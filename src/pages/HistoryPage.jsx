import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import DocumentCard from '../components/ui/DocumentCard'
import useDocuments from '../hooks/useDocuments'
import { generatePdf } from '../generators/generatePdf'
import { TEMPLATE_CATALOG } from '../data/templateCatalog'

// Dokumenty w historii mają na razie tylko typ+trasę (brak pełnych danych formularza),
// więc "Pobierz" podpinamy pod istniejący mechanizm pustych szablonów zamiast wypełnionego PDF-u.
const TYPE_TO_TEMPLATE_KEY = {
  CMR: 'cmr',
  'Packing List': 'packing',
  Faktura: 'faktura',
  'Sea Waybill': 'seawaybill',
}

const TABS = [
  { key: 'completed', label: 'Gotowe dokumenty' },
  { key: 'draft', label: 'Wersje robocze' },
]

const SORT_OPTIONS = {
  completed: [
    { key: 'newest', label: 'Najnowsze' },
    { key: 'oldest', label: 'Najstarsze' },
    { key: 'name-asc', label: 'Nazwa A-Z' },
  ],
  draft: [
    { key: 'newest', label: 'Najnowsze' },
    { key: 'oldest', label: 'Najstarsze' },
    { key: 'name-asc', label: 'Nazwa A-Z' },
    { key: 'last-edited', label: 'Ostatnio edytowane' },
  ],
}

function sortDocuments(docs, sortBy) {
  const sorted = [...docs]
  switch (sortBy) {
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    case 'name-asc':
      return sorted.sort((a, b) => a.type.localeCompare(b.type))
    case 'last-edited':
      return sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    case 'newest':
    default:
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
}

function EmptyState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 rounded-2xl py-16 px-6">
      <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="font-medium text-slate-700 dark:text-slate-200">{message}</p>
    </div>
  )
}

export default function HistoryPage() {
  const { documents, removeDocument, saveDocument } = useDocuments()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('completed')
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [downloadingId, setDownloadingId] = useState(null)

  const completedCount = documents.filter(d => d.status === 'completed').length
  const draftCount = documents.filter(d => d.status === 'draft').length

  const types = useMemo(
    () => [...new Set(documents.map(d => d.type))].sort(),
    [documents]
  )

  const visibleDocs = useMemo(() => {
    const q = query.trim().toLowerCase()
    let docs = documents.filter(d => d.status === activeTab)

    if (typeFilter !== 'all') {
      docs = docs.filter(d => d.type === typeFilter)
    }

    if (q) {
      docs = docs.filter(d => {
        const route = `${d.routeFrom} ${d.routeTo} ${d.routeFrom}→${d.routeTo}`.toLowerCase()
        const haystack = `${d.type} ${route} ${d.stepLabel || ''}`.toLowerCase()
        return haystack.includes(q)
      })
    }

    return sortDocuments(docs, sortBy)
  }, [documents, activeTab, typeFilter, query, sortBy])

  function handleTabChange(tabKey) {
    setActiveTab(tabKey)
    setSortBy('newest')
  }

  function handleRemove(doc) {
    removeDocument(doc.id)
  }

  async function handleDownload(doc) {
    const templateKey = TYPE_TO_TEMPLATE_KEY[doc.type]
    const entry = templateKey && TEMPLATE_CATALOG.find(t => t.key === templateKey)
    if (!entry) {
      console.info('TODO: brak szablonu do pobrania dla typu dokumentu', doc.type)
      return
    }
    setDownloadingId(doc.id)
    try {
      // TODO: gdy dokument będzie miał realne dane formularza, przekazać je zamiast {}
      await generatePdf(entry.template, {}, entry.filename)
    } catch (err) {
      console.error('Błąd generowania PDF:', err)
    } finally {
      setDownloadingId(null)
    }
  }

  function handleDuplicate(doc) {
    saveDocument({
      type: doc.type,
      status: 'draft',
      routeFrom: doc.routeFrom,
      routeTo: doc.routeTo,
      currentStep: 1,
      stepLabel: 'Trasa',
      files: [],
    })
    setActiveTab('draft')
  }

  function handleContinue(doc) {
    // Wczytanie danych draftu do kreatora na podstawie draftId — TODO, patrz NewDocumentPage.jsx
    navigate(`/new-document?draftId=${doc.id}`)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Helmet>
        <title>Historia dokumentów | AMLogistico</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Historia dokumentów</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Wszystkie Twoje dokumenty — gotowe i w trakcie tworzenia.
        </p>
      </div>

      <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-700 mb-4">
        {TABS.map(tab => {
          const count = tab.key === 'completed' ? completedCount : draftCount
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={
                'pb-3 text-sm font-medium border-b-2 -mb-px transition-colors ' +
                (isActive
                  ? 'border-emerald-600 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200')
              }
            >
              {tab.label} <span className="text-slate-400 dark:text-slate-500">({count})</span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Szukaj po nazwie, typie lub trasie…"
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        />
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          <option value="all">Wszystkie typy</option>
          {types.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
        >
          {SORT_OPTIONS[activeTab].map(opt => (
            <option key={opt.key} value={opt.key}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        {visibleDocs.length === 0 ? (
          <EmptyState
            message={
              query.trim() || typeFilter !== 'all'
                ? 'Brak dokumentów pasujących do filtrów.'
                : activeTab === 'completed'
                  ? 'Brak gotowych dokumentów.'
                  : 'Brak wersji roboczych.'
            }
          />
        ) : (
          visibleDocs.map(doc => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              downloading={downloadingId === doc.id}
              onDownload={handleDownload}
              onContinue={handleContinue}
              onDuplicate={handleDuplicate}
              onRemove={handleRemove}
            />
          ))
        )}
      </div>
    </div>
  )
}
