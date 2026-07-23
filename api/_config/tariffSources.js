// Konfiguracja doboru kodu celnego wg trasy (Etap 1 wyszukiwarki HS AI).
//
// Reguła (opiera się o KRAJ NADANIA, nie całą trasę):
//   - countryFrom w UE  → pełny CN8 z cn_codes, zawsze (polski eksporter do Kanady
//     nadal składa unijne zgłoszenie eksportowe i potrzebuje pełnego CN8).
//   - countryTo poza UE → DODATKOWO osobna sugestia kodu z taryfy kraju docelowego
//     (tylko gdy kraj jest w officialTariffSources — inaczej pomijamy web_search).
//   - countryFrom poza UE → tylko HS-6 (ISZTAR nie obejmuje tamtejszej taryfy).

// Lista kodów UE — spójna z EU_CODES w src/services/documentGeneration.js.
// Trzymana osobno, bo backend (api/) nie importuje modułów z src/.
export const EU_CODES = new Set([
  'PL', 'DE', 'FR', 'NL', 'BE', 'CZ', 'SK', 'AT', 'IT', 'ES', 'PT', 'SE', 'DK',
  'FI', 'HU', 'RO', 'BG', 'HR', 'GR', 'EE', 'LV', 'LT',
  // pozostałe państwa UE (dla kompletności bramki UE/poza-UE):
  'IE', 'LU', 'SI', 'CY', 'MT',
])

export function isEU(code) {
  return EU_CODES.has(String(code || '').toUpperCase())
}

// Oficjalne taryfy celne krajów docelowych, do których web_search jest ograniczony
// (allowed_domains). Klucz = kod ISO-2 kraju, wartość = lista dozwolonych domen.
// Kraju spoza tej mapy NIE odpytujemy web_searchem (zwracamy destinationCode: null).
export const officialTariffSources = {
  US: ['hts.usitc.gov'],
  CA: ['cbsa-asfc.gc.ca'],
  GB: ['trade-tariff.service.gov.uk'],
  AU: ['abf.gov.au'],
  CH: ['xtares.admin.ch'],
  NO: ['tolletaten.no'],
}

// Pełne nazwy krajów docelowych (do nagłówka sekcji „Kod dla odprawy importowej w …").
export const COUNTRY_NAMES_PL = {
  US: 'USA',
  CA: 'Kanada',
  GB: 'Wielka Brytania',
  AU: 'Australia',
  CH: 'Szwajcaria',
  NO: 'Norwegia',
}

// Nazwy oficjalnych systemów taryfowych (do etykiety „Zweryfikowano w …").
export const TARIFF_SYSTEM_NAMES = {
  US: 'HTS (USITC)',
  CA: 'CBSA Customs Tariff',
  GB: 'UK Trade Tariff',
  AU: 'ABF Tariff',
  CH: 'Xtares (Szwajcaria)',
  NO: 'Tolletaten (Norwegia)',
}
