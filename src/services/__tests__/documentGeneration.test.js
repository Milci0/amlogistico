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

  it('bez etapow multimodalnych jeden neutralny wiersz bierze przewoznika z Kroku „Strony"', () => {
    const d = buildGeneratorData(OLD_SNAPSHOT, 'PL')
    expect(d.carrierLegs.rows).toEqual([{
      label: 'Leg 1',
      mode: '',
      placeOfReceipt: '',
      pol: '',
      pod: '',
      placeOfDelivery: '',
      carrierName: 'Przewoznik SA',
      carrierAddress: 'ul. Testowa 1',
      carrierVatNumber: 'PL999',
    }])
  })
})

describe('etapy multimodalne → carrierLegs.rows', () => {
  const withLegs = (legs) => buildGeneratorData({ ...OLD_SNAPSHOT, multimodal: { legs } }, 'PL')

  it('jeden etap sea trafia w Main-carriage z POL/POD z jego wlasnych pol', () => {
    const d = withLegs([{ order: 1, mode: 'sea', from: 'Gdansk', to: 'Newark', carrier: 'Maersk' }])
    expect(d.carrierLegs.rows).toHaveLength(1)
    expect(d.carrierLegs.rows[0]).toMatchObject({
      label: 'Main-carriage',
      mode: 'sea',
      carrierName: 'Maersk',
      placeOfReceipt: 'Gdansk',
      pol: 'Gdansk',
      pod: 'Newark',
      placeOfDelivery: 'Newark',
    })
  })

  it('dwa etapy (road + sea): dowoz jako Pre-carriage, POL glownego bierze punkt przeladunku z dowozu', () => {
    const d = withLegs([
      { order: 1, mode: 'road', from: 'Lodz', to: 'Gdansk', carrier: 'Trans PL' },
      { order: 2, mode: 'sea', from: 'Gdansk', to: 'Newark', carrier: 'Maersk' },
    ])
    expect(d.carrierLegs.rows).toHaveLength(2)
    expect(d.carrierLegs.rows[0]).toMatchObject({ label: 'Pre-carriage', carrierName: 'Trans PL', placeOfReceipt: 'Lodz', pol: '', pod: '' })
    expect(d.carrierLegs.rows[1]).toMatchObject({ label: 'Main-carriage', carrierName: 'Maersk', pol: 'Gdansk', pod: 'Newark', placeOfDelivery: 'Newark' })
  })

  it('dwa etapy bez sea/air: sekwencyjne Leg 1 / Leg 2, POL/POD puste', () => {
    const d = withLegs([
      { order: 1, mode: 'road', from: 'Lodz', to: 'Gdansk', carrier: 'Trans PL' },
      { order: 2, mode: 'rail', from: 'Gdansk', to: 'Malmo', carrier: 'PKP Cargo' },
    ])
    expect(d.carrierLegs.rows).toHaveLength(2)
    expect(d.carrierLegs.rows[0]).toMatchObject({ label: 'Leg 1', mode: 'road', carrierName: 'Trans PL', placeOfReceipt: 'Lodz', pol: '', pod: '' })
    expect(d.carrierLegs.rows[1]).toMatchObject({ label: 'Leg 2', mode: 'rail', carrierName: 'PKP Cargo', pol: '', pod: '', placeOfDelivery: 'Malmo' })
  })

  it('dokladnie trzy etapy zawsze dostaja Pre/Main/On, niezaleznie od trybu', () => {
    const d = withLegs([
      { order: 1, mode: 'road', from: 'Lodz', to: 'Gdansk', carrier: 'Trans PL' },
      { order: 2, mode: 'sea', from: 'Gdansk', to: 'Newark', carrier: 'Maersk' },
      { order: 3, mode: 'rail', from: 'Newark', to: 'Chicago', carrier: 'Union Pacific' },
    ])
    expect(d.carrierLegs.rows).toHaveLength(3)
    expect(d.carrierLegs.rows[0]).toMatchObject({ label: 'Pre-carriage', carrierName: 'Trans PL', placeOfReceipt: 'Lodz' })
    expect(d.carrierLegs.rows[1]).toMatchObject({ label: 'Main-carriage', carrierName: 'Maersk', pol: 'Gdansk', pod: 'Newark' })
    expect(d.carrierLegs.rows[2]).toMatchObject({ label: 'On-carriage', carrierName: 'Union Pacific', placeOfDelivery: 'Chicago' })
  })

  it('cztery etapy z sea w srodku: Pre-carriage numerowane, On-carriage pojedyncze', () => {
    const d = withLegs([
      { order: 1, mode: 'road', from: 'Warszawa', to: 'Lodz', carrier: 'A' },
      { order: 2, mode: 'road', from: 'Lodz', to: 'Gdansk', carrier: 'B' },
      { order: 3, mode: 'sea', from: 'Gdansk', to: 'Newark', carrier: 'Maersk' },
      { order: 4, mode: 'road', from: 'Newark', to: 'Chicago', carrier: 'C' },
    ])
    expect(d.carrierLegs.rows.map((r) => r.label)).toEqual(['Pre-carriage 1', 'Pre-carriage 2', 'Main-carriage', 'On-carriage'])
    expect(d.carrierLegs.rows[0].placeOfReceipt).toBe('Warszawa')
    expect(d.carrierLegs.rows[2]).toMatchObject({ pol: 'Gdansk', pod: 'Newark' })
    expect(d.carrierLegs.rows[3].placeOfDelivery).toBe('Chicago')
  })

  it('brakujace „Dokad" etapu N spada na „Skad" etapu N+1 przy wyznaczaniu POL', () => {
    const d = withLegs([
      { order: 1, mode: 'road', from: 'Lodz', to: '', carrier: 'Trans PL' },
      { order: 2, mode: 'sea', from: 'Gdansk', to: 'Newark', carrier: 'Maersk' },
    ])
    expect(d.carrierLegs.rows[1].pol).toBe('Gdansk')
  })

  it('same puste etapy nie kasuja przewoznika z Kroku „Strony"', () => {
    const d = withLegs([{ order: 1, mode: '', from: '', to: '', carrier: '' }])
    expect(d.carrierLegs.rows).toHaveLength(1)
    expect(d.carrierLegs.rows[0].carrierName).toBe('Przewoznik SA')
    expect(d.carrierLegs.rows[0].label).toBe('Leg 1')
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
