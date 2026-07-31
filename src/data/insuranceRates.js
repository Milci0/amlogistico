// Stawki ubezpieczenia cargo i kalkulator składki (czysta logika, zero React/fetch).
//
// Źródło liczb: docs/insurance-ref/insuranceService.ts — plik referencyjny pod integrację
// z Loadsure. Przeniesione są WYŁĄCZNIE stałe i wzór kalkulacji; żadnego wywołania API
// tutaj nie ma i mieć nie będzie, dopóki nie zostanie podpisana umowa z ubezpieczycielem.
//
// Klucze kategorii są WŁASNE dla kalkulatora — celowo NIE pokrywają się z 19 kategoriami
// z data/cargoCategories.js (tamte opisują towar pod kątem celnym, te pod kątem ryzyka).
// Mapowanie 19→12 to decyzja biznesowa do podjęcia razem z ubezpieczycielem.

export const BASE_RATES = {
  general:      0.37,
  machinery:    0.28,
  electronics:  0.52,
  food_chilled: 0.45,
  food_frozen:  0.48,
  valuable:     0.65,
  chemicals:    0.58,
  vehicles:     0.35,
  textiles:     0.25,
  metals:       0.22,
  medicines:    0.55,
  dangerous:    0.85,
}

// Instytutowe klauzule ładunkowe (Institute Cargo Clauses)
export const COVERAGE_MULTIPLIERS = {
  ICC_A: 1.00, // all risk, najszerszy
  ICC_B: 0.75, // named perils
  ICC_C: 0.55, // podstawowy
}

export const MODE_MULTIPLIERS = {
  sea:  1.00,
  air:  0.85, // niższe ryzyko
  road: 0.90,
  rail: 0.80,
}

const DANGEROUS_MULTIPLIER = 1.5
const PERISHABLE_MULTIPLIER = 1.2

// Poniżej tej kwoty składka się nie opłaca obsługowo — ubezpieczyciele stosują minimum.
export const MIN_PREMIUM = 25

/**
 * Szacunek składki: wartość ładunku × stawka bazowa skorygowana o zakres ochrony,
 * środek transportu i charakter towaru. Wynik zaokrąglony, nie mniejszy niż MIN_PREMIUM.
 */
export function calculatePremiumLocally({
  cargoValue,
  cargoCategory,
  coverageType,
  transportMode,
  dangerous,
  perishable,
}) {
  const baseRate     = BASE_RATES[cargoCategory] ?? BASE_RATES.general
  const coverageMul  = COVERAGE_MULTIPLIERS[coverageType] ?? COVERAGE_MULTIPLIERS.ICC_A
  const modeMul      = MODE_MULTIPLIERS[transportMode] ?? 1.0
  const dangerousMul = dangerous  ? DANGEROUS_MULTIPLIER  : 1.0
  const perishMul    = perishable ? PERISHABLE_MULTIPLIER : 1.0

  const rate    = baseRate * coverageMul * modeMul * dangerousMul * perishMul
  const premium = Math.round((Number(cargoValue) || 0) * rate / 100)

  return Math.max(premium, MIN_PREMIUM)
}

// ── Etykiety do UI ─────────────────────────────────────────────────────────────

export const COVERAGE_LABELS = {
  ICC_A: { name: 'ICC (A), all risk',     desc: 'Najszerszy zakres ochrony' },
  ICC_B: { name: 'ICC (B), named perils', desc: 'Wybrane ryzyka' },
  ICC_C: { name: 'ICC (C), podstawowy',   desc: 'Zakres minimalny' },
}

export const RATE_CATEGORY_LABELS = {
  general:      'Towary ogólne',
  machinery:    'Maszyny i urządzenia',
  electronics:  'Elektronika',
  food_chilled: 'Żywność chłodzona',
  food_frozen:  'Żywność mrożona',
  valuable:     'Towary wartościowe',
  chemicals:    'Chemikalia',
  vehicles:     'Pojazdy',
  textiles:     'Tekstylia',
  metals:       'Metale',
  medicines:    'Farmaceutyki',
  dangerous:    'Towary niebezpieczne',
}

export const TRANSPORT_MODE_LABELS = {
  sea:  'Morski',
  air:  'Lotniczy',
  road: 'Drogowy',
  rail: 'Kolejowy',
}

export const CURRENCIES = ['EUR', 'PLN', 'USD']
