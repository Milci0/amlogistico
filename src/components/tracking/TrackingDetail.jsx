import { Link } from 'react-router-dom'
import { ArrowLeft, Map } from 'lucide-react'
import { BRANCHES, TRACKING_STATUSES } from '../../data/trackingMock'
import { formatDocumentDate } from '../../utils/formatDate'
import ShipmentTimeline from './ShipmentTimeline'
import CargoSummary from './CargoSummary'
import BranchDetails from './BranchDetails'

export default function TrackingDetail({ shipment }) {
  const branch = BRANCHES[shipment.branch]
  const status = TRACKING_STATUSES[shipment.status]
  const BranchIcon = branch.icon

  return (
    <div>
      <Link
        to="/tracking"
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
        Wróć do listy
      </Link>

      {/* Nagłówek */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-6">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
          <BranchIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">{shipment.id}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            {shipment.route.fromCity} ({shipment.route.fromCountry}) → {shipment.route.toCity} ({shipment.route.toCountry})
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${status.badgeClass}`}>
            {status.label}
          </span>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">
            ETA: <span className="font-medium text-gray-600 dark:text-slate-300">{formatDocumentDate(shipment.eta)}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-4">
              Oś czasu przesyłki
            </h3>
            <ShipmentTimeline events={shipment.events} />
          </div>

          <CargoSummary cargo={shipment.cargo} />
          <BranchDetails shipment={shipment} />
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-4 flex flex-col items-center justify-center gap-2 h-64 lg:h-80 border border-dashed border-gray-300 dark:border-slate-600 rounded-xl bg-gray-50 dark:bg-slate-900/50 text-center px-4">
            <Map className="w-8 h-8 text-gray-300 dark:text-slate-600" strokeWidth={1.5} />
            <p className="text-sm font-medium text-gray-500 dark:text-slate-400">Mapa trasy</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">Wkrótce — miejsce na integrację z mapą</p>
          </div>
        </div>
      </div>
    </div>
  )
}
