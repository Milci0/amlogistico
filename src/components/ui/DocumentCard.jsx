const TYPE_COLORS = {
  CMR: 'bg-blue-100 text-blue-700',
  'Packing List': 'bg-emerald-100 text-emerald-700',
  Faktura: 'bg-amber-100 text-amber-700',
  'Sea Waybill': 'bg-purple-100 text-purple-700',
}

const STATUS_COLORS = {
  Gotowy: 'bg-green-100 text-green-700',
  Szkic: 'bg-gray-100 text-gray-600',
  'W trakcie': 'bg-amber-100 text-amber-700',
}

export default function DocumentCard({ type, number, date, status, route, onDownload }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`text-xs font-bold px-2 py-1 rounded-md shrink-0 ${TYPE_COLORS[type] || 'bg-gray-100 text-gray-600'}`}>
          {type}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{number}</p>
          <p className="text-xs text-gray-400 mt-0.5">{route} · {date}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span className={`hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[status] || 'bg-gray-100 text-gray-600'}`}>
          {status}
        </span>
        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Pobierz
        </button>
      </div>
    </div>
  )
}
