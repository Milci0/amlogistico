import { formatDocumentDate } from '../../utils/formatDate'

const TYPE_COLORS = {
  CMR: 'bg-blue-100 text-blue-700',
  'Packing List': 'bg-emerald-100 text-emerald-700',
  Faktura: 'bg-amber-100 text-amber-700',
  'Sea Waybill': 'bg-purple-100 text-purple-700',
}

export default function DocumentCard({ doc, downloading, onDownload, onContinue, onDuplicate, onRemove }) {
  const isDraft = doc.status === 'draft'
  const typeColor = TYPE_COLORS[doc.type] || 'bg-gray-100 text-gray-600'
  const route = `${doc.routeFrom} → ${doc.routeTo}`
  const dateLabel = formatDocumentDate(isDraft ? doc.updatedAt : doc.createdAt)

  return (
    <div
      className={
        'bg-white rounded-xl border shadow-sm p-4 flex items-center justify-between gap-4 ' +
        (isDraft ? 'border-l-4 border-l-amber-400 border-gray-100' : 'border-gray-100')
      }
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className={`text-xs font-bold px-2 py-1 rounded-md shrink-0 ${typeColor}`}>
          {doc.type}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{doc.type}</p>
          {isDraft ? (
            <div className="mt-1">
              <p className="text-xs text-gray-400">
                {route} · Krok {doc.currentStep} z 4: {doc.stepLabel} · edytowano {dateLabel}
              </p>
              <div className="w-32 h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${(doc.currentStep / 4) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-400 mt-0.5">{route} · {dateLabel}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span
          className={
            'hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full ' +
            (isDraft ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700')
          }
        >
          {isDraft ? 'Szkic' : 'Gotowy'}
        </span>

        {isDraft ? (
          <button
            onClick={() => onContinue?.(doc)}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-2.5 py-1.5 rounded-lg transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
            Kontynuuj
          </button>
        ) : (
          <>
            <button
              onClick={() => onDownload?.(doc)}
              disabled={downloading}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 disabled:opacity-60 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {downloading ? 'Generuję…' : 'Pobierz'}
            </button>
            <button
              onClick={() => onDuplicate?.(doc)}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Ponownie
            </button>
          </>
        )}
        <button
          onClick={() => onRemove?.(doc)}
          className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Usuń
        </button>
      </div>
    </div>
  )
}
