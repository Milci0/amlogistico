// Testy silnika doboru — ETAP 2.1 (wsteczna zgodnosc + tryb metadanych)
// i ETAP 2.2 (poprawki merytoryczne).
//
// Pelna macierz tras (60+ przypadkow) to ETAP 3; tutaj sprawdzamy WYLACZNIE to,
// co zmienil etap 2, plus twarda gwarancje, ze bez szostego argumentu nic sie
// nie zmienilo.

import { describe, it, expect } from 'vitest'
import { getDocuments, PREFERENTIAL_ORIGIN_MAP, LAYERS } from '../documentEngine'

const ids = (list) => list.map((d) => d.id)

// ─── Migawka zachowania ─────────────────────────────────────────────────────
// Pierwotnie zdjeta z silnika sprzed ETAPU 1, gdzie kazda rozbieznosc oznaczala
// zlamanie wstecznej zgodnosci.
//
// ETAP 2 Promptu 2 CELOWO zmienil dobor na pieciu z jedenastu tras - wpiacie
// 22 nowych dokumentow bylo cala jego trescia. Rozbieznosci sa wypisane przy
// kazdej trasie, zeby za pol roku nikt nie uznal ich za regresje. Trasy bez
// komentarza NIE zmienily sie ani o jeden dokument.
//
// Gwarancja KSZTALTU (5 pol we wpisie, warnings jako stringi, brak `blanks`
// bez szostego argumentu) obowiazuje dalej i jest testowana ponizej.
//
// Dopiecie 136_Wagon_List i 122_Delivery_Order (2026-08-04) NIE zmienilo tu
// niczego i tak ma zostac: 136 wymaga flagi `groupConsignment`, ktorej zadna
// z tych tras nie podaje, a 122 dotyczy wylacznie PRZYWOZU morskiego do UE -
// jedyna trasa importowa w tej migawce (CN|PL) jest kolejowa. Brak zmiany jest
// tu wynikiem, nie przeoczeniem: obie reguly sa waskie z zalozenia.
const BASELINE = {
  'PL|DE|road|general': {
    required: ['01_CMR', '09_Zlecenie', '10_POD', '02_PackingList', '03_Invoice'],
    conditional: [],
    warnings: 0,
  },
  // ETAP 2: +130 (CH w strefie PEM, wiec deklaracja dostawcy ma sens).
  'PL|CH|road|general': {
    required: ['01_CMR', '09_Zlecenie', '10_POD', '02_PackingList', '03_Invoice', '04_Proforma', '07_EAD'],
    conditional: ['06_COO', '12_EUR1', '130_Supplier_Declaration'],
    warnings: 0,
  },
  // ETAP 2: +129 (A.TR zastapil ostrzezenie warn_atr_turkey, stad warnings 1 -> 0),
  // +130 (TR w unii celnej).
  'PL|TR|road|general': {
    required: ['01_CMR', '09_Zlecenie', '10_POD', '02_PackingList', '03_Invoice', '04_Proforma', '07_EAD', '129_ATR_Certificate', '51_Turkey_Import'],
    conditional: ['06_COO', '130_Supplier_Declaration'],
    warnings: 0,
  },
  // ETAP 2: +131 (CA w REX_FTA), +130.
  'PL|CA|sea|general': {
    required: ['05_BL', '02_PackingList', '03_Invoice', '04_Proforma', '07_EAD', '42_Canada_Import'],
    conditional: ['26_SeaWaybill', '06_COO', '131_REX_Statement_Origin', '130_Supplier_Declaration'],
    warnings: 1,
  },
  'PL|US|sea|electronics': {
    required: ['05_BL', '02_PackingList', '03_Invoice', '04_Proforma', '07_EAD', '08_ISF', '20_CBP7501'],
    conditional: ['26_SeaWaybill', '06_COO', '106_CE'],
    warnings: 1,
  },
  // ETAP 2, najwieksza zmiana: 27_CIM -> 134_CIM_SMGS (CN jest w SMGS_ONLY),
  // +124 i +125 przy wprowadzeniu do UE. Ostrzezenia: warn_eu_import_sad
  // wycofane, doszly warn_cim_smgs_route i warn_ens_lodgement (1 -> 2).
  'CN|PL|rail|general': {
    required: ['134_CIM_SMGS', '02_PackingList', '03_Invoice', '04_Proforma', '23_China_Export', '06_COO', '124_ENS_ICS2', '125_EU_Import_Declaration'],
    conditional: [],
    warnings: 2,
  },
  // ETAP 2: +130 (NO w strefie PEM).
  'PL|NO|road|dangerous_goods': {
    required: ['01_CMR', '09_Zlecenie', '10_POD', '02_PackingList', '03_Invoice', '04_Proforma', '07_EAD', '29_DG_Manifest', '69_MSDS', '118_ADR'],
    conditional: ['06_COO', '12_EUR1', '130_Supplier_Declaration', '14_ADR'],
    warnings: 1,
  },
  // ETAP 2: +123 przy morskich towarach niebezpiecznych, wraz z ostrzezeniem
  // warn_container_packing_duplicate (0 -> 1).
  'PL|CN|sea|dangerous_goods': {
    required: ['05_BL', '02_PackingList', '03_Invoice', '04_Proforma', '07_EAD', '22_China_Import', '29_DG_Manifest', '69_MSDS', '15_IMDG', '123_Container_Packing_Cert'],
    conditional: ['26_SeaWaybill', '06_COO'],
    warnings: 1,
  },
  'PL|NG|sea|general': {
    required: ['05_BL', '02_PackingList', '03_Invoice', '04_Proforma', '07_EAD', '53_Nigeria_Import', '68_PSI'],
    conditional: ['26_SeaWaybill', '06_COO'],
    warnings: 2,
  },
  'BR|AR|sea|general': {
    required: ['05_BL', '02_PackingList', '03_Invoice', '04_Proforma', '36_Brazil_Export', '72_Argentina_Import'],
    conditional: ['26_SeaWaybill'],
    warnings: 0,
  },
  'PL|IN|air|general': {
    required: ['11_AWB', '02_PackingList', '03_Invoice', '04_Proforma', '07_EAD', '44_India_Import'],
    conditional: ['06_COO'],
    warnings: 0,
  },
}

describe('ETAP 2.1 — wsteczna zgodnosc bez szostego argumentu', () => {
  for (const [key, expected] of Object.entries(BASELINE)) {
    const [origin, destination, mode, cargo] = key.split('|')
    it(`${key} zwraca dokladnie to co przed zmiana`, () => {
      const r = getDocuments(origin, destination, mode, cargo, {})
      expect(ids(r.required)).toEqual(expected.required)
      expect(ids(r.conditional)).toEqual(expected.conditional)
      expect(r.warnings).toHaveLength(expected.warnings)
    })
  }

  it('warnings to tablica STRINGOW, nie obiektow', () => {
    const r = getDocuments('PL', 'US', 'sea', 'general', {})
    expect(r.warnings.length).toBeGreaterThan(0)
    for (const w of r.warnings) expect(typeof w).toBe('string')
  })

  it('wpis ma tylko 5 pol sprzed ETAPU 1 — metadane katalogu nie wyciekaja', () => {
    const r = getDocuments('PL', 'DE', 'road', 'general', {})
    for (const doc of r.required) {
      expect(Object.keys(doc).sort()).toEqual(['available', 'id', 'name_en', 'name_pl', 'path'])
    }
  })

  it('nie zwraca klucza `blanks` w trybie zgodnosci', () => {
    const r = getDocuments('PL', 'NG', 'sea', 'general', {})
    expect(r.blanks).toBeUndefined()
  })

  it('jawne includeMetadata:false zachowuje sie jak brak argumentu', () => {
    const a = getDocuments('PL', 'US', 'sea', 'electronics', {})
    const b = getDocuments('PL', 'US', 'sea', 'electronics', {}, { includeMetadata: false })
    expect(b).toEqual(a)
  })
})

describe('ETAP 2.1 — tryb includeMetadata', () => {
  const meta = (o, d, m, c, f = {}) => getDocuments(o, d, m, c, f, { includeMetadata: true })

  it('zwraca cztery listy', () => {
    const r = meta('PL', 'NG', 'sea', 'general')
    expect(Array.isArray(r.required)).toBe(true)
    expect(Array.isArray(r.conditional)).toBe(true)
    expect(Array.isArray(r.blanks)).toBe(true)
    expect(Array.isArray(r.warnings)).toBe(true)
  })

  it('zaden dokument blank_only nie trafia do required ani conditional', () => {
    const routes = [
      ['PL', 'NG', 'sea', 'general'],
      ['PL', 'IN', 'air', 'general'],
      ['PL', 'US', 'sea', 'electronics'],
      ['CN', 'PL', 'rail', 'general'],
      ['PL', 'CN', 'sea', 'dangerous_goods'],
    ]
    for (const route of routes) {
      const r = meta(...route)
      for (const doc of [...r.required, ...r.conditional]) {
        expect(doc.outputMode).not.toBe('blank_only')
      }
      for (const doc of r.blanks) {
        expect(doc.outputMode).toBe('blank_only')
      }
    }
  })

  it('Form M (Nigeria) jest w blanks, NIE w required — wystawia go bank/urzad kraju przywozu', () => {
    const r = meta('PL', 'NG', 'sea', 'general')
    expect(ids(r.blanks)).toContain('53_Nigeria_Import')
    expect(ids(r.required)).not.toContain('53_Nigeria_Import')
  })

  it('Bill of Entry (Indie) jest w blanks — wystawia zagraniczny agent celny', () => {
    const r = meta('PL', 'IN', 'air', 'general')
    expect(ids(r.blanks)).toContain('44_India_Import')
    expect(ids(r.required)).not.toContain('44_India_Import')
  })

  it('kazdy wpis niesie layer, outputMode, issuerType i blocking', () => {
    const r = meta('PL', 'US', 'sea', 'electronics')
    for (const doc of [...r.required, ...r.conditional, ...r.blanks]) {
      expect(typeof doc.layer).toBe('number')
      expect(doc.layer).toBeGreaterThanOrEqual(1)
      expect(doc.layer).toBeLessThanOrEqual(7)
      expect(['final', 'draft', 'blank_only']).toContain(doc.outputMode)
      expect(typeof doc.issuerType).toBe('string')
      expect(typeof doc.blocking).toBe('boolean')
    }
  })

  it('required ma `reason`, conditional ma `condition`', () => {
    const r = meta('PL', 'US', 'sea', 'electronics')
    for (const doc of r.required) expect(typeof doc.reason).toBe('string')
    for (const doc of r.conditional) expect(typeof doc.condition).toBe('string')
  })

  it('warstwa zgadza sie ze zrodlem reguly', () => {
    const r = meta('PL', 'US', 'sea', 'electronics')
    const byId = Object.fromEntries([...r.required, ...r.conditional, ...r.blanks].map((d) => [d.id, d]))
    expect(byId['05_BL'].layer).toBe(LAYERS.TRANSPORT)
    expect(byId['02_PackingList'].layer).toBe(LAYERS.COMMERCIAL)
    expect(byId['07_EAD'].layer).toBe(LAYERS.EXPORT)
    expect(byId['08_ISF'].layer).toBe(LAYERS.IMPORT)
    expect(byId['106_CE'].layer).toBe(LAYERS.CARGO)
  })

  it('ostrzezenia to obiekty z kodem i poziomem waznosci', () => {
    const r = meta('PL', 'US', 'sea', 'general')
    expect(r.warnings.length).toBeGreaterThan(0)
    for (const w of r.warnings) {
      expect(typeof w.code).toBe('string')
      expect(['critical', 'warning', 'info']).toContain(w.severity)
      expect(typeof w.message).toBe('string')
      expect(w.message.length).toBeGreaterThan(0)
    }
  })

  it('sankcje maja poziom critical', () => {
    const r = meta('PL', 'RU', 'road', 'general')
    const sanction = r.warnings.find((w) => w.code === 'warn_sanctions_ru_by_dest')
    expect(sanction).toBeDefined()
    expect(sanction.severity).toBe('critical')
  })

  it('ostrzezenia ze zmienna niesie params do interpolacji', () => {
    const r = meta('PL', 'CA', 'sea', 'general')
    const rex = r.warnings.find((w) => w.code === 'warn_rex_export')
    expect(rex.params).toEqual({ country: 'CA' })
  })
})

describe('ETAP 2.2 — pochodzenie preferencyjne', () => {
  it('PREFERENTIAL_ORIGIN_MAP ma trzy rozlaczne rezimy', () => {
    const { PEM, CUSTOMS_UNION, REX_SELF_CERT } = PREFERENTIAL_ORIGIN_MAP
    expect(PEM.length).toBeGreaterThan(0)
    expect(CUSTOMS_UNION).toEqual(['TR', 'AD', 'SM'])
    expect(REX_SELF_CERT.length).toBeGreaterThan(0)
    for (const c of CUSTOMS_UNION) expect(PEM).not.toContain(c)
    for (const c of REX_SELF_CERT) expect(PEM).not.toContain(c)
    for (const c of REX_SELF_CERT) expect(CUSTOMS_UNION).not.toContain(c)
  })

  it('PL->CH (strefa PEM): EUR.1 jest, ostrzezenia o REX nie ma', () => {
    const r = getDocuments('PL', 'CH', 'road', 'general', {}, { includeMetadata: true })
    const all = [...ids(r.required), ...ids(r.conditional), ...ids(r.blanks)]
    expect(all).toContain('12_EUR1')
    expect(r.warnings.map((w) => w.code)).not.toContain('warn_rex_export')
  })

  // ETAP 2: do partii B doszedl szablon A.TR, wiec zamiast ostrzezenia
  // warn_atr_turkey uzytkownik dostaje teraz realny dokument.
  it('PL->TR towar przemyslowy: A.TR jako dokument, BEZ EUR.1', () => {
    const r = getDocuments('PL', 'TR', 'road', 'general', {}, { includeMetadata: true })
    const all = [...ids(r.required), ...ids(r.conditional), ...ids(r.blanks)]
    expect(all).not.toContain('12_EUR1')
    expect(all).toContain('129_ATR_Certificate')
    expect(r.warnings.map((w) => w.code)).not.toContain('warn_atr_turkey')
  })

  it('PL->TR produkty rolne: EUR.1 wraca, ostrzezenie zmienia sie na rolne', () => {
    const r = getDocuments('PL', 'TR', 'road', 'food_plant', {}, { includeMetadata: true })
    const all = [...ids(r.required), ...ids(r.conditional), ...ids(r.blanks)]
    expect(all).toContain('12_EUR1')
    const codes = r.warnings.map((w) => w.code)
    expect(codes).toContain('warn_atr_turkey_agri')
    expect(codes).not.toContain('warn_atr_turkey')
  })

  it('PL->CA (REX): BEZ EUR.1, jest ostrzezenie o oswiadczeniu na fakturze', () => {
    const r = getDocuments('PL', 'CA', 'sea', 'general', {}, { includeMetadata: true })
    const all = [...ids(r.required), ...ids(r.conditional), ...ids(r.blanks)]
    expect(all).not.toContain('12_EUR1')
    expect(r.warnings.map((w) => w.code)).toContain('warn_rex_export')
  })

  it('PL->JP i PL->GB tez ida sciezka REX, nie EUR.1', () => {
    for (const dest of ['JP', 'GB', 'VN', 'KR', 'SG', 'NZ']) {
      const r = getDocuments('PL', dest, 'sea', 'general', {}, { includeMetadata: true })
      const all = [...ids(r.required), ...ids(r.conditional), ...ids(r.blanks)]
      expect(all, `EUR.1 nie powinien byc dobrany dla ${dest}`).not.toContain('12_EUR1')
      expect(r.warnings.map((w) => w.code)).toContain('warn_rex_export')
    }
  })
})

describe('ETAP 2.2 — tranzyt drogowy i kolejowy', () => {
  it('droga przez kraj spoza CTC: T1/T2 ORAZ karnet TIR', () => {
    const r = getDocuments('PL', 'IT', 'road', 'general', { transitCountries: ['RU'] })
    expect(ids(r.required)).toContain('116_Transit')
    expect(ids(r.required)).toContain('117_TIR')
  })

  it('droga przez kraj CTC: samo T1/T2, bez TIR', () => {
    const r = getDocuments('PL', 'IT', 'road', 'general', { transitCountries: ['CH'] })
    expect(ids(r.required)).toContain('116_Transit')
    expect(ids(r.required)).not.toContain('117_TIR')
  })

  it('kolej przez kraj spoza UE: T1/T2 jest, karnet TIR NIE (TIR jest drogowy)', () => {
    const r = getDocuments('CN', 'PL', 'rail', 'general', { transitCountries: ['RU', 'BY'] }, { includeMetadata: true })
    const all = [...ids(r.required), ...ids(r.conditional), ...ids(r.blanks)]
    expect(all).toContain('116_Transit')
    expect(all).not.toContain('117_TIR')
    expect(r.warnings.map((w) => w.code)).toContain('warn_rail_transit_non_eu')
  })

  it('kolej przez kraj CTC: T1/T2 plus ostrzezenie CTC', () => {
    const r = getDocuments('PL', 'FR', 'rail', 'general', { transitCountries: ['CH'] }, { includeMetadata: true })
    const all = [...ids(r.required), ...ids(r.conditional), ...ids(r.blanks)]
    expect(all).toContain('116_Transit')
    expect(r.warnings.map((w) => w.code)).toContain('warn_ctc_transit')
  })

  it('kolej bez tranzytu poza UE: zadnego dokumentu tranzytowego', () => {
    const r = getDocuments('PL', 'FR', 'rail', 'general', {})
    expect(ids(r.required)).not.toContain('116_Transit')
    expect(ids(r.required)).not.toContain('117_TIR')
  })

  it('transport morski i lotniczy nie dostaja dokumentow tranzytowych', () => {
    for (const mode of ['sea', 'air', 'multimodal']) {
      const r = getDocuments('PL', 'IT', mode, 'general', { transitNonEU: true })
      expect(ids(r.required)).not.toContain('116_Transit')
      expect(ids(r.required)).not.toContain('117_TIR')
    }
  })
})

describe('Reguly, ktore NIE mialy sie zmienic', () => {
  it('AES (zgloszenie eksportowe USA) nie pojawia sie przy imporcie DO USA', () => {
    const r = getDocuments('PL', 'US', 'sea', 'general', {})
    expect(ids(r.required)).toContain('08_ISF')
    expect(ids(r.required)).not.toContain('30_USA_AES')
  })

  it('AES pojawia sie dopiero przy eksporcie Z USA', () => {
    const r = getDocuments('US', 'PL', 'sea', 'general', {})
    expect(ids(r.required)).toContain('30_USA_AES')
  })

  it('trasa poza UE (BR->AR) nie dostaje dokumentow unijnych', () => {
    const r = getDocuments('BR', 'AR', 'sea', 'general', {})
    const all = [...ids(r.required), ...ids(r.conditional)]
    expect(all).not.toContain('07_EAD')
    expect(all).not.toContain('12_EUR1')
    expect(all).not.toContain('104_T2L')
  })

  it('ADR tylko na drodze, IMDG tylko na morzu, IATA tylko w powietrzu', () => {
    const road = ids(getDocuments('PL', 'NO', 'road', 'dangerous_goods', {}).required)
    expect(road).toContain('118_ADR')
    expect(road).not.toContain('15_IMDG')
    expect(road).not.toContain('64_IATA_DGR')

    const sea = ids(getDocuments('PL', 'CN', 'sea', 'dangerous_goods', {}).required)
    expect(sea).toContain('15_IMDG')
    expect(sea).not.toContain('118_ADR')

    const air = ids(getDocuments('PL', 'CN', 'air', 'dangerous_goods', {}).required)
    expect(air).toContain('64_IATA_DGR')
    expect(air).not.toContain('118_ADR')
  })
})

// ─── KRYTERIA AKCEPTACYJNE ETAPU 2 (Prompt 2) ────────────────────────────────
//
// Cztery przypadki, ktorych po ETAPIE 1 nie dalo sie sprawdzic, bo silnik nie
// znal jeszcze nowych dokumentow. Kazdy jest tu w calosci, z warunkiem
// NEGATYWNYM obok pozytywnego - inaczej test przechodzilby takze wtedy, gdyby
// regula dokladala dokument zawsze.

describe('ETAP 2 — kryteria akceptacyjne', () => {
  const meta = (o, d, m, c, f = {}, opts = {}) =>
    getDocuments(o, d, m, c, f, { includeMetadata: true, ...opts })
  const allIds = (r) => [...ids(r.required), ...ids(r.conditional), ...ids(r.blanks)]

  it('1. sea + containerized zwraca 119_VGM_SOLAS z blocking: true', () => {
    const bez = meta('PL', 'US', 'sea', 'general')
    expect(allIds(bez)).not.toContain('119_VGM_SOLAS')

    const z = meta('PL', 'US', 'sea', 'general', { containerized: true })
    const vgm = z.required.find((d) => d.id === '119_VGM_SOLAS')
    expect(vgm, 'VGM musi byc w sekcji WYMAGANE').toBeDefined()
    expect(vgm.blocking).toBe(true)
    expect(vgm.layer).toBe(LAYERS.TRANSPORT)

    // Drobnica (break-bulk) nie podlega VGM - dlatego flaga, a nie sam tryb morski.
    expect(allIds(meta('PL', 'US', 'sea', 'general', { containerized: false })))
      .not.toContain('119_VGM_SOLAS')
  })

  it('2. air + consolidated zwraca 11_AWB i 137_HAWB; bez flagi tylko 11_AWB', () => {
    const bez = allIds(meta('PL', 'US', 'air', 'general', { consolidated: false }))
    expect(bez).toContain('11_AWB')
    expect(bez).not.toContain('137_HAWB')

    const z = allIds(meta('PL', 'US', 'air', 'general', { consolidated: true }))
    expect(z).toContain('11_AWB')
    expect(z).toContain('137_HAWB')
  })

  it('3. rail do strefy SMGS zwraca 134_CIM_SMGS, nie 27_CIM', () => {
    // PL -> CN: kraj docelowy w SMGS_ONLY.
    const doChin = allIds(meta('PL', 'CN', 'rail', 'general'))
    expect(doChin).toContain('134_CIM_SMGS')
    expect(doChin).not.toContain('27_CIM')

    // PL -> DE: obie strony w COTIF, zaden kraj z SMGS_ONLY. To wlasnie ten
    // przypadek psula by lista CZLONKOW SMGS (PL jest strona obu umow).
    const wewnatrzUE = allIds(meta('PL', 'DE', 'rail', 'general'))
    expect(wewnatrzUE).toContain('27_CIM')
    expect(wewnatrzUE).not.toContain('134_CIM_SMGS')

    // Kraj TRANZYTOWY tez uruchamia regule, mimo ze nadanie i cel sa w COTIF.
    const tranzytem = allIds(meta('PL', 'TR', 'rail', 'general', { transitCountries: ['BY', 'RU'] }))
    expect(tranzytem).toContain('134_CIM_SMGS')
    expect(tranzytem).not.toContain('27_CIM')
  })

  it('4. kakao z kraju trzeciego do PL: 127_EUDR_DDS w ostrzezeniach (info), NIE w required', () => {
    const r = meta('CN', 'PL', 'sea', 'food_plant', { cargoCategoryId: 'food_plant' })

    expect(ids(r.required), 'EUDR nie obowiazuje jeszcze w dacie referencyjnej')
      .not.toContain('127_EUDR_DDS')
    expect(allIds(r)).not.toContain('127_EUDR_DDS')

    const gate = r.warnings.find((w) => w.code === 'warn_document_not_yet_valid')
    expect(gate, 'brak ostrzezenia bramki czasowej').toBeDefined()
    expect(gate.severity).toBe('info')
    expect(gate.params.date).toBe('2026-12-30')

    // Kontrola odwrotna: po wejsciu obowiazku w zycie dokument WRACA do required.
    const po = meta('CN', 'PL', 'sea', 'food_plant', { cargoCategoryId: 'food_plant' }, {
      referenceDate: new Date('2027-01-15'),
    })
    expect(ids(po.required)).toContain('127_EUDR_DDS')
    expect(po.warnings.map((w) => w.code)).not.toContain('warn_document_not_yet_valid')
  })
})

// ─── REGULY STEROWANE ID KATEGORII Z KATALOGU ────────────────────────────────
//
// Dwanascie z dziewietnastu kategorii w cargoCategories.js mapuje sie na engine
// 'general', wiec akcyzy, CBAM i EUDR NIE DA SIE odroznic po kategorii silnika.
// Te reguly czytaja `flags.cargoCategoryId`. Bez flagi maja NIE odpalac - inaczej
// stare rekordy (sprzed kategorii towaru) zaczelyby dostawac przypadkowe dokumenty.

describe('ETAP 2 — rezimy zalezne od cargoCategoryId', () => {
  const meta = (o, d, m, c, f = {}) => getDocuments(o, d, m, c, f, { includeMetadata: true })
  const allIds = (r) => [...ids(r.required), ...ids(r.conditional), ...ids(r.blanks)]

  it('CBAM tylko dla kategorii w zakresie rozporzadzenia i tylko przy przywozie do UE', () => {
    const stal = meta('CN', 'PL', 'sea', 'general', { cargoCategoryId: 'metals' })
    expect(allIds(stal)).toContain('126_CBAM_Data_Sheet')
    expect(stal.warnings.map((w) => w.code)).toContain('warn_cbam_annual')

    // Tekstylia nie sa objete CBAM.
    expect(allIds(meta('CN', 'PL', 'sea', 'general', { cargoCategoryId: 'textiles' })))
      .not.toContain('126_CBAM_Data_Sheet')
    // Wywoz z UE to nie przywoz - CBAM nie dotyczy.
    expect(allIds(meta('PL', 'CN', 'sea', 'general', { cargoCategoryId: 'metals' })))
      .not.toContain('126_CBAM_Data_Sheet')
    // Brak flagi = regula milczy.
    expect(allIds(meta('CN', 'PL', 'sea', 'general'))).not.toContain('126_CBAM_Data_Sheet')
  })

  it('EMCS dla wyrobow akcyzowych wysylanych z UE', () => {
    const alkohol = meta('PL', 'DE', 'road', 'general', { cargoCategoryId: 'beverages' })
    expect(allIds(alkohol)).toContain('132_EMCS_eAD')
    expect(alkohol.warnings.map((w) => w.code)).toContain('warn_emcs_arc')

    expect(allIds(meta('PL', 'DE', 'road', 'general', { cargoCategoryId: 'textiles' })))
      .not.toContain('132_EMCS_eAD')
    expect(allIds(meta('PL', 'DE', 'road', 'general'))).not.toContain('132_EMCS_eAD')
  })

  it('SENT wyzwala RODZAJ TOWARU, nie przekroczenie granicy', () => {
    // Przewoz wylacznie krajowy - SENT obowiazuje mimo braku granicy.
    const krajowy = meta('PL', 'PL', 'road', 'general', { cargoCategoryId: 'energy' })
    expect(ids(krajowy.required)).toContain('133_SENT')
    expect(krajowy.warnings.map((w) => w.code)).toContain('warn_sent_registration')

    // Ten sam towar bez zwiazku z Polska - SENT nie dotyczy.
    expect(allIds(meta('DE', 'FR', 'road', 'general', { cargoCategoryId: 'energy' })))
      .not.toContain('133_SENT')

    // Polska jako kraj TRANZYTOWY tez uruchamia obowiazek.
    expect(allIds(meta('DE', 'LT', 'road', 'general', { cargoCategoryId: 'energy', transitCountries: ['PL'] })))
      .toContain('133_SENT')

    // Transport morski i lotniczy nie sa objete systemem.
    expect(allIds(meta('PL', 'CN', 'sea', 'general', { cargoCategoryId: 'energy' })))
      .not.toContain('133_SENT')
  })
})
