// Testy funkcji pomocniczych do przenoszenia danych zakładki „Dane firmy"
// (profil) do sekcji NADAWCA w kreatorze. Lista pól i predykat pustego pola
// pochodzą z api/_lib/companyDataStatus.js (patrz senderProfileFill.js) -
// te testy nie duplikują tamtej logiki, tylko sprawdzają rozszerzenie na niej
// zbudowane.

import { describe, it, expect } from 'vitest'
import { companyDataStatus, composeCompanyAddress, fillSenderFromProfile } from '../senderProfileFill.js'

const fullProfile = {
  companyName: 'AMLogistico Sp. z o.o.',
  vatNumber: 'PL1234567890',
  eoriNumber: 'PL123456789012345',
  address: 'Trawowa 1',
  postalCode: '6300',
  city: 'Solec',
  country: 'Polska',
}

describe('companyDataStatus', () => {
  it('wszystkie pola wypełnione -> full', () => {
    expect(companyDataStatus(fullProfile)).toBe('full')
  })

  it('jedno pole wypełnione -> partial', () => {
    expect(companyDataStatus({ companyName: 'AMLogistico' })).toBe('partial')
  })

  it('żadne pole wypełnione -> empty', () => {
    const empty = {
      companyName: null,
      vatNumber: null,
      eoriNumber: null,
      address: null,
      postalCode: null,
      city: null,
      country: null,
    }
    expect(companyDataStatus(empty)).toBe('empty')
  })

  it('pole zawierające same białe znaki liczy się jako puste', () => {
    const profile = { ...fullProfile, eoriNumber: '   ' }
    expect(companyDataStatus(profile)).toBe('partial')
  })

  it('pola null i undefined liczą się jako puste', () => {
    const profile = { ...fullProfile, eoriNumber: null, postalCode: undefined }
    expect(companyDataStatus(profile)).toBe('partial')
  })

  it('brak użytkownika -> empty (nie rzuca)', () => {
    expect(companyDataStatus(null)).toBe('empty')
    expect(companyDataStatus(undefined)).toBe('empty')
  })
})

describe('composeCompanyAddress', () => {
  it('komplet pól -> "ulica, kod miasto, kraj"', () => {
    expect(composeCompanyAddress(fullProfile)).toBe('Trawowa 1, 6300 Solec, Polska')
  })

  it('brak kodu pocztowego -> bez podwójnego przecinka', () => {
    const profile = { ...fullProfile, postalCode: '' }
    expect(composeCompanyAddress(profile)).toBe('Trawowa 1, Solec, Polska')
  })

  it('brak kraju -> bez przecinka na końcu', () => {
    const profile = { ...fullProfile, country: '' }
    expect(composeCompanyAddress(profile)).toBe('Trawowa 1, 6300 Solec')
  })

  it('wyłącznie ulica -> sama ulica, bez przecinków', () => {
    const profile = { address: 'Trawowa 1', postalCode: '', city: '', country: '' }
    expect(composeCompanyAddress(profile)).toBe('Trawowa 1')
  })

  it('wszystkie pola puste -> pusty string, bez samotnych przecinków', () => {
    const profile = { address: '', postalCode: '', city: '', country: '' }
    expect(composeCompanyAddress(profile)).toBe('')
  })

  it('brak obiektu profilu -> pusty string (nie rzuca)', () => {
    expect(composeCompanyAddress(undefined)).toBe('')
  })
})

describe('fillSenderFromProfile', () => {
  it('formularz całkowicie pusty -> uzupełnia name/vat/address z profilu', () => {
    const sender = { name: '', vat: '', address: '', contact: '', phone: '', iban: '', swift: '', bank: '' }
    const result = fillSenderFromProfile(sender, fullProfile)
    expect(result.name).toBe('AMLogistico Sp. z o.o.')
    expect(result.vat).toBe('PL1234567890')
    expect(result.address).toBe('Trawowa 1, 6300 Solec, Polska')
  })

  it('ręcznie wpisana nazwa firmy inna niż w profilu -> pozostaje nietknięta', () => {
    const sender = { name: 'Inna Sp. z o.o.', vat: '', address: '', contact: '', phone: '', iban: '', swift: '', bank: '' }
    const result = fillSenderFromProfile(sender, fullProfile)
    expect(result.name).toBe('Inna Sp. z o.o.')
    expect(result.vat).toBe('PL1234567890')
    expect(result.address).toBe('Trawowa 1, 6300 Solec, Polska')
  })

  it('wypełnione pola bankowe pozostają nietknięte', () => {
    const sender = {
      name: '', vat: '', address: '', contact: '', phone: '',
      iban: 'PL61109010140000071219812874', swift: 'WBKPPLPP', bank: 'Bank Testowy',
    }
    const result = fillSenderFromProfile(sender, fullProfile)
    expect(result.iban).toBe('PL61109010140000071219812874')
    expect(result.swift).toBe('WBKPPLPP')
    expect(result.bank).toBe('Bank Testowy')
  })

  it('nie dotyka osoby kontaktowej i telefonu (brak odpowiednika w profilu)', () => {
    const sender = { name: '', vat: '', address: '', contact: 'Jan Kowalski', phone: '+48500600700', iban: '', swift: '', bank: '' }
    const result = fillSenderFromProfile(sender, fullProfile)
    expect(result.contact).toBe('Jan Kowalski')
    expect(result.phone).toBe('+48500600700')
  })

  it('dwukrotne wywołanie nie duplikuje ani nie zmienia wyniku', () => {
    const sender = { name: '', vat: '', address: '', contact: '', phone: '', iban: '', swift: '', bank: '' }
    const once = fillSenderFromProfile(sender, fullProfile)
    const twice = fillSenderFromProfile(once, fullProfile)
    expect(twice).toEqual(once)
  })

  it('jest czysta - nie modyfikuje przekazanego obiektu sender', () => {
    const sender = { name: '', vat: '', address: '', contact: '', phone: '', iban: '', swift: '', bank: '' }
    const snapshot = { ...sender }
    fillSenderFromProfile(sender, fullProfile)
    expect(sender).toEqual(snapshot)
  })

  it('częściowy profil (tylko nazwa firmy) -> adres zostaje pusty, bez samotnych przecinków', () => {
    const sender = { name: '', vat: '', address: '', contact: '', phone: '', iban: '', swift: '', bank: '' }
    const profile = { companyName: 'AMLogistico' }
    const result = fillSenderFromProfile(sender, profile)
    expect(result.name).toBe('AMLogistico')
    expect(result.address).toBe('')
  })
})
