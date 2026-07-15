import { useMemo, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams } from 'react-router-dom'
import DocumentWizard from '../components/wizard/DocumentWizard'
import { WizardProvider, UnsavedChangesGuard, readAutosave, clearAutosave } from '../components/wizard'
import { getSet } from '../services/documentSetsRepo'
import AlertBox from '../components/ui/AlertBox'
import { formatDocumentDate } from '../utils/formatDate'

export default function NewDocumentPage() {
  const [params] = useSearchParams()
  const editId = params.get('editId')
  const draftId = params.get('draftId')

  // Zestaw źródłowy (edit = gotowy oryginał, resume = draft) — z repozytorium.
  const sourceSet = useMemo(() => {
    if (editId) return getSet(editId)
    if (draftId) return getSet(draftId)
    return null
  }, [editId, draftId])

  const mode = editId ? 'edit' : draftId ? 'resume' : 'create'

  // Autozapis do przywrócenia — tylko przy czystym starcie (bez edit/draft).
  const autosave = useMemo(
    () => (mode === 'create' ? readAutosave() : null),
    [mode]
  )
  const [restore, setRestore] = useState(null) // null | 'fresh' | 'restored'

  // Nieznany identyfikator (np. rekord usunięty) — nie udajemy pustego kreatora.
  if ((editId || draftId) && !sourceSet) {
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
              onClick={() => { clearAutosave(); setRestore('fresh') }}
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
  const flowType = initialSet?.flowType || 'have_transport'
  const providerKey = editId || draftId || (restore === 'restored' ? 'restored' : 'new')

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
      <WizardProvider key={providerKey} flowType={flowType} mode={mode} initialSet={initialSet}>
        <UnsavedChangesGuard />
        <DocumentWizard />
      </WizardProvider>
    </div>
  )
}
