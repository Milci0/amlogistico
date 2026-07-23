// Wspólna warstwa dostępu do ISZTAR4 (Ministerstwo Finansów) — używana przez
// scripts/sync-isztar.js oraz scripts/validate-cargo-categories.js.
//
// Rekonesans 2026-07-23 (potwierdzony realnym wywołaniem, NIE założeniem):
//   GET https://ext-isztar4.mf.gov.pl/tariff/rest/goods-nomenclature/codes
//       ?date=YYYY-MM-DD&language=PL|EN&page=N
//   Odpowiedź = zagnieżdżone drzewo: każda strona to jeden węzeł-korzeń
//   { description, subgroup[], links{first,self,next,last} }.
//   `code` niosą tylko poziomy 6-cyfrowy (podpozycja CN) i 10-cyfrowy (TARIC);
//   sekcje/działy/pozycje (2/4 cyfry) to węzły bez `code`. Kody bez kropek.
//   `?date=` filtruje drzewo do kodów AKTYWNYCH danego dnia (można podać przeszłą
//   datę — tak rozróżniamy „kod wycofany" od „nigdy nie istniał").

const BASE = 'https://ext-isztar4.mf.gov.pl/tariff/rest/goods-nomenclature/codes'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchPage(date, lang, page, tries = 3) {
  const url = `${BASE}?date=${date}&language=${lang}&page=${page}`
  let lastErr
  for (let i = 1; i <= tries; i++) {
    try {
      // Uwaga: serwer ISZTAR zwraca 406, jeśli Accept zawężone do application/json —
      // wymaga */* (tak jak domyślny curl). Nie zmieniać na application/json.
      const res = await fetch(url, {
        headers: { 'User-Agent': 'AmLogistico-sync/1.0', Accept: '*/*' },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status} dla ${url}`)
      return await res.json()
    } catch (e) {
      lastErr = e
      if (i < tries) await sleep(1000 * i)
    }
  }
  throw lastErr
}

// Rekurencyjnie zbiera węzły z `code` do mapy code -> { code, parentCode, level, description }.
// parentCode = najbliższy przodek posiadający `code` (sekcje/działy bez kodu są przezroczyste).
function collect(node, parentCode, out) {
  if (!node || typeof node !== 'object') return
  const hasCode = typeof node.code === 'string' && node.code.length > 0
  if (hasCode && !out.has(node.code)) {
    out.set(node.code, {
      code: node.code,
      parentCode: parentCode ?? null,
      level: node.code.length,
      description: (node.description || '').replace(/\s+/g, ' ').trim(),
    })
  }
  if (Array.isArray(node.subgroup)) {
    const nextParent = hasCode ? node.code : parentCode
    for (const child of node.subgroup) collect(child, nextParent, out)
  }
}

// Pobiera CAŁĄ nomenklaturę aktywną na `date` w języku `lang`.
// Zwraca Map(code -> { code, parentCode, level, description }).
export async function fetchAllCodes(date, lang = 'PL', { onProgress } = {}) {
  const first = await fetchPage(date, lang, 1)
  const last = Number(first.links?.last?.match(/page=(\d+)/)?.[1] || 1)
  const out = new Map()
  collect(first, null, out)
  if (onProgress) onProgress(1, last)
  for (let p = 2; p <= last; p++) {
    const page = await fetchPage(date, lang, p)
    collect(page, null, out)
    if (onProgress) onProgress(p, last)
  }
  return out
}

// Pomocnicze zbiory do dopasowywania kodów z bazy podkategorii (CN8 z kropkami)
// do realnej nomenklatury (6/10 cyfr). Dawny CN8 (8 cyfr) waliduje się jako
// prefiks aktywnego kodu 10-cyfrowego.
export function buildLookups(codeMap) {
  const exact = new Set() // wszystkie kody 6/10 (dokładne dopasowanie)
  const prefix8 = new Set() // pierwsze 8 cyfr kodów 10-cyfrowych (dla CN8 z bazy)
  const prefix6 = new Set() // pierwsze 6 cyfr kodów 10-cyfrowych (rezerwowo)
  for (const { code } of codeMap.values()) {
    exact.add(code)
    if (code.length >= 8) prefix8.add(code.slice(0, 8))
    if (code.length >= 6) prefix6.add(code.slice(0, 6))
  }
  return { exact, prefix8, prefix6 }
}

// Normalizacja kodu z bazy podkategorii: usuwa kropki/spacje, zostawia cyfry.
export function normalizeCode(raw) {
  return String(raw || '').replace(/[^0-9]/g, '')
}

// ── Kontekst opisowy (dla oceny spójności tematycznej) ──────────────────────────
// W przeciwieństwie do fetchAllCodes buduje `ancestryText` = łańcuch opisów WSZYSTKICH
// przodków, także węzłów bez `code` (sekcja/dział/pozycja 4-cyfrowa). To istotne, bo
// nazwa towaru często siedzi na poziomie pozycji (np. „Zegarki… inne niż 9101"),
// a liść 10-cyfrowy nazywa się tylko „Pozostałe".
function collectContext(node, stack, out) {
  if (!node || typeof node !== 'object') return
  const hasCode = typeof node.code === 'string' && node.code.length > 0
  const raw = (node.description || '').replace(/\s+/g, ' ').trim()
  const desc = raw.replace(/^[-\s]+/, '') // usuń wiodące myślniki hierarchii
  if (hasCode && !out.has(node.code)) {
    out.set(node.code, {
      code: node.code,
      level: node.code.length,
      ownDesc: desc,
      ancestryText: [...stack, desc].filter(Boolean).join(' > '),
      heading4: node.code.slice(0, 4),
    })
  }
  if (Array.isArray(node.subgroup)) {
    const nextStack = desc ? [...stack, desc] : stack
    for (const child of node.subgroup) collectContext(child, nextStack, out)
  }
}

// Pobiera nomenklaturę aktywną na `date` i zwraca Map(code -> { code, level, ownDesc,
// ancestryText, heading4 }). Wynik cache'owany na dysku (scripts/.cache).
export async function fetchCodeContext(date, lang = 'PL', { cacheDir, onProgress } = {}) {
  if (cacheDir) {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const file = path.join(cacheDir, `context-${date}-${lang}.json`)
    if (fs.existsSync(file)) {
      const arr = JSON.parse(fs.readFileSync(file, 'utf8'))
      return new Map(arr.map((e) => [e.code, e]))
    }
    const first = await fetchPage(date, lang, 1)
    const last = Number(first.links?.last?.match(/page=(\d+)/)?.[1] || 1)
    const out = new Map()
    collectContext(first, [], out)
    if (onProgress) onProgress(1, last)
    for (let p = 2; p <= last; p++) {
      const page = await fetchPage(date, lang, p)
      collectContext(page, [], out)
      if (onProgress) onProgress(p, last)
    }
    fs.mkdirSync(cacheDir, { recursive: true })
    fs.writeFileSync(file, JSON.stringify([...out.values()]))
    return out
  }
  const first = await fetchPage(date, lang, 1)
  const last = Number(first.links?.last?.match(/page=(\d+)/)?.[1] || 1)
  const out = new Map()
  collectContext(first, [], out)
  if (onProgress) onProgress(1, last)
  for (let p = 2; p <= last; p++) {
    const page = await fetchPage(date, lang, p)
    collectContext(page, [], out)
    if (onProgress) onProgress(p, last)
  }
  return out
}
