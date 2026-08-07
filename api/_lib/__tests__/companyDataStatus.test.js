// Testy reguly R2: powiadomienie o danych firmy powstaje TYLKO gdy WSZYSTKIE pola
// zakladki „Dane firmy" sa puste. Jedno wypelnione pole calkowicie je wylacza.

import { describe, it, expect } from 'vitest'
import { hasAnyCompanyData, COMPANY_DATA_FIELDS } from '../companyDataStatus.js'

// Konto o wypelnionych danych osobowych i pustych firmowych — punkt odniesienia
// dla wiekszosci przypadkow. Pola osobowe NIE moga wplywac na wynik.
const emptyCompany = {
  id: 'u1',
  email: 'kowalski@example.com',
  fullName: 'Jan Kowalski',
  phone: '+48123123123',
  passwordHash: 'hash',
  plan: 'free',
  stripeCustomerId: 'cus_123',
  defaultCurrency: 'EUR',
  preferredLanguage: 'PL',
  marketingConsent: true,
  companyName: null,
  vatNumber: null,
  eoriNumber: null,
  address: null,
  postalCode: null,
  city: null,
  country: null,
}

describe('hasAnyCompanyData', () => {
  it('wszystkie pola puste (null) -> false', () => {
    expect(hasAnyCompanyData(emptyCompany)).toBe(false)
  })

  it('wszystkie pola puste (pusty string) -> false', () => {
    const user = { ...emptyCompany }
    for (const f of COMPANY_DATA_FIELDS) user[f] = ''
    expect(hasAnyCompanyData(user)).toBe(false)
  })

  it('wszystkie pola puste (undefined, czyli brak klucza) -> false', () => {
    expect(hasAnyCompanyData({ id: 'u1', fullName: 'Jan Kowalski' })).toBe(false)
  })

  it('sama nazwa firmy -> true', () => {
    expect(hasAnyCompanyData({ ...emptyCompany, companyName: 'AMLogistico' })).toBe(true)
  })

  it('sam NIP -> true', () => {
    expect(hasAnyCompanyData({ ...emptyCompany, vatNumber: 'PL1234567890' })).toBe(true)
  })

  it('sam kraj -> true', () => {
    expect(hasAnyCompanyData({ ...emptyCompany, country: 'PL' })).toBe(true)
  })

  it('kazde z siedmiu pol osobno wystarcza', () => {
    for (const field of COMPANY_DATA_FIELDS) {
      expect(hasAnyCompanyData({ ...emptyCompany, [field]: 'x' })).toBe(true)
    }
  })

  it('same spacje w nazwie firmy licza sie jako pusto -> false', () => {
    expect(hasAnyCompanyData({ ...emptyCompany, companyName: '   ' })).toBe(false)
  })

  it('tabulatory i znaki nowej linii tez sa pustka -> false', () => {
    expect(hasAnyCompanyData({ ...emptyCompany, address: '\t\n  ' })).toBe(false)
  })

  it('wypelnione dane osobowe przy pustej firmie -> false', () => {
    const user = { ...emptyCompany, fullName: 'Jan Kowalski', phone: '+48500600700' }
    expect(hasAnyCompanyData(user)).toBe(false)
  })

  it('pola techniczne konta nie sa brane pod uwage', () => {
    // plan, stripeCustomerId, defaultCurrency i preferredLanguage sa wypelnione
    // w emptyCompany; gdyby ktorekolwiek wchodzilo do oceny, wynik bylby true.
    expect(hasAnyCompanyData(emptyCompany)).toBe(false)
    expect(COMPANY_DATA_FIELDS).not.toContain('preferredLanguage')
    expect(COMPANY_DATA_FIELDS).not.toContain('defaultCurrency')
    expect(COMPANY_DATA_FIELDS).not.toContain('fullName')
    expect(COMPANY_DATA_FIELDS).not.toContain('phone')
    expect(COMPANY_DATA_FIELDS).not.toContain('email')
    expect(COMPANY_DATA_FIELDS).not.toContain('marketingConsent')
    expect(COMPANY_DATA_FIELDS).not.toContain('profileCompleted')
  })

  it('brak uzytkownika -> false (nie rzuca)', () => {
    expect(hasAnyCompanyData(null)).toBe(false)
    expect(hasAnyCompanyData(undefined)).toBe(false)
  })

  it('lista pol pokrywa dokladnie zakladke „Dane firmy"', () => {
    expect([...COMPANY_DATA_FIELDS].sort()).toEqual(
      ['address', 'city', 'companyName', 'country', 'eoriNumber', 'postalCode', 'vatNumber'],
    )
  })
})
