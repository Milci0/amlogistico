import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BRANCHES, TRACKING_STATUSES } from '../../data/trackingMock'
import { formatDocumentDate } from '../../utils/formatDate'

export default function ShipmentCard({ shipment }) {
  const { t } = useTranslation('pages')
  const branch = BRANCHES[shipment.branch]
  const status = TRACKING_STATUSES[shipment.status]
  const BranchIcon = branch.icon

  return (
    <Link
      to={`/tracking?shipmentId=${shipment.id}`}
      className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm p-4 hover:border-orange-300 dark:hover:border-orange-800 hover:shadow-md transition-all"
    >
      <div className="shrink-0 w-11 h-11 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center" title={t(`tracking.branches.${shipment.branch}`)}>
        <BranchIcon className="w-5 h-5 text-orange-700 dark:text-orange-400" strokeWidth={1.5} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{shipment.id}</p>
        <p className="text-xs text-gray-500 dark:text-slate-400 truncate mt-0.5">
          {shipment.route.fromCity} ({shipment.route.fromCountry}) → {shipment.route.toCity} ({shipment.route.toCountry})
        </p>
      </div>

      <div className="hidden sm:block text-right shrink-0">
        <p className="text-[11px] text-gray-400 dark:text-slate-500">ETA</p>
        <p className="text-xs font-medium text-gray-700 dark:text-slate-200">{formatDocumentDate(shipment.eta)}</p>
      </div>

      <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.badgeClass}`}>
        {t(`tracking.statuses.${shipment.status}`)}
      </span>

      <ChevronRight className="w-4 h-4 text-gray-300 dark:text-slate-600 shrink-0" />
    </Link>
  )
}
