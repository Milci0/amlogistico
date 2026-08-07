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

// kind → prefiks kluczy i18n (namespace `common`). Oczekiwane klucze pod prefiksem:
// `.title`, `.body`, `.cta`.
const CONTENT_KEYS = {
  [KIND_PROFILE_COMPANY_DATA]: 'notifications.auto.profileCompanyData',
}

// notificationContent(notification, t) -> { title, body, ctaLabel, ctaUrl }
//   `t` z react-i18next; namespace podajemy jawnie, żeby funkcja działała także
//   z `t` związanym z innym namespace'em.
export function notificationContent(n, t) {
  if (!n) return { title: '', body: '', ctaLabel: null, ctaUrl: null }

  // Powiadomienia admina i wszystko, czego nie umiemy przetłumaczyć, idzie z bazy.
  const prefix = CONTENT_KEYS[n.kind]
  if (!prefix) {
    return { title: n.title, body: n.body, ctaLabel: n.ctaLabel, ctaUrl: n.ctaUrl }
  }

  // `params` przed `ns`/`defaultValue`, żeby dane z bazy nie mogły nadpisać opcji i18next.
  const tr = (key, fallback) =>
    t(`${prefix}.${key}`, { ...(n.params || {}), ns: 'common', defaultValue: fallback ?? '' })

  return {
    title: tr('title', n.title),
    body: tr('body', n.body),
    ctaLabel: n.ctaLabel ? tr('cta', n.ctaLabel) : null,
    ctaUrl: n.ctaUrl,
  }
}
