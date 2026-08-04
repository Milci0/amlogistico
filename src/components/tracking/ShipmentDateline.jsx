import { useTranslation } from 'react-i18next'
import { Package, Ship, MapPin } from 'lucide-react'
import { formatDocumentDate } from '../../utils/formatDate'

// Oś czasu zbudowana WYŁĄCZNIE z dat, które faktycznie mamy (loadDate, eta) —
// punkty bez daty pokazują się jako nieuzupełnione, NIE znikają z osi.
const POINTS = [
  { key: 'loadDate', icon: Package },
  { key: 'eta', icon: Ship },
  { key: 'delivered', icon: MapPin },
]

export default function ShipmentDateline({ dates, delivered }) {
  const { t } = useTranslation('pages')

  return (
    <div>
      {POINTS.map(({ key, icon: Icon }, i) => {
        const isLast = i === POINTS.length - 1
        const value = key === 'delivered' ? null : dates[key]
        const filled = key === 'delivered' ? delivered : !!value

        return (
          <div key={key} className={`flex gap-4 ${filled ? '' : 'opacity-50'}`}>
            <div className="relative shrink-0 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center
                  ${filled ? 'bg-emerald-50 dark:bg-emerald-900/30' : 'bg-gray-100 dark:bg-slate-700'}`}
              >
                <Icon
                  className={`w-5 h-5 ${filled ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}
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
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {t(`tracking.dateline.${key}`)}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                {key === 'delivered'
                  ? t(delivered ? 'tracking.dateline.confirmedByUser' : 'tracking.dateline.notYet')
                  : value ? formatDocumentDate(value) : t('tracking.dateline.notProvided')}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
