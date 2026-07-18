import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import DocumentWizard from '../components/wizard/DocumentWizard'
import { WizardProvider, UnsavedChangesGuard, clearAutosave, PATH_TO_FLOW } from '../components/wizard'
import { useAuth } from '../auth/AuthContext'
import { getSet } from '../services/documentSetsRepo'
import AlertBox from '../components/ui/AlertBox'

export default function NewDocumentPage() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const editId = params.get('editId')
  const draftId = params.get('draftId')
  const pathParam = params.get('path')

  // ?path= wybiera ścieżkę tylko przy świeżym starcie (create). 'A'→have_transport,
  // 'B'→find_transport, brak/inne → null (fallback niżej).
  const pathFlow = PATH_TO_FLOW[pathParam] || null

  const mode = editId ? 'edit' : draftId ? 'resume' : 'create'
  const sourceId = editId || draftId

  // Zestaw źródłowy (edit = gotowy oryginał, resume = draft) — z repozytorium (async).
  const [sourceSet, setSourceSet] = useState(null)
  const [sourceLoading, setSourceLoading] = useState(!!sourceId)
  const [sourceError, setSourceError] = useState(false)

  useEffect(() => {
    if (!sourceId) {
      setSourceSet(null)
      setSourceLoading(false)
      return
    }
    let active = true
    setSourceLoading(true)
    setSourceError(false)
    getSet(sourceId)
      .then((s) => { if (active) setSourceSet(s) })
      .catch(() => { if (active) setSourceError(true) })
      .finally(() => { if (active) setSourceLoading(false) })
    return () => { active = false }
  }, [sourceId])

  // Flow dla świeżego kreatora — potrzebne do wyczyszczenia ewentualnego starego
  // autozapisu (autozapis jest per flowType).
  const createFlowType = mode === 'create' ? pathFlow || 'have_transport' : null

  // Bez propozycji „przywróć niedokończony formularz" — gdy user wcześniej
  // wyszedł z kreatora, UnsavedChangesGuard już go zapytał, czy zapisać wersję
  // roboczą, czy odrzucić zmiany. Świeży start zawsze czyści stary autozapis,
  // żeby nie zostawał w localStorage bez sensu.
  useEffect(() => {
    if (mode === 'create') clearAutosave(createFlowType)
  }, [mode, createFlowType])

  // Ładowanie zestawu źródłowego (edit/resume) — czekamy, zanim zdecydujemy o kreatorze.
  if (sourceId && sourceLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <Helmet><title>Nowe zlecenie | AMLogistico</title></Helmet>
        <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">Ładowanie zestawu…</p>
      </div>
    )
  }

  // Błąd sieci przy ładowaniu — inny komunikat niż „nie istnieje".
  if (sourceId && sourceError) {
    return (
      <div className="max-w-2xl mx-auto">
        <Helmet><title>Nowe zlecenie | AMLogistico</title></Helmet>
        <AlertBox type="error" title="Błąd ładowania">
          Nie udało się wczytać zestawu. Odśwież stronę lub spróbuj ponownie później.
        </AlertBox>
      </div>
    )
  }

  // Nieznany identyfikator (np. rekord usunięty) — nie udajemy pustego kreatora.
  if (sourceId && !sourceSet) {
    return (
      <div className="max-w-2xl mx-auto">
        <Helmet><title>Nowe zlecenie | AMLogistico</title></Helmet>
        <AlertBox type="error" title="Nie znaleziono zestawu">
          Zestaw, który próbujesz otworzyć, nie istnieje lub został usunięty.
        </AlertBox>
      </div>
    )
  }

  // initialSet dla providera: edit/resume → z repo; świeży create → brak (null).
  const initialSet = sourceSet
  // Priorytet flowType: 1) wczytany zestaw (edit/resume) wygrywa zawsze,
  // 2) ?path= dla świeżego create, 3) fallback have_transport.
  const flowType = initialSet?.flowType || pathFlow || 'have_transport'
  // flowType w kluczu remountu — inaczej zmiana ścieżki nie zresetowałaby wizarda.
  const providerKey = `${editId || draftId || 'new'}:${flowType}`

  return (
    <div className="max-w-2xl mx-auto">
      <Helmet>
        <title>Nowe zlecenie | AMLogistico</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          {mode === 'edit' ? 'Edytuj zlecenie' : 'Nowe zlecenie'}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Wypełnij formularz a my dobierzemy dokumenty automatycznie.
        </p>
      </div>
      <WizardProvider
        key={providerKey}
        flowType={flowType}
        mode={mode}
        initialSet={initialSet}
        defaultCurrency={mode === 'create' ? user?.defaultCurrency : null}
      >
        <UnsavedChangesGuard />
        <DocumentWizard />
      </WizardProvider>
    </div>
  )
}
