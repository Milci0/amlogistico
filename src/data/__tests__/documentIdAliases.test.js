// Most miedzy stara a nowa przestrzenia id dokumentow — ETAP 2.3.
//
// Jesli ten plik przestanie przechodzic, „Pobierz" w Historii przestanie dzialac
// na wszystkich zestawach zapisanych przed unifikacja silnika — i to po cichu,
// bez komunikatu bledu.

import { describe, it, expect } from 'vitest'
import {
  toCatalogId,
  toLegacyId,
  toCatalogIds,
  hasLegacyIds,
  LEGACY_TO_CATALOG,
} from '../documentIdAliases'
import { documentCatalog } from '../documentCatalog'
import { DOCUMENTS } from '../../generators/documents'

describe('kompletnosc mapowania', () => {
  it('kazdy z dziewieciu kluczy dawnego rejestru ma odpowiednik', () => {
    const registryKeys = DOCUMENTS.map((d) => d.key).sort()
    expect(registryKeys).toEqual(Object.keys(LEGACY_TO_CATALOG).sort())
    expect(registryKeys).toHaveLength(9)
  })

  it('kazdy cel mapowania istnieje w katalogu dokumentow', () => {
    for (const [legacy, catalog] of Object.entries(LEGACY_TO_CATALOG)) {
      expect(documentCatalog[catalog], `${legacy} -> ${catalog}`).toBeDefined()
      expect(documentCatalog[catalog].name_pl).toBeTruthy()
    }
  })

  it('mapowanie jest roznowartosciowe', () => {
    const targets = Object.values(LEGACY_TO_CATALOG)
    expect(new Set(targets).size).toBe(targets.length)
  })
})

describe('toCatalogId', () => {
  it('tlumaczy stary klucz', () => {
    expect(toCatalogId('cmr')).toBe('01_CMR')
    expect(toCatalogId('packing')).toBe('02_PackingList')
    expect(toCatalogId('seawaybill')).toBe('26_SeaWaybill')
  })

  it('jest idempotentna — identyfikator katalogu przechodzi bez zmian', () => {
    expect(toCatalogId('01_CMR')).toBe('01_CMR')
    expect(toCatalogId(toCatalogId('cmr'))).toBe('01_CMR')
  })

  it('nieznany identyfikator przechodzi bez zmian zamiast znikac', () => {
    expect(toCatalogId('117_TIR')).toBe('117_TIR')
    expect(toCatalogId('cos_czego_nie_znamy')).toBe('cos_czego_nie_znamy')
  })

  it('wartosci nietekstowe nie rzucaja', () => {
    for (const bad of [null, undefined, 0, {}, []]) {
      expect(() => toCatalogId(bad)).not.toThrow()
    }
  })
})

describe('toLegacyId', () => {
  it('tlumaczy w druga strone', () => {
    expect(toLegacyId('01_CMR')).toBe('cmr')
    expect(toLegacyId('28_MTD')).toBe('multimodal')
  })

  it('zwraca null dla dokumentow, ktorych nigdy nie bylo w kreatorze', () => {
    expect(toLegacyId('117_TIR')).toBeNull()
    expect(toLegacyId('53_Nigeria_Import')).toBeNull()
  })
})

describe('toCatalogIds', () => {
  it('mapuje cala liste selectedDocs ze starego rekordu', () => {
    expect(toCatalogIds(['cmr', 'packing', 'faktura'])).toEqual([
      '01_CMR', '02_PackingList', '03_Invoice',
    ])
  })

  it('radzi sobie z lista mieszana (rekord czesciowo zmigrowany)', () => {
    expect(toCatalogIds(['cmr', '02_PackingList', '117_TIR'])).toEqual([
      '01_CMR', '02_PackingList', '117_TIR',
    ])
  })

  it('usuwa duplikaty powstale po zmapowaniu', () => {
    expect(toCatalogIds(['cmr', '01_CMR'])).toEqual(['01_CMR'])
  })

  it('nie-tablica daje pusta liste zamiast rzutu', () => {
    for (const bad of [null, undefined, 'cmr', 42]) {
      expect(toCatalogIds(bad)).toEqual([])
    }
  })
})

describe('hasLegacyIds', () => {
  it('rozpoznaje rekord sprzed unifikacji', () => {
    expect(hasLegacyIds(['cmr', 'packing'])).toBe(true)
    expect(hasLegacyIds(['01_CMR', '02_PackingList'])).toBe(false)
    expect(hasLegacyIds([])).toBe(false)
    expect(hasLegacyIds(null)).toBe(false)
  })
})
