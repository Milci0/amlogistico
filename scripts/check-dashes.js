// Kontrola reguly z CLAUDE.md: zaden tekst widoczny dla uzytkownika nie moze
// zawierac pauzy em-dash (—) ani en-dash (–). Zamiast nich: przecinek, nawias,
// dwukropek albo zwykly lacznik.
//
// Uruchomienie:  npm run lint:dashes
// Kod wyjscia 1 przy znalezieniu czegokolwiek.
//
// ── CO SKANUJEMY I DLACZEGO WLASNIE TO ──────────────────────────────────────
// Regula dotyczy TEKSTU, nie kodu, wiec skaner celowo pomija:
//   - komentarze w kodzie (// oraz bloki /* */) — jawny wyjatek w CLAUDE.md,
//     myslniki sa tam w calym repo od dawna,
//   - src/generators/templates/** — szablony PDF odwzorowuja oryginalne
//     formularze, gdzie myslnik jest elementem wzoru,
//   - documentCatalog.js i templateCatalog.js — nazwy wlasne dokumentow,
//     swiadomie zostawione (patrz sekcja „Czystka tekstow" w CLAUDE.md).

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

const DASHES = /[—–]/ // em-dash, en-dash

const SCAN_DIRS = ['src', 'api']
const SCAN_EXT = new Set(['.js', '.jsx', '.json'])

const SKIP_PATHS = [
  // Szablony PDF i nagłówek „wersja robocza" odwzorowuja oryginalne formularze,
  // gdzie myslnik jest elementem wzoru. To druk, nie interfejs.
  'src/generators/templates',
  'src/generators/draftBanner.jsx',
  // Nazwy wlasne dokumentow, swiadomie zostawione (patrz „Czystka tekstow" w CLAUDE.md).
  'src/data/documentCatalog.js',
  'src/data/templateCatalog.js',
  // Opisy testow to nie tekst produktu.
  '__tests__',
  'node_modules',
]

function shouldSkip(rel) {
  const normalized = rel.split(path.sep).join('/')
  return SKIP_PATHS.some((p) => normalized.startsWith(p) || normalized.includes(`/${p}`))
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (shouldSkip(path.relative(ROOT, full))) continue
    if (entry.isDirectory()) yield* walk(full)
    else if (SCAN_EXT.has(path.extname(entry.name))) yield full
  }
}

// Usuwa z pliku wszystkie komentarze, zostawiajac puste linie w ich miejsce
// (numeracja linii musi sie zgadzac z oryginalem).
//
// Nie parsujemy JS-a, tylko odsiewamy to, czego regula nie dotyczy. Obslugiwane
// sa trzy formy: bloki /* */ (w tym komentarze JSX {/* */}), koncowki // oraz
// cale linie komentarza. Znaki // wewnatrz stringow i w adresach (https://) sa
// pomijane dzieki sledzeniu stanu cudzyslowow.
// Czy `/` w tym miejscu zaczyna regex, czy jest dzieleniem. Decyduje ostatni
// znaczacy znak przed nim: po wartosci (litera, cyfra, nawias zamykajacy) to
// dzielenie, po operatorze albo otwarciu to regex.
function startsRegex(before) {
  const prev = before.replace(/\s+$/, '').slice(-1)
  return prev === '' || '(,=:[!&|?{};+-*%<>~^'.includes(prev)
}

function stripComments(source) {
  let out = ''
  let i = 0
  let quote = null // ' " ` albo null

  while (i < source.length) {
    const ch = source[i]
    const next = source[i + 1]

    if (quote) {
      if (ch === '\\') { out += source.slice(i, i + 2); i += 2; continue }
      if (ch === quote) quote = null
      out += ch
      i++
      continue
    }

    // Komentarze sprawdzamy PRZED otwarciem stringa. Odwrotna kolejnosc jest
    // pulapka: apostrof w polskim komentarzu („nie ma go") otwieralby fikcyjny
    // string i kolejne // przestawaloby byc rozpoznawane jako komentarz.
    // Sekwencja // wewnatrz stringa (https://) jest bezpieczna, bo trafia
    // do galezi `if (quote)` powyzej.
    if (ch === '/' && next === '*') {
      const end = source.indexOf('*/', i + 2)
      const block = source.slice(i, end === -1 ? source.length : end + 2)
      // Zachowujemy same znaki nowej linii, zeby numery linii sie nie przesunely.
      out += block.replace(/[^\n]/g, '')
      i += block.length
      continue
    }

    if (ch === '/' && next === '/') {
      const end = source.indexOf('\n', i)
      i = end === -1 ? source.length : end
      continue
    }

    if (ch === '"' || ch === "'" || ch === '`') { quote = ch; out += ch; i++; continue }

    // Literal wyrazenia regularnego. Bez tego regex zawierajacy cudzyslow,
    // np. .replace(/[\\/:*?"<>|]/g, ''), otwieralby fikcyjny string i psul
    // rozpoznawanie komentarzy w dalszej czesci pliku (realny przypadek:
    // src/utils/blankDocuments.js). Heurystyka „poprzedni znaczacy znak"
    // odroznia regex od dzielenia i w tym repo wystarcza.
    if (ch === '/' && startsRegex(out)) {
      let j = i + 1
      let inClass = false
      while (j < source.length) {
        const c = source[j]
        if (c === '\\') { j += 2; continue }
        if (c === '\n') break // niedomkniety regex, to jednak bylo dzielenie
        if (c === '[') inClass = true
        else if (c === ']') inClass = false
        else if (c === '/' && !inClass) { j++; break }
        j++
      }
      out += source.slice(i, j).replace(/[^\n]/g, ' ')
      i = j
      continue
    }

    out += ch
    i++
  }

  return out
}

const findings = []

for (const dir of SCAN_DIRS) {
  const abs = path.join(ROOT, dir)
  if (!fs.existsSync(abs)) continue
  for (const file of walk(abs)) {
    const rel = path.relative(ROOT, file).split(path.sep).join('/')
    const isJson = path.extname(file) === '.json'
    const source = fs.readFileSync(file, 'utf8')
    // W JSON-ie nie ma komentarzy, wiec czyscimy tylko kod.
    const scanned = isJson ? source : stripComments(source)

    scanned.split('\n').forEach((line, i) => {
      if (DASHES.test(line)) {
        findings.push({ file: rel, line: i + 1, text: line.trim().slice(0, 120) })
      }
    })
  }
}

// CLAUDE.md tez podlega regule (jest w niej wymieniony wprost), ale zawiera
// 301 wystapien sprzed jej wprowadzenia. Czyszczenie dokumentacji projektu to
// osobne zadanie, wiec domyslnie jej nie skanujemy — od tego jest flaga --docs.
// Skaner, ktory jest czerwony od pierwszego uruchomienia, przestaje byc czytany.
if (process.argv.includes('--docs')) {
  const claudeMd = path.join(ROOT, 'CLAUDE.md')
  if (fs.existsSync(claudeMd)) {
    fs.readFileSync(claudeMd, 'utf8').split('\n').forEach((line, i) => {
      if (DASHES.test(line)) findings.push({ file: 'CLAUDE.md', line: i + 1, text: line.trim().slice(0, 120) })
    })
  }
}

if (findings.length === 0) {
  console.log('OK: brak em-dash i en-dash w tekstach.')
  process.exit(0)
}

console.error(`Znaleziono ${findings.length} wystapien em-dash/en-dash:\n`)
for (const f of findings) {
  console.error(`  ${f.file}:${f.line}\n    ${f.text}`)
}
console.error('\nZamien na: przecinek, nawias, dwukropek albo zwykly lacznik (-).')
process.exit(1)
