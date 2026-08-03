// Porównuje drzewa kluczy tłumaczeń EN i PL.
//
// Zgłasza: klucz obecny w jednym języku a brakujący w drugim, rozjazd typów
// (string vs obiekt vs tablica), różną długość tablic oraz pusty tekst.
// Kod wyjścia 1, gdy cokolwiek znaleziono.
//
// Uruchomienie: npm run lint:locales

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const here = path.dirname(fileURLToPath(import.meta.url))
const LOCALES = path.join(here, '..', 'src', 'locales')
const LANGS = ['en', 'pl']

function typeOf(v) {
  if (Array.isArray(v)) return 'array'
  if (v === null) return 'null'
  return typeof v
}

// i18next tworzy warianty liczby mnogiej z sufiksami; polski ma kategorie
// one/few/many, angielski tylko one/other. Porównujemy więc istnienie BAZY
// klucza, nie kompletu sufiksów, inaczej każdy licznik dawałby fałszywy alarm.
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/

function pluralBases(obj) {
  const bases = new Set()
  for (const key of Object.keys(obj ?? {})) {
    if (PLURAL_SUFFIX.test(key)) bases.add(key.replace(PLURAL_SUFFIX, ''))
  }
  return bases
}

function walk(a, b, prefix, ns, problems) {
  const keys = new Set([...Object.keys(a ?? {}), ...Object.keys(b ?? {})])
  const basesA = pluralBases(a)
  const basesB = pluralBases(b)

  for (const base of new Set([...basesA, ...basesB])) {
    const full = prefix ? `${prefix}.${base}` : base
    if (!basesA.has(base)) problems.push(`${ns}: brak liczebnika w EN -> ${full}`)
    if (!basesB.has(base)) problems.push(`${ns}: brak liczebnika w PL -> ${full}`)
  }

  for (const key of [...keys].sort()) {
    // Warianty liczby mnogiej sprawdzone wyżej, po bazie klucza.
    if (PLURAL_SUFFIX.test(key)) {
      const value = (a && a[key]) ?? (b && b[key])
      const full = prefix ? `${prefix}.${key}` : key
      if (typeof value === 'string' && !value.trim()) problems.push(`${ns}: pusty tekst -> ${full}`)
      continue
    }
    const full = prefix ? `${prefix}.${key}` : key
    const inA = a != null && Object.prototype.hasOwnProperty.call(a, key)
    const inB = b != null && Object.prototype.hasOwnProperty.call(b, key)

    if (!inA) { problems.push(`${ns}: brak w EN  -> ${full}`); continue }
    if (!inB) { problems.push(`${ns}: brak w PL  -> ${full}`); continue }

    const ta = typeOf(a[key])
    const tb = typeOf(b[key])
    if (ta !== tb) {
      problems.push(`${ns}: rozjazd typow (${ta} vs ${tb}) -> ${full}`)
      continue
    }

    if (ta === 'object') {
      walk(a[key], b[key], full, ns, problems)
    } else if (ta === 'array') {
      if (a[key].length !== b[key].length) {
        problems.push(`${ns}: rozna dlugosc tablicy (${a[key].length} vs ${b[key].length}) -> ${full}`)
      }
      a[key].forEach((item, i) => {
        if (typeof item === 'string' && !item.trim()) problems.push(`${ns}: pusty tekst EN -> ${full}[${i}]`)
      })
      b[key].forEach((item, i) => {
        if (typeof item === 'string' && !item.trim()) problems.push(`${ns}: pusty tekst PL -> ${full}[${i}]`)
      })
    } else if (ta === 'string') {
      if (!a[key].trim()) problems.push(`${ns}: pusty tekst EN -> ${full}`)
      if (!b[key].trim()) problems.push(`${ns}: pusty tekst PL -> ${full}`)
    }
  }
}

const files = {}
for (const lang of LANGS) {
  const dir = path.join(LOCALES, lang)
  if (!fs.existsSync(dir)) {
    console.error(`Brak katalogu ${dir}`)
    process.exit(1)
  }
  files[lang] = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
}

const problems = []

for (const ns of files.en) {
  if (!files.pl.includes(ns)) problems.push(`brak pliku PL: ${ns}`)
}
for (const ns of files.pl) {
  if (!files.en.includes(ns)) problems.push(`brak pliku EN: ${ns}`)
}

const shared = files.en.filter((f) => files.pl.includes(f))
let keyCount = 0

for (const ns of shared) {
  const en = JSON.parse(fs.readFileSync(path.join(LOCALES, 'en', ns), 'utf8'))
  const pl = JSON.parse(fs.readFileSync(path.join(LOCALES, 'pl', ns), 'utf8'))
  const before = problems.length
  walk(en, pl, '', ns.replace('.json', ''), problems)
  keyCount += countLeaves(en)
  if (problems.length === before) console.log(`  ok  ${ns}`)
}

function countLeaves(obj) {
  let n = 0
  for (const v of Object.values(obj)) {
    if (v && typeof v === 'object' && !Array.isArray(v)) n += countLeaves(v)
    else n += 1
  }
  return n
}

if (problems.length > 0) {
  console.error(`\nZnaleziono ${problems.length} problemow:`)
  problems.forEach((p) => console.error('  ' + p))
  process.exit(1)
}

console.log(`\nOK: ${shared.length} namespace'ow, ${keyCount} kluczy, EN i PL zgodne.`)
