// translateEngineWarning — ETAP 2.1.
//
// Najwazniejszy test w tym pliku to ten o STARYCH rekordach: `engineResult.warnings`
// zapisane w bazie przed ETAPEM 2.1 to zwykle stringi po polsku. Odczyt takiego
// rekordu nie moze rzucic ani zwrocic smieci.

import { describe, it, expect } from 'vitest'
import { translateEngineWarning } from '../translateEngineWarning'

const OLD_RECORD_WARNINGS = [
  'ISF 10+2 musi być złożony minimum 24h przed załadunkiem na statek w porcie wyjścia.',
  'Form M (Nigeria) musi być uzyskany przez importera PRZED wysyłką.',
  'Eksport do CA: preferencyjne pochodzenie deklaruje sie na fakturze (system REX / deklaracja pochodzenia), a nie przez EUR.1. Do 6000 EUR moze ja wystawic kazdy eksporter; powyzej - tylko zarejestrowany/upowazniony eksporter (REX).',
  'Trasa przez kraj spoza Konwencji o wspolnej procedurze tranzytowej (RU, KZ). Wymagany Karnet TIR (transport drogowy, pojazd zatwierdzony TIR, gwarancja celna). TIR nie obejmuje alkoholu i wyrobow tytoniowych.',
  'Zdanie, ktorego silnik juz nie produkuje i ktorego nikt nie tlumaczyl.',
]

describe('stare rekordy (warnings jako stringi)', () => {
  it('nie rzuca dla zadnego zapisanego zdania, w obu jezykach', () => {
    for (const lang of ['pl', 'en', 'en-GB', 'pl-PL']) {
      for (const w of OLD_RECORD_WARNINGS) {
        expect(() => translateEngineWarning(w, lang)).not.toThrow()
        expect(typeof translateEngineWarning(w, lang)).toBe('string')
      }
    }
  })

  it('po polsku zwraca oryginal', () => {
    const src = OLD_RECORD_WARNINGS[0]
    expect(translateEngineWarning(src, 'pl')).toBe(src)
  })

  it('po angielsku tlumaczy przez dopasowanie 1:1 (EXACT)', () => {
    const out = translateEngineWarning(OLD_RECORD_WARNINGS[0], 'en')
    expect(out).toContain('ISF 10+2')
    expect(out).not.toContain('załadunkiem')
  })

  it('po angielsku tlumaczy zdania sklejane (PATTERNS) zachowujac zmienna czesc', () => {
    expect(translateEngineWarning(OLD_RECORD_WARNINGS[2], 'en')).toContain('Export to CA')
    expect(translateEngineWarning(OLD_RECORD_WARNINGS[3], 'en')).toContain('RU, KZ')
  })

  it('nieznane zdanie zwraca bez zmian zamiast rzucac', () => {
    const src = OLD_RECORD_WARNINGS[4]
    expect(translateEngineWarning(src, 'en')).toBe(src)
  })
})

describe('wartosci brzegowe', () => {
  it('null, undefined, liczba i pusty string nie rzucaja', () => {
    for (const bad of [null, undefined, 0, 42, '', NaN, [], true]) {
      expect(() => translateEngineWarning(bad, 'en')).not.toThrow()
      expect(() => translateEngineWarning(bad, 'pl')).not.toThrow()
    }
  })

  it('brak jezyka nie rzuca', () => {
    expect(() => translateEngineWarning({ code: 'warn_isf_24h' }, undefined)).not.toThrow()
    expect(() => translateEngineWarning('cokolwiek', undefined)).not.toThrow()
  })
})

describe('nowy ksztalt (obiekt z kodem)', () => {
  it('tlumaczy po kodzie na angielski', () => {
    const out = translateEngineWarning({ code: 'warn_isf_24h', message: 'PL zrodlowe' }, 'en')
    expect(out).toContain('ISF 10+2')
    expect(out).toContain('24 hours')
  })

  it('tlumaczy po kodzie takze na polski — czego stara sciezka nie potrafila', () => {
    const out = translateEngineWarning({ code: 'warn_isf_24h', message: 'PL zrodlowe' }, 'pl')
    expect(out).toContain('ISF 10+2')
    expect(out).toContain('załadunkiem')
    expect(out).not.toBe('PL zrodlowe')
  })

  it('interpoluje zmienne z params', () => {
    const en = translateEngineWarning({ code: 'warn_rex_export', params: { country: 'CA' } }, 'en')
    expect(en).toContain('Export to CA')
    const pl = translateEngineWarning({ code: 'warn_rex_export', params: { country: 'CA' } }, 'pl')
    expect(pl).toContain('Eksport do CA')
  })

  it('interpoluje liste krajow w ostrzezeniu tranzytowym', () => {
    const out = translateEngineWarning({ code: 'warn_tir_non_ctc', params: { countries: 'RU, KZ' } }, 'en')
    expect(out).toContain('RU, KZ')
  })

  it('nieznany kod spada na zdanie zrodlowe', () => {
    const message = 'Zdanie, ktorego silnik juz nie produkuje i ktorego nikt nie tlumaczyl.'
    expect(translateEngineWarning({ code: 'warn_z_przyszlosci', message }, 'en')).toBe(message)
    expect(translateEngineWarning({ code: 'warn_z_przyszlosci', message }, 'pl')).toBe(message)
  })

  it('nieznany kod bez message zwraca pusty string, nie rzuca', () => {
    expect(translateEngineWarning({ code: 'warn_z_przyszlosci' }, 'en')).toBe('')
  })
})

// ─── POKRYCIE TLUMACZEN DLA KODOW EMITOWANYCH PRZEZ SILNIK ──────────────────
//
// ETAP 2 dolozyl szesc nowych kodow ostrzezen. Kazdy MUSI miec klucz w EN i PL,
// inaczej uzytkownik anglojezyczny zobaczy zdanie po polsku (degradacja, ktora
// nie wywala aplikacji, wiec sama z siebie sie nie ujawni).
//
// Test omiata trasy zamiast czytac stala z silnika: sprawdza to, co uzytkownik
// faktycznie zobaczy, a nie deklaracje.
describe('kazdy kod emitowany przez silnik ma tlumaczenie EN i PL', () => {
  const ROUTES = [
    ['PL', 'DE', 'road', 'general', {}],
    ['PL', 'TR', 'road', 'general', {}],
    ['PL', 'TR', 'road', 'food_plant', {}],
    ['PL', 'CA', 'sea', 'general', {}],
    ['PL', 'US', 'sea', 'electronics', {}],
    ['PL', 'NG', 'sea', 'general', {}],
    ['CN', 'PL', 'rail', 'general', {}],
    ['CN', 'PL', 'sea', 'food_plant', { cargoCategoryId: 'food_plant' }],
    ['PL', 'CN', 'sea', 'dangerous_goods', { containerized: true }],
    ['PL', 'CN', 'rail', 'dangerous_goods', {}],
    ['PL', 'IT', 'road', 'general', { transitNonEU: true, transitCountries: ['UA'] }],
    ['PL', 'DE', 'road', 'general', { cargoCategoryId: 'beverages' }],
    ['PL', 'DE', 'road', 'general', { cargoCategoryId: 'medicines' }],
    ['US', 'PL', 'sea', 'general', { cargoCategoryId: 'metals' }],
    ['PL', 'US', 'air', 'general', { consolidated: true }],
    ['RU', 'PL', 'rail', 'general', {}],
  ]

  it('zbior kodow jest niepusty i w calosci przetlumaczony', async () => {
    const { getDocuments } = await import('../documentEngine')
    const en = (await import('../../locales/en/errors.json')).default
    const pl = (await import('../../locales/pl/errors.json')).default

    const codes = new Set()
    for (const [o, d, m, c, f] of ROUTES) {
      const r = getDocuments(o, d, m, c, f, { includeMetadata: true })
      for (const w of r.warnings) codes.add(w.code)
    }

    expect(codes.size).toBeGreaterThan(10)
    const brakEn = [...codes].filter((c) => !en.engineWarnings[c])
    const brakPl = [...codes].filter((c) => !pl.engineWarnings[c])
    expect(brakEn, 'kody bez tlumaczenia EN').toEqual([])
    expect(brakPl, 'kody bez tlumaczenia PL').toEqual([])
  })

  it('szesc kodow z ETAPU 2 jest wsrod nich', async () => {
    const en = (await import('../../locales/en/errors.json')).default
    const pl = (await import('../../locales/pl/errors.json')).default
    const NOWE = [
      'warn_ens_lodgement', 'warn_cim_smgs_route', 'warn_container_packing_duplicate',
      'warn_cbam_annual', 'warn_emcs_arc', 'warn_sent_registration',
    ]
    for (const code of NOWE) {
      expect(en.engineWarnings[code], `EN ${code}`).toBeTruthy()
      expect(pl.engineWarnings[code], `PL ${code}`).toBeTruthy()
    }
  })
})
