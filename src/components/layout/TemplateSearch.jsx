import { useEffect, useMemo, useRef, useState } from 'react'
import { generatePdf } from '../../generators/generatePdf'
import { searchTemplates, GROUP_LABELS } from '../../data/templateCatalog'

export default function TemplateSearch() {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [downloadingKey, setDownloadingKey] = useState(null)
  const boxRef = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const results = useMemo(() => searchTemplates(query), [query])

  async function handleDownload(doc) {
    setDownloadingKey(doc.key)
    try {
      await generatePdf(doc.template, {}, doc.filename)
    } catch (err) {
      console.error('Błąd generowania pustego PDF:', err)
    } finally {
      setDownloadingKey(null)
    }
  }

  return (
    <div className="relative w-full max-w-lg" ref={boxRef}>
      <div className="relative">
        <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10.5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          placeholder="Szukaj szablonu… (np. china, import, UE)"
          className="w-full pl-9 pr-3 py-2 text-sm rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 mt-2 max-h-80 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50">
          <div className="sticky top-0 px-3 py-1.5 text-[11px] text-slate-400 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
            {query.trim() ? `Wyniki (${results.length})` : `Wszystkie szablony (${results.length})`}
          </div>
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-slate-400">Brak dopasowań.</div>
          ) : (
            results.map(doc => (
              <div key={doc.key} className="flex items-center justify-between gap-2 px-3 py-2 border-b last:border-b-0 border-slate-100 dark:border-slate-700">
                <div className="min-w-0">
                  <p className="text-sm text-slate-900 dark:text-slate-100 truncate">{doc.name}</p>
                  <p className="text-xs text-slate-400">{GROUP_LABELS[doc.grupa]}</p>
                </div>
                <button
                  onClick={() => handleDownload(doc)}
                  disabled={downloadingKey === doc.key}
                  className="shrink-0 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  {downloadingKey === doc.key ? 'Generuję…' : 'Pobierz PDF'}
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
