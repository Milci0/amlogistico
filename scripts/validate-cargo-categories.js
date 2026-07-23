// scripts/validate-cargo-categories.js
// Walidacja 260 podkategorii towaru (src/data/cargoCategories.js) wobec lokalnej tabeli
// cn_codes (zasilanej z ISZTAR4 przez scripts/sync-isztar.js).
//
// Uruchomienie:
//   NODE_OPTIONS=--use-system-ca node --env-file=.env scripts/validate-cargo-categories.js
//
// Klasyfikacja (Etap 2):
//   OK            — kod aktywny dziś + opis ISZTAR spójny tematycznie z nazwą podkategorii.
//   NIEAKTUALNY   — kod istniał (migawka historyczna 2021-06-30, pre-HS2022), ale dziś nieaktywny.
//                   Przy jednoznacznym następcy → suggested_fix; inaczej needs_manual_review.
//   NIEISTNIEJACY — kodu nie ma ani dziś, ani w migawce historycznej (literówka / zła podpozycja).
//                   Zawsze needs_manual_review.
//   NIESPOJNY     — kod aktywny, ale opis ISZTAR wyraźnie nie pasuje do nazwy (słaby overlap
//                   tekstowy lub sprzeczność liczbowa, np. wiek „100 lat" vs „250 lat").
//                   Zawsze needs_manual_review.
//
// NIC nie nadpisuje żywego pliku. Wynik: raport .md + .json oraz OSOBNY plik sugestii.

import { PrismaClient } from '@prisma/client'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fetchCodeContext, normalizeCode } from './lib/isztar.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPORTS_DIR = path.join(__dirname, 'reports')
const CACHE_DIR = path.join(__dirname, '.cache')
const TODAY = new Date().toISOString().slice(0, 10)
const HIST_DATE = '2021-06-30' // przed HS2022 — do wykrycia kodów wycofanych w 2022 r.
const OLD_DATE = '2000-01-01' // druga, głębsza migawka (floor API = 1990-01-01; poniżej HTTP 500)

const prisma = new PrismaClient()

// ── Tekst: normalizacja PL, tokenizacja, lekki stemming ─────────────────────────
const PL_MAP = { ł: 'l', ą: 'a', ć: 'c', ę: 'e', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' }
function normalizeText(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[łąćęńóśźż]/g, (c) => PL_MAP[c] || c)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}
// Przymiotniki stanu/opakowania, które ISZTAR często pomija — nie liczą się do overlapu.
const GENERIC = new Set([
  'swieze', 'swiezy', 'swieza', 'mrozone', 'mrozony', 'mrozona', 'suszone', 'suszony',
  'chlodzone', 'zywe', 'zywy', 'zywa', 'surowe', 'surowy', 'przetworzone', 'gotowe',
  'nowe', 'nowy', 'uzywane', 'uzywany', 'sztuczne', 'naturalne', 'naturalny',
  // stopwords
  'oraz', 'lub', 'inne', 'pozostale', 'itp', 'itd', 'np', 'ponad', 'powyzej', 'ponizej',
  'typu', 'rodzaju', 'dla', 'przez', 'przy', 'bez', 'jako', 'wraz', 'wedlug',
])
function stem(t) {
  return t.length > 6 ? t.slice(0, 6) : t
}
function tokens(str) {
  return [
    ...new Set(
      normalizeText(str)
        .replace(/[^a-z0-9]+/g, ' ')
        .split(/\s+/)
        .filter((t) => t.length >= 3 && !/^\d+$/.test(t) && !GENERIC.has(t))
        .map(stem)
    ),
  ]
}
// Udział tokenów NAZWY pokrytych w tekście kontekstu ISZTAR.
function consistency(name, contextText) {
  const nt = tokens(name)
  if (nt.length === 0) return 1
  const ct = new Set(tokens(contextText))
  const shared = nt.filter((t) => ct.has(t)).length
  return shared / nt.length
}
// Sprzeczność zakresu wieku: porównuje liczbę lat z nazwy z NAJGŁĘBSZYM (najbardziej
// szczegółowym) zakresem wieku w opisie ISZTAR. Ancestry idzie ogólne→szczegółowe, więc
// ostatnie dopasowanie = poziom, na który faktycznie wskazuje kod. Antyki „100 lat"
// przypisane do podpozycji „przekraczającym 250 lat" → 100 ≠ 250 → konflikt.
function ageConflict(name, contextText) {
  const nameM = name.match(/(\d{2,4})\s*lat/i) || name.match(/przekraczaj\w*\D*(\d{2,4})/i)
  if (!nameM) return false
  const nameYears = Number(nameM[1])
  const ctxAll = [...contextText.matchAll(/(\d{2,4})\s*lat|przekraczaj\w*\D*(\d{2,4})/gi)]
  if (!ctxAll.length) return false
  const last = ctxAll[ctxAll.length - 1]
  const ctxYears = Number(last[1] || last[2])
  return Number.isFinite(nameYears) && Number.isFinite(ctxYears) && nameYears !== ctxYears
}
const WEAK_MATCH = 0.6 // poniżej — słabe dopasowanie tekstowe (advisory, nie twierdzenie o błędzie)

// Wybór następcy z rankingu kandydatów. Zwraca kandydata TYLKO gdy jest DOKŁADNIE JEDEN
// sensowny (score ≥ minScore) albo jest wyraźny lider (przewaga ≥ minGap). Inaczej null —
// zero zgadywania „najbardziej prawdopodobnego" z kilku równorzędnych.
function pickSuccessor(ranked, { minScore, minGap }) {
  const sensible = ranked.filter((r) => r.score >= minScore)
  if (sensible.length === 1) return sensible[0]
  if (sensible.length > 1 && sensible[0].score - sensible[1].score >= minGap) return sensible[0]
  return null
}

async function main() {
  fs.mkdirSync(REPORTS_DIR, { recursive: true })

  // 1) Podkategorie z jedynego źródła prawdy (import — plik jest modułem JS, nie JSON-em).
  const { CARGO_SUBCATEGORIES, CARGO_CATEGORIES } = await import('../src/data/cargoCategories.js')
  const catName = new Map(CARGO_CATEGORIES.map((c) => [c.id, c.name]))
  console.log(`[validate] Podkategorii do sprawdzenia: ${CARGO_SUBCATEGORIES.length}`)

  // 2) Membership (aktywność) — WYŁĄCZNIE z tabeli cn_codes (deliverable Etapu 1).
  const rows = await prisma.$queryRawUnsafe(
    'SELECT code, level, valid_to IS NULL AS active FROM cn_codes'
  )
  const activeExact = new Set()
  const activePrefix8 = new Set()
  for (const r of rows) {
    if (!r.active) continue
    activeExact.add(r.code)
    if (r.code.length >= 8) activePrefix8.add(r.code.slice(0, 8))
  }
  console.log(`[validate] cn_codes: ${rows.length} (aktywnych: ${activeExact.size})`)

  // 3) Kontekst opisowy (bogaty, z poziomami bez kodu) — dziś + migawka historyczna.
  console.log('[validate] Pobieram kontekst opisowy (dziś)…')
  const ctxToday = await fetchCodeContext(TODAY, 'PL', {
    cacheDir: CACHE_DIR,
    onProgress: (p, l) => process.stdout.write(`\r  dziś ${p}/${l}   `),
  })
  process.stdout.write('\n')
  console.log('[validate] Pobieram kontekst historyczny (2021-06-30)…')
  const ctxHist = await fetchCodeContext(HIST_DATE, 'PL', {
    cacheDir: CACHE_DIR,
    onProgress: (p, l) => process.stdout.write(`\r  hist ${p}/${l}   `),
  })
  process.stdout.write('\n')

  console.log(`[validate] Pobieram kontekst historyczny (${OLD_DATE})…`)
  const ctxOld = await fetchCodeContext(OLD_DATE, 'PL', {
    cacheDir: CACHE_DIR,
    onProgress: (p, l) => process.stdout.write(`\r  old ${p}/${l}   `),
  })
  process.stdout.write('\n')

  const histExact = new Set(ctxHist.keys())
  const histPrefix8 = new Set()
  for (const code of ctxHist.keys()) if (code.length >= 8) histPrefix8.add(code.slice(0, 8))
  const oldExact = new Set(ctxOld.keys())
  const oldPrefix8 = new Set()
  for (const code of ctxOld.keys()) if (code.length >= 8) oldPrefix8.add(code.slice(0, 8))

  // Pula następców: aktywne kody dziś, pogrupowane wg pozycji 4-cyfrowej.
  const byHeading4 = new Map()
  for (const e of ctxToday.values()) {
    if (!activeExact.has(e.code)) continue
    if (!byHeading4.has(e.heading4)) byHeading4.set(e.heading4, [])
    byHeading4.get(e.heading4).push(e)
  }

  // Znajdź reprezentatywny aktywny wpis kontekstu dla kodu z bazy (CN8 → prefiks 10-cyfr).
  function matchContext(digits, name) {
    if (ctxToday.has(digits) && activeExact.has(digits)) return ctxToday.get(digits)
    // CN8 zakończony na „00" = poziom podpozycji 6-cyfrowej (brak dalszego podziału CN).
    // Bierzemy kontekst 6-cyfrowy, żeby ocena tematyczna/wieku nie łapała głębokich
    // rozróżnień TARIC (np. „Starsze niż 200 lat" pod antykami 100-250 lat).
    if (digits.length === 8 && digits.endsWith('00')) {
      const p6 = digits.slice(0, 6)
      if (ctxToday.has(p6) && activeExact.has(p6)) return ctxToday.get(p6)
    }
    // CN8 obejmuje zwykle wiele liści TARIC — wybierz ten, którego opis NAJLEPIEJ pasuje do
    // nazwy podkategorii. Kod jest spójny tematycznie, jeśli KTÓRAKOLWIEK jego podpozycja
    // odpowiada towarowi (błędny kod dalej wyjdzie z zerowym pokryciem = NIESPÓJNY).
    let best = null
    let bestScore = -1
    for (const e of ctxToday.values()) {
      if (e.level === 10 && e.code.startsWith(digits) && activeExact.has(e.code)) {
        const s = name ? consistency(name, e.ancestryText) : 0
        if (s > bestScore) {
          bestScore = s
          best = e
        }
      }
    }
    return best
  }

  const results = []
  for (const sub of CARGO_SUBCATEGORIES) {
    const digits = normalizeCode(sub.hsCode)
    const lenOK = [6, 8, 10].includes(digits.length)
    const base = {
      id: sub.id,
      categoryId: sub.categoryId,
      categoryName: catName.get(sub.categoryId) || sub.categoryId,
      name: sub.name,
      hsCode: sub.hsCode,
      digits,
      formatOk: lenOK,
    }

    const active = activeExact.has(digits) || (digits.length === 8 && activePrefix8.has(digits))

    if (active) {
      const ctx = matchContext(digits, sub.name)
      const ancestry = ctx?.ancestryText || ''
      const score = consistency(sub.name, ancestry)
      const numConflict = ageConflict(sub.name, ancestry)
      // NIESPOJNY tylko przy WYRAŹNYCH sygnałach: sprzeczność zakresu wieku albo ZEROWE
      // pokrycie tokenów. Słabe (ale niezerowe) pokrycie ≠ błąd — to często synonim
      // (np. „Wołowina" vs opis ISZTAR „Mięso z bydła"), więc trafia do sekcji doradczej.
      if (numConflict) {
        results.push({
          ...base, status: 'NIESPOJNY', action: 'needs_manual_review',
          matchedCode: ctx?.code || null, matchedDescription: ancestry, score: Number(score.toFixed(2)),
          reason: 'Kod aktywny, ale zakres wieku w opisie ISZTAR jest sprzeczny z nazwą podkategorii (kod wskazuje węższą/inną podpozycję).',
        })
      } else if (score === 0) {
        results.push({
          ...base, status: 'NIESPOJNY', action: 'needs_manual_review',
          matchedCode: ctx?.code || null, matchedDescription: ancestry, score: 0,
          reason: 'Kod aktywny, ale ZEROWE pokrycie tekstowe nazwy z opisem ISZTAR. Może być synonim (do potwierdzenia) albo błędny kod.',
        })
      } else {
        results.push({
          ...base, status: 'OK', action: 'none',
          matchedCode: ctx?.code || null, matchedDescription: ancestry, score: Number(score.toFixed(2)),
          weakTextMatch: score < WEAK_MATCH,
        })
      }
      continue
    }

    // Kod nieaktywny dziś. Sprawdź obie migawki historyczne (2021 → 2000).
    const existedHist = histExact.has(digits) || (digits.length === 8 && histPrefix8.has(digits))
    const existedOld = oldExact.has(digits) || (digits.length === 8 && oldPrefix8.has(digits))
    if (existedHist || existedOld) {
      const heading4 = digits.slice(0, 4)
      // Najlepszy dostępny opis historyczny kodu (do dopasowania następcy).
      const findHistDesc = (ctx) =>
        ctx.get(digits)?.ancestryText ||
        (digits.length === 8
          ? [...ctx.values()].find((e) => e.level === 10 && e.code.startsWith(digits))?.ancestryText
          : '') ||
        ''
      const histDesc = findHistDesc(ctxHist) || findHistDesc(ctxOld)
      const candidates = byHeading4.get(heading4) || []
      const ranked = candidates
        .map((c) => ({
          code: c.code,
          desc: c.ancestryText,
          score: Math.max(consistency(sub.name, c.ancestryText), consistency(histDesc, c.ancestryText)),
        }))
        .sort((a, b) => b.score - a.score)

      // Dwustopniowe szukanie następcy: najpierw rygorystycznie, potem luźniej (pkt 3).
      const strict = pickSuccessor(ranked, { minScore: 0.5, minGap: 0.2 })
      const relaxed = strict ? null : pickSuccessor(ranked, { minScore: 0.34, minGap: 0.15 })
      const pick = strict || relaxed
      // Skąd wiemy, że kod kiedyś istniał (do reklasyfikacji z pkt 4).
      const reclassifiedFromOlder = !existedHist && existedOld
      const era = existedHist ? HIST_DATE : OLD_DATE
      const eraNote = reclassifiedFromOlder
        ? `Kod nieaktywny dziś i w ${HIST_DATE}, ale obecny w głębszej migawce ${OLD_DATE} — reklasyfikacja NIEISTNIEJĄCY → NIEAKTUALNY (wycofany wcześniej niż zakładano).`
        : `Kod wycofany po ${HIST_DATE}.`

      if (pick) {
        results.push({
          ...base,
          status: 'NIEAKTUALNY',
          action: 'suggested_fix',
          reclassifiedFromOlder,
          historicalEra: era,
          historicalDescription: histDesc,
          suggestedCode: pick.code,
          suggestedDescription: pick.desc,
          suggestedScore: Number(pick.score.toFixed(2)),
          matchedWith: strict ? 'strict' : 'relaxed_threshold',
          reason: `${eraNote} ${strict ? 'Jednoznaczny' : 'Kandydat z LUŹNIEJSZEGO progu — jeden sensowny'} następca w pozycji ${heading4}.`,
        })
      } else {
        results.push({
          ...base,
          status: 'NIEAKTUALNY',
          action: 'needs_manual_review',
          reclassifiedFromOlder,
          historicalEra: era,
          historicalDescription: histDesc,
          candidates: ranked.slice(0, 5).map((r) => ({ code: r.code, desc: r.desc, score: Number(r.score.toFixed(2)) })),
          reason: `${eraNote} Brak jednoznacznego następcy w pozycji ${heading4} (także po poluzowaniu progu).`,
        })
      }
      continue
    }

    // Podpowiedź naprawcza: czy poprawny jest przynajmniej 6-cyfrowy prefiks?
    const p6 = digits.slice(0, 6)
    const realChildren = [...ctxToday.values()]
      .filter((e) => e.level === 10 && e.code.startsWith(p6) && activeExact.has(e.code))
      .slice(0, 6)
      .map((e) => ({ code: e.code, desc: e.ownDesc }))
    const p6Active = activeExact.has(p6) || realChildren.length > 0
    results.push({
      ...base,
      status: 'NIEISTNIEJACY',
      action: 'needs_manual_review',
      parent6Active: p6Active,
      realSubdivisions: realChildren,
      reason: p6Active
        ? `Kod CN8 nie istnieje, ale poziom 6-cyfrowy (${p6}) jest aktywny — końcówka „${digits.slice(6)}" jest błędna. Realne podpozycje: ${realChildren.map((c) => c.code).join(', ') || '(brak 10-cyfr)'}.`
        : `Kodu nie ma w ISZTAR ani dziś, ani w migawkach historycznych (${HIST_DATE}, ${OLD_DATE}). Prawdopodobnie literówka lub podpozycja, która nigdy nie istniała.`,
    })
  }

  writeReports(results)
}

function writeReports(results) {
  const groups = { OK: [], NIEAKTUALNY: [], NIEISTNIEJACY: [], NIESPOJNY: [] }
  for (const r of results) groups[r.status].push(r)

  const stamp = TODAY
  const jsonPath = path.join(REPORTS_DIR, `cargo-validation-${stamp}.json`)
  const mdPath = path.join(REPORTS_DIR, `cargo-validation-${stamp}.md`)
  // AUTO plik sugestii z algorytmu. NIE nadpisuje kuratorowanego pliku
  // `cargo-categories-suggested-fixes.json` (ręczne sugestie manual_review_confirmed).
  const fixesPath = path.join(REPORTS_DIR, 'cargo-categories-suggested-fixes.auto.json')

  fs.writeFileSync(jsonPath, JSON.stringify({ generatedAt: new Date().toISOString(), histDates: [HIST_DATE, OLD_DATE], counts: countOf(groups), results }, null, 2))

  // Osobny plik sugestii: TYLKO NIEAKTUALNY z jednoznacznym następcą. Nigdzie nieimportowany.
  // `matched_with` odróżnia sugestie z progu pierwotnego (strict) od poluzowanego (relaxed).
  const suggested = results
    .filter((r) => r.status === 'NIEAKTUALNY' && r.action === 'suggested_fix')
    .map((r) => ({
      id: r.id,
      categoryId: r.categoryId,
      name: r.name,
      currentHsCode: r.hsCode,
      suggestedCode: r.suggestedCode,
      suggestedDescription: r.suggestedDescription,
      suggestedScore: r.suggestedScore,
      matched_with: r.matchedWith, // 'strict' | 'relaxed_threshold'
      reclassifiedFromOlder: !!r.reclassifiedFromOlder,
      reason: r.reason,
    }))
  const strictN = suggested.filter((s) => s.matched_with === 'strict').length
  const relaxedN = suggested.filter((s) => s.matched_with === 'relaxed_threshold').length
  const reclassN = groups.NIEAKTUALNY.filter((r) => r.reclassifiedFromOlder).length
  fs.writeFileSync(
    fixesPath,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        note: 'Do RĘCZNEJ akceptacji. NIE jest importowany przez aplikację.',
        legend: { strict: 'próg pierwotny (rygorystyczny)', relaxed_threshold: 'próg poluzowany (pkt 3)' },
        counts: { strict: strictN, relaxed_threshold: relaxedN },
        suggestions: suggested,
      },
      null,
      2
    )
  )

  fs.writeFileSync(mdPath, buildMarkdown(groups, { strictN, relaxedN, reclassN }))

  console.log('\n[validate] ── PODSUMOWANIE ──')
  for (const k of Object.keys(groups)) console.log(`  ${k}: ${groups[k].length}`)
  console.log(`  sugestie następcy: strict=${strictN}, relaxed=${relaxedN}`)
  console.log(`  reklasyfikacje NIEISTNIEJĄCY→NIEAKTUALNY (migawka ${OLD_DATE}): ${reclassN}`)
  console.log(`\n[validate] Raporty:`)
  console.log(`  ${path.relative(process.cwd(), mdPath)}`)
  console.log(`  ${path.relative(process.cwd(), jsonPath)}`)
  console.log(`  ${path.relative(process.cwd(), fixesPath)}`)
}

function countOf(groups) {
  return Object.fromEntries(Object.entries(groups).map(([k, v]) => [k, v.length]))
}

function esc(s) {
  return String(s || '').replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

function buildMarkdown(groups, { strictN = 0, relaxedN = 0, reclassN = 0 } = {}) {
  const total = Object.values(groups).reduce((a, g) => a + g.length, 0)
  let md = `# Walidacja kategorii towaru wobec ISZTAR4\n\n`
  md += `Wygenerowano: ${new Date().toISOString()}  •  Migawki historyczne: ${HIST_DATE}, ${OLD_DATE}\n\n`
  md += `Sprawdzono **${total}** podkategorii.\n\n`
  md += `| Grupa | Liczba |\n|---|---|\n`
  for (const k of ['OK', 'NIEAKTUALNY', 'NIEISTNIEJACY', 'NIESPOJNY']) md += `| ${k} | ${groups[k].length} |\n`
  md += `\nSugestie następcy: **${strictN}** z progu pierwotnego (strict), **${relaxedN}** z poluzowanego (relaxed_threshold).\n`
  md += `Reklasyfikacje NIEISTNIEJĄCY→NIEAKTUALNY dzięki migawce ${OLD_DATE}: **${reclassN}**.\n\n`
  md += `> **Uwaga metodologiczna:** przynależność (aktywny/nieaktywny) jest twarda — z tabeli \`cn_codes\`.\n`
  md += `> Ocena „spójności tematycznej" jest **heurystyką tekstową** (pokrycie stemowanych tokenów nazwy w\n`
  md += `> opisie ISZTAR wraz z całą ścieżką hierarchii + kontrola sprzeczności liczbowych wieku). Wszystkie\n`
  md += `> przypadki inne niż OK trafiają do ręcznego przeglądu — nic nie jest nadpisywane automatycznie.\n\n`

  const section = (title, list, cols, rowFn) => {
    md += `## ${title} (${list.length})\n\n`
    if (!list.length) {
      md += `_brak_\n\n`
      return
    }
    md += `| ${cols.join(' | ')} |\n| ${cols.map(() => '---').join(' | ')} |\n`
    for (const r of list) md += `| ${rowFn(r).map(esc).join(' | ')} |\n`
    md += `\n`
  }

  section('NIEAKTUALNY — kod wycofany', groups.NIEAKTUALNY,
    ['id', 'kategoria', 'nazwa', 'kod', 'akcja', 'sugerowany kod', 'źródło sugestii', 'reklas. z 2000', 'uzasadnienie'],
    (r) => [r.id, r.categoryName, r.name, r.hsCode, r.action, r.suggestedCode || '-', r.matchedWith || '-', r.reclassifiedFromOlder ? 'tak' : '-', r.reason])

  section('NIESPOJNY — kod aktywny, opis nie pasuje', groups.NIESPOJNY,
    ['id', 'kategoria', 'nazwa', 'kod', 'dopasowany kod', 'opis ISZTAR', 'score', 'uzasadnienie'],
    (r) => [r.id, r.categoryName, r.name, r.hsCode, r.matchedCode || '-', r.matchedDescription || '-', String(r.score ?? ''), r.reason])

  section('NIEISTNIEJACY — kod nie znaleziony', groups.NIEISTNIEJACY,
    ['id', 'kategoria', 'nazwa', 'kod', 'uzasadnienie'],
    (r) => [r.id, r.categoryName, r.name, r.hsCode, r.reason])

  const weak = groups.OK.filter((r) => r.weakTextMatch)
  section('DORADCZO — OK, ale słabe dopasowanie tekstowe (heurystyka, NIE potwierdzony błąd)', weak,
    ['id', 'kategoria', 'nazwa', 'kod', 'dopasowany kod', 'opis ISZTAR', 'score'],
    (r) => [r.id, r.categoryName, r.name, r.hsCode, r.matchedCode || '-', r.matchedDescription || '-', String(r.score ?? '')])
  md += `> Powyższe kody są AKTYWNE w ISZTAR. Niskie pokrycie tokenów wynika najczęściej z synonimów\n`
  md += `> (nazwa handlowa vs formalny opis CN, np. „Wołowina" vs „Mięso z bydła"). Zalecany szybki\n`
  md += `> przegląd wzrokowy, ale to NIE jest twierdzenie o błędzie.\n\n`

  md += `## OK (${groups.OK.length})\n\nKody aktywne w ISZTAR. Pełna lista (w tym score i dopasowany kod) w pliku JSON.\n`
  return md
}

main()
  .catch((e) => {
    console.error('[validate] BŁĄD:', e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
