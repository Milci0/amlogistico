import { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { formatDocumentDate } from '../../utils/formatDate'
import { COUNTRIES } from '../../data/mockData'
import { getStepLabel, getFlowLabel } from '../wizard/flowSteps'
import { getSet } from '../../services/documentSetsRepo'

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

function DocGroup({ title, docs, isDraft, docStatuses, onDownload }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 dark:text-slate-500 px-3 mb-1">{title}</p>
      <div className="space-y-1.5">
        {docs.map((doc) => {
          const status = docStatuses[doc.key]
          return (
            <div key={doc.key} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 dark:bg-slate-700/50">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-800 dark:text-slate-200 truncate">{doc.name}</p>
                {doc.desc && <p className="text-[11px] text-gray-400 dark:text-slate-500 truncate">{doc.desc}</p>}
              </div>
              {isDraft ? (
                <span className="shrink-0 text-[11px] text-gray-400 dark:text-slate-500">Niewygenerowany</span>
              ) : (
                <>
                  <DocRowStatus status={status} />
                  <button
                    onClick={() => onDownload(doc.key)}
                    disabled={status === 'loading'}
                    className="shrink-0 flex items-center gap-1.5 text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-60 px-2 py-1 rounded-md transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    {status === 'done' ? 'Pobierz ponownie' : 'Pobierz'}
                  </button>
                </>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Karta zestawu dokumentów (DocumentSet). Wspólna dla Historii (completed) i
// Wersji roboczych (draft). Bez przycisku „Duplikuj" — edycja gotowego zestawu
// tworzy nowy, niezależny wpis (patrz onEdit → tryb edit kreatora).
export default function DocumentCard({
  set,
  downloading,
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
  // Tylko gotowe zestawy z realnie wygenerowanym kompletem da się rozwinąć.
  // Wersje robocze NIE mają jeszcze wybranego/wygenerowanego kompletu (krok
  // „Dokumenty" nie był jeszcze odwiedzony) — pokazywanie projekcji na żywo
  // sugerowało, że to już finalna lista, więc strzałka rozwijania jest tu myląca.
  const canExpand = !isDraft && docCount > 0

  const [expanded, setExpanded] = useState(false)
  const [docStatuses, setDocStatuses] = useState({})
  // Pełny zestaw (z formData/engineResult) doładowywany leniwie przy pierwszym
  // rozwinięciu — lista zestawów nie niesie tych pól (oszczędność transferu).
  const [fullSet, setFullSet] = useState(null)
  const [detailsLoading, setDetailsLoading] = useState(false)
  const [detailsError, setDetailsError] = useState(false)

  // Pojedyncze dokumenty do rozwinięcia — CAŁA lista z engineResult (wymagane +
  // opcjonalne), nie tylko te realnie zaznaczone/pobrane przy generowaniu —
  // każdy z nich da się pobrać osobno (regenerowany z zapisanego formData).
  const allDocs = fullSet?.engineResult?.docs || []
  const requiredDocs = allDocs.filter((d) => d.required)
  const optionalDocs = allDocs.filter((d) => !d.required)

  async function toggleExpand() {
    const next = !expanded
    setExpanded(next)
    if (next && !fullSet && !detailsLoading) {
      setDetailsLoading(true)
      setDetailsError(false)
      try {
        const full = await getSet(set.id)
        setFullSet(full)
      } catch {
        setDetailsError(true)
      } finally {
        setDetailsLoading(false)
      }
    }
  }

  async function handleDocDownload(key) {
    // Przekazujemy pełny zestaw (dociągnięty przy rozwinięciu) — niesie
    // formData/engineResult potrzebne do regeneracji; lista ich nie ma.
    await onDownloadOne?.(fullSet || set, key, (k, st) => setDocStatuses((s) => ({ ...s, [k]: st })))
  }

  return (
    <div
      className={
        'bg-white dark:bg-slate-800 rounded-xl border shadow-sm p-4 ' +
        (isDraft ? 'border-l-4 border-l-amber-400 border-gray-100 dark:border-slate-700' : 'border-gray-100 dark:border-slate-700')
      }
    >
      <div className="flex items-center justify-between gap-4">
      {/* Cała lewa część (strzałka + badge + tytuł) jest klikalna — klik w okienko
          rozwija listę dokumentów. Przyciski akcji są w osobnym bloku po prawej. */}
      <div
        className={'flex items-center gap-3 min-w-0 ' + (canExpand ? 'cursor-pointer' : '')}
        onClick={canExpand ? toggleExpand : undefined}
        role={canExpand ? 'button' : undefined}
        tabIndex={canExpand ? 0 : undefined}
        aria-expanded={canExpand ? expanded : undefined}
        aria-label={canExpand ? (expanded ? 'Ukryj dokumenty' : 'Pokaż dokumenty') : undefined}
        onKeyDown={
          canExpand
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  toggleExpand()
                }
              }
            : undefined
        }
      >
        {canExpand && (
          <span
            aria-hidden="true"
            className="shrink-0 w-6 h-6 flex items-center justify-center text-gray-400 dark:text-slate-500"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? 'rotate-90' : ''}`} strokeWidth={2} />
          </span>
        )}
        <span className="text-xs font-bold px-2 py-1 rounded-md shrink-0 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
          {transportLabel}
        </span>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{title}</p>
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
              {flowLabel}
            </span>
          </div>

          {isDraft ? (
            <div className="mt-1">
              <p className="text-xs text-gray-400 dark:text-slate-500">
                {route} · Krok {set.lastStep} z {set.totalSteps}: {getStepLabel(set.flowType, set.lastStep)} · edytowano {dateLabel}
              </p>
              <div className="w-32 h-1 bg-gray-100 dark:bg-slate-700 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${(set.lastStep / set.totalSteps) * 100}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                {route} · {docCount} {docCount === 1 ? 'dokument' : 'dokumentów'} · {dateLabel}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <span
          className={
            'hidden sm:inline text-xs font-medium px-2 py-0.5 rounded-full ' +
            (isDraft ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300' : 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300')
          }
        >
          {isDraft ? 'Szkic' : 'Gotowy'}
        </span>

        {isDraft ? (
          <button
            onClick={() => onContinue?.(set)}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 px-2.5 py-1.5 rounded-lg transition-colors"
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
              className="flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 disabled:opacity-60 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {downloading ? 'Generuję…' : 'Pobierz wszystko'}
            </button>
            {!isBlank && (
              <button
                onClick={() => onEdit?.(set)}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 px-2.5 py-1.5 rounded-lg transition-colors"
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
          className="flex items-center gap-1.5 text-xs font-medium text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Usuń
        </button>
      </div>
      </div>

      {expanded && canExpand && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700 space-y-3">
          {detailsLoading ? (
            <p className="text-xs text-gray-400 dark:text-slate-500 px-3 py-2">Ładowanie…</p>
          ) : detailsError ? (
            <p className="text-xs text-red-600 px-3 py-2">Nie udało się wczytać dokumentów.</p>
          ) : (
            <>
              {requiredDocs.length > 0 && (
                <DocGroup
                  title="Wymagane"
                  docs={requiredDocs}
                  isDraft={isDraft}
                  docStatuses={docStatuses}
                  onDownload={handleDocDownload}
                />
              )}
              {optionalDocs.length > 0 && (
                <DocGroup
                  title="Opcjonalne"
                  docs={optionalDocs}
                  isDraft={isDraft}
                  docStatuses={docStatuses}
                  onDownload={handleDocDownload}
                />
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
