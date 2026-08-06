// Walidacja numeru kontenera wg ISO 6346 (cyfra kontrolna) — kopia logiki z
// src/utils/containerNumber.js. Backend NIE importuje z drzewa src/ (frontendowy
// moduł, patrz ta sama uwaga w api/_validation/shipsgoTracking.js), więc algorytm
// jest zduplikowany tutaj celowo. Zmiana w jednym miejscu wymaga zmiany w drugim.
//
// Używana WYŁĄCZNIE jako bramka przed POST /ocean/shipments (kosztuje kredyt) —
// literówka w numerze kontenera zapisanym w DocumentSet nie powinna palić kredytu
// na numer, który i tak nie może być poprawny.

const LETTER_VALUES = {
  A: 10, B: 12, C: 13, D: 14, E: 15, F: 16, G: 17, H: 18, I: 19,
  J: 20, K: 21, L: 23, M: 24, N: 25, O: 26, P: 27, Q: 28, R: 29,
  S: 30, T: 31, U: 32, V: 34, W: 35, X: 36, Y: 37, Z: 38,
}

const FULL_PATTERN = /^[A-Z]{4}\d{7}$/

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

// Zwraca true tylko gdy numer ma pełny kształt ISO 6346 I cyfra kontrolna się zgadza.
// Nie normalizuje wejścia — wywołujący przekazuje już znormalizowany numer
// (wielkie litery, bez spacji/myślników), tak jak jest zapisany w DocumentSet.
export function isValidContainerNumber(raw) {
  const normalized = (raw || '').toUpperCase().replace(/[\s-]/g, '')
  if (!FULL_PATTERN.test(normalized)) return false
  const body = normalized.slice(0, 10)
  const providedCheckDigit = Number(normalized[10])
  return computeCheckDigit(body) === providedCheckDigit
}
