import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import crypto from 'node:crypto'
import { trimShipmentData, trimGeojson, OCEAN_STATUSES, createOceanShipment, getOceanShipment } from '../shipsgo.js'
import { validateContainerNumber, isValidContainerNumber } from '../containerChecksum.js'
import { INACTIVE_STATUSES, isArchived, isAwaitingCarrierData, shouldPoll } from '../containerTrackingRepo.js'

// Kształt odpowiedzi ShipsGo (koperta z kluczem `shipment`), NIEZGADYWANY —
// przechwycony z realnego konta 2026-08-06: POST /ocean/shipments zwrócił
// {"message":"SUCCESS","shipment":{"id":6559745,...}}, a wcześniejszy kod
// zakładał płaską strukturę i gubił `id` przy KAŻDYM udanym utworzeniu (dwa
// realne, opłacone przypadki: TLLU1080331, MMAU1351730 - kredyt poszedł,
// a numer został bez zapisanego shipsgoId). Te testy pilnują, żeby unwrap
// się nie cofnął.
describe('koperta odpowiedzi ShipsGo (unwrapShipment)', () => {
  const REAL_CREATE_RESPONSE = {
    message: 'SUCCESS',
    shipment: { id: 6559745, reference: null, booking_number: null, container_number: 'TLLU1080331' },
  }

  beforeEach(() => {
    process.env.SHIPSGO_API_TOKEN = 'test-token'
    vi.stubGlobal('fetch', vi.fn())
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    delete process.env.SHIPSGO_API_TOKEN
  })

  it('createOceanShipment wyciąga id z koperty { shipment } zamiast z góry', async () => {
    fetch.mockResolvedValue(new Response(JSON.stringify(REAL_CREATE_RESPONSE), { status: 200 }))
    const result = await createOceanShipment({ containerNumber: 'TLLU1080331' })
    expect(result.success).toBe(true)
    expect(result.data?.id).toBe(6559745)
    expect(result.data?.container_number).toBe('TLLU1080331')
  })

  it('createOceanShipment na 409 też wyciąga id z koperty { shipment }', async () => {
    fetch.mockResolvedValue(new Response(JSON.stringify(REAL_CREATE_RESPONSE), { status: 409 }))
    const result = await createOceanShipment({ containerNumber: 'TLLU1080331' })
    expect(result.success).toBe(true)
    expect(result.alreadyExists).toBe(true)
    expect(result.data?.id).toBe(6559745)
  })

  it('getOceanShipment wyciąga id z tej samej koperty przy odczycie', async () => {
    fetch.mockResolvedValue(new Response(JSON.stringify({
      message: 'SUCCESS',
      shipment: { id: 6559746, status: 'SAILING', carrier: { name: 'MAERSK LINE' } },
    }), { status: 200 }))
    const result = await getOceanShipment(6559746)
    expect(result.success).toBe(true)
    expect(result.data?.id).toBe(6559746)
    expect(result.data?.status).toBe('SAILING')
  })

  it('unwrap jest bezpieczny dla już płaskiej odpowiedzi (bez klucza shipment)', async () => {
    fetch.mockResolvedValue(new Response(JSON.stringify({ id: 999, status: 'NEW' }), { status: 200 }))
    const result = await createOceanShipment({ containerNumber: 'AAAA1234561' })
    expect(result.data?.id).toBe(999)
  })
})

describe('containerChecksum (kopia backendowa)', () => {
  it('daje ten sam wynik co walidacja frontendowa', () => {
    expect(isValidContainerNumber('CSQU3054383')).toBe(true)
    expect(isValidContainerNumber('CSQU3054384')).toBe(false)
    expect(isValidContainerNumber('ABC123')).toBe(false)
  })

  it('rozroznia ksztalt od sumy kontrolnej', () => {
    expect(validateContainerNumber('ABC123').code).toBe('format')
    expect(validateContainerNumber('CSQU3054384').code).toBe('checksum')
    expect(validateContainerNumber('').code).toBe('empty')
  })
})

describe('isArchived (definicja rekordu aktywnego)', () => {
  it('discardedAt konczy rejs niezaleznie od statusu', () => {
    expect(isArchived({ status: 'SAILING', discardedAt: new Date() })).toBe(true)
  })

  it('DISCHARGED i UNTRACKED sa nieaktywne bez discardedAt', () => {
    for (const status of INACTIVE_STATUSES) {
      expect(isArchived({ status, discardedAt: null })).toBe(true)
    }
  })

  it('rejs w toku jest aktywny', () => {
    expect(isArchived({ status: 'SAILING', discardedAt: null })).toBe(false)
    expect(isArchived({ status: 'INPROGRESS', discardedAt: null })).toBe(false)
  })

  it('lista statusow nieaktywnych zawiera dokladnie te dwa', () => {
    expect(INACTIVE_STATUSES).toEqual(['DISCHARGED', 'UNTRACKED'])
  })
})

// ── Odstep odpytywania zalezy od STATUSU, nie od fetchState ─────────────────
// Regresja z 2026-08-08. Rekord swiezo utworzony ma fetchState 'ready' (POST
// zwrocil id i migawke, wiec z naszej perspektywy odczyt sie UDAL), ale status
// 'NEW'/'INPROGRESS', bo armator nie podal jeszcze trasy. Stara wersja
// shouldPoll() dobierala odstep po fetchState, wiec taki rekord dostawal godzine
// zamiast minuty i wisial userowi na „Pobieramy dane". Realny przypadek:
// CGMU5102420 status=NEW fetchState=ready przez 37 minut bez jednego odpytania.
describe('isAwaitingCarrierData i odstep odpytywania', () => {
  const base = { shipsgoId: 1, discardedAt: null }

  it('rekord ready ze statusem NEW nadal czeka na dane armatora', () => {
    expect(isAwaitingCarrierData({ ...base, status: 'NEW', fetchState: 'ready' })).toBe(true)
    expect(isAwaitingCarrierData({ ...base, status: 'INPROGRESS', fetchState: 'ready' })).toBe(true)
  })

  it('rejs w drodze nie czeka juz na dane armatora', () => {
    expect(isAwaitingCarrierData({ ...base, status: 'SAILING', fetchState: 'ready' })).toBe(false)
  })

  it('fetchState pending wystarcza, nawet gdy statusu jeszcze nie znamy', () => {
    expect(isAwaitingCarrierData({ ...base, status: null, fetchState: 'pending' })).toBe(true)
  })

  it('czekajacy na armatora jest odpytywalny po minucie, a nie po godzinie', () => {
    const row = {
      ...base,
      status: 'NEW',
      fetchState: 'ready',
      lastPolledAt: new Date(Date.now() - 2 * 60 * 1000),
    }
    expect(shouldPoll(row)).toBe(true)
  })

  it('minute po odpytaniu nie ponawiamy', () => {
    const row = {
      ...base,
      status: 'NEW',
      fetchState: 'ready',
      lastPolledAt: new Date(Date.now() - 5 * 1000),
    }
    expect(shouldPoll(row)).toBe(false)
  })

  it('rejs zakonczony nie jest odpytywany nigdy', () => {
    const row = { ...base, status: 'DISCHARGED', fetchState: 'ready', lastPolledAt: new Date(0) }
    expect(shouldPoll(row)).toBe(false)
  })
})

// ── Fixture wg UDOKUMENTOWANEGO ksztaltu odpowiedzi ShipsGo Ocean ───────────
// Poprzednia wersja tego bloku budowala obiekt z nazwami pol, ktorych API nie
// zwraca (`route.transhipments`, `size_type`, `transit_time`/`transit_percentage`/
// `co2_emission` na poziomie glownym, `carrier.scac`). Testy przechodzily, kod
// wygladal na sprawny, a produkcja dostawala inny obiekt i kafelki byly puste.
// To byla wlasciwa przyczyna usterki, dlatego fixture jest tu wazniejszy niz
// same asercje: wszystko ponizej odwzorowuje dokumentacje 1:1.
//
// Trasa: CALLAO -> PANAMA CITY (przeladunek) -> ROTTERDAM, dwa statki, czesc
// zdarzen faktyczna (ACT), czesc szacowana (EST).
const CALLAO = { code: 'PECLL', name: 'CALLAO', timezone: 'America/Lima', country: { code: 'PE', name: 'Peru' } }
const BALBOA = { code: 'PABLB', name: 'PANAMA CITY (BALBOA)', timezone: 'America/Panama', country: { code: 'PA', name: 'Panama' } }
const ROTTERDAM = { code: 'NLRTM', name: 'ROTTERDAM', timezone: 'Europe/Amsterdam', country: { code: 'NL', name: 'Netherlands' } }

const FIGARO = { name: 'CMA CGM FIGARO' }
const RIVOLI = { name: 'CMA CGM RIVOLI' }

const OCEAN_SHIPMENT = {
  id: 6559745,
  reference: null,
  booking_number: 'BKG778812',
  container_number: 'CGMU6913205',
  status: 'SAILING',
  carrier: { code: 'CMDU', name: 'CMA CGM' },
  route: {
    port_of_loading: {
      // Nazwa portu zaladunku CELOWO inna niz w ruchach („CALLAO (LIMA)" kontra
      // „CALLAO") - to dlatego porownanie idzie po kodzie, nie po nazwie.
      location: { ...CALLAO, name: 'CALLAO (LIMA)' },
      date_of_loading: '2026-07-08T18:20:00Z',
      date_of_loading_initial: '2026-07-06T18:20:00Z',
    },
    ts_count: 1,
    port_of_discharge: {
      location: ROTTERDAM,
      date_of_discharge: '2026-08-22T06:00:00Z',
      date_of_discharge_initial: '2026-08-19T06:00:00Z',
    },
    transit_time: 45,
    transit_percentage: 60,
    co2_emission: 1240,
  },
  containers: [
    {
      number: 'CGMU6913205',
      status: 'ON_VESSEL',
      size: 40,
      type: 'High Cube',
      movements: [
        { event: 'EMSH', status: 'ACT', location: CALLAO, vessel: null, voyage: null, timestamp: '2026-07-02T11:00:00Z' },
        { event: 'GTIN', status: 'ACT', location: CALLAO, vessel: null, voyage: null, timestamp: '2026-07-06T08:30:00Z' },
        { event: 'LOAD', status: 'ACT', location: CALLAO, vessel: FIGARO, voyage: 'FST1259', timestamp: '2026-07-08T18:20:00Z' },
        { event: 'DEPA', status: 'ACT', location: CALLAO, vessel: FIGARO, voyage: 'FST1259', timestamp: '2026-07-09T02:10:00Z' },
        { event: 'ARRV', status: 'ACT', location: BALBOA, vessel: FIGARO, voyage: 'FST1259', timestamp: '2026-07-22T14:05:00Z' },
        { event: 'DEPA', status: 'ACT', location: BALBOA, vessel: RIVOLI, voyage: 'RVL014W', timestamp: '2026-07-25T09:40:00Z' },
        { event: 'ARRV', status: 'EST', location: ROTTERDAM, vessel: RIVOLI, voyage: 'RVL014W', timestamp: '2026-08-22T06:00:00Z' },
        { event: 'DISC', status: 'EST', location: ROTTERDAM, vessel: null, voyage: null, timestamp: '2026-08-22T15:30:00Z' },
      ],
    },
  ],
  tokens: { map: 'tok123' },
  checked_at: '2026-08-07T09:14:00Z',
}

describe('trimShipmentData', () => {
  it('wyciaga daty trasy potrzebne do paska postepu', () => {
    const s = trimShipmentData(OCEAN_SHIPMENT)
    expect(s.loadingDate).toBe('2026-07-08T18:20:00Z')
    expect(s.dischargeDate).toBe('2026-08-22T06:00:00Z')
    expect(s.dischargeDateInitial).toBe('2026-08-19T06:00:00Z')
  })

  it('liczy kontenery i sklada typ z rozmiaru i typu', () => {
    const s = trimShipmentData(OCEAN_SHIPMENT)
    expect(s.containerCount).toBe(1)
    expect(s.containerType).toBe('40 High Cube')
    expect(s.containers[0].number).toBe('CGMU6913205')
    expect(s.containers[0].type).toBe('40 High Cube')
  })

  it('bierze statek i rejs z ostatniego ruchu, ktory je niesie', () => {
    const s = trimShipmentData(OCEAN_SHIPMENT)
    expect(s.vessel).toBe('CMA CGM RIVOLI')
    expect(s.voyageNo).toBe('RVL014W')
  })

  it('zachowuje status EST przy zdarzeniach szacowanych', () => {
    const s = trimShipmentData(OCEAN_SHIPMENT)
    expect(s.movements.at(-1).status).toBe('EST')
    expect(s.movements[0].status).toBe('ACT')
  })

  it('bierze kod linii z carrier.code', () => {
    expect(trimShipmentData(OCEAN_SHIPMENT).carrier).toEqual({ scac: 'CMDU', name: 'CMA CGM' })
  })

  it('nie wywala sie na pustej odpowiedzi (status INPROGRESS)', () => {
    const s = trimShipmentData({ id: 1, status: 'INPROGRESS', route: null, containers: [] })
    expect(s.containerCount).toBe(0)
    expect(s.movements).toEqual([])
    expect(s.loadingLocation).toBeNull()
    expect(s.vessel).toBeNull()
  })

  it('null na wejsciu daje null', () => {
    expect(trimShipmentData(null)).toBeNull()
  })

  it('zachowuje aliasy uzywane przez zakladke Lista przesylek', () => {
    const s = trimShipmentData(OCEAN_SHIPMENT)
    expect(s.eta).toBe('2026-08-22T06:00:00Z')
    expect(s.loadingLocation.code).toBe('PECLL')
    expect(s.dischargeLocation.code).toBe('NLRTM')
    expect(s.loadingDateInitial).toBe('2026-07-06T18:20:00Z')
  })
})

// ── Testy regresyjne: kazdy z nich ZAWODZI na kodzie sprzed poprawki ─────────
describe('trimShipmentData - pola czytane z niewlasciwych sciezek (regresja)', () => {
  it('czas przewozu, postep i emisja CO2 pochodza z route, nie z poziomu glownego', () => {
    const s = trimShipmentData(OCEAN_SHIPMENT)
    expect(s.transitTime).toBe(45)
    expect(s.transitPercentage).toBe(60)
    expect(s.co2Emission).toBe(1240)
  })

  it('te same trzy pola czytane sa zapasowo takze z poziomu glownego', () => {
    const s = trimShipmentData({ ...OCEAN_SHIPMENT, route: undefined, transit_time: 12, transit_percentage: 30, co2_emission: 900 })
    expect(s.transitTime).toBe(12)
    expect(s.transitPercentage).toBe(30)
    expect(s.co2Emission).toBe(900)
  })

  it('ts_count = 1 daje tsCount 1 i dokladnie jeden port przeladunku', () => {
    const s = trimShipmentData(OCEAN_SHIPMENT)
    expect(s.tsCount).toBe(1)
    expect(s.transhipments).toHaveLength(1)
    expect(s.transhipments[0]).toEqual({ code: 'PABLB', name: 'PANAMA CITY (BALBOA)', country: 'Panama' })
  })

  it('brak ts_count daje null, a NIE zero', () => {
    const { ts_count, ...routeBezLiczby } = OCEAN_SHIPMENT.route
    const s = trimShipmentData({ ...OCEAN_SHIPMENT, route: routeBezLiczby })
    expect(s.tsCount).toBeNull()
    // Rozroznienie ma znaczenie dla uzytkownika: null to „nie wiemy", zero to
    // „przewoznik potwierdzil przewoz bezposredni".
    expect(s.tsCount).not.toBe(0)
  })

  it('ts_count = 0 daje zero i pusta liste portow', () => {
    const bezposredni = {
      ...OCEAN_SHIPMENT,
      route: { ...OCEAN_SHIPMENT.route, ts_count: 0 },
      containers: [{
        ...OCEAN_SHIPMENT.containers[0],
        movements: [
          { event: 'LOAD', status: 'ACT', location: CALLAO, vessel: FIGARO, voyage: 'FST1259', timestamp: '2026-07-08T18:20:00Z' },
          { event: 'DISC', status: 'EST', location: ROTTERDAM, vessel: FIGARO, voyage: 'FST1259', timestamp: '2026-08-22T06:00:00Z' },
        ],
      }],
    }
    const s = trimShipmentData(bezposredni)
    expect(s.tsCount).toBe(0)
    expect(s.transhipments).toEqual([])
  })

  it('port zaladunku i wyladunku nie trafiaja na liste przeladunkow mimo innej nazwy w ruchach', () => {
    // Ruchy w CALLAO nazywaja port „CALLAO", a trasa „CALLAO (LIMA)" - gdyby
    // porownanie szlo po nazwie, port zaladunku wygladalby na przeladunek.
    const kody = trimShipmentData(OCEAN_SHIPMENT).transhipments.map((p) => p.code)
    expect(kody).not.toContain('PECLL')
    expect(kody).not.toContain('NLRTM')
  })

  it('rozjazd ts_count z lista portow jest logowany, ale nie przerywa przetwarzania', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const s = trimShipmentData({ ...OCEAN_SHIPMENT, route: { ...OCEAN_SHIPMENT.route, ts_count: 2 } })
    // Autorytatywna jest liczba z API, lista nazw zostaje przyblizeniem.
    expect(s.tsCount).toBe(2)
    expect(s.transhipments).toHaveLength(1)
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })

  // Same pola rozmiaru i typu, bez ruchow. ts_count zerowane razem z nimi, zeby
  // brak portow nie wywolywal ostrzezenia o rozjezdzie (osobny test wyzej).
  const zTypem = (container) => trimShipmentData({
    ...OCEAN_SHIPMENT,
    route: { ...OCEAN_SHIPMENT.route, ts_count: 0 },
    containers: [container],
  })

  it('typ kontenera: rozmiar i typ skladaja sie w jedna etykiete', () => {
    expect(zTypem({ number: 'X', size: 40, type: 'RF' }).containerType).toBe('40 RF')
  })

  it('typ kontenera: sam typ bez wiodacej spacji', () => {
    expect(zTypem({ number: 'X', type: 'RF' }).containerType).toBe('RF')
  })

  it('typ kontenera: sam rozmiar tez sie nie gubi', () => {
    expect(zTypem({ number: 'X', size: 20 }).containerType).toBe('20')
  })

  it('typ kontenera: brak obu pol daje null, nie pusty string', () => {
    expect(zTypem({ number: 'X' }).containerType).toBeNull()
  })

  it('migawka w starym ksztalcie (bez route) nie wywraca funkcji', () => {
    // Rekordy zapisane przed ta poprawka zostaja w bazie w starym ksztalcie -
    // trim musi je zniesc, a brakujace pola daja null, nie wyjatek.
    const stary = {
      id: 4242,
      status: 'SAILING',
      booking_number: 'BKG123',
      carrier: { scac: 'CMDU', name: 'CMA CGM' },
      containers: [{ number: 'CGMU6913205', size_type: '40 HC', status: 'ON_VESSEL' }],
    }
    const s = trimShipmentData(stary)
    expect(s.tsCount).toBeNull()
    expect(s.transhipments).toEqual([])
    expect(s.transitTime).toBeNull()
    expect(s.co2Emission).toBeNull()
    expect(s.loadingLocation).toBeNull()
    // Zapasowy odczyt starych nazw zostaje, dopoki ksztalt nie zostanie
    // potwierdzony na realnym tokenie.
    expect(s.containerType).toBe('40 HC')
    expect(s.carrier).toEqual({ scac: 'CMDU', name: 'CMA CGM' })
  })
})

describe('trimGeojson', () => {
  const fc = {
    type: 'FeatureCollection',
    features: [
      {
        geometry: { type: 'Point', coordinates: [121.4, 31.2] },
        properties: { name: 'Shanghai', type: 'port', status: 'PAST' },
      },
      {
        geometry: { type: 'LineString', coordinates: [[121.4, 31.2], [103.8, 1.3]] },
        properties: { status: 'CURRENT', current: { coordinates: [110.0, 15.0] }, vessel: { name: 'CMA CGM Figaro' }, voyage: 'FST1259' },
      },
      {
        geometry: { type: 'LineString', coordinates: [[103.8, 1.3], [18.6, 54.3]] },
        properties: { status: 'FUTURE' },
      },
    ],
  }

  it('zachowuje status odcinka, od ktorego zalezy styl linii', () => {
    const g = trimGeojson(fc)
    expect(g.features.map((f) => f.properties.status)).toEqual(['PAST', 'CURRENT', 'FUTURE'])
  })

  it('zachowuje pozycje statku, nazwe jednostki i rejs', () => {
    const g = trimGeojson(fc)
    expect(g.features[1].properties.current).toEqual([110.0, 15.0])
    expect(g.features[1].properties.vessel).toBe('CMA CGM Figaro')
    expect(g.features[1].properties.voyage).toBe('FST1259')
  })

  it('brak pozycji statku to normalny stan, nie blad', () => {
    const g = trimGeojson({
      type: 'FeatureCollection',
      features: [{ geometry: { type: 'LineString', coordinates: [[1, 1], [2, 2]] }, properties: { status: 'CURRENT', current: null } }],
    })
    expect(g.features[0].properties.current).toBeNull()
  })

  it('nieznany status jest zerowany, nie przepuszczany dalej', () => {
    const g = trimGeojson({
      type: 'FeatureCollection',
      features: [{ geometry: { type: 'Point', coordinates: [1, 1] }, properties: { status: 'COS' } }],
    })
    expect(g.features[0].properties.status).toBeNull()
  })

  it('odrzuca ksztalt, ktory nie jest FeatureCollection', () => {
    expect(trimGeojson({ type: 'Feature' })).toBeNull()
    expect(trimGeojson(null)).toBeNull()
    expect(trimGeojson({ type: 'FeatureCollection', features: [] })).toBeNull()
  })

  // Ksztalt POTWIERDZONY na realnym tokenie 2026-08-08. Dwa zalozenia okazaly sie
  // bledne i przez oba mapa nigdy nie miala czego narysowac ani co pokazac w dymku.
  describe('realny ksztalt odpowiedzi ShipsGo', () => {
    const realna = {
      message: 'SUCCESS',
      geojson: {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: { type: 'Point', coordinates: [-76.940998, -12.164225] },
            properties: {
              status: 'PAST',
              location: { code: 'PECLL', name: 'CALLAO (LIMA)', country: { code: 'PE', name: 'Peru' } },
            },
          },
          {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [[-79.565, 8.95], [4.48333, 51.9]] },
            properties: {
              status: 'CURRENT',
              vessel: { name: 'MAERSK BOGOR', imo: 9394882 },
              voyage: '628N',
              events: { DEPA: { timestamp: '2026-07-25T12:00:00-05:00' } },
              current: { index: 30, coordinates: [-5.071523, 49.46693] },
            },
          },
        ],
      },
    }

    it('rozpakowuje koperte { message, geojson }', () => {
      const g = trimGeojson(realna)
      expect(g).not.toBeNull()
      expect(g.features).toHaveLength(2)
    })

    it('czyta nazwe portu z properties.location.name', () => {
      const g = trimGeojson(realna)
      expect(g.features[0].properties.name).toBe('CALLAO (LIMA)')
    })

    it('czyta pozycje statku, jednostke i rejs z odcinka CURRENT', () => {
      const g = trimGeojson(realna)
      expect(g.features[1].properties.current).toEqual([-5.071523, 49.46693])
      expect(g.features[1].properties.vessel).toBe('MAERSK BOGOR')
      expect(g.features[1].properties.voyage).toBe('628N')
    })

    it('przesylka w przygotowaniu ma pusta liste obiektow, czyli brak trasy', () => {
      expect(trimGeojson({ message: 'SUCCESS', geojson: { type: 'FeatureCollection', features: [] } })).toBeNull()
    })
  })
})

// Podpis webhooka. Logika jest w api/_routes/tracking.js (funkcja lokalna),
// wiec odtwarzamy ja tutaj 1:1 i testujemy sam algorytm porownania.
function signatureMatches(rawBody, provided, secret) {
  if (!provided || !secret || !rawBody) return false
  const mac = crypto.createHmac('sha256', secret).update(rawBody).digest()
  const value = String(provided).replace(/^sha256=/i, '').trim()
  const expected = [mac.toString('hex'), mac.toString('base64')]
  return expected.some((candidate) => {
    const a = Buffer.from(candidate, 'utf8')
    const b = Buffer.from(value, 'utf8')
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  })
}

describe('podpis webhooka (HMAC-SHA256)', () => {
  const secret = 'tajny-sekret'
  const body = Buffer.from(JSON.stringify({ event: 'OCEAN.SHIPMENTS.SHIPMENT_UPDATED', data: { id: 1 } }), 'utf8')
  const hex = crypto.createHmac('sha256', secret).update(body).digest('hex')
  const b64 = crypto.createHmac('sha256', secret).update(body).digest('base64')

  it('przyjmuje podpis w hex i w base64', () => {
    expect(signatureMatches(body, hex, secret)).toBe(true)
    expect(signatureMatches(body, b64, secret)).toBe(true)
  })

  it('przyjmuje prefiks sha256=', () => {
    expect(signatureMatches(body, `sha256=${hex}`, secret)).toBe(true)
  })

  it('odrzuca podpis policzony innym sekretem', () => {
    const wrong = crypto.createHmac('sha256', 'inny').update(body).digest('hex')
    expect(signatureMatches(body, wrong, secret)).toBe(false)
  })

  it('odrzuca podpis poprawny dla INNEJ tresci', () => {
    const other = Buffer.from(JSON.stringify({ event: 'X' }), 'utf8')
    const otherSig = crypto.createHmac('sha256', secret).update(other).digest('hex')
    expect(signatureMatches(body, otherSig, secret)).toBe(false)
  })

  it('odrzuca brak podpisu, brak sekretu i pusta tresc', () => {
    expect(signatureMatches(body, null, secret)).toBe(false)
    expect(signatureMatches(body, hex, null)).toBe(false)
    expect(signatureMatches(null, hex, secret)).toBe(false)
  })

  it('odrzuca podpis o innej dlugosci bez rzucania wyjatku', () => {
    // timingSafeEqual rzuca przy roznych dlugosciach, wiec dlugosc sprawdzamy sami.
    expect(() => signatureMatches(body, 'abc', secret)).not.toThrow()
    expect(signatureMatches(body, 'abc', secret)).toBe(false)
  })
})

describe('statusy ShipsGo', () => {
  it('lista pokrywa wszystkie osiem wartosci z dokumentacji', () => {
    expect(OCEAN_STATUSES).toEqual([
      'NEW', 'INPROGRESS', 'BOOKED', 'LOADED', 'SAILING', 'ARRIVED', 'DISCHARGED', 'UNTRACKED',
    ])
  })
})
