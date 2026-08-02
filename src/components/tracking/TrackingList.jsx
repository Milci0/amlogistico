import { useMemo, useState } from 'react'
import { Search, PackageSearch } from 'lucide-react'
import { MOCK_SHIPMENTS, TRACKING_STATUSES } from '../../data/trackingMock'
import ShipmentCard from './ShipmentCard'

const inputCls =
  'w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-colors'

const STATUS_FILTERS = ['all', ...Object.keys(TRACKING_STATUSES)]

export default function TrackingList() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return MOCK_SHIPMENTS.filter((s) => {
      const matchesQuery = !q || s.id.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || s.status === statusFilter
      return matchesQuery && matchesStatus
    })
  }, [query, statusFilter])

  return (
    <div>
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg mb-3">
        <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" strokeWidth={2} />
        <input
          type="text"
          className="bg-transparent text-sm outline-none flex-1 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
          placeholder="Szukaj po numerze przesyłki (np. SHP-2026-1042)..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {STATUS_FILTERS.map((key) => {
          const active = statusFilter === key
          const label = key === 'all' ? 'Wszystkie' : TRACKING_STATUSES[key].label
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
          <p className="text-sm font-medium text-gray-600 dark:text-slate-300">Brak przesyłek</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 max-w-xs">
            {query.trim() || statusFilter !== 'all'
              ? 'Żadna przesyłka nie pasuje do wyszukiwania lub wybranego filtra.'
              : 'Nie znaleziono żadnych przesyłek do wyświetlenia.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {filtered.map((s) => (
            <ShipmentCard key={s.id} shipment={s} />
          ))}
        </div>
      )}
    </div>
  )
}
