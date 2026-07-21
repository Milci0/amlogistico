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
import { getSet } from '../services/documentSetsRepo'

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

  // Lista zestawów (GET /document-sets) NIE niesie formData/engineResult — są
  // odcinane dla oszczędności transferu (patrz backend toClientListItem). Do
  // regeneracji PDF-ów potrzebujemy pełnego rekordu, więc przed każdym pobraniem
  // doładowujemy go leniwie przez getSet(id). Bez tego generateDocuments dostawało
  // undefined (rzut / pusty ZIP) i „Pobierz" nie działało dla żadnego zestawu.
  async function loadFull(set) {
    if (set.formData !== undefined) return set // już pełny (np. przekazany z karty)
    const full = await getSet(set.id)
    return full || set
  }

  async function handleDownload(set) {
    setDownloadError(null)
    setDownloadingId(set.id)
    try {
      const full = await loadFull(set)
      if (full.kind === 'blank') {
        // Puste szablony — generowane przez JSX (jak wypełnione), fallback na
        // statyczny plik dla dokumentów bez jeszcze skonwertowanego szablonu.
        const docs = (full.selectedDocs || [])
          .map((key) => full.engineResult?.docs?.find((d) => d.key === key))
          .filter(Boolean)
        await downloadBlankZip(docs, `dokumenty_${full.meta?.routeFrom}_${full.meta?.routeTo}.zip`)
      } else {
        const { failed } = await generateDocuments(full.formData, full.selectedDocs || [])
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
    let full
    try {
      full = await loadFull(set)
    } catch (err) {
      console.error('Błąd ładowania zestawu:', err)
      onStatus?.(key, 'error')
      setDownloadError('Nie udało się wczytać zestawu.')
      return
    }
    if (full.kind === 'blank') {
      const doc = full.engineResult?.docs?.find((d) => d.key === key)
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
      const { failed } = await generateDocuments(full.formData, [key], onStatus)
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
