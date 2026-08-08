import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Container as ContainerIcon, ChevronRight, Trash2, SearchX } from 'lucide-react'
import { formatRelativeTime } from '../../utils/formatDate'
import ContainerStatusBadge from './ContainerStatusBadge'

// Filtry statusu — WYŁĄCZNIE realne wartości ShipsGo Ocean (OCEAN_STATUSES
// w api/_lib/shipsgo.js, 8 wartości potwierdzonych w dokumentacji) plus flaga
// `archived`, która w UI nadpisuje status (patrz containerStatus.js). Zredukowane
// z 8+1 możliwych stanów do 5 przycisków (2026-08-08):
//   - NEW/INPROGRESS ("Pobieramy dane") pominięte jako cel filtra — stan
//     przejściowy, kontener nie powinien w nim długo zostawać
//   - BOOKED/LOADED/SAILING razem jako „W drodze" (przed dotarciem do portu)
//   - ARRIVED/DISCHARGED razem jako „W porcie docelowym" (dotarł, nieważne
//     czy już rozładowany) — CELOWO osobno od „W drodze", bo kontener w
//     porcie docelowym to nie to samo co w trasie
//   - `archived` sam w sobie jako „Rejs zakończony" (nadpisuje status)
//   - UNTRACKED jako „Bez śledzenia"
// Etykiety idą z JUŻ ISTNIEJĄCYCH kluczy (status.* per kontener,
// realStatuses.in_destination_port ze starej „Listy przesyłek" — jedyny
// ocalały klucz z tamtej sekcji, bo nazwa i znaczenie pasują 1:1) — żadnych
// nowych tłumaczeń poza stanem pustej listy po filtrze.
const STATUS_FILTERS = [
  { id: 'all', labelKey: 'tracking.allStatuses' },
  { id: 'in_transit', statuses: ['BOOKED', 'LOADED', 'SAILING'], labelKey: 'tracking.container.status.SAILING' },
  { id: 'at_destination', statuses: ['ARRIVED', 'DISCHARGED'], labelKey: 'tracking.realStatuses.in_destination_port' },
  { id: 'archived', labelKey: 'tracking.container.status.ARCHIVED' },
  { id: 'untracked', statuses: ['UNTRACKED'], labelKey: 'tracking.container.status.UNTRACKED' },
]

function matchesFilter(c, filterId) {
  if (filterId === 'all') return true
  if (filterId === 'archived') return !!c.archived
  // Archiwalny kontener pokazuje się WYŁĄCZNIE pod „Rejs zakończony" (i „Wszystkie") —
  // ostatni status sprzed archiwizacji nie powinien go dublować pod innym przyciskiem,
  // ten sam priorytet co already w resolveContainerStatus (containerStatus.js).
  if (c.archived) return false
  const filter = STATUS_FILTERS.find((f) => f.id === filterId)
  return !!filter?.statuses?.includes(c.status)
}

// Stan 1 (pusty) i stan 4 (lista) makiety.
//
// Sekcja nazywa się „Twoje kontenery", NIE „Historia wyszukiwań": to lista
// aktywnie śledzonych przesyłek, które aktualizują się same, a nie log wpisów.
//
// Stan pusty jest widoczny OD RAZU, przed pierwszym wyszukaniem. To jedyny
// moment, w którym można ustawić oczekiwania: że kontener zostanie na liście
// i że nie trzeba go wpisywać ponownie.
export default function ContainerList({ containers, loading, onOpen, onRemove }) {
  const { t, i18n } = useTranslation('pages')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(
    () => containers.filter((c) => matchesFilter(c, statusFilter)),
    [containers, statusFilter]
  )

  return (
    <section>
      <div className="flex items-baseline justify-between gap-3 mb-3">
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
          {t('tracking.container.listTitle')}
        </h2>
        {containers.length > 0 && (
          <span className="text-xs text-gray-500 dark:text-slate-400">
            {t('tracking.container.listCount', { count: containers.length })}
          </span>
        )}
      </div>

      {containers.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 dark:border-slate-600 p-6 text-center">
          <ContainerIcon className="w-6 h-6 mx-auto text-gray-300 dark:text-slate-600" strokeWidth={1.5} />
          <p className="text-sm font-medium text-gray-700 dark:text-slate-200 mt-3">
            {loading ? t('tracking.container.emptyLoading') : t('tracking.container.emptyTitle')}
          </p>
          {!loading && (
            <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 max-w-md mx-auto leading-relaxed">
              {t('tracking.container.emptyBody')}
            </p>
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {STATUS_FILTERS.map(({ id, labelKey }) => {
              const active = statusFilter === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setStatusFilter(id)}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors
                    ${active
                      ? 'border-orange-600 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'}`}
                >
                  {t(labelKey)}
                </button>
              )
            })}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
              <SearchX className="w-8 h-8 text-gray-300 dark:text-slate-600 mb-3" strokeWidth={1.5} />
              <p className="text-sm font-medium text-gray-600 dark:text-slate-300">
                {t('tracking.container.emptyFiltered')}
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-2">
              {filtered.map((c) => (
                <li key={c.containerNumber + (c.archived ? '-arch' : '')}>
                  {/* Przycisk otwarcia i przycisk usunięcia jako RODZEŃSTWO, nie
                      zagnieżdżenie <button> w <button> — usuwanie z listy nie
                      wymaga już wejścia w szczegóły kontenera. */}
                  <div className="flex items-stretch gap-1 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 transition-colors group focus-within:ring-2 focus-within:ring-orange-500">
                    <button
                      type="button"
                      onClick={() => onOpen(c)}
                      className="flex-1 min-w-0 text-left flex flex-wrap items-center gap-x-3 gap-y-2 p-4 rounded-xl focus:outline-none"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-mono tracking-wider font-semibold text-gray-900 dark:text-white">
                          {c.containerNumber}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                          {describeRoute(t, c)}
                        </p>
                      </div>
                      <ContainerStatusBadge status={c.status} archived={c.archived} fetchState={c.fetchState} />
                      <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                        {formatRelativeTime(c.updatedAt, i18n.language)}
                      </span>
                      <ChevronRight
                        className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400 shrink-0"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(c.containerNumber)}
                      aria-label={t('tracking.container.removeFromList')}
                      title={t('tracking.container.removeFromList')}
                      className="shrink-0 self-center mr-2 w-8 h-8 flex items-center justify-center rounded-lg border border-transparent text-red-600 dark:text-red-400 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <Trash2 className="w-4 h-4" strokeWidth={1.75} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  )
}

// Trasa plus przewoźnik, a gdy portów jeszcze nie ma, uczciwa informacja
// zamiast pustego miejsca.
function describeRoute(t, c) {
  const from = c.portOfLoading?.name
  const to = c.portOfDischarge?.name
  if (!from && !to) {
    return c.status === 'UNTRACKED'
      ? t('tracking.container.noCarrierData')
      : t('tracking.container.routeUnknown')
  }
  const route = `${from || '?'} → ${to || '?'}`
  return c.carrier?.name ? `${route} · ${c.carrier.name}` : route
}
