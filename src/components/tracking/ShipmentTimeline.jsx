import { useTranslation } from 'react-i18next'
import { EVENT_TYPES } from '../../data/trackingMock'
import { formatDocumentDate } from '../../utils/formatDate'

// Pionowa oś czasu zdarzeń — wspólna dla wszystkich gałęzi transportu (drogowej,
// morskiej, lotniczej, multimodalnej). Ostatnie zdarzenie z `planned: true`
// (jeszcze nie zaszło) renderuje się przygaszone, z przerywaną linią.

export default function ShipmentTimeline({ events }) {
  const { t, i18n } = useTranslation('pages')
  // Treść zdarzeń to dane makiety — angielskie wersje leżą obok polskich
  // w trackingMock.js (locationEn / descriptionEn).
  const isEn = i18n.language.startsWith('en')

  return (
    <div>
      {events.map((event, i) => {
        const isLast = i === events.length - 1
        const meta = EVENT_TYPES[event.type] || EVENT_TYPES.transit
        const Icon = meta.icon
        const isDelay = event.type === 'delay'

        return (
          <div key={i} className={`flex gap-4 ${event.planned ? 'opacity-60' : ''}`}>
            <div className="relative shrink-0 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center
                  ${isDelay
                    ? 'bg-red-50 dark:bg-red-900/30'
                    : 'bg-emerald-50 dark:bg-emerald-900/30'}`}
              >
                <Icon
                  className={`w-5 h-5 ${isDelay ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}
                  strokeWidth={1.5}
                />
              </div>
              {!isLast && (
                <span
                  className={`w-px flex-1 mt-1 mb-1 ${event.planned ? 'border-l border-dashed border-slate-300 dark:border-slate-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                  aria-hidden="true"
                />
              )}
            </div>
            <div className="flex-1 pb-6">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <span className="text-xs font-semibold text-gray-700 dark:text-slate-200">
                  {formatDocumentDate(event.date)}
                </span>
                <span className="text-xs text-gray-400 dark:text-slate-500">{event.time}</span>
                {event.planned && (
                  <span className="text-[10px] font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wide">
                    {t('tracking.planned')}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                {(isEn && event.locationEn) || event.location}
              </p>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                {(isEn && event.descriptionEn) || event.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
