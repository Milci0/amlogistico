// Bramka czasowa validFrom/validTo — ETAP 2.2.
//
// Osobny plik, bo vi.mock podmienia katalog na poziomie MODULU: w katalogu
// produkcyjnym wszystkie wpisy maja dzis validFrom/validTo = null, wiec bez
// podmiany nie da sie sprawdzic, czy mechanizm w ogole dziala.

import { describe, it, expect, vi } from 'vitest'

vi.mock('../../data/documentCatalog', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    documentCatalog: {
      ...actual.documentCatalog,
      // Dokument, ktory zacznie obowiazywac dopiero w przyszlosci.
      '09_Zlecenie': { ...actual.documentCatalog['09_Zlecenie'], validFrom: '2030-01-01' },
      // Dokument, ktory juz przestal obowiazywac.
      '10_POD': { ...actual.documentCatalog['10_POD'], validTo: '2020-12-31' },
    },
  }
})

const { getDocuments } = await import('../documentEngine')

const ids = (list) => list.map((d) => d.id)

describe('bramka czasowa sterowana katalogiem', () => {
  const REFERENCE = new Date('2026-08-03')

  it('dokument z validFrom w przyszlosci wypada z required', () => {
    const r = getDocuments('PL', 'DE', 'road', 'general', {}, { referenceDate: REFERENCE })
    expect(ids(r.required)).not.toContain('09_Zlecenie')
    expect(ids(r.required)).toContain('01_CMR')
  })

  it('zamiast dokumentu pojawia sie ostrzezenie o poziomie info', () => {
    const r = getDocuments('PL', 'DE', 'road', 'general', {}, {
      referenceDate: REFERENCE,
      includeMetadata: true,
    })
    const w = r.warnings.find((x) => x.code === 'warn_document_not_yet_valid')
    expect(w).toBeDefined()
    expect(w.severity).toBe('info')
    expect(w.params.date).toBe('2030-01-01')
  })

  it('dokument z validTo w przeszlosci tez wypada, z wlasnym kodem', () => {
    const r = getDocuments('PL', 'DE', 'road', 'general', {}, {
      referenceDate: REFERENCE,
      includeMetadata: true,
    })
    const all = [...ids(r.required), ...ids(r.conditional), ...ids(r.blanks)]
    expect(all).not.toContain('10_POD')
    expect(r.warnings.map((x) => x.code)).toContain('warn_document_expired')
  })

  it('po dacie wejscia w zycie dokument wraca na liste', () => {
    const r = getDocuments('PL', 'DE', 'road', 'general', {}, { referenceDate: new Date('2031-01-01') })
    expect(ids(r.required)).toContain('09_Zlecenie')
    expect(r.warnings.some((w) => typeof w === 'string' && w.includes('2030-01-01'))).toBe(false)
  })

  it('domyslny referenceDate to dzis — bramka dziala bez podania opcji', () => {
    const r = getDocuments('PL', 'DE', 'road', 'general', {})
    expect(ids(r.required)).not.toContain('09_Zlecenie')
    expect(ids(r.required)).not.toContain('10_POD')
  })
})
