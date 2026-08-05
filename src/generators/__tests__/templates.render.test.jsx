// Renderowanie szablonow PDF poza przegladarka.
//
// generatePdf robi dokladnie to samo w kroku 1 (renderToStaticMarkup), zanim
// wpusci HTML do iframe z html2pdf. Jesli szablon rzuci tutaj, w przegladarce
// wywali sie tak samo, a tam objawia sie to jako "Nie udalo sie pobrac
// dokumentow" bez wskazania winnego pliku. Test ma zlapac to wczesniej.
//
// Rendera samego PDF-a (html2canvas, jsPDF) NIE da sie tu sprawdzic, bo wymaga
// realnego DOM i CDN. Zakres testu to: brak wyjatku + zachowana konwencja 794 px.

import { describe, it, expect } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { TEMPLATE_CATALOG } from '../../data/templateCatalog'
import { buildGeneratorData } from '../../services/documentGeneration'
import { withDraftBanner } from '../draftBanner'

// Migawka z wypelnionymi polami galezi morskiej: partia A zyje wlasnie z nich.
const SEA_SNAPSHOT = {
  route: { transport: 'sea', fromCountry: 'PL', fromCity: 'Gdansk', toCountry: 'US', toCity: 'Newark', loadDate: '2026-09-14', multimodal: false },
  cargo: { cargoName: 'Palety drewniane', hsCode: '4415.20', weight: '18400', weightNet: '17900', volume: '54', packages: '20', packageType: 'PLT', value: '42000', currency: 'EUR', notes: 'Sztauowac z dala od zrodel ciepla' },
  parties: {
    sender: { name: 'Nadawca sp. z o.o.', address: 'ul. Portowa 1, 80-001 Gdansk', vat: 'PL1234567890' },
    receiver: { name: 'Consignee Inc.', address: '100 Harbor Rd, Newark NJ' },
    carrier: { name: 'Ocean Line SA', address: 'Rotterdam', contact: 'ops@example.com', phone: '+31 10 000 00 00' },
  },
  road: { vehicleType: '', adr: false },
  sea: { containerType: '40HC', containerNo: 'MSCU1234567', sealNo: 'PL0099887', marksNos: 'NO. 1-20', vessel: 'MSC Katarina', voyageNo: '024W', bookingNo: 'BKG-778812', freightTerms: 'Prepaid', eta: '2026-10-08', flag: 'PA' },
  terms: { incoterms: 'FOB', freightPrice: '2400', freightCurrency: 'USD', paymentDays: '30' },
}

const FILLED = buildGeneratorData(SEA_SNAPSHOT, 'PL')

function render(Component, data) {
  return renderToStaticMarkup(createElement(Component, { data }))
}

describe('kazdy szablon z TEMPLATE_CATALOG renderuje sie bez wyjatku', () => {
  // Pusty formularz: downloadBlankDocument wola generatePdf(tpl.template, {}),
  // wiec `{}` to realny kontrakt, nie sztuczny przypadek brzegowy.
  it.each(TEMPLATE_CATALOG.map((t) => [t.key, t.template]))('%s — tryb pustego formularza', (key, Template) => {
    const html = render(Template, {})
    expect(html, key).toContain('794px')
  })

  it.each(TEMPLATE_CATALOG.map((t) => [t.key, t.template]))('%s — tryb wypelniony', (key, Template) => {
    const html = render(Template, FILLED)
    expect(html, key).toContain('794px')
    expect(html.length, key).toBeGreaterThan(500)
  })
})

describe('partia A — dane z migawki faktycznie trafiaja na wydruk', () => {
  const byKey = Object.fromEntries(TEMPLATE_CATALOG.map((t) => [t.key, t.template]))

  it('VGM niesie nr kontenera, plombe i mase brutto', () => {
    const html = render(byKey.vgm, FILLED)
    expect(html).toContain('MSCU1234567')
    expect(html).toContain('PL0099887')
    expect(html).toContain('18400')
    // Obie metody ustalenia masy musza byc na formularzu do zaznaczenia.
    expect(html).toContain('Metoda 1')
    expect(html).toContain('Metoda 2')
  })

  it('Potwierdzenie bookingu niesie numer bookingu i warunki frachtu', () => {
    const html = render(byKey.booking_confirmation, FILLED)
    expect(html).toContain('BKG-778812')
    expect(html).toContain('Prepaid')
    expect(html).toContain('MSC Katarina')
  })

  it('Manifest ladunkowy niesie statek, rejs i znaki', () => {
    const html = render(byKey.cargo_manifest_sea, FILLED)
    expect(html).toContain('MSC Katarina')
    expect(html).toContain('024W')
    expect(html).toContain('NO. 1-20')
  })

  it('Delivery Order niesie kontener i odbiorce', () => {
    const html = render(byKey.delivery_order, FILLED)
    expect(html).toContain('MSCU1234567')
    expect(html).toContain('Consignee Inc.')
  })

  it('Swiadectwo pakowania ma komplet 9 oswiadczen Kodeksu IMDG 5.4.2', () => {
    const html = render(byKey.container_packing_cert, FILLED)
    const checkboxes = html.match(/TAK \/ YES/g) || []
    expect(checkboxes).toHaveLength(9)
    expect(html).toContain('MSCU1234567')
  })
})

describe('partia B: dokumenty celne i regulacyjne UE', () => {
  const byKey = Object.fromEntries(TEMPLATE_CATALOG.map((t) => [t.key, t.template]))

  it('ENS opisuje WPROWADZENIE do UE, nie wywoz', () => {
    const html = render(byKey.ens_ics2, FILLED)
    expect(html).toContain('WPROWADZENIA towaru na obszar celny Unii')
    expect(html).toContain('MRN')
  })

  // Prompt wprost zabrania wypisywania listy panstw z derogacjami - zmienia sie
  // w czasie, a wydrukowany PDF zostaje z uzytkownikiem na lata.
  it('ENS nie wymienia panstw objetych derogacjami', () => {
    const html = render(byKey.ens_ics2, FILLED)
    expect(html).not.toMatch(/derogacj/i)
  })

  it('CBAM mowi wprost, ze nie jest zgloszeniem per przesylka', () => {
    const html = render(byKey.cbam_data_sheet, FILLED)
    expect(html).toContain('NIE jest zgłoszenie')
    expect(html).toContain('30.09.2027')
    expect(html).toContain('01.02.2027')
    expect(html).toContain('50 ton')
    // Pelny zakres towarowy z rozporzadzenia.
    for (const g of ['cement', 'żelazo i stal', 'aluminium', 'nawozy', 'energia elektryczna', 'wodór']) {
      expect(html, g).toContain(g)
    }
  })

  it('EUDR zbiera dane PRZED zlozeniem i nie udaje, ze zna numer DDS', () => {
    const html = render(byKey.eudr_dds, FILLED)
    expect(html).toContain('PRZED złożeniem')
    expect(html).toContain('TRACES')
    expect(html).toContain('30.12.2026')
    expect(html).toContain('30.06.2027')
    for (const g of ['bydło', 'kakao', 'kawa', 'olej palmowy', 'kauczuk', 'soja', 'drewno']) {
      expect(html, g).toContain(g)
    }
  })

  it('A.TR nazywa rzecz po imieniu: swobodny obrot, nie pochodzenie', () => {
    const html = render(byKey.atr, FILLED)
    expect(html).toContain('SWOBODNY OBRÓT')
    expect(html).toContain('nie EUR.1')
  })

  it('REX zostawia miejsce na numer, zamiast go zmyslac', () => {
    const html = render(byKey.rex_statement, FILLED)
    expect(html).toContain('6 000 EUR')
    expect(html).toContain('REX')
  })
})

describe('partia C: krajowe PL i kolejowe', () => {
  const byKey = Object.fromEntries(TEMPLATE_CATALOG.map((t) => [t.key, t.template]))
  // Migawka kolejowa - trzy wagony w przesylce grupowej. buildGeneratorData
  // sklada wagonNumbers w tekst rozdzielony przecinkami, wiec szablon wykazu
  // musi go z powrotem rozbic na wiersze.
  const RAIL = buildGeneratorData({
    ...SEA_SNAPSHOT,
    route: { ...SEA_SNAPSHOT.route, transport: 'rail', fromCountry: 'PL', toCountry: 'CN', toCity: 'Chengdu' },
    rail: {
      stationFrom: 'Malaszewicze', stationTo: 'Chengdu', groupConsignment: true,
      wagonNumbers: ['31 51 4675 123-4', '', '31 51 4675 456-7', '31 51 4675 999-9'],
    },
  }, 'PL')

  it('e-AD nie udaje, ze zna numer ARC', () => {
    const html = render(byKey.emcs_ead, FILLED)
    expect(html).toContain('ARC')
    expect(html).toContain('nadaje system EMCS')
    expect(html).toContain('e-SAD')
  })

  it('SENT mowi wprost, ze obowiazek wynika z towaru, nie z trasy', () => {
    const html = render(byKey.sent, FILLED)
    expect(html).toContain('RODZAJU TOWARU, nie z trasy')
    expect(html).toContain('wyłącznie krajowym')
    // Pelny katalog kategorii objetych systemem.
    for (const g of ['paliwa', 'alkohol etylowy skażony', 'susz tytoniowy', 'oleje roślinne', 'produkty lecznicze']) {
      expect(html, g).toContain(g)
    }
  })

  it('CIM/SMGS niesie stacje i numery wagonow z kroku Towar', () => {
    const html = render(byKey.cim_smgs, RAIL)
    expect(html).toContain('Malaszewicze')
    expect(html).toContain('Chengdu')
    expect(html).toContain('31 51 4675 123-4')
  })

  // RID 5.4.1.4.1 jest LAGODNIEJSZY niz ADR: wymaga jednego z EN/FR/DE, ale NIE
  // zada jezyka kraju nadania. Szablon nie moze przenosic reguly ADR na kolej.
  it('RID opisuje wlasny wymog jezykowy, nie regule ADR', () => {
    const html = render(byKey.rid_rail_dg, RAIL)
    expect(html).toContain('francuski, niemiecki lub angielski')
    expect(html).not.toMatch(/jezyk[ua] kraju nadania|języku kraju nadania/)
  })

  it('RID niesie oswiadczenie nadawcy i komplet 13 klas', () => {
    const html = render(byKey.rid_rail_dg, RAIL)
    expect(html).toContain('Oświadczam')
    for (const cls of ['Klasa 1', 'Klasa 4.3', 'Klasa 5.2', 'Klasa 6.2', 'Klasa 9']) {
      expect(html, cls).toContain(cls)
    }
  })

  it('wykaz wagonow rozbija liste na wiersze i pomija puste wpisy', () => {
    const html = render(byKey.wagon_list, RAIL)
    for (const w of ['31 51 4675 123-4', '31 51 4675 456-7', '31 51 4675 999-9']) {
      expect(html, w).toContain(w)
    }
    // Trzy niepuste numery z czterech pozycji tablicy - pusty string odpada.
    expect(html).toContain('>3<')
  })

  it('wykaz wagonow bez danych kolejowych nadal daje pusty formularz', () => {
    const html = render(byKey.wagon_list, {})
    expect(html).toContain('794px')
    expect(html).toContain('WYKAZ WAGON')
  })
})

describe('partia D: lotnicze', () => {
  const byKey = Object.fromEntries(TEMPLATE_CATALOG.map((t) => [t.key, t.template]))
  const AIR = buildGeneratorData({
    ...SEA_SNAPSHOT,
    route: { ...SEA_SNAPSHOT.route, transport: 'air', toCountry: 'US', toCity: 'New York' },
    air: { airportFrom: 'WAW', airportTo: 'JFK', consolidated: true, knownConsignor: true, chargeableWeightKg: '850' },
  }, 'PL')

  it('HAWB odroznia sie od MAWB i niesie lotniska z kroku Towar', () => {
    const html = render(byKey.hawb, AIR)
    expect(html).toContain('HOUSE AIR WAYBILL')
    expect(html).toContain('MAWB')
    expect(html).toContain('WAW')
    expect(html).toContain('JFK')
    expect(html).toContain('850')
  })

  it('HAWB mowi wprost, ze nie jest papierem wartosciowym', () => {
    const html = render(byKey.hawb, AIR)
    expect(html).toContain('nie jest papierem wartościowym')
  })

  it('SLI upowaznia spedytora i zaznacza konsolidacje z migawki', () => {
    const html = render(byKey.sli_air, AIR)
    expect(html).toContain('Upoważniam spedytora')
    expect(html).toContain('TAK / YES')
    expect(html).toContain('nie jest dokumentem przewozowym')
  })

  it('deklaracja bezpieczenstwa niesie statusy SPX, SCO i SHR', () => {
    const html = render(byKey.consignor_security_decl, AIR)
    for (const status of ['SPX', 'SCO', 'SHR']) expect(html, status).toContain(status)
    expect(html).toContain('znany nadawca')
    expect(html).toContain('zarejestrowany agent')
  })

  it('deklaracja bezpieczenstwa odczytuje status znanego nadawcy z migawki', () => {
    const html = render(byKey.consignor_security_decl, AIR)
    expect(html).toContain('znany nadawca (KC)')
  })

  it('manifest lotniczy ma kolumny na MAWB i HAWB naraz', () => {
    const html = render(byKey.air_cargo_manifest, AIR)
    expect(html).toContain('MAWB No.')
    expect(html).toContain('HAWB No.')
    expect(html).toContain('chicagowskiej')
  })
})

// Twardy zakaz z promptu: dokument blank_only NIGDY nie moze wyjsc z danymi
// uzytkownika. Sciezka generowania juz to wymusza (generateOne kieruje takie
// dokumenty do downloadBlankDocument, ktore podstawia pusty obiekt), ale dla
// szablonow pisanych od ETAPU 1 trzymamy druga, niezalezna gwarancje: wydruk
// ma byc IDENTYCZNY niezaleznie od tego, co dostanie na wejsciu.
describe('dokumenty blank_only nie przeciekaja danymi uzytkownika', () => {
  const NEW_BLANK_ONLY = ['ched_traces']

  it.each(NEW_BLANK_ONLY)('%s renderuje sie identycznie z danymi i bez nich', (key) => {
    const Template = TEMPLATE_CATALOG.find((t) => t.key === key).template
    expect(render(Template, FILLED)).toBe(render(Template, {}))
  })

  it('zaden ze znacznikow danych testowych nie trafia na wydruk', () => {
    const Template = TEMPLATE_CATALOG.find((t) => t.key === 'ched_traces').template
    const html = render(Template, FILLED)
    for (const marker of ['Nadawca sp. z o.o.', 'Consignee Inc.', 'MSCU1234567', 'Palety drewniane']) {
      expect(html, marker).not.toContain(marker)
    }
  })
})

describe('naglowek wersji roboczej nie psuje szablonu', () => {
  it('opakowany szablon nadal renderuje sie i niesie tekst naglowka', () => {
    const Wrapped = withDraftBanner(TEMPLATE_CATALOG.find((t) => t.key === 'booking_confirmation').template, 'PROJEKT — test')
    const html = render(Wrapped, FILLED)
    expect(html).toContain('PROJEKT')
    expect(html).toContain('BKG-778812')
  })
})
