import { useEffect, useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import DocumentWizard from '../components/wizard/DocumentWizard'
import { WizardProvider, UnsavedChangesGuard, readAutosave, clearAutosave, PATH_TO_FLOW } from '../components/wizard'
import { useAuth } from '../auth/AuthContext'
import { getSet } from '../services/documentSetsRepo'
import AlertBox from '../components/ui/AlertBox'
import { formatDocumentDate } from '../utils/formatDate'

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

  // Flow dla świeżego kreatora — potrzebne już do odczytu właściwego autozapisu
  // (autozapis jest per flowType).
  const createFlowType = mode === 'create' ? pathFlow || 'have_transport' : null

  // Autozapis do przywrócenia — tylko przy czystym starcie (bez edit/draft),
  // czytany dla flow wynikającego z ?path=.
  const autosave = useMemo(
    () => (mode === 'create' ? readAutosave(createFlowType) : null),
    [mode, createFlowType]
  )
  const [restore, setRestore] = useState(null) // null | 'fresh' | 'restored'

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

  // Propozycja przywrócenia niedokończonego formularza (ETAP 16).
  if (autosave && restore === null) {
    return (
      <div className="max-w-2xl mx-auto">
        <Helmet><title>Nowe zlecenie | AMLogistico</title></Helmet>
        <AlertBox type="info" title="Znaleziono niedokończony formularz">
          <p>
            Masz zapisany automatycznie postęp z {formatDocumentDate(autosave.savedAt, true)}. Chcesz
            do niego wrócić?
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setRestore('restored')}
              className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-4 py-2 transition-colors"
            >
              Przywróć
            </button>
            <button
              onClick={() => { clearAutosave(createFlowType); setRestore('fresh') }}
              className="text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg px-4 py-2 hover:bg-slate-50 transition-colors"
            >
              Zacznij od nowa
            </button>
          </div>
        </AlertBox>
      </div>
    )
  }

  // initialSet dla providera: edit/resume → z repo; restore → z autozapisu.
  const restoredSet =
    restore === 'restored' && autosave
      ? {
          formData: autosave.snapshot,
          lastStep: autosave.step,
          maxStepReached: autosave.maxStepReached,
          flowType: autosave.flowType,
        }
      : null

  const initialSet = sourceSet || restoredSet
  // Priorytet flowType: 1) wczytany zestaw (edit/resume/restore) wygrywa zawsze,
  // 2) ?path= dla świeżego create, 3) fallback have_transport.
  const flowType = initialSet?.flowType || pathFlow || 'have_transport'
  // flowType w kluczu remountu — inaczej zmiana ścieżki nie zresetowałaby wizarda.
  const providerKey = `${editId || draftId || (restore === 'restored' ? 'restored' : 'new')}:${flowType}`

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
