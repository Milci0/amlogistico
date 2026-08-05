import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, PackageSearch, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { MOCK_SHIPMENTS } from '../../data/trackingMock'
import ShipmentCard from './ShipmentCard'
import RealShipmentCard from './RealShipmentCard'

const inputCls =
  'w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-colors'

const STATUS_FILTERS = ['all', 'planned', 'in_transit', 'in_destination_port', 'discharged', 'eta_passed', 'delivered']

// shipments = realne przesyłki (projekcja zestawów dokumentów, patrz
// utils/shipmentFromSet.js). Puste → pokazujemy MOCK_SHIPMENTS jako WYRAŹNIE
// oznaczone przykłady z zachętą do stworzenia pierwszego zestawu; jedna
// prawdziwa przesyłka wystarczy, żeby przykłady zniknęły na dobre.
export default function TrackingList({ shipments }) {
  const { t } = useTranslation('pages')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const hasReal = shipments.length > 0

  const filtered = useMemo(() => {
    if (!hasReal) return []
    const q = query.trim().toLowerCase()
    return shipments.filter((s) => {
      const haystack = [s.route.fromCity, s.route.toCity, s.cargoDescription, s.voyage.containerNo]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
      const matchesQuery = !q || haystack.includes(q)
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [hasReal, shipments, query, statusFilter])

  if (!hasReal) {
    return (
      <div>
        <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 mb-5">
          <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" strokeWidth={1.75} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">{t('tracking.emptyRealTitle')}</p>
            <p className="text-sm text-emerald-800 dark:text-emerald-300 mt-0.5">{t('tracking.emptyRealBody')}</p>
            <Link
              to="/wybor-sciezki"
              className="inline-block mt-3 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
            >
              {t('tracking.emptyRealCta')}
            </Link>
          </div>
        </div>

        <p className="text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wide mb-2.5">
          {t('tracking.exampleSectionTitle')}
        </p>
        <div className="flex flex-col gap-2.5">
          {MOCK_SHIPMENTS.map((s) => (
            <div key={s.id} className="relative">
              <span className="absolute -top-2 left-3 z-10 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-700 dark:bg-slate-600 text-white">
                {t('tracking.exampleBadge')}
              </span>
              <ShipmentCard shipment={s} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg mb-3">
        <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" strokeWidth={2} />
        <input
          type="text"
          className="bg-transparent text-sm outline-none flex-1 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
          placeholder={t('tracking.searchPlaceholder')}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_FILTERS.map((key) => {
          const active = statusFilter === key
          const label = key === 'all' ? t('tracking.allStatuses') : t(`tracking.realStatuses.${key}`)
          return (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors
                ${active
                  ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'}`}
            >
              {label}
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-16 px-4 border border-dashed border-gray-200 dark:border-slate-700 rounded-xl">
          <PackageSearch className="w-9 h-9 text-gray-300 dark:text-slate-600 mb-3" strokeWidth={1.5} />
          <p className="text-sm font-medium text-gray-600 dark:text-slate-300">{t('tracking.emptyTitle')}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 max-w-xs">
            {t('tracking.emptyFiltered')}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((s) => (
            <RealShipmentCard key={s.id} shipment={s} />
          ))}
        </div>
      )}
    </div>
  )
}
