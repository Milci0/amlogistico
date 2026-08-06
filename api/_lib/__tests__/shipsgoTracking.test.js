import { describe, it, expect } from 'vitest'
import crypto from 'node:crypto'
import { trimShipmentData, trimGeojson, OCEAN_STATUSES } from '../shipsgo.js'
import { validateContainerNumber, isValidContainerNumber } from '../containerChecksum.js'
import { INACTIVE_STATUSES, isArchived } from '../containerTrackingRepo.js'

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

describe('trimShipmentData', () => {
  const raw = {
    id: 4242,
    status: 'SAILING',
    booking_number: 'BKG123',
    carrier: { scac: 'CMDU', name: 'CMA CGM' },
    transit_time: 43,
    transit_percentage: 99, // celowo mylaca wartosc z API
    co2_emission: 1200,
    checked_at: '2026-08-06T09:14:00Z',
    tokens: { map: 'tok123' },
    route: {
      port_of_loading: { location: { code: 'CNSHA', name: 'Shanghai' }, date: '2026-07-12' },
      port_of_discharge: {
        location: { code: 'PLGDN', name: 'Gdansk' },
        date: '2026-08-24',
        date_initial: '2026-08-21',
      },
      transhipments: [{ location: { code: 'SGSIN', name: 'Singapore' } }],
    },
    containers: [
      {
        number: 'CGMU6913205',
        size_type: '40 HC',
        status: 'ON_VESSEL',
        movements: [
          { event: 'LOAD', status: 'ACT', timestamp: '2026-07-12T16:02:00Z', vessel: { name: 'CMA CGM Figaro' }, voyage: 'FST1259' },
          { event: 'DISC', status: 'EST', timestamp: '2026-08-25T12:00:00Z' },
        ],
      },
    ],
  }

  it('wyciaga daty trasy potrzebne do paska postepu', () => {
    const s = trimShipmentData(raw)
    expect(s.loadingDate).toBe('2026-07-12')
    expect(s.dischargeDate).toBe('2026-08-24')
    expect(s.dischargeDateInitial).toBe('2026-08-21')
  })

  it('zachowuje transit_percentage jako surowa wartosc, ale to nie ono steruje paskiem', () => {
    // Pasek liczy computeVoyageProgress z dat (patrz src/utils/voyageProgress.js).
    // Tu tylko utrwalamy, ze wartosc z API jest przenoszona bez interpretacji.
    expect(trimShipmentData(raw).transitPercentage).toBe(99)
  })

  it('liczy kontenery i przenosi typ', () => {
    const s = trimShipmentData(raw)
    expect(s.containerCount).toBe(1)
    expect(s.containerType).toBe('40 HC')
    expect(s.containers[0].number).toBe('CGMU6913205')
  })

  it('przenosi przeladunki z nazwa portu', () => {
    expect(trimShipmentData(raw).transhipments).toEqual([
      { code: 'SGSIN', name: 'Singapore', country: null },
    ])
  })

  it('bierze statek i rejs z ostatniego ruchu, ktory je niesie', () => {
    const s = trimShipmentData(raw)
    expect(s.vessel).toBe('CMA CGM Figaro')
    expect(s.voyageNo).toBe('FST1259')
  })

  it('zachowuje status EST przy zdarzeniach szacowanych', () => {
    const s = trimShipmentData(raw)
    expect(s.movements[1].status).toBe('EST')
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
    const s = trimShipmentData(raw)
    expect(s.eta).toBe('2026-08-24')
    expect(s.loadingLocation.code).toBe('CNSHA')
    expect(s.dischargeLocation.code).toBe('PLGDN')
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
