import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import DocumentCard from '../components/ui/DocumentCard'
import DocumentFilterBar from '../components/documents/DocumentFilterBar'
import DocumentsEmptyState from '../components/documents/DocumentsEmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import useDocumentSets from '../hooks/useDocumentSets'
import { listSets } from '../services/documentSetsRepo'

const SORT_OPTIONS = [
  { key: 'newest', label: 'Najnowsze' },
  { key: 'oldest', label: 'Najstarsze' },
  { key: 'name-asc', label: 'Nazwa A-Z' },
  { key: 'last-edited', label: 'Ostatnio edytowane' },
]

const TRANSPORT_LABEL = { road: 'Drogowy', sea: 'Morski' }

export default function DraftsPage() {
  const { version, remove } = useDocumentSets()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [toDelete, setToDelete] = useState(null)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allDrafts = useMemo(
    () => listSets({ status: 'draft', search: query, sort: sortBy }),
    [version, query, sortBy]
  )

  const types = useMemo(() => {
    const present = new Set(allDrafts.map((s) => TRANSPORT_LABEL[s.meta?.transportMode]).filter(Boolean))
    return [...present].sort()
  }, [allDrafts])

  const visibleSets = useMemo(() => {
    if (typeFilter === 'all') return allDrafts
    return allDrafts.filter((s) => TRANSPORT_LABEL[s.meta?.transportMode] === typeFilter)
  }, [allDrafts, typeFilter])

  function handleContinue(set) {
    navigate(`/new-document?draftId=${set.id}`)
  }

  function confirmRemove() {
    if (toDelete) remove(toDelete.id)
    setToDelete(null)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Helmet>
        <title>Wersje robocze | AMLogistico</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Wersje robocze</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Dokumenty w trakcie tworzenia.
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

      <div className="flex flex-col gap-2">
        {visibleSets.length === 0 ? (
          <DocumentsEmptyState
            message={
              query.trim() || typeFilter !== 'all'
                ? 'Brak dokumentów pasujących do filtrów.'
                : 'Brak wersji roboczych.'
            }
            action={
              !query.trim() && typeFilter === 'all' && (
                <Link
                  to="/new-document"
                  className="inline-block text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Rozpocznij nowy dokument
                </Link>
              )
            }
          />
        ) : (
          visibleSets.map((set) => (
            <DocumentCard
              key={set.id}
              set={set}
              onContinue={handleContinue}
              onRemove={setToDelete}
            />
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        title="Usunąć wersję roboczą?"
        description="Tej operacji nie można cofnąć."
        confirmLabel="Usuń"
        destructive
        onConfirm={confirmRemove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
