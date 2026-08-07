// ── Tekst powiadomienia: baza albo tłumaczenia, zależnie od źródła ─────────────
//
// Powiadomienia admina niosą prawdziwą treść wpisaną ręcznie w panelu i pokazujemy
// ją tak, jak przyszła. Powiadomienia automatyczne powstają na serwerze, który nie
// zna języka wybranego w przeglądarce, więc ich treść składamy tutaj, przy renderze:
// klucz i18n wynika z kategorii (`kind`), a wartości do wstawienia z `params`.
// Tekst zapisany w bazie jest wtedy WYŁĄCZNIE zapasem na wypadek braku klucza.
//
// Mechanizm jest ogólny: kolejna kategoria powiadomień automatycznych wymaga tylko
// dopisania wiersza do CONTENT_KEYS i kompletu kluczy w src/locales/{en,pl}/common.json.

export const KIND_ADMIN_MESSAGE = 'ADMIN_MESSAGE'
export const KIND_PROFILE_COMPANY_DATA = 'PROFILE_COMPANY_DATA'
export const KIND_CONTAINER_READY = 'CONTAINER_READY'

// kind → prefiks kluczy i18n (namespace `common`). Oczekiwane klucze pod prefiksem:
// `.title`, `.body`, `.cta`.
//
// `bodyKey` jest opcjonalne i wybiera wariant treści na podstawie `params`: część
// danych bywa nieznana (armator nie podał portów), a zdanie z pustym miejscem
// w środku wygląda jak usterka, nie jak brak danych.
const CONTENT_KEYS = {
  [KIND_PROFILE_COMPANY_DATA]: { prefix: 'notifications.auto.profileCompanyData' },
  [KIND_CONTAINER_READY]: {
    prefix: 'notifications.auto.containerReady',
    bodyKey: (p) => (p?.carrier && p?.portOfLoading && p?.portOfDischarge ? 'body' : 'bodyNoRoute'),
  },
}

// notificationContent(notification, t) -> { title, body, ctaLabel, ctaUrl }
//   `t` z react-i18next; namespace podajemy jawnie, żeby funkcja działała także
//   z `t` związanym z innym namespace'em.
export function notificationContent(n, t) {
  if (!n) return { title: '', body: '', ctaLabel: null, ctaUrl: null }

  // Powiadomienia admina i wszystko, czego nie umiemy przetłumaczyć, idzie z bazy.
  const entry = CONTENT_KEYS[n.kind]
  if (!entry) {
    return { title: n.title, body: n.body, ctaLabel: n.ctaLabel, ctaUrl: n.ctaUrl }
  }

  // `params` przed `ns`/`defaultValue`, żeby dane z bazy nie mogły nadpisać opcji i18next.
  const tr = (key, fallback) =>
    t(`${entry.prefix}.${key}`, { ...(n.params || {}), ns: 'common', defaultValue: fallback ?? '' })

  return {
    title: tr('title', n.title),
    body: tr(entry.bodyKey ? entry.bodyKey(n.params) : 'body', n.body),
    ctaLabel: n.ctaLabel ? tr('cta', n.ctaLabel) : null,
    ctaUrl: n.ctaUrl,
  }
}
