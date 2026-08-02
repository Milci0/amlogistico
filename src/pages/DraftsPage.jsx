import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import DocumentCard from '../components/ui/DocumentCard'
import DocumentFilterBar from '../components/documents/DocumentFilterBar'
import DocumentsEmptyState from '../components/documents/DocumentsEmptyState'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import AlertBox from '../components/ui/AlertBox'
import useDocumentSets, { useDocumentSetList } from '../hooks/useDocumentSets'

const SORT_KEYS = ['newest', 'oldest', 'name-asc', 'last-edited']
const SORT_LABEL_KEY = {
  newest: 'sort.newest',
  oldest: 'sort.oldest',
  'name-asc': 'sort.nameAsc',
  'last-edited': 'sort.lastEdited',
}

export default function DraftsPage() {
  const { t } = useTranslation('pages')
  const transportLabel = (mode) =>
    mode ? t(`documentCard.transport.${mode}`, { defaultValue: '' }) : ''
  const SORT_OPTIONS = SORT_KEYS.map((key) => ({ key, label: t(SORT_LABEL_KEY[key]) }))
  const { remove } = useDocumentSets()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [toDelete, setToDelete] = useState(null)
  const [removeError, setRemoveError] = useState(null)

  const { sets: allDrafts, loading, error } = useDocumentSetList({
    status: 'draft',
    search: query,
    sort: sortBy,
  })

  const types = useMemo(() => {
    const present = new Set(allDrafts.map((s) => transportLabel(s.meta?.transportMode)).filter(Boolean))
    return [...present].sort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDrafts, t])

  const visibleSets = useMemo(() => {
    if (typeFilter === 'all') return allDrafts
    return allDrafts.filter((s) => transportLabel(s.meta?.transportMode) === typeFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDrafts, typeFilter, t])

  function handleContinue(set) {
    navigate(`/new-document?draftId=${set.id}`)
  }

  async function confirmRemove() {
    if (!toDelete) return
    try {
      await remove(toDelete.id)
    } catch {
      setRemoveError(t('drafts.removeError'))
    }
    setToDelete(null)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <Helmet>
        <title>{t('drafts.metaTitle')}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('drafts.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {t('drafts.subtitle')}
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

      {(error || removeError) && (
        <div className="mb-4">
          <AlertBox type="error" title={t('drafts.errorTitle')}>
            {removeError || t('drafts.loadError')}
          </AlertBox>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {loading ? (
          <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">{t('drafts.loading')}</p>
        ) : visibleSets.length === 0 ? (
          <DocumentsEmptyState
            message={
              query.trim() || typeFilter !== 'all'
                ? t('drafts.emptyFiltered')
                : t('drafts.empty')
            }
            action={
              !query.trim() && typeFilter === 'all' && (
                <Link
                  to="/new-document"
                  className="inline-block text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  {t('drafts.startNew')}
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
        title={t('drafts.deleteTitle')}
        description={t('drafts.deleteBody')}
        confirmLabel={t('actions.delete', { ns: 'common' })}
        destructive
        onConfirm={confirmRemove}
        onCancel={() => setToDelete(null)}
      />
    </div>
  )
}
