// Skladanie tresci powiadomienia: baza (admin) albo tlumaczenia (automatyczne).
//
// Zaslepka `t` odwzorowuje zachowanie i18next istotne dla tego modulu: znany klucz
// zwraca tlumaczenie z podstawieniem `{{param}}`, nieznany zwraca `defaultValue`.

import { describe, it, expect } from 'vitest'
import {
  notificationContent,
  KIND_ADMIN_MESSAGE,
  KIND_PROFILE_COMPANY_DATA,
} from '../notificationContent.js'

const DICT = {
  'notifications.auto.profileCompanyData.title': 'Finish setting up your company',
  'notifications.auto.profileCompanyData.body': 'Add your company details once.',
  'notifications.auto.profileCompanyData.cta': 'Complete profile',
}

function t(key, opts = {}) {
  const found = DICT[key]
  if (found === undefined) return opts.defaultValue ?? key
  return found.replace(/\{\{(\w+)\}\}/g, (m, name) => (name in opts ? String(opts[name]) : m))
}

const AUTO = {
  id: 'n1',
  kind: KIND_PROFILE_COMPANY_DATA,
  title: 'Dokończ konfigurację firmy',
  body: 'Dodaj dane firmy raz.',
  ctaLabel: 'Uzupełnij profil',
  ctaUrl: '/profile?tab=firma',
  params: null,
}

describe('notificationContent', () => {
  it('powiadomienie admina idzie prosto z bazy, bez tlumaczenia', () => {
    const admin = {
      kind: KIND_ADMIN_MESSAGE,
      title: 'Przerwa techniczna',
      body: 'W sobote od 22:00.',
      ctaLabel: null,
      ctaUrl: null,
    }
    expect(notificationContent(admin, t)).toEqual({
      title: 'Przerwa techniczna',
      body: 'W sobote od 22:00.',
      ctaLabel: null,
      ctaUrl: null,
    })
  })

  it('powiadomienie automatyczne bierze tresc z tlumaczen, nie z bazy', () => {
    const c = notificationContent(AUTO, t)
    expect(c.title).toBe('Finish setting up your company')
    expect(c.body).toBe('Add your company details once.')
    expect(c.ctaLabel).toBe('Complete profile')
    expect(c.ctaUrl).toBe('/profile?tab=firma') // link nigdy nie jest tlumaczony
  })

  it('brak klucza i18n -> tekst z bazy jako zapas', () => {
    const nieznane = { ...AUTO, kind: 'PRZYSZLA_KATEGORIA' }
    const c = notificationContent(nieznane, t)
    expect(c.title).toBe('Dokończ konfigurację firmy')
    expect(c.body).toBe('Dodaj dane firmy raz.')
  })

  it('params sa podstawiane w tlumaczonej tresci', () => {
    const dict = { 'notifications.auto.profileCompanyData.title': 'Witaj {{name}}' }
    const tt = (key, opts = {}) => {
      const found = dict[key]
      if (found === undefined) return opts.defaultValue ?? key
      return found.replace(/\{\{(\w+)\}\}/g, (m, n) => (n in opts ? String(opts[n]) : m))
    }
    const c = notificationContent({ ...AUTO, params: { name: 'Jan' } }, tt)
    expect(c.title).toBe('Witaj Jan')
  })

  it('params z bazy nie moga nadpisac opcji i18next', () => {
    const c = notificationContent({ ...AUTO, params: { defaultValue: 'podmiana', ns: 'errors' } }, t)
    expect(c.title).toBe('Finish setting up your company')
  })

  it('brak powiadomienia -> puste pola zamiast wyjatku', () => {
    expect(notificationContent(null, t)).toEqual({ title: '', body: '', ctaLabel: null, ctaUrl: null })
  })

  it('powiadomienie automatyczne bez CTA nie dostaje etykiety przycisku', () => {
    const c = notificationContent({ ...AUTO, ctaLabel: null, ctaUrl: null }, t)
    expect(c.ctaLabel).toBeNull()
    expect(c.ctaUrl).toBeNull()
  })
})
