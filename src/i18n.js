import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Namespace'y odpowiadają realnym obszarom aplikacji (nie ma landingu ani stron
// prawnych, więc nie ma dla nich plików).
import enCommon from './locales/en/common.json'
import enWizard from './locales/en/wizard.json'
import enPages from './locales/en/pages.json'
import enCargo from './locales/en/cargo.json'
import enCountries from './locales/en/countries.json'
import enIncoterms from './locales/en/incoterms.json'
import enErrors from './locales/en/errors.json'

import plCommon from './locales/pl/common.json'
import plWizard from './locales/pl/wizard.json'
import plPages from './locales/pl/pages.json'
import plCargo from './locales/pl/cargo.json'
import plCountries from './locales/pl/countries.json'
import plIncoterms from './locales/pl/incoterms.json'
import plErrors from './locales/pl/errors.json'

export const LANG_STORAGE_KEY = 'amlogistico:v1:lang'
export const SUPPORTED_LANGUAGES = ['en', 'pl']

const resources = {
  en: {
    common: enCommon,
    wizard: enWizard,
    pages: enPages,
    cargo: enCargo,
    countries: enCountries,
    incoterms: enIncoterms,
    errors: enErrors,
  },
  pl: {
    common: plCommon,
    wizard: plWizard,
    pages: plPages,
    cargo: plCargo,
    countries: plCountries,
    incoterms: plIncoterms,
    errors: plErrors,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: SUPPORTED_LANGUAGES,
    defaultNS: 'common',
    ns: ['common', 'wizard', 'pages', 'cargo', 'countries', 'incoterms', 'errors'],
    detection: {
      // 'navigator' celowo POMINIĘTE: użytkownik z polską przeglądarką ma zobaczyć
      // wersję angielską, dopóki sam nie wybierze polskiej. Decyzja produktowa.
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: LANG_STORAGE_KEY,
    },
    interpolation: { escapeValue: false },
    returnNull: false,
  })

// Atrybut lang na <html> musi nadążać za wyborem języka (czytniki ekranu,
// dzielenie wyrazów, indeksowanie).
function syncHtmlLang(lng) {
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', lng)
  }
}
syncHtmlLang(i18n.resolvedLanguage || 'en')
i18n.on('languageChanged', syncHtmlLang)

export default i18n
