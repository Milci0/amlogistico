// Stan kreatora po dodaniu gałęzi kolejowej, lotniczej i multimodalnej — ETAP 2.4.
//
// Najwazniejsze sa tu testy STARYCH migawek: zestawy zapisane przed 2026-08-03
// nie maja slajsow rail/air/multimodal, a mimo to musza sie otwierac w kreatorze
// i dawac sie zregenerowac z Historii.

import { describe, it, expect } from 'vitest'
import {
  createEmptySnapshot,
  normalizeSnapshot,
  hasBranchData,
  initRoad,
  initSea,
  initRail,
  initAir,
  initMultimodal,
  SLICE_INITIALIZERS,
  TRANSPORT_MODES,
} from '../wizardState'

// Migawka w ksztalcie sprzed dodania nowych galezi — dokladnie to, co leży
// w bazie w kolumnie form_data dla istniejacych zestawow.
const OLD_SNAPSHOT = {
  route: { transport: 'road', fromCountry: 'PL', fromCity: 'Gdansk', toCountry: 'DE', toCity: 'Berlin', loadDate: '2026-07-01', multimodal: false },
  cargo: { cargoName: 'Palety', hsCode: '4415.20', weight: '1200', currency: 'EUR' },
  parties: {
    sender: { name: 'Nadawca sp. z o.o.', vat: 'PL123' },
    receiver: { name: 'Empfaenger GmbH' },
    carrier: { name: 'Przewoznik SA', address: 'ul. Testowa 1', vat: 'PL999' },
  },
  road: { vehicleType: 'Plandeka', adr: false },
  sea: { containerType: '', freightTerms: 'Prepaid' },
  terms: { incoterms: 'FCA' },
}

describe('normalizeSnapshot — stare migawki', () => {
  it('uzupelnia brakujace slajsy rail/air/multimodal', () => {
    const s = normalizeSnapshot(OLD_SNAPSHOT)
    expect(s.rail).toEqual(initRail())
    expect(s.air).toEqual(initAir())
    expect(s.multimodal).toEqual(initMultimodal())
  })

  it('nie rusza niczego, co user wpisal', () => {
    const s = normalizeSnapshot(OLD_SNAPSHOT)
    expect(s.route.fromCity).toBe('Gdansk')
    expect(s.cargo.cargoName).toBe('Palety')
    expect(s.parties.carrier.name).toBe('Przewoznik SA')
    expect(s.road.vehicleType).toBe('Plandeka')
    expect(s.terms.incoterms).toBe('FCA')
  })

  it('uzupelnia brakujace POLA w istniejacych slajsach', () => {
    const s = normalizeSnapshot(OLD_SNAPSHOT)
    expect(s.cargo.cargoCategory).toBe('')
    expect(s.cargo.packageType).toBe('')
    expect(s.road.vehicleReg).toBe('')
    expect(s.parties.sender.iban).toBe('')
  })

  it('pusta / uszkodzona migawka daje czysty szkielet zamiast rzutu', () => {
    for (const bad of [null, undefined, 'tekst', 42, []]) {
      expect(() => normalizeSnapshot(bad)).not.toThrow()
    }
    expect(normalizeSnapshot(null)).toEqual(createEmptySnapshot())
    expect(normalizeSnapshot({})).toEqual(createEmptySnapshot())
  })

  it('jest idempotentna', () => {
    const once = normalizeSnapshot(OLD_SNAPSHOT)
    expect(normalizeSnapshot(once)).toEqual(once)
  })

  it('numeruje etapy multimodalne po kolei, nawet gdy zapis byl niepelny', () => {
    const s = normalizeSnapshot({ multimodal: { legs: [{ carrier: 'A' }, { carrier: 'B' }, { carrier: 'C' }] } })
    expect(s.multimodal.legs.map((l) => l.order)).toEqual([1, 2, 3])
    expect(s.multimodal.legs[1]).toMatchObject({ order: 2, carrier: 'B', mode: '', from: '', to: '' })
  })
})

describe('hasBranchData — czy przelaczenie galezi ma o co pytac', () => {
  it('swiezy slajs nie liczy sie jako wypelniony', () => {
    for (const mode of TRANSPORT_MODES) {
      expect(hasBranchData(mode, SLICE_INITIALIZERS[mode]())).toBe(false)
    }
  })

  it('wykrywa wpisany tekst', () => {
    expect(hasBranchData('road', { ...initRoad(), vehicleReg: 'WA 12345' })).toBe(true)
    expect(hasBranchData('sea', { ...initSea(), containerNo: 'MSKU1234567' })).toBe(true)
    expect(hasBranchData('rail', { ...initRail(), stationFrom: 'Malaszewicze' })).toBe(true)
    expect(hasBranchData('air', { ...initAir(), airportFrom: 'WAW' })).toBe(true)
  })

  it('wykrywa zaznaczony checkbox', () => {
    expect(hasBranchData('road', { ...initRoad(), adr: true })).toBe(true)
    expect(hasBranchData('rail', { ...initRail(), groupConsignment: true })).toBe(true)
    expect(hasBranchData('air', { ...initAir(), knownConsignor: true })).toBe(true)
  })

  it('domyslne freightTerms w morskim nie udaja wypelnienia', () => {
    expect(hasBranchData('sea', initSea())).toBe(false)
    expect(hasBranchData('sea', { ...initSea(), freightTerms: 'Collect' })).toBe(true)
  })

  it('dodany wagon liczy sie jako dane', () => {
    expect(hasBranchData('rail', { ...initRail(), wagonNumbers: ['31 51 4675 123-4'] })).toBe(true)
  })

  // Multimodal startuje z JEDNYM pustym etapem, wiec porownanie po samej dlugosci
  // tablicy przepuscilo by wypelniony etap i skasowalo go bez pytania.
  it('wypelniony jedyny etap multimodalny liczy sie jako dane', () => {
    const base = initMultimodal()
    expect(hasBranchData('multimodal', base)).toBe(false)
    const filled = { legs: [{ ...base.legs[0], carrier: 'Maersk' }] }
    expect(hasBranchData('multimodal', filled)).toBe(true)
  })

  it('dorzucony etap multimodalny tez liczy sie jako dane', () => {
    const base = initMultimodal()
    expect(hasBranchData('multimodal', { legs: [...base.legs, { order: 2, mode: '', from: '', to: '', carrier: '' }] })).toBe(true)
  })

  it('nieznana galaz i brak slajsu nie rzucaja', () => {
    expect(hasBranchData('teleport', {})).toBe(false)
    expect(hasBranchData('road', null)).toBe(false)
    expect(hasBranchData(undefined, undefined)).toBe(false)
  })
})

describe('createEmptySnapshot', () => {
  it('ma slajs dla kazdej z pieciu galezi', () => {
    const s = createEmptySnapshot()
    for (const mode of TRANSPORT_MODES) expect(s[mode]).toBeDefined()
    expect(TRANSPORT_MODES).toEqual(['road', 'sea', 'rail', 'air', 'multimodal'])
  })

  it('startuje z jednym pustym etapem multimodalnym', () => {
    expect(createEmptySnapshot().multimodal.legs).toHaveLength(1)
    expect(createEmptySnapshot().multimodal.legs[0].order).toBe(1)
  })
})
