// Zunifikowany dobor dokumentow + warstwa aliasow id — ETAP 2.3.
//
// Tu siedzi test, ktory pilnuje CICHEJ awarii pobierania z Historii:
// findUnresolvedDocIds uzywa DOKLADNIE tego samego aliasu i tej samej listy co
// filtr wewnatrz generateDocuments, wiec pusty wynik tutaj oznacza pusty filtr tam.

import { describe, it, expect } from 'vitest'
import {
  getDocsForSnapshot,
  getEngineResultForSnapshot,
  buildEngineResult,
  findUnresolvedDocIds,
} from '../documentGeneration'
import { draftBannerText } from '../../generators/draftBanner'

// Migawka w ksztalcie sprzed unifikacji — tak wyglada form_data istniejacych zestawow.
const SNAP = {
  route: { transport: 'road', fromCountry: 'PL', fromCity: 'Gdansk', toCountry: 'DE', toCity: 'Berlin', loadDate: '2026-07-01', multimodal: false },
  cargo: { cargoName: 'Palety', hsCode: '4415.20', weight: '1200', currency: 'EUR' },
  parties: { sender: { name: 'Nadawca' }, receiver: { name: 'Odbiorca' }, carrier: { name: 'Przewoznik' } },
  road: { vehicleType: 'Plandeka', adr: false },
  sea: { freightTerms: 'Prepaid' },
  terms: { incoterms: 'FCA' },
}
const withRoute = (patch) => ({ ...SNAP, route: { ...SNAP.route, ...patch } })

describe('getDocsForSnapshot na zunifikowanym silniku', () => {
  it('zwraca identyfikatory KATALOGU, nie stare klucze rejestru', () => {
    const keys = getDocsForSnapshot(SNAP).map((d) => d.key)
    expect(keys).toContain('01_CMR')
    expect(keys).not.toContain('cmr')
  })

  it('PL->DE drogowy daje komplet z warstwy transportowej i handlowej', () => {
    const keys = getDocsForSnapshot(SNAP).map((d) => d.key)
    expect(keys).toEqual(expect.arrayContaining(['01_CMR', '09_Zlecenie', '10_POD', '02_PackingList', '03_Invoice']))
  })

  it('galezie kolejowa, lotnicza i multimodalna NIE sa juz puste', () => {
    for (const transport of ['rail', 'air', 'multimodal']) {
      expect(getDocsForSnapshot(withRoute({ transport })).length, transport).toBeGreaterThan(0)
    }
    expect(getDocsForSnapshot(withRoute({ transport: 'rail' })).map((d) => d.key)).toContain('27_CIM')
    expect(getDocsForSnapshot(withRoute({ transport: 'air' })).map((d) => d.key)).toContain('11_AWB')
    expect(getDocsForSnapshot(withRoute({ transport: 'multimodal' })).map((d) => d.key)).toContain('28_MTD')
  })

  // Krok "Trasa" -> "Osobne umowy na odcinki" (2026-08-08): sprawdza calosc
  // przewodu snapshot -> buildEngineFlags -> silnik, nie tylko sam silnik
  // (documentEngine.matrix.test.js), zeby wychwycic pomylke w nazwie pola
  // (multimodal.contractType/legs), gdyby sie kiedys rozjechala.
  it('multimodal z osobnymi umowami czyta legs[] zamiast dawac MTD', () => {
    const snap = withRoute({ transport: 'multimodal' })
    snap.multimodal = {
      contractType: 'separate',
      legs: [
        { order: 1, mode: 'road', from: '', to: '', carrier: '' },
        { order: 2, mode: 'sea', from: '', to: '', carrier: '' },
      ],
    }
    const keys = getDocsForSnapshot(snap).map((d) => d.key)
    expect(keys).toEqual(expect.arrayContaining(['01_CMR', '05_BL']))
    expect(keys).not.toContain('28_MTD')
  })

  it('kazdy dokument ma sekcje, tryb wyjscia i nazwe', () => {
    for (const d of getDocsForSnapshot(withRoute({ toCountry: 'NG', transport: 'sea' }))) {
      expect(['required', 'optional', 'manual']).toContain(d.section)
      expect(['final', 'draft', 'blank_only']).toContain(d.outputMode)
      expect(typeof d.name).toBe('string')
      expect(d.name.length).toBeGreaterThan(0)
    }
  })

  it('blank_only trafia do sekcji recznej i nigdy do wymaganych', () => {
    const docs = getDocsForSnapshot(withRoute({ toCountry: 'NG', transport: 'sea' }))
    const formM = docs.find((d) => d.key === '53_Nigeria_Import')
    expect(formM).toBeDefined()
    expect(formM.section).toBe('manual')
    expect(formM.outputMode).toBe('blank_only')
    expect(docs.filter((d) => d.section === 'required').every((d) => d.outputMode !== 'blank_only')).toBe(true)
  })

  it('dokumenty generowane maja podpiety szablon i nazwe pliku bez sufiksu pustego', () => {
    for (const d of getDocsForSnapshot(SNAP).filter((x) => x.outputMode !== 'blank_only')) {
      expect(d.template, `brak szablonu dla ${d.key}`).toBeTruthy()
      expect(d.filename).toMatch(/\.pdf$/)
      expect(d.filename).not.toContain('_pusty')
    }
  })

  it('dziewiec dokumentow kreatora zachowuje dotychczasowe nazwy plikow i opisy', () => {
    const byKey = Object.fromEntries(getDocsForSnapshot(SNAP).map((d) => [d.key, d]))
    expect(byKey['01_CMR'].filename).toBe('CMR.pdf')
    expect(byKey['03_Invoice'].filename).toBe('Faktura_Handlowa.pdf')
    expect(byKey['10_POD'].filename).toBe('Protokol_Odbioru_POD.pdf')
    expect(byKey['01_CMR'].desc).toBe('Podstawowy dokument transportu drogowego')
  })

  it('ADR zaznaczony w sekcji drogowej podnosi kategorie do towarow niebezpiecznych', () => {
    const plain = getDocsForSnapshot(SNAP).map((d) => d.key)
    expect(plain).not.toContain('118_ADR')
    const adr = getDocsForSnapshot({ ...SNAP, road: { ...SNAP.road, adr: true } }).map((d) => d.key)
    expect(adr).toContain('118_ADR')
    expect(adr).toContain('69_MSDS')
  })

  it('ostrzezenia silnika sa teraz dostepne dla kreatora', () => {
    const r = getEngineResultForSnapshot(withRoute({ toCountry: 'US', transport: 'sea' }))
    expect(r.warnings.length).toBeGreaterThan(0)
    expect(r.warnings.every((w) => typeof w.code === 'string')).toBe(true)
  })

  it('buildEngineResult zapisuje id katalogu, sekcje i ostrzezenia', () => {
    const er = buildEngineResult(SNAP)
    expect(er.docs.map((d) => d.key)).toContain('01_CMR')
    expect(er.docs.every((d) => typeof d.section === 'string')).toBe(true)
    expect(Array.isArray(er.warnings)).toBe(true)
  })
})

describe('alias id na sciezce pobierania z Historii', () => {
  it('stare selectedDocs rozwiazuja sie w calosci', () => {
    expect(findUnresolvedDocIds(SNAP, ['cmr', 'packing', 'faktura', 'zlecenie', 'pod'])).toEqual([])
  })

  it('stare i nowe id trafiaja w te same dokumenty', () => {
    const modern = ['01_CMR', '02_PackingList', '03_Invoice', '09_Zlecenie', '10_POD']
    expect(findUnresolvedDocIds(SNAP, modern)).toEqual([])
    const available = new Set(getDocsForSnapshot(SNAP).map((d) => d.key))
    for (const id of modern) expect(available.has(id)).toBe(true)
  })

  it('stary zestaw morski tez sie rozwiazuje', () => {
    const sea = withRoute({ transport: 'sea', toCountry: 'US' })
    expect(findUnresolvedDocIds(sea, ['bol', 'packing', 'faktura', 'proforma', 'seawaybill'])).toEqual([])
  })

  it('lista mieszana (rekord czesciowo zmigrowany) rozwiazuje sie w calosci', () => {
    expect(findUnresolvedDocIds(SNAP, ['cmr', '02_PackingList', 'zlecenie'])).toEqual([])
  })

  it('dokument spoza doboru jest RAPORTOWANY, a nie pomijany po cichu', () => {
    expect(findUnresolvedDocIds(SNAP, ['cmr', '117_TIR'])).toEqual(['117_TIR'])
  })

  // REGRESJA znaleziona na 7 realnych zestawach w bazie (2026-08-03).
  // Checkbox „Transport multimodalny" istnial wylacznie w dawnym rejestrze
  // kreatora; silnik emitowal 28_MTD tylko dla mode === 'multimodal'. Zestawy
  // zapisane z zaznaczonym checkboxem przy trasie drogowej/morskiej przestawaly
  // sie pobierac — po cichu, bo generateDocuments zwraca wtedy { failed: [] }.
  it('zaznaczony checkbox multimodalny dokłada MTD obok listu przewozowego galezi', () => {
    const roadPlain = getDocsForSnapshot(SNAP).map((d) => d.key)
    expect(roadPlain).not.toContain('28_MTD')

    const roadMulti = getDocsForSnapshot(withRoute({ multimodal: true }))
    const keys = roadMulti.map((d) => d.key)
    expect(keys).toContain('01_CMR')
    expect(keys).toContain('28_MTD')
    expect(roadMulti.find((d) => d.key === '28_MTD').section).toBe('required')
  })

  it('stary zestaw z checkboxem multimodalnym rozwiazuje sie w calosci', () => {
    // Dokladny ksztalt selected_docs z rekordu 86011fc7 w bazie.
    const road = withRoute({ multimodal: true })
    expect(findUnresolvedDocIds(road, ['cmr', 'packing', 'faktura', 'multimodal'])).toEqual([])

    // Wariant morski poza UE — proforma dochodzi dopiero przy granicy celnej.
    const sea = withRoute({ transport: 'sea', toCountry: 'US', multimodal: true })
    expect(findUnresolvedDocIds(sea, ['bol', 'packing', 'faktura', 'proforma', 'multimodal'])).toEqual([])
  })

  it('pusta lista nie zglasza problemow', () => {
    expect(findUnresolvedDocIds(SNAP, [])).toEqual([])
    expect(findUnresolvedDocIds(SNAP, null)).toEqual([])
  })
})

describe('naglowek dokumentu wg (outputMode, issuerType)', () => {
  it('urzedy dostaja „do zlozenia w" z nazwa organu', () => {
    for (const issuerType of ['customs_authority', 'chamber_of_commerce', 'government_agency']) {
      const text = draftBannerText({ outputMode: 'draft', issuerType, authority: 'Izba Celna' }, 'PL')
      expect(text).toContain('WERSJA ROBOCZA')
      expect(text).toContain('Izba Celna')
    }
  })

  it('przewoznik dostaje projekt do zatwierdzenia, bez nazwy organu', () => {
    const text = draftBannerText({ outputMode: 'draft', issuerType: 'carrier', authority: 'Armator' }, 'PL')
    expect(text).toContain('PROJEKT')
    expect(text).toContain('przewoźnika')
    expect(text).not.toContain('Armator')
  })

  // ETAP 1: CBAM, EUDR i SENT to formularze, ktore zobowiazany sklada SAM
  // w systemie urzedowym: ani "projekt dla przewoznika", ani dokument obrotu.
  it('nadawca skladajacy w systemie urzedowym dostaje „dane do zlozenia w"', () => {
    const text = draftBannerText({ outputMode: 'draft', issuerType: 'shipper', authority: 'KAS' }, 'PL')
    expect(text).toContain('WERSJA ROBOCZA')
    expect(text).toContain('dane do złożenia w: KAS')
    expect(draftBannerText({ outputMode: 'draft', issuerType: 'shipper', authority: 'KAS' }, 'EN'))
      .toContain('data to be filed with: KAS')
  })

  // Puste odeslanie ("do zlozenia w: wlasciwym organie") wyglada jak wypelnione
  // pole, a nie niesie zadnej informacji; lepiej sam naglowek.
  it('brak organu nie produkuje pustego odeslania', () => {
    expect(draftBannerText({ outputMode: 'draft', issuerType: 'customs_authority', authority: null }, 'PL')).toBe('WERSJA ROBOCZA')
    expect(draftBannerText({ outputMode: 'draft', issuerType: 'shipper' }, 'PL')).toBe('WERSJA ROBOCZA')
    expect(draftBannerText({ outputMode: 'draft', issuerType: 'government_agency', authority: '' }, 'EN')).toBe('DRAFT')
  })

  it('dokument finalny i pusty formularz nie dostaja naglowka', () => {
    expect(draftBannerText({ outputMode: 'final', issuerType: 'shipper' }, 'PL')).toBeNull()
    expect(draftBannerText({ outputMode: 'blank_only', issuerType: 'foreign_broker' }, 'PL')).toBeNull()
  })

  it('naglowek idzie za jezykiem dokumentu', () => {
    expect(draftBannerText({ outputMode: 'draft', issuerType: 'carrier' }, 'EN')).toContain('DRAFT')
    expect(draftBannerText({ outputMode: 'draft', issuerType: 'customs_authority', authority: 'KAS' }, 'EN'))
      .toContain('to be filed with: KAS')
  })

  it('Bill of Lading faktycznie dostaje naglowek projektu', () => {
    const bol = getDocsForSnapshot(withRoute({ transport: 'sea', toCountry: 'US' })).find((d) => d.key === '05_BL')
    expect(bol.outputMode).toBe('draft')
    expect(bol.issuerType).toBe('carrier')
    expect(draftBannerText(bol, 'PL')).toContain('PROJEKT')
  })

  it('CMR zostaje dokumentem finalnym, bez naglowka', () => {
    const cmr = getDocsForSnapshot(SNAP).find((d) => d.key === '01_CMR')
    expect(cmr.outputMode).toBe('final')
    expect(draftBannerText(cmr, 'PL')).toBeNull()
  })
})

// ─── ETAP 2: FLAGI DOCIERAJA Z MIGAWKI DO SILNIKA ────────────────────────────
//
// Reguly ETAPU 2 czytaja flagi, ktorych kreator wczesniej nie przekazywal
// (`containerized`, `consolidated`, `cargoCategoryId`). Jesli buildEngineFlags
// ich nie poda, dokumenty po prostu NIGDY sie nie pojawia - po cichu, bez bledu.
// Te testy ida cala droga: migawka -> buildEngineFlags -> silnik -> lista.
describe('ETAP 2 — nowe flagi na sciezce migawka -> silnik', () => {
  const seaSnap = (sea) => ({
    ...SNAP,
    route: { ...SNAP.route, transport: 'sea', toCountry: 'US', toCity: 'Newark' },
    sea: { ...SNAP.sea, ...sea },
  })

  it('numer kontenera w migawce wlacza VGM', () => {
    // Drobnica: brak pol kontenerowych - VGM sie NIE pojawia.
    expect(getDocsForSnapshot(seaSnap({})).map((d) => d.key)).not.toContain('119_VGM_SOLAS')

    // Sam numer kontenera wystarczy.
    const zNumerem = getDocsForSnapshot(seaSnap({ containerNo: 'MSCU1234567' }))
    expect(zNumerem.map((d) => d.key)).toContain('119_VGM_SOLAS')
    expect(zNumerem.find((d) => d.key === '119_VGM_SOLAS').required).toBe(true)

    // Sam typ kontenera tez.
    expect(getDocsForSnapshot(seaSnap({ containerType: '40HC' })).map((d) => d.key))
      .toContain('119_VGM_SOLAS')
  })

  it('checkbox konsolidacji w galezi lotniczej wlacza HAWB', () => {
    const air = (consolidated) => ({
      ...SNAP,
      route: { ...SNAP.route, transport: 'air', toCountry: 'US' },
      air: { airportFrom: 'WAW', airportTo: 'JFK', consolidated, knownConsignor: false, chargeableWeightKg: '' },
    })
    expect(getDocsForSnapshot(air(false)).map((d) => d.key)).not.toContain('137_HAWB')
    expect(getDocsForSnapshot(air(true)).map((d) => d.key)).toContain('137_HAWB')
  })

  it('kategoria towaru z kroku Towar dociera do regul akcyzowych', () => {
    const napoje = { ...SNAP, cargo: { ...SNAP.cargo, cargoCategory: 'beverages' } }
    expect(getDocsForSnapshot(napoje).map((d) => d.key)).toContain('132_EMCS_eAD')

    const tekstylia = { ...SNAP, cargo: { ...SNAP.cargo, cargoCategory: 'textiles' } }
    expect(getDocsForSnapshot(tekstylia).map((d) => d.key)).not.toContain('132_EMCS_eAD')
  })

  // Rekordy sprzed kategorii towaru maja `cargoType`, nie `cargoCategory`.
  // Nie moga zaczac dostawac dokumentow akcyzowych po tej zmianie.
  it('stary zestaw bez kategorii nie dostaje nowych dokumentow kategorialnych', () => {
    const stary = { ...SNAP, cargo: { cargoName: 'Palety', cargoType: 'Drobnica', weight: '1200' } }
    const keys = getDocsForSnapshot(stary).map((d) => d.key)
    for (const id of ['132_EMCS_eAD', '133_SENT', '126_CBAM_Data_Sheet', '127_EUDR_DDS']) {
      expect(keys, id).not.toContain(id)
    }
    expect(findUnresolvedDocIds(stary, ['cmr', 'packing', 'faktura'])).toEqual([])
  })
})
