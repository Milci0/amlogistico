// Testy silnika doboru — ETAP 2.1 (wsteczna zgodnosc + tryb metadanych)
// i ETAP 2.2 (poprawki merytoryczne).
//
// Pelna macierz tras (60+ przypadkow) to ETAP 3; tutaj sprawdzamy WYLACZNIE to,
// co zmienil etap 2, plus twarda gwarancje, ze bez szostego argumentu nic sie
// nie zmienilo.

import { describe, it, expect } from 'vitest'
import { getDocuments, PREFERENTIAL_ORIGIN_MAP, LAYERS } from '../documentEngine'

const ids = (list) => list.map((d) => d.id)

// ─── Migawka zachowania SPRZED zmian ────────────────────────────────────────
// Zdjeta z silnika w wersji przed ETAPEM 1 (kopia robocza uruchomiona obok
// nowej). Kazda rozbieznosc tutaj = zlamanie wstecznej zgodnosci.
const BASELINE = {
  'PL|DE|road|general': {
    required: ['01_CMR', '09_Zlecenie', '10_POD', '02_PackingList', '03_Invoice'],
    conditional: [],
    warnings: 0,
  },
  'PL|CH|road|general': {
    required: ['01_CMR', '09_Zlecenie', '10_POD', '02_PackingList', '03_Invoice', '04_Proforma', '07_EAD'],
    conditional: ['06_COO', '12_EUR1'],
    warnings: 0,
  },
  'PL|TR|road|general': {
    required: ['01_CMR', '09_Zlecenie', '10_POD', '02_PackingList', '03_Invoice', '04_Proforma', '07_EAD', '51_Turkey_Import'],
    conditional: ['06_COO'],
    warnings: 1,
  },
  'PL|CA|sea|general': {
    required: ['05_BL', '02_PackingList', '03_Invoice', '04_Proforma', '07_EAD', '42_Canada_Import'],
    conditional: ['26_SeaWaybill', '06_COO'],
    warnings: 1,
  },
  'PL|US|sea|electronics': {
    required: ['05_BL', '02_PackingList', '03_Invoice', '04_Proforma', '07_EAD', '08_ISF', '20_CBP7501'],
    conditional: ['26_SeaWaybill', '06_COO', '106_CE'],
    warnings: 1,
  },
  'CN|PL|rail|general': {
    required: ['27_CIM', '02_PackingList', '03_Invoice', '04_Proforma', '23_China_Export', '06_COO'],
    conditional: [],
    warnings: 1,
  },
  'PL|NO|road|dangerous_goods': {
    required: ['01_CMR', '09_Zlecenie', '10_POD', '02_PackingList', '03_Invoice', '04_Proforma', '07_EAD', '29_DG_Manifest', '69_MSDS', '118_ADR'],
    conditional: ['06_COO', '12_EUR1', '14_ADR'],
    warnings: 1,
  },
  'PL|CN|sea|dangerous_goods': {
    required: ['05_BL', '02_PackingList', '03_Invoice', '04_Proforma', '07_EAD', '22_China_Import', '29_DG_Manifest', '69_MSDS', '15_IMDG'],
    conditional: ['26_SeaWaybill', '06_COO'],
    warnings: 0,
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

  it('PL->TR towar przemyslowy: A.TR (ostrzezenie), BEZ EUR.1', () => {
    const r = getDocuments('PL', 'TR', 'road', 'general', {}, { includeMetadata: true })
    const all = [...ids(r.required), ...ids(r.conditional), ...ids(r.blanks)]
    expect(all).not.toContain('12_EUR1')
    expect(r.warnings.map((w) => w.code)).toContain('warn_atr_turkey')
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
