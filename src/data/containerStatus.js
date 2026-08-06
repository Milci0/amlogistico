// Mapowanie statusów rejsu ShipsGo na etykiety i kolory w interfejsie.
//
// Dane trzymają identyfikator, tekst idzie z tłumaczeń — ten sam wzorzec co
// MENU_GROUPS czy FLOWS. `labelKey` wskazuje klucz w namespace `pages`.
//
// Rekord ARCHIWALNY (zakończony rejs) dostaje etykietę „Rejs zakończony"
// w kolorze wygaszonym NIEZALEŻNIE od ostatniego statusu — patrz
// resolveContainerStatus() na dole.

export const CONTAINER_STATUS_STYLES = {
  // Kolor ostrzegawczy plus pulsująca kropka: czekamy na dane od przewoźnika.
  NEW: {
    labelKey: 'tracking.container.status.INPROGRESS',
    badge: 'bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-900',
    dot: 'bg-orange-500',
    pulse: true,
  },
  INPROGRESS: {
    labelKey: 'tracking.container.status.INPROGRESS',
    badge: 'bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-900',
    dot: 'bg-orange-500',
    pulse: true,
  },
  BOOKED: {
    labelKey: 'tracking.container.status.BOOKED',
    badge: 'bg-gray-50 dark:bg-slate-700/50 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-600',
    dot: 'bg-gray-400',
    pulse: false,
  },
  LOADED: {
    labelKey: 'tracking.container.status.LOADED',
    badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    dot: 'bg-blue-500',
    pulse: false,
  },
  SAILING: {
    labelKey: 'tracking.container.status.SAILING',
    badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    dot: 'bg-blue-500',
    pulse: false,
  },
  ARRIVED: {
    labelKey: 'tracking.container.status.ARRIVED',
    badge: 'bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-900',
    dot: 'bg-blue-500',
    pulse: false,
  },
  DISCHARGED: {
    labelKey: 'tracking.container.status.DISCHARGED',
    badge: 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-900',
    dot: 'bg-green-500',
    pulse: false,
  },
  UNTRACKED: {
    labelKey: 'tracking.container.status.UNTRACKED',
    badge: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-600',
    dot: 'bg-gray-400',
    pulse: false,
  },
}

const ARCHIVED_STYLE = {
  labelKey: 'tracking.container.status.ARCHIVED',
  badge: 'bg-gray-50 dark:bg-slate-800 text-gray-400 dark:text-slate-500 border-gray-200 dark:border-slate-700',
  dot: 'bg-gray-300 dark:bg-slate-600',
  pulse: false,
}

// Utworzenie w ShipsGo zakończyło się niejednoznacznie (np. status 500/503 po
// wysłaniu POST-a, albo sukces bez możliwego do odczytania id) — rekord
// ZOSTAJE w bazie (backend celowo go nie kasuje, żeby retry nie wysłał
// drugiego, płatnego POST-a na ten sam numer), ale nigdy nie dostał realnego
// statusu z ShipsGo, więc `status` zostaje na wartości domyślnej ('NEW').
// Bez tego wpisu taki rekord wyglądałby jak zwykłe "Pobieramy dane" na zawsze.
const CREATE_FAILED_STYLE = {
  labelKey: 'tracking.container.status.CREATE_FAILED',
  badge: 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900',
  dot: 'bg-red-500',
  pulse: false,
}

const FALLBACK_STYLE = CONTAINER_STATUS_STYLES.UNTRACKED

// Rejs zakończony ma własną etykietę i kolor wygaszony, żeby nikt nie wziął
// archiwalnego „W drodze" za bieżący transport.
export function resolveContainerStatus({ status, archived, fetchState }) {
  if (archived) return ARCHIVED_STYLE
  if (fetchState === 'failed' && isPendingStatus(status)) return CREATE_FAILED_STYLE
  return CONTAINER_STATUS_STYLES[status] || FALLBACK_STYLE
}

// Czy dla tego rekordu warto jeszcze odpytywać nasz endpoint (stan przejściowy).
export function isPendingStatus(status) {
  return status === 'NEW' || status === 'INPROGRESS'
}
