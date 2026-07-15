import { useState } from 'react'
import { formatDocumentDate } from '../../utils/formatDate'
import { COUNTRIES } from '../../data/mockData'
import { getStepLabel, getFlowLabel } from '../wizard/flowSteps'

const TRANSPORT_LABEL = { road: 'Drogowy', sea: 'Morski' }

function countryName(code) {
  return COUNTRIES.find((c) => c.code === code)?.name || code || '—'
}

function DocRowStatus({ status }) {
  if (status === 'loading') {
    return (
      <svg className="w-3.5 h-3.5 animate-spin text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    )
  }
  if (status === 'error') {
    return <span className="text-[11px] font-medium text-red-600 shrink-0">Błąd</span>
  }
  return null
}

// Karta zestawu dokumentów (DocumentSet). Wspólna dla Historii (completed) i
// Wersji roboczych (draft). Bez przycisku „Duplikuj" — edycja gotowego zestawu
// tworzy nowy, niezależny wpis (patrz onEdit → tryb edit kreatora).
export default function DocumentCard({
  set,
  downloading,
  derivedFromDate,
  onDownload,
  onDownloadOne,
  onEdit,
  onContinue,
  onRemove,
}) {
  const isDraft = set.status === 'draft'
  const isBlank = set.kind === 'blank'
  const meta = set.meta || {}
  const title = meta.cargoDescription?.trim() || 'Zestaw dokumentów'
  const route = `${countryName(meta.routeFrom)} → ${countryName(meta.routeTo)}`
  const transportLabel = TRANSPORT_LABEL[meta.transportMode] || meta.transportMode || '—'
  const flowLabel = getFlowLabel(set.flowType)
  const dateLabel = formatDocumentDate(isDraft ? set.updatedAt : set.createdAt)
  const docCount = set.selectedDocs?.length || 0

  // Pojedyncze dokumenty do rozwinięcia — tylko dla gotowych zestawów, w kolejności
  // z selectedDocs (dane opisowe z engineResult zapisanego przy generowaniu).
  const docsDetails = !isDraft
    ? (set.selectedDocs || [])
        .map((key) => set.engineResult?.docs?.find((d) => d.key === key))
        .filter(Boolean)
    : []
  const canExpand = docsDetails.length > 0

  const [expanded, setExpanded] = useState(false)
  const [docStatuses, setDocStatuses] = useState({})

  async function handleDocDownload(key) {
    await onDownloadOne?.(set, key, (k, st) => setDocStatuses((s) => ({ ...s, [k]: st })))
  }

  return (
    <div
      className={
        'bg-white rounded-xl border shadow-sm p-4 ' +
        (isDraft ? 'border-l-4 border-l-amber-400 border-gray-100' : 'border-gray-100')
      }
    >
      <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 min-w-0">
        {canExpand && (
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            aria-label={expanded ? 'Zwiń listę dokumentów' : 'Rozwiń listę dokumentów'}
            className="shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-md transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        <span className="text-xs font-bold px-2 py-1 rounded-md shrink-0 bg-blue-100 text-blue-700">
          {transportLabel}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
              {flowLabel}
            </span>
          </div>

          {isDraft ? (
            <div className="mt-1">
              <p className="text-xs text-gray-400">
                {route} · Krok {set.lastStep} z {set.totalSteps}: {getStepLabel(set.flowType, set.lastStep)} · edytowano {dateLabel}
              </p>
              <div className="w-32 h-1 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${(set.lastStep / set.totalSteps) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 mt-0.5">
                {route} · {docCount} {docCount === 1 ? 'dokument' : 'dokumentów'} · {dateLabel}
              </p>
              {set.derivedFromId && (
                <p className="text-[11px] text-slate-400 mt-0.5 italic">
                  na podstawie zestawu{derivedFromDate ? ` z ${derivedFromDate}` : ''}
                </p>
              )}
            </>
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
            onClick={() => onContinue?.(set)}
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
              onClick={() => onDownload?.(set)}
              disabled={downloading}
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 disabled:opacity-60 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {downloading ? 'Generuję…' : 'Pobierz wszystko'}
            </button>
            {!isBlank && (
              <button
                onClick={() => onEdit?.(set)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edytuj
              </button>
            )}
          </>
        )}
        <button
          onClick={() => onRemove?.(set)}
          className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Usuń
        </button>
      </div>
      </div>

      {expanded && canExpand && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
          {docsDetails.map((doc) => {
            const status = docStatuses[doc.key]
            return (
              <div key={doc.key} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-800 truncate">{doc.name}</p>
                  {doc.desc && <p className="text-[11px] text-gray-400 truncate">{doc.desc}</p>}
                </div>
                <DocRowStatus status={status} />
                <button
                  onClick={() => handleDocDownload(doc.key)}
                  disabled={status === 'loading'}
                  className="shrink-0 flex items-center gap-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-100 disabled:opacity-60 px-2 py-1 rounded-md transition-colors"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  {status === 'done' ? 'Pobierz ponownie' : 'Pobierz'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
