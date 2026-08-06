import { useTranslation } from 'react-i18next'
import { Container as ContainerIcon, ChevronRight } from 'lucide-react'
import { formatRelativeTime } from '../../utils/formatDate'
import ContainerStatusBadge from './ContainerStatusBadge'

// Stan 1 (pusty) i stan 4 (lista) makiety.
//
// Sekcja nazywa się „Twoje kontenery", NIE „Historia wyszukiwań": to lista
// aktywnie śledzonych przesyłek, które aktualizują się same, a nie log wpisów.
//
// Stan pusty jest widoczny OD RAZU, przed pierwszym wyszukaniem. To jedyny
// moment, w którym można ustawić oczekiwania: że kontener zostanie na liście
// i że nie trzeba go wpisywać ponownie.
export default function ContainerList({ containers, loading, onOpen }) {
  const { t, i18n } = useTranslation('pages')

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
        <ul className="flex flex-col gap-2">
          {containers.map((c) => (
            <li key={c.containerNumber + (c.archived ? '-arch' : '')}>
              <button
                type="button"
                onClick={() => onOpen(c)}
                className="w-full text-left flex flex-wrap items-center gap-x-3 gap-y-2 p-4 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 transition-colors group focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-mono tracking-wider font-semibold text-gray-900 dark:text-white">
                    {c.containerNumber}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 truncate">
                    {describeRoute(t, c)}
                  </p>
                </div>
                <ContainerStatusBadge status={c.status} archived={c.archived} />
                <span className="text-xs text-gray-400 dark:text-slate-500 whitespace-nowrap">
                  {formatRelativeTime(c.updatedAt, i18n.language)}
                </span>
                <ChevronRight
                  className="w-4 h-4 text-gray-300 dark:text-slate-600 group-hover:text-gray-500 dark:group-hover:text-slate-400 shrink-0"
                  strokeWidth={2}
                  aria-hidden="true"
                />
              </button>
            </li>
          ))}
        </ul>
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
