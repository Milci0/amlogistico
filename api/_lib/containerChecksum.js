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

export function normalizeContainerNumber(raw) {
  return (raw || '').toUpperCase().replace(/[\s-]/g, '')
}

// Zwraca { normalized, ok, code } gdzie code to 'ok' | 'empty' | 'format' | 'checksum'.
// Rozróżnienie kształtu od sumy kontrolnej jest po to, żeby trasa mogła zwrócić
// właściwy komunikat, a nie jeden generyczny „nieprawidłowy numer".
//
// Backend NIGDY nie podpowiada wyliczonej cyfry kontrolnej — niezgodność sumy
// nie wskazuje, która z pierwszych dziesięciu pozycji jest zła (patrz obszerny
// komentarz w src/utils/containerNumber.js). Wyjątek opisany tam wymaga wiedzy
// o poprzednim wpisie w tej samej sesji, której backend nie ma i mieć nie powinien.
export function validateContainerNumber(raw) {
  const normalized = normalizeContainerNumber(raw)
  if (!normalized) return { normalized, ok: false, code: 'empty' }
  if (!FULL_PATTERN.test(normalized)) return { normalized, ok: false, code: 'format' }
  const providedCheckDigit = Number(normalized[10])
  if (computeCheckDigit(normalized.slice(0, 10)) !== providedCheckDigit) {
    return { normalized, ok: false, code: 'checksum' }
  }
  return { normalized, ok: true, code: 'ok' }
}

// Zwraca true tylko gdy numer ma pełny kształt ISO 6346 I cyfra kontrolna się zgadza.
export function isValidContainerNumber(raw) {
  return validateContainerNumber(raw).ok
}
