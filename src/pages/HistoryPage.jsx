import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import DocumentCard from '../components/ui/DocumentCard'
import DocumentFilterBar from '../components/documents/DocumentFilterBar'
import DocumentsEmptyState from '../components/documents/DocumentsEmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import AlertBox from '../components/ui/AlertBox'
import useDocumentSets, { useDocumentSetList } from '../hooks/useDocumentSets'
import { generateDocuments } from '../services/documentGeneration'
import { downloadBlankDocument, downloadBlankZip } from '../utils/blankDocuments'

const SORT_OPTIONS = [
  { key: 'newest', label: 'Najnowsze' },
  { key: 'oldest', label: 'Najstarsze' },
  { key: 'name-asc', label: 'Nazwa A-Z' },
]

const TRANSPORT_LABEL = { road: 'Drogowy', sea: 'Morski' }

export default function HistoryPage() {
  const { remove } = useDocumentSets()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [downloadingId, setDownloadingId] = useState(null)
  const [downloadError, setDownloadError] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const { sets: allCompleted, loading, error } = useDocumentSetList({
    status: 'completed',
    search: query,
    sort: sortBy,
  })

  const types = useMemo(() => {
    const present = new Set(allCompleted.map((s) => TRANSPORT_LABEL[s.meta?.transportMode]).filter(Boolean))
    return [...present].sort()
  }, [allCompleted])

  const visibleSets = useMemo(() => {
    if (typeFilter === 'all') return allCompleted
    return allCompleted.filter((s) => TRANSPORT_LABEL[s.meta?.transportMode] === typeFilter)
  }, [allCompleted, typeFilter])

  async function handleDownload(set) {
    setDownloadError(null)
    setDownloadingId(set.id)
    try {
      if (set.kind === 'blank') {
        // Puste szablony — generowane przez JSX (jak wypełnione), fallback na
        // statyczny plik dla dokumentów bez jeszcze skonwertowanego szablonu.
        const docs = (set.selectedDocs || [])
          .map((key) => set.engineResult?.docs?.find((d) => d.key === key))
          .filter(Boolean)
        await downloadBlankZip(docs, `dokumenty_${set.meta?.routeFrom}_${set.meta?.routeTo}.zip`)
      } else {
        const { failed } = await generateDocuments(set.formData, set.selectedDocs || [])
        if (failed.length > 0) setDownloadError('Nie udało się wygenerować części dokumentów.')
      }
    } catch (err) {
      console.error('Błąd pobierania dokumentów:', err)
      setDownloadError('Nie udało się pobrać dokumentów.')
    } finally {
      setDownloadingId(null)
    }
  }

  // Pobranie pojedynczego dokumentu z rozwiniętej karty — status idzie do wiersza
  // dokumentu (onStatus), nie do globalnego downloadingId karty.
  async function handleDownloadOne(set, key, onStatus) {
    setDownloadError(null)
    if (set.kind === 'blank') {
      const doc = set.engineResult?.docs?.find((d) => d.key === key)
      if (!doc) return
      onStatus?.(key, 'loading')
      try {
        await downloadBlankDocument(doc.key, doc.name)
        onStatus?.(key, 'done')
      } catch (err) {
        console.error('Błąd pobierania pliku:', err)
        onStatus?.(key, 'error')
        setDownloadError('Nie udało się pobrać dokumentu.')
      }
      return
    }
    try {
      const { failed } = await generateDocuments(set.formData, [key], onStatus)
      if (failed.length > 0) setDownloadError('Nie udało się wygenerować dokumentu.')
    } catch (err) {
      console.error('Błąd generowania PDF:', err)
      setDownloadError('Nie udało się wygenerować dokumentu.')
    }
  }

  function handleEdit(set) {
    navigate(`/new-document?editId=${set.id}`)
  }

  async function confirmRemove() {
    if (!toDelete) return
    try {
      await remove(toDelete.id)
    } catch {
      setDownloadError('Nie udało się usunąć zestawu.')
    }
    setToDelete(null)
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
          Wszystkie Twoje gotowe dokumenty.
        </p>
      </div>

      <DocumentFilterBar
        query={query}
        onQueryChange={setQuery}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        types={types}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortOptions={SORT_OPTIONS}
      />

      {downloadError && (
        <div className="mb-4">
          <AlertBox type="error" title="Błąd pobierania">{downloadError}</AlertBox>
        </div>
      )}

      {error && (
        <div className="mb-4">
          <AlertBox type="error" title="Błąd ładowania">
            Nie udało się wczytać dokumentów. Odśwież stronę lub spróbuj ponownie później.
          </AlertBox>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">Ładowanie…</p>
        ) : visibleSets.length === 0 ? (
          <DocumentsEmptyState
            message={
              query.trim() || typeFilter !== 'all'
                ? 'Brak dokumentów pasujących do filtrów.'
                : 'Brak gotowych dokumentów.'
            }
          />
        ) : (
          visibleSets.map((set) => (
            <DocumentCard
              key={set.id}
              set={set}
              downloading={downloadingId === set.id}
              onDownload={handleDownload}
              onDownloadOne={handleDownloadOne}
              onEdit={handleEdit}
              onRemove={setToDelete}
            />
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Usunąć zestaw dokumentów?"
        description="Tej operacji nie można cofnąć. Usuwany jest tylko ten wpis."
        confirmLabel="Usuń"
        destructive
        onConfirm={confirmRemove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
