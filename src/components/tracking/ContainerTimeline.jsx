import { useTranslation } from 'react-i18next'
import { formatDocumentDate } from '../../utils/formatDate'
import { isDateChanged } from '../../utils/voyageProgress'
import { SHIPSGO_EVENT_ICONS, SHIPSGO_EVENT_FALLBACK_ICON } from '../../data/shipsgoEvents'

// Oś czasu zdarzeń ze stanu 5, chronologicznie.
//
// Dwie rzeczy, które muszą tu być widoczne, bo od nich zależą decyzje spedytora:
//   1. Zdarzenia ze `status: "EST"` są SZACOWANE. Dostają etykietę i przygaszony
//      kolor, żeby nikt nie planował odbioru na podstawie prognozy myśląc, że to
//      fakt dokonany.
//   2. Zmiana daty rozładunku względem pierwotnej. Opóźnienie to najważniejsza
//      informacja dla spedytora, więc pokazujemy je przy zdarzeniu, a nie chowamy.
//
// Nieznany kod zdarzenia POKAZUJEMY jako surowy (defaultValue), nie ukrywamy —
// lista kodów ShipsGo nie jest opublikowana w całości, a brakujące zdarzenie
// w historii jest gorsze niż zdarzenie z nieładną nazwą.
export default function ContainerTimeline({ movements, dischargeDate, dischargeDateInitial }) {
  const { t } = useTranslation('pages')

  if (!movements || movements.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-slate-400">
        {t('tracking.container.shipsgo.noMovements')}
      </p>
    )
  }

  const dischargeDelayed = isDateChanged(dischargeDate, dischargeDateInitial)

  return (
    <ol className="flex flex-col">
      {movements.map((mv, i) => {
        const Icon = SHIPSGO_EVENT_ICONS[mv.event] || SHIPSGO_EVENT_FALLBACK_ICON
        const estimated = mv.status === 'EST'
        const isLast = i === movements.length - 1
        const location = mv.location
          ? [mv.location.name, mv.location.country].filter(Boolean).join(', ')
          : ''
        const vessel = [mv.vessel, mv.voyage].filter(Boolean).join(' · ')
        // Informację o dacie pierwotnej dokładamy do zdarzenia rozładunku
        // i przypłynięcia, bo to ich dotyczy przesunięcie terminu.
        const showOriginalDate = dischargeDelayed && (mv.event === 'DISC' || mv.event === 'ARRV')

        return (
          <li key={`${mv.event}-${mv.timestamp || i}`} className={`flex gap-4 ${estimated ? 'opacity-60' : ''}`}>
            <div className="relative shrink-0 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center
                  ${estimated ? 'bg-gray-100 dark:bg-slate-700' : 'bg-orange-50 dark:bg-orange-900/30'}`}
              >
                <Icon
                  className={`w-4 h-4 ${estimated ? 'text-gray-400 dark:text-slate-500' : 'text-orange-700 dark:text-orange-400'}`}
                  strokeWidth={1.5}
                />
              </div>
              {!isLast && (
                <span
                  className={`w-px flex-1 mt-1 mb-1 ${estimated ? 'border-l border-dashed border-slate-300 dark:border-slate-600' : 'bg-orange-300 dark:bg-orange-900'}`}
                  aria-hidden="true"
                />
              )}
            </div>

            <div className="flex-1 pb-5 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white flex flex-wrap items-center gap-2">
                {t(`tracking.shipsgoEvents.${mv.event}`, { defaultValue: mv.event })}
                {estimated && (
                  <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
                    {t('tracking.container.estimated')}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                {mv.timestamp ? formatDocumentDate(mv.timestamp, true) : t('tracking.dateline.notProvided')}
                {location && ` · ${location}`}
                {vessel && ` · ${vessel}`}
              </p>
              {showOriginalDate && (
                <p className="text-xs text-orange-700 dark:text-orange-400 mt-0.5">
                  {t('tracking.container.originalDate', { date: formatDocumentDate(dischargeDateInitial) })}
                </p>
              )}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
