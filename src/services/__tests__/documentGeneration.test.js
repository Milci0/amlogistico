// buildGeneratorData po dodaniu galezi kolejowej/lotniczej/multimodalnej — ETAP 2.4.
//
// Regresja, ktorej ten plik pilnuje: „Pobierz" w Historii regeneruje PDF prosto
// z zapisanego form_data, z pominieciem kreatora. Zestawy zapisane przed
// 2026-08-03 nie maja slajsow rail/air/multimodal, wiec bez normalizacji
// pierwsze odwolanie do rail.stationFrom wywalaloby pobieranie STARYCH dokumentow.

import { describe, it, expect } from 'vitest'
import {
  buildGeneratorData,
  getDocsForSnapshot,
  getEngineResultForSnapshot,
  buildEngineResult,
  findUnresolvedDocIds,
} from '../documentGeneration'
import { draftBannerText } from '../../generators/draftBanner'

const OLD_SNAPSHOT = {
  route: { transport: 'road', fromCountry: 'PL', fromCity: 'Gdansk', toCountry: 'DE', toCity: 'Berlin', loadDate: '2026-07-01', multimodal: false },
  cargo: { cargoName: 'Palety', hsCode: '4415.20', weight: '1200', packages: '10', currency: 'EUR' },
  parties: {
    sender: { name: 'Nadawca sp. z o.o.', vat: 'PL123' },
    receiver: { name: 'Empfaenger GmbH' },
    carrier: { name: 'Przewoznik SA', address: 'ul. Testowa 1', vat: 'PL999' },
  },
  road: { vehicleType: 'Plandeka', adr: false },
  sea: { containerType: '', freightTerms: 'Prepaid' },
  terms: { incoterms: 'FCA' },
}

describe('stare migawki bez nowych slajsow', () => {
  it('nie rzuca', () => {
    expect(() => buildGeneratorData(OLD_SNAPSHOT, 'PL')).not.toThrow()
  })

  it('nowe sekcje ladunku sa puste, ale obecne', () => {
    const d = buildGeneratorData(OLD_SNAPSHOT, 'PL')
    expect(d.rail).toEqual({ stationFrom: '', stationTo: '', groupConsignment: false, wagonNumbers: '' })
    expect(d.air.airportFrom).toBe('')
    expect(d.air.consolidated).toBe(false)
  })

  it('dotychczasowe pola sa nietkniete', () => {
    const d = buildGeneratorData(OLD_SNAPSHOT, 'PL')
    expect(d.cargo.name).toBe('Palety')
    expect(d.vehicle.type).toBe('Plandeka')
    expect(d.vehicle.typeEn).toBe('Tarpaulin (curtainsider)')
    expect(d.carrier.name).toBe('Przewoznik SA')
    expect(d.carrier.vatNumber).toBe('PL999')
    expect(d.cargo.incoterms).toBe('FCA')
  })

  it('bez etapow multimodalnych mainCarriage nadal bierze przewoznika z Kroku „Strony"', () => {
    const d = buildGeneratorData(OLD_SNAPSHOT, 'PL')
    expect(d.carrierLegs.mainCarriage).toEqual({
      name: 'Przewoznik SA',
      address: 'ul. Testowa 1',
      vatNumber: 'PL999',
    })
    expect(d.carrierLegs.preCarriage.name).toBe('')
    expect(d.carrierLegs.onCarriage.name).toBe('')
  })
})

describe('etapy multimodalne → carrierLegs', () => {
  const withLegs = (legs) => buildGeneratorData({ ...OLD_SNAPSHOT, multimodal: { legs } }, 'PL')

  it('jeden etap trafia w przewoz glowny', () => {
    const d = withLegs([{ order: 1, mode: 'sea', from: 'Gdansk', to: 'Newark', carrier: 'Maersk' }])
    expect(d.carrierLegs.mainCarriage.name).toBe('Maersk')
    expect(d.carrierLegs.preCarriage.name).toBe('')
    expect(d.carrierLegs.onCarriage.name).toBe('')
  })

  it('dwa etapy to dowoz plus przewoz glowny', () => {
    const d = withLegs([
      { order: 1, mode: 'road', from: 'Lodz', to: 'Gdansk', carrier: 'Trans PL' },
      { order: 2, mode: 'sea', from: 'Gdansk', to: 'Newark', carrier: 'Maersk' },
    ])
    expect(d.carrierLegs.preCarriage.name).toBe('Trans PL')
    expect(d.carrierLegs.mainCarriage.name).toBe('Maersk')
    expect(d.carrierLegs.onCarriage.name).toBe('')
  })

  it('trzy etapy wypelniaja dowoz, przewoz glowny i odwoz', () => {
    const d = withLegs([
      { order: 1, mode: 'road', from: 'Lodz', to: 'Gdansk', carrier: 'Trans PL' },
      { order: 2, mode: 'sea', from: 'Gdansk', to: 'Newark', carrier: 'Maersk' },
      { order: 3, mode: 'rail', from: 'Newark', to: 'Chicago', carrier: 'Union Pacific' },
    ])
    expect(d.carrierLegs.preCarriage.name).toBe('Trans PL')
    expect(d.carrierLegs.mainCarriage.name).toBe('Maersk')
    expect(d.carrierLegs.onCarriage.name).toBe('Union Pacific')
  })

  it('same puste etapy nie kasuja przewoznika z Kroku „Strony"', () => {
    const d = withLegs([{ order: 1, mode: '', from: '', to: '', carrier: '' }])
    expect(d.carrierLegs.mainCarriage.name).toBe('Przewoznik SA')
  })
})

describe('nowe galezie w ladunku szablonu', () => {
  it('numery wagonow ida jako tekst rozdzielony przecinkami', () => {
    const d = buildGeneratorData(
      { ...OLD_SNAPSHOT, route: { ...OLD_SNAPSHOT.route, transport: 'rail' }, rail: { stationFrom: 'Malaszewicze', stationTo: 'Duisburg', groupConsignment: true, wagonNumbers: ['31 51 4675 123-4', '', '31 51 4675 999-9'] } },
      'PL'
    )
    expect(d.rail.wagonNumbers).toBe('31 51 4675 123-4, 31 51 4675 999-9')
    expect(d.rail.stationFrom).toBe('Malaszewicze')
    expect(d.rail.groupConsignment).toBe(true)
  })

  it('dane lotnicze przechodza w calosci', () => {
    const d = buildGeneratorData(
      { ...OLD_SNAPSHOT, route: { ...OLD_SNAPSHOT.route, transport: 'air' }, air: { airportFrom: 'WAW', airportTo: 'JFK', consolidated: true, knownConsignor: true, chargeableWeightKg: '850' } },
      'PL'
    )
    expect(d.air).toEqual({ airportFrom: 'WAW', airportTo: 'JFK', consolidated: true, knownConsignor: true, chargeableWeightKg: '850' })
  })
})
