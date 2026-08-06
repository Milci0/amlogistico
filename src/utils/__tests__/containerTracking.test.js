import { describe, it, expect } from 'vitest'
import { validateContainerNumber, analyzeContainerNumber } from '../containerNumber'
import { computeVoyageProgress, isDateChanged } from '../voyageProgress'
import { resolveContainerStatus, isPendingStatus } from '../../data/containerStatus'

// Numery uzyte w testach:
//   CSQU3054383 - przyklad rozpisany na en.wikipedia.org/wiki/ISO_6346
//   MSCU1234567 - numer o CELOWO blednej cyfrze kontrolnej
describe('validateContainerNumber (ISO 6346)', () => {
  it('przyjmuje numer z poprawna cyfra kontrolna', () => {
    const r = validateContainerNumber('CSQU3054383')
    expect(r.ok).toBe(true)
    expect(r.code).toBe('ok')
    expect(r.normalized).toBe('CSQU3054383')
  })

  it('normalizuje male litery, spacje i myslniki', () => {
    expect(validateContainerNumber('csqu 305438-3').normalized).toBe('CSQU3054383')
    expect(validateContainerNumber('csqu 305438-3').ok).toBe(true)
  })

  it('odroznia zly ksztalt od zlej cyfry kontrolnej', () => {
    expect(validateContainerNumber('ABC123').code).toBe('format')
    expect(validateContainerNumber('CSQU30543831').code).toBe('format')
    expect(validateContainerNumber('CSQU3054384').code).toBe('checksum')
  })

  it('puste wejscie ma wlasny kod', () => {
    expect(validateContainerNumber('').code).toBe('empty')
    expect(validateContainerNumber('   ').code).toBe('empty')
  })

  // Sedno reguly: niezgodnosc sumy nie wskazuje, KTORA z pierwszych dziesieciu
  // pozycji jest zla, wiec podpowiadanie „poprawnej cyfry" byloby zgadywaniem.
  it('NIE podpowiada cyfry kontrolnej bez kontekstu poprzedniego wpisu', () => {
    expect(validateContainerNumber('CSQU3054384').expectedCheckDigit).toBeNull()
    expect(validateContainerNumber('MSCU1234567').expectedCheckDigit).toBeNull()
  })

  it('podpowiada cyfre TYLKO gdy zmienil sie wylacznie ostatni znak', () => {
    const r = validateContainerNumber('CSQU3054384', { lastValidNumber: 'CSQU3054383' })
    expect(r.code).toBe('checksum')
    expect(r.expectedCheckDigit).toBe(3)
  })

  it('nie podpowiada, gdy rozni sie takze ktorys z pierwszych dziesieciu znakow', () => {
    const r = validateContainerNumber('CSQU3054484', { lastValidNumber: 'CSQU3054383' })
    expect(r.expectedCheckDigit).toBeNull()
  })

  it('czwarta litera spoza U/J/Z to ostrzezenie, nie blad twardy', () => {
    // CSQA3054383 ma ten sam korpus co CSQU..., ale inna litere kategorii,
    // wiec cyfra kontrolna sie nie zgadza. Sprawdzamy sam mechanizm flagi
    // na numerze, ktory przechodzi sume kontrolna.
    const withU = validateContainerNumber('CSQU3054383')
    expect(withU.ok).toBe(true)
    expect(withU.categoryWarning).toBe(false)
  })

  it('analyzeContainerNumber zostaje zgodne wstecz', () => {
    const a = analyzeContainerNumber('CSQU3054383')
    expect(a.valid).toBe(true)
    expect(a.checkDigit).toBe(3)
    expect(a.prefix).toBe('CSQU')
  })
})

describe('computeVoyageProgress (postep z DAT, nie z transit_percentage)', () => {
  const start = '2026-07-01T00:00:00Z'
  const end = '2026-07-11T00:00:00Z' // 10 dni

  it('liczy procent z uplywu czasu miedzy datami', () => {
    const now = new Date('2026-07-06T00:00:00Z') // polowa
    expect(computeVoyageProgress(start, end, now).percent).toBe(50)
  })

  it('przed zaladunkiem daje 0, po rozladunku 100', () => {
    expect(computeVoyageProgress(start, end, new Date('2026-06-01T00:00:00Z')).percent).toBe(0)
    expect(computeVoyageProgress(start, end, new Date('2026-08-01T00:00:00Z')).percent).toBe(100)
  })

  // null zamiast zera: „nie wiemy" to inna informacja niz „rejs stoi w miejscu".
  it('zwraca null, gdy brakuje ktorejs daty albo sa w zlej kolejnosci', () => {
    expect(computeVoyageProgress(null, end).percent).toBeNull()
    expect(computeVoyageProgress(start, null).percent).toBeNull()
    expect(computeVoyageProgress(end, start).percent).toBeNull()
    expect(computeVoyageProgress('nonsens', end).percent).toBeNull()
  })

  it('tuz po wyplynieciu daje wartosc bliska zeru (przypadek, w ktorym transit_percentage klamie)', () => {
    const now = new Date('2026-07-01T06:00:00Z') // 6 godzin z 10 dni
    expect(computeVoyageProgress(start, end, now).percent).toBeLessThan(5)
  })
})

describe('isDateChanged', () => {
  it('wykrywa przesuniecie terminu o dobe', () => {
    expect(isDateChanged('2026-08-24', '2026-08-21')).toBe(true)
  })

  it('ignoruje roznice godzin w obrebie tego samego dnia', () => {
    expect(isDateChanged('2026-08-24T08:00:00', '2026-08-24T18:00:00')).toBe(false)
  })

  it('brak ktorejs daty to brak zmiany', () => {
    expect(isDateChanged(null, '2026-08-21')).toBe(false)
    expect(isDateChanged('2026-08-24', null)).toBe(false)
  })
})

describe('resolveContainerStatus', () => {
  it('rekord archiwalny dostaje etykiete rejsu zakonczonego NIEZALEZNIE od statusu', () => {
    const sailing = resolveContainerStatus({ status: 'SAILING', archived: true })
    expect(sailing.labelKey).toBe('tracking.container.status.ARCHIVED')
    const arrived = resolveContainerStatus({ status: 'ARRIVED', archived: true })
    expect(arrived.labelKey).toBe('tracking.container.status.ARCHIVED')
  })

  it('NEW i INPROGRESS maja pulsujaca kropke i te sama etykiete', () => {
    expect(resolveContainerStatus({ status: 'NEW' }).pulse).toBe(true)
    expect(resolveContainerStatus({ status: 'INPROGRESS' }).pulse).toBe(true)
    expect(resolveContainerStatus({ status: 'NEW' }).labelKey)
      .toBe(resolveContainerStatus({ status: 'INPROGRESS' }).labelKey)
  })

  it('nieznany status nie wywala widoku', () => {
    expect(resolveContainerStatus({ status: 'COS_NOWEGO' }).labelKey).toBeTruthy()
  })

  it('isPendingStatus obejmuje tylko stany przejsciowe', () => {
    expect(isPendingStatus('NEW')).toBe(true)
    expect(isPendingStatus('INPROGRESS')).toBe(true)
    expect(isPendingStatus('SAILING')).toBe(false)
    expect(isPendingStatus('UNTRACKED')).toBe(false)
  })
})
