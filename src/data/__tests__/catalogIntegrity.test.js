// Spojnosc trzech katalogow, ktore musza opisywac ten sam zbior dokumentow:
//   documentCatalog.js  - metadane doboru (silnik)
//   templateCatalog.js  - szablony JSX (wyszukiwarka, puste formularze)
//   blankTemplateMap.js - most miedzy nimi
//
// Test rosnie z kazda partia ETAPU 1: sprawdza CALY katalog, nie tylko nowe wpisy.

import { describe, it, expect } from 'vitest'
import { documentCatalog } from '../documentCatalog'
import { TEMPLATE_CATALOG, GROUP_LABELS, searchTemplates } from '../templateCatalog'
import { getBlankTemplate } from '../blankTemplateMap'

const ISSUER_TYPES = [
  'shipper', 'forwarder', 'carrier', 'customs_authority', 'chamber_of_commerce',
  'government_agency', 'bank', 'insurer', 'lab_or_inspector', 'notified_body', 'foreign_broker',
]
const OUTPUT_MODES = ['final', 'draft', 'blank_only']
const TRANSPORT_MODES = ['road', 'sea', 'air', 'rail', 'multimodal']

// Wpis katalogu dokumentow, ktorego `category` celowo nie idzie za grupa szablonu:
// China Import podstawia deklaracje UE (ead_sad, grupa celne_export), ale sam
// dotyczy importu (patrz komentarz w blankTemplateMap.js).
const CATEGORY_OVERRIDES = { '22_China_Import': 'celne_import' }

const catalogIds = Object.keys(documentCatalog)

describe('templateCatalog', () => {
  it('klucze i nazwy plikow sa unikalne', () => {
    const keys = TEMPLATE_CATALOG.map((t) => t.key)
    const files = TEMPLATE_CATALOG.map((t) => t.filename)
    expect(new Set(keys).size).toBe(keys.length)
    expect(new Set(files).size).toBe(files.length)
  })

  // Sufiks _pusty jest znaczacy: filenameFor() w documentGeneration.js zdejmuje go,
  // zeby wersja WYPELNIONA pobrala sie jako CMR.pdf, a nie CMR_pusty.pdf.
  it('kazda nazwa pliku konczy sie na _pusty.pdf', () => {
    for (const t of TEMPLATE_CATALOG) {
      expect(t.filename, t.key).toMatch(/_pusty\.pdf$/)
    }
  })

  it('kazdy wpis ma znana grupe i komponent szablonu', () => {
    for (const t of TEMPLATE_CATALOG) {
      expect(Object.keys(GROUP_LABELS), t.key).toContain(t.grupa)
      expect(typeof t.template, t.key).toBe('function')
      expect(Array.isArray(t.tags), t.key).toBe(true)
    }
  })
})

describe('documentCatalog — metadane doboru', () => {
  it('kazdy wpis ma komplet pol z ETAPU 1', () => {
    for (const id of catalogIds) {
      const c = documentCatalog[id]
      expect(c.name_pl, id).toBeTruthy()
      expect(c.name_en, id).toBeTruthy()
      expect(Array.isArray(c.transportModes), id).toBe(true)
      expect(c.transportModes.length, id).toBeGreaterThan(0)
      for (const m of c.transportModes) expect(TRANSPORT_MODES, `${id} -> ${m}`).toContain(m)
      expect(ISSUER_TYPES, `${id} -> ${c.issuerType}`).toContain(c.issuerType)
      expect(OUTPUT_MODES, `${id} -> ${c.outputMode}`).toContain(c.outputMode)
      expect(typeof c.blockingIfMissing, id).toBe('boolean')
      expect(Object.keys(GROUP_LABELS), `${id} -> ${c.category}`).toContain(c.category)
    }
  })

  it('daty obowiazywania sa w formacie ISO albo null', () => {
    for (const id of catalogIds) {
      for (const field of ['validFrom', 'validTo']) {
        const v = documentCatalog[id][field]
        if (v !== null) expect(v, `${id}.${field}`).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      }
    }
  })

  // legalBasis === null jest DOZWOLONE i znaczace (podstawa nieustalona albo
  // nieistniejaca; patrz docs/legalbasis_do_uzupelnienia.md). Pilnujemy tylko,
  // zeby nie bylo pustego stringa udajacego wypelnione pole.
  it('legalBasis to niepusty tekst albo null, nigdy pusty string', () => {
    for (const id of catalogIds) {
      const v = documentCatalog[id].legalBasis
      expect(v === null || (typeof v === 'string' && v.trim().length > 0), id).toBe(true)
    }
  })
})

describe('most documentCatalog <-> templateCatalog', () => {
  it('kazdy dokument da sie pobrac: szablon JSX albo statyczny plik', () => {
    const unobtainable = catalogIds.filter(
      (id) => documentCatalog[id].available && !getBlankTemplate(id) && !documentCatalog[id].path
    )
    expect(unobtainable).toEqual([])
  })

  // Dokument bez statycznego wzorca w public/templates MUSI miec szablon JSX,
  // inaczej `available: true` klamie i "Puste szablony" pokaza pozycje bez pliku.
  it('wpis z path: null ma szablon JSX', () => {
    const orphans = catalogIds.filter((id) => documentCatalog[id].path === null && !getBlankTemplate(id))
    expect(orphans).toEqual([])
  })

  it('category dokumentu idzie za grupa jego szablonu', () => {
    for (const id of catalogIds) {
      const tpl = getBlankTemplate(id)
      if (!tpl) continue
      const expected = CATEGORY_OVERRIDES[id] || tpl.grupa
      expect(documentCatalog[id].category, id).toBe(expected)
    }
  })
})

describe('ETAP 1 / partia A — dokumenty morskie 119-123', () => {
  const BATCH_A = ['119_VGM_SOLAS', '120_Booking_Confirmation', '121_Cargo_Manifest_Sea', '122_Delivery_Order', '123_Container_Packing_Cert']

  it('wszystkie piec jest w katalogu i ma szablon', () => {
    for (const id of BATCH_A) {
      expect(documentCatalog[id], id).toBeDefined()
      expect(getBlankTemplate(id), id).not.toBeNull()
      expect(documentCatalog[id].path, id).toBeNull()
      expect(documentCatalog[id].available, id).toBe(true)
    }
  })

  it('sa dokumentami galezi morskiej', () => {
    for (const id of BATCH_A) {
      expect(documentCatalog[id].transportModes, id).toContain('sea')
    }
  })

  // VGM i swiadectwo pakowania sa warunkiem zaladunku, nie udogodnieniem.
  it('VGM i swiadectwo pakowania blokuja przesylke przy braku', () => {
    expect(documentCatalog['119_VGM_SOLAS'].blockingIfMissing).toBe(true)
    expect(documentCatalog['123_Container_Packing_Cert'].blockingIfMissing).toBe(true)
  })

  it('booking i delivery order zostaja bez podstawy prawnej (stosunek umowny, praktyka portowa)', () => {
    expect(documentCatalog['120_Booking_Confirmation'].legalBasis).toBeNull()
    expect(documentCatalog['122_Delivery_Order'].legalBasis).toBeNull()
  })

  // Wyszukiwarka w Topbarze zasila sie z TEMPLATE_CATALOG przez searchTemplates,
  // wiec nowe wpisy sa w niej widoczne bez zmian w TemplateSearch.jsx.
  it('wyszukiwarka szablonow znajduje kazdy nowy dokument', () => {
    const found = (q) => searchTemplates(q).map((t) => t.key)
    expect(found('VGM')).toContain('vgm')
    expect(found('booking')).toContain('booking_confirmation')
    expect(found('manifest')).toContain('cargo_manifest_sea')
    expect(found('wydania')).toContain('delivery_order')
    expect(found('pakowania kontenera')).toContain('container_packing_cert')
    // Bez diakrytykow tez: normalize() zdejmuje ogonki po obu stronach.
    expect(found('swiadectwo pakowania')).toContain('container_packing_cert')
  })
})

describe('ETAP 1 / partia B: celne i regulacyjne UE 124-131', () => {
  const BATCH_B = [
    '124_ENS_ICS2', '125_EU_Import_Declaration', '126_CBAM_Data_Sheet', '127_EUDR_DDS',
    '128_CHED_TRACES', '129_ATR_Certificate', '130_Supplier_Declaration', '131_REX_Statement_Origin',
  ]

  it('wszystkie osiem jest w katalogu i ma szablon', () => {
    for (const id of BATCH_B) {
      expect(documentCatalog[id], id).toBeDefined()
      expect(getBlankTemplate(id), id).not.toBeNull()
      expect(documentCatalog[id].path, id).toBeNull()
      expect(documentCatalog[id].available, id).toBe(true)
    }
  })

  // Rezimy z tej partii wyzwala rodzaj towaru albo kierunek przywozu, nie galaz
  // transportu, wiec kazdy dokument musi byc osiagalny w kazdej galezi.
  it('nie sa przypisane do jednej galezi transportu', () => {
    for (const id of BATCH_B) {
      expect(documentCatalog[id].transportModes.sort(), id)
        .toEqual(['air', 'multimodal', 'rail', 'road', 'sea'])
    }
  })

  it('EUDR ma date wejscia w zycie, ktora uruchomi bramke czasowa silnika', () => {
    expect(documentCatalog['127_EUDR_DDS'].validFrom).toBe('2026-12-30')
    expect(new Date('2026-12-30') > new Date()).toBe(true)
  })

  // CHED wystawia organ na granicznym punkcie kontroli - platforma nie ma prawa
  // podstawiac tam danych uzytkownika.
  it('CHED zostaje pustym formularzem urzedowym', () => {
    expect(documentCatalog['128_CHED_TRACES'].outputMode).toBe('blank_only')
    expect(documentCatalog['128_CHED_TRACES'].issuerType).toBe('government_agency')
  })

  it('CBAM i EUDR to formularze nadawcy skladane w systemie urzedowym', () => {
    for (const id of ['126_CBAM_Data_Sheet', '127_EUDR_DDS']) {
      expect(documentCatalog[id].issuerType, id).toBe('shipper')
      expect(documentCatalog[id].outputMode, id).toBe('draft')
      expect(documentCatalog[id].authority, id).toBeTruthy()
    }
  })

  // CBAM rozlicza sie ROCZNIE, wiec brak karty danych nie zatrzymuje przesylki.
  it('CBAM nie blokuje przesylki, ENS i zgloszenie przywozowe blokuja', () => {
    expect(documentCatalog['126_CBAM_Data_Sheet'].blockingIfMissing).toBe(false)
    expect(documentCatalog['124_ENS_ICS2'].blockingIfMissing).toBe(true)
    expect(documentCatalog['125_EU_Import_Declaration'].blockingIfMissing).toBe(true)
  })

  it('A.TR stoi obok EUR.1, nie zamiast niego', () => {
    expect(documentCatalog['129_ATR_Certificate'].category).toBe('swiadectwo')
    expect(documentCatalog['12_EUR1']).toBeDefined()
    expect(documentCatalog['129_ATR_Certificate'].issuerType)
      .toBe(documentCatalog['12_EUR1'].issuerType)
  })

  it('wyszukiwarka szablonow znajduje kazdy dokument partii B', () => {
    const found = (q) => searchTemplates(q).map((t) => t.key)
    expect(found('ENS')).toContain('ens_ics2')
    expect(found('przywozowe')).toContain('eu_import_declaration')
    expect(found('CBAM')).toContain('cbam_data_sheet')
    expect(found('EUDR')).toContain('eudr_dds')
    expect(found('CHED')).toContain('ched_traces')
    expect(found('A.TR')).toContain('atr')
    expect(found('turcja')).toContain('atr')
    expect(found('dostawcy')).toContain('supplier_declaration')
    expect(found('REX')).toContain('rex_statement')
  })

})

describe('ETAP 1 / partia C: krajowe PL i kolejowe 132-136', () => {
  const BATCH_C = ['132_EMCS_eAD', '133_SENT', '134_CIM_SMGS', '135_RID_Rail_DG', '136_Wagon_List']
  const RAIL_ONLY = ['134_CIM_SMGS', '135_RID_Rail_DG', '136_Wagon_List']

  it('wszystkie piec jest w katalogu i ma szablon', () => {
    for (const id of BATCH_C) {
      expect(documentCatalog[id], id).toBeDefined()
      expect(getBlankTemplate(id), id).not.toBeNull()
      expect(documentCatalog[id].path, id).toBeNull()
      expect(documentCatalog[id].available, id).toBe(true)
    }
  })

  it('dokumenty kolejowe nie wychodza poza galaz kolejowa i multimodalna', () => {
    for (const id of RAIL_ONLY) {
      expect(documentCatalog[id].transportModes.sort(), id).toEqual(['multimodal', 'rail'])
    }
  })

  // SENT wyzwala RODZAJ TOWARU, nie trasa - obowiazuje takze w przewozie
  // wylacznie krajowym, wiec nie moze byc zwiazany z przekroczeniem granicy.
  it('SENT obejmuje przewoz drogowy i kolejowy', () => {
    expect(documentCatalog['133_SENT'].transportModes.sort()).toEqual(['multimodal', 'rail', 'road'])
  })

  it('SENT to formularz nadawcy skladany w rejestrze, jak CBAM i EUDR', () => {
    expect(documentCatalog['133_SENT'].issuerType).toBe('shipper')
    expect(documentCatalog['133_SENT'].outputMode).toBe('draft')
    expect(documentCatalog['133_SENT'].authority).toMatch(/SENT/)
  })

  it('e-AD dotyczy kazdej galezi, bo akcyza nie zalezy od srodka transportu', () => {
    expect(documentCatalog['132_EMCS_eAD'].transportModes.sort())
      .toEqual(['air', 'multimodal', 'rail', 'road', 'sea'])
  })

  // RID domyka komplet czterech galezi dla towarow niebezpiecznych.
  it('RID ma te same metadane co siostrzane dokumenty DG', () => {
    const rid = documentCatalog['135_RID_Rail_DG']
    for (const sibling of ['14_ADR', '15_IMDG', '64_IATA_DGR']) {
      expect(rid.issuerType, sibling).toBe(documentCatalog[sibling].issuerType)
      expect(rid.outputMode, sibling).toBe(documentCatalog[sibling].outputMode)
      expect(rid.category, sibling).toBe(documentCatalog[sibling].category)
      expect(rid.blockingIfMissing, sibling).toBe(documentCatalog[sibling].blockingIfMissing)
    }
  })

  it('CIM/SMGS stoi obok 27_CIM, nie zamiast niego', () => {
    expect(documentCatalog['27_CIM']).toBeDefined()
    expect(documentCatalog['134_CIM_SMGS'].category).toBe(documentCatalog['27_CIM'].category)
  })

  it('wykaz wagonow nie blokuje przesylki i nie ma podstawy prawnej', () => {
    expect(documentCatalog['136_Wagon_List'].blockingIfMissing).toBe(false)
    expect(documentCatalog['136_Wagon_List'].legalBasis).toBeNull()
    expect(documentCatalog['136_Wagon_List'].outputMode).toBe('draft')
  })

  it('wyszukiwarka szablonow znajduje kazdy dokument partii C', () => {
    const found = (q) => searchTemplates(q).map((t) => t.key)
    expect(found('EMCS')).toContain('emcs_ead')
    expect(found('akcyza')).toContain('emcs_ead')
    expect(found('SENT')).toContain('sent')
    expect(found('SMGS')).toContain('cim_smgs')
    expect(found('RID')).toContain('rid_rail_dg')
    expect(found('wagon')).toContain('wagon_list')
  })
})

describe('ETAP 1 / partia D: lotnicze 137-140', () => {
  const BATCH_D = ['137_HAWB', '138_SLI_Air', '139_Consignor_Security_Decl', '140_Air_Cargo_Manifest']

  it('wszystkie cztery sa w katalogu i maja szablon', () => {
    for (const id of BATCH_D) {
      expect(documentCatalog[id], id).toBeDefined()
      expect(getBlankTemplate(id), id).not.toBeNull()
      expect(documentCatalog[id].path, id).toBeNull()
      expect(documentCatalog[id].available, id).toBe(true)
    }
  })

  it('nie wychodza poza galaz lotnicza i multimodalna', () => {
    for (const id of BATCH_D) {
      expect(documentCatalog[id].transportModes.sort(), id).toEqual(['air', 'multimodal'])
    }
  })

  // 11_AWB pelni role MAWB; HAWB dochodzi OBOK niego przy konsolidacji, wiec
  // oba maja te sama podstawe prawna, ale roznych wystawcow.
  it('HAWB stoi obok 11_AWB, z tą samą konwencją i innym wystawcą', () => {
    expect(documentCatalog['11_AWB']).toBeDefined()
    expect(documentCatalog['137_HAWB'].legalBasis).toBe(documentCatalog['11_AWB'].legalBasis)
    expect(documentCatalog['11_AWB'].issuerType).toBe('carrier')
    expect(documentCatalog['137_HAWB'].issuerType).toBe('forwarder')
    expect(documentCatalog['137_HAWB'].category).toBe(documentCatalog['11_AWB'].category)
  })

  it('deklaracja bezpieczenstwa ma realna podstawe prawna i blokuje przy braku', () => {
    const d = documentCatalog['139_Consignor_Security_Decl']
    expect(d.legalBasis).toMatch(/2015\/1998/)
    expect(d.blockingIfMissing).toBe(true)
    expect(d.issuerType).toBe('shipper')
    expect(d.outputMode).toBe('final')
  })

  // Prompt mowil o "konwencji FAL ICAO" - taka nie istnieje. FAL to konwencja
  // IMO, uzyta przy morskim 121. Lotniczym odpowiednikiem jest zalacznik 9
  // do Konwencji chicagowskiej.
  it('manifest lotniczy nie powoluje sie na nieistniejaca konwencje FAL ICAO', () => {
    const basis = documentCatalog['140_Air_Cargo_Manifest'].legalBasis
    expect(basis).toMatch(/chicagowskiej/)
    expect(basis).not.toMatch(/FAL/)
    // Morski manifest zostaje przy FAL - tam konwencja istnieje.
    expect(documentCatalog['121_Cargo_Manifest_Sea'].legalBasis).toMatch(/FAL/)
  })

  it('SLI zostaje bez podstawy prawnej: standard branzowy, nie akt prawny', () => {
    expect(documentCatalog['138_SLI_Air'].legalBasis).toBeNull()
    expect(documentCatalog['138_SLI_Air'].blockingIfMissing).toBe(false)
  })

  it('wyszukiwarka szablonow znajduje kazdy dokument partii D', () => {
    const found = (q) => searchTemplates(q).map((t) => t.key)
    expect(found('HAWB')).toContain('hawb')
    expect(found('konsolidacja')).toContain('hawb')
    expect(found('SLI')).toContain('sli_air')
    expect(found('bezpieczenstwa')).toContain('consignor_security_decl')
    expect(found('znany nadawca')).toContain('consignor_security_decl')
    expect(found('manifest')).toContain('air_cargo_manifest')
  })
})

// Domkniecie ETAPU 1: 22 dokumenty z Promptu 2 sa w komplecie.
describe('ETAP 1: komplet 22 nowych dokumentow', () => {
  const NEW_IDS = [
    '119_VGM_SOLAS', '120_Booking_Confirmation', '121_Cargo_Manifest_Sea', '122_Delivery_Order',
    '123_Container_Packing_Cert', '124_ENS_ICS2', '125_EU_Import_Declaration', '126_CBAM_Data_Sheet',
    '127_EUDR_DDS', '128_CHED_TRACES', '129_ATR_Certificate', '130_Supplier_Declaration',
    '131_REX_Statement_Origin', '132_EMCS_eAD', '133_SENT', '134_CIM_SMGS', '135_RID_Rail_DG',
    '136_Wagon_List', '137_HAWB', '138_SLI_Air', '139_Consignor_Security_Decl', '140_Air_Cargo_Manifest',
  ]

  it('katalog dokumentow ma 142 wpisy, katalog szablonow 140', () => {
    expect(Object.keys(documentCatalog)).toHaveLength(142)
    expect(TEMPLATE_CATALOG).toHaveLength(140)
  })

  it('wszystkie 22 maja szablon JSX i zaden nie ma statycznego PDF-a', () => {
    for (const id of NEW_IDS) {
      expect(getBlankTemplate(id), id).not.toBeNull()
      expect(documentCatalog[id].path, id).toBeNull()
    }
    expect(NEW_IDS).toHaveLength(22)
  })

  // Wyszukiwarka w Topbarze (TemplateSearch.jsx, widoczna na zakladce
  // „Dokumentacja" / /history) wola searchTemplates i nie ma wlasnej listy.
  // Puste zapytanie = caly katalog, wiec kazdy nowy wpis jest w niej od razu.
  it('wyszukiwarka pokazuje CALY katalog przy pustym zapytaniu, z 22 nowymi wlacznie', () => {
    const wszystkie = searchTemplates('').map((t) => t.key)
    expect(wszystkie).toHaveLength(TEMPLATE_CATALOG.length)

    const brakujace = NEW_IDS.filter((id) => !wszystkie.includes(getBlankTemplate(id).key))
    expect(brakujace).toEqual([])
  })

  // Kazdy nowy dokument da sie znalezc po fragmencie WLASNEJ nazwy - to jest
  // realny sposob, w jaki uzytkownik go szuka. Fraza = najdluzszy wyraz nazwy,
  // bo skroty rozdzielone znakami („CIM/SMGS", „e-AD") daja przy mechanicznym
  // ciecu ciagi, ktorych w katalogu nie ma.
  it('kazdy z 22 znajduje sie po najdluzszym wyrazie swojej nazwy', () => {
    for (const id of NEW_IDS) {
      const wpis = getBlankTemplate(id)
      const fraza = (wpis.name.match(/[\p{L}\p{N}]+/gu) || [])
        .reduce((a, b) => (b.length > a.length ? b : a), '')
      expect(fraza.length, `${id}: nazwa bez wyrazu do wyszukania`).toBeGreaterThan(2)
      expect(searchTemplates(fraza).map((t) => t.key), `${id} po frazie "${fraza}"`)
        .toContain(wpis.key)
    }
  })

  // Skroty pisane z dywizem lub ukosnikiem musza byc osiagalne takze bez nich.
  it('skroty z separatorem znajduja sie rowniez w zapisie ciaglym', () => {
    const found = (q) => searchTemplates(q).map((t) => t.key)
    // „e-AD" bez dywizu: uzytkownik szukajacy dokumentu akcyzowego wpisze „ead".
    expect(found('ead')).toContain('emcs_ead')
    // Ta sama fraza nadal znajduje deklaracje eksportowa UE - oba sa poprawne.
    expect(found('ead')).toContain('ead_sad')
    // „CIM/SMGS" po obu czlonach osobno.
    expect(found('cim')).toContain('cim_smgs')
    expect(found('smgs')).toContain('cim_smgs')
    // ...i nadal po samym CIM znajduje sie starszy list przewozowy.
    expect(found('cim')).toContain('cim')
  })

  // Pobranie z wyszukiwarki idzie przez generatePdf(doc.template, {}, doc.filename),
  // wiec brak ktoregokolwiek z tych pol = przycisk „Pobierz PDF" rzuca.
  it('kazdy z 22 ma komplet pol potrzebnych do pobrania z wyszukiwarki', () => {
    for (const id of NEW_IDS) {
      const wpis = getBlankTemplate(id)
      expect(typeof wpis.template, id).toBe('function')
      expect(wpis.filename, id).toMatch(/_pusty\.pdf$/)
      expect(wpis.name, id).toBeTruthy()
    }
  })

  it('numeracja 119-140 jest ciagla i bez luk', () => {
    const numbers = NEW_IDS.map((id) => Number(id.split('_')[0])).sort((a, x) => a - x)
    expect(numbers).toEqual(Array.from({ length: 22 }, (_, i) => 119 + i))
  })
})
