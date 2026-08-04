// Walidacja numeru kontenera wg ISO 6346 (cyfra kontrolna) — czysta funkcja,
// wyłącznie po stronie klienta. Numer NIGDY nie jest zapisywany ani logowany
// (dane handlowe klienta) — ten moduł tylko liczy, nic nie persystuje.
//
import { lookupCarrierByPrefix } from '../data/containerPrefixes'

// Algorytm zweryfikowany 2026-08-04 na https://en.wikipedia.org/wiki/ISO_6346
// (rozpisany przykład CSQU3054383 → suma 6185, 6185 mod 11 = 3 = cyfra kontrolna):
//   1. Litery → liczby wg tabeli (A=10, pomijamy wielokrotności 11 czyli 11/22/33,
//      więc B=12 ... Z=38).
//   2. 10 znaków (3 litery właściciela + litera kategorii U/J/Z + 6 cyfr numeru)
//      mnożymy przez 2^pozycja (pozycja 0 dla lewego znaku, rosnąco w prawo).
//   3. Sumujemy, dzielimy przez 11 — RESZTA to cyfra kontrolna.
//   4. Jeśli reszta = 10, cyfra kontrolna = 0 (nie ma cyfry „10”).

const LETTER_VALUES = {
  A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17, H: 18, I: 19,
  J: 20, K: 21, L: 23, M: 24, N: 25, O: 26, P: 27, Q: 28, R: 29,
  S: 30, T: 31, U: 32, V: 34, W: 35, X: 36, Y: 37, Z: 38,
}

// Pełny kształt ISO 6346: 4 litery (kod właściciela + kategoria U/J/Z) + 7 cyfr
// (6 cyfr numeru + 1 cyfra kontrolna) = 11 znaków.
const FULL_PATTERN = /^[A-Z]{4}\d{7}$/

// Akceptuje numer ze spacjami/myślnikami i małymi literami — normalizuje przed obróbką.
export function normalizeContainerNumber(raw) {
  return (raw || '').toUpperCase().replace(/[\s-]/g, '')
}

function computeCheckDigit(tenChars) {
  let sum = 0
  for (let i = 0; i < tenChars.length; i++) {
    const ch = tenChars[i]
    const value = ch >= 'A' && ch <= 'Z' ? LETTER_VALUES[ch] : Number(ch)
    sum += value * 2 ** i
  }
  const remainder = sum % 11
  return remainder === 10 ? 0 : remainder
}

// Zwraca:
//   normalized  – numer po normalizacji (wielkie litery, bez spacji/myślników)
//   prefix      – pierwsze 4 znaki, jeśli są literami (do rozpoznania linii); inaczej ''
//   valid       – true/false gdy da się policzyć cyfrę kontrolną; null gdy kształt
//                 numeru nie pozwala jej policzyć (np. zła długość) — NIE blokujemy
//                 wtedy wyszukiwania, tylko pomijamy ocenę poprawności
//   checkDigit  – policzona cyfra kontrolna (tylko gdy valid !== null)
export function analyzeContainerNumber(raw) {
  const normalized = normalizeContainerNumber(raw)
  const prefixCandidate = normalized.slice(0, 4)
  const prefix = /^[A-Z]{4}$/.test(prefixCandidate) ? prefixCandidate : ''

  if (!FULL_PATTERN.test(normalized)) {
    return { normalized, prefix, valid: null, checkDigit: null }
  }

  const body = normalized.slice(0, 10)
  const providedCheckDigit = Number(normalized[10])
  const checkDigit = computeCheckDigit(body)

  return { normalized, prefix, valid: checkDigit === providedCheckDigit, checkDigit }
}

// Łączy analyzeContainerNumber + lookupCarrierByPrefix w jedno wywołanie —
// WSPÓLNA ścieżka dla ContainerLookup (wyszukiwarka w Śledzeniu ładunku) i
// widoku szczegółów przesyłki (link do trackera z zapisanego numeru
// kontenera), żeby rozpoznawanie linii nie było zduplikowane w dwóch miejscach.
// Zwraca analyzeContainerNumber(raw) + { carrier } (null gdy prefiks nierozpoznany).
export function identifyContainer(raw) {
  const analysis = analyzeContainerNumber(raw)
  const carrier = analysis.prefix ? lookupCarrierByPrefix(analysis.prefix) : null
  return { ...analysis, carrier }
}
