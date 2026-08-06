import { useTranslation } from 'react-i18next'
import { Package, Ship, MapPin } from 'lucide-react'
import { formatDocumentDate } from '../../utils/formatDate'
import { SHIPSGO_EVENT_ICONS, SHIPSGO_EVENT_FALLBACK_ICON } from '../../data/shipsgoEvents'

// Oś czasu — DWA tryby:
//  - podstawowy: 3 punkty z dat wpisanych ręcznie (loadDate/eta) + potwierdzenie
//    dostawy. Punkty bez daty pokazują się jako nieuzupełnione, NIE znikają.
//  - wzbogacony (movements z ShipsGo): pełna lista zdarzeń z osi kontenera —
//    ROZSZERZENIE trybu podstawowego, nie zastąpienie: nasze 3 punkty to
//    podzbiór tego, co niosą movements (LOAD ⊇ załadunek, DISC/ARRV ⊇ ETA,
//    EMRT ⊇ dostawa), więc gdy movements są dostępne, pokazujemy JE (bogatsze),
//    a potwierdzenie ręczne dostawy zostaje doklejone na końcu niezależnie —
//    user zawsze może wiedzieć więcej niż ShipsGo.
function TimelineRow({ Icon, filled, title, subtitle, isLast }) {
  return (
    <div className={`flex gap-4 ${filled ? '' : 'opacity-50'}`}>
      <div className="relative shrink-0 flex flex-col items-center">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center
            ${filled ? 'bg-orange-50 dark:bg-orange-900/30' : 'bg-gray-100 dark:bg-slate-700'}`}
        >
          <Icon
            className={`w-5 h-5 ${filled ? 'text-orange-700 dark:text-orange-400' : 'text-gray-400 dark:text-slate-500'}`}
            strokeWidth={1.5}
          />
        </div>
        {!isLast && (
          <span
            className={`w-px flex-1 mt-1 mb-1 ${filled ? 'bg-slate-200 dark:bg-slate-700' : 'border-l border-dashed border-slate-300 dark:border-slate-600'}`}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="flex-1 pb-6">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

export default function ShipmentDateline({ dates, delivered, movements }) {
  const { t } = useTranslation('pages')
  const hasMovements = Array.isArray(movements) && movements.length > 0

  const deliveredRow = (
    <TimelineRow
      key="delivered"
      Icon={MapPin}
      filled={delivered}
      isLast
      title={t('tracking.dateline.delivered')}
      subtitle={t(delivered ? 'tracking.dateline.confirmedByUser' : 'tracking.dateline.notYet')}
    />
  )

  if (hasMovements) {
    return (
      <div>
        {movements.map((mv, i) => {
          const Icon = SHIPSGO_EVENT_ICONS[mv.event] || SHIPSGO_EVENT_FALLBACK_ICON
          const filled = mv.status === 'ACT'
          const locationLabel = mv.location
            ? [mv.location.name, mv.location.country].filter(Boolean).join(', ')
            : ''
          const extra = [mv.vessel, mv.voyage].filter(Boolean).join(' · ')
          return (
            <TimelineRow
              key={`${mv.event}-${mv.timestamp || i}`}
              Icon={Icon}
              filled={filled}
              isLast={false}
              title={t(`tracking.shipsgoEvents.${mv.event}`, { defaultValue: mv.event })}
              subtitle={
                <>
                  {mv.timestamp ? formatDocumentDate(mv.timestamp, true) : t('tracking.dateline.notProvided')}
                  {locationLabel && ` · ${locationLabel}`}
                  {extra && ` · ${extra}`}
                </>
              }
            />
          )
        })}
        {deliveredRow}
      </div>
    )
  }

  return (
    <div>
      <TimelineRow
        Icon={Package}
        filled={!!dates.loadDate}
        title={t('tracking.dateline.loadDate')}
        subtitle={dates.loadDate ? formatDocumentDate(dates.loadDate) : t('tracking.dateline.notProvided')}
      />
      <TimelineRow
        Icon={Ship}
        filled={!!dates.eta}
        title={t('tracking.dateline.eta')}
        subtitle={dates.eta ? formatDocumentDate(dates.eta) : t('tracking.dateline.notProvided')}
      />
      {deliveredRow}
    </div>
  )
}
