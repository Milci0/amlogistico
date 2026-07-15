import { useEffect, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import { useWizard } from './WizardContext'
import AlertBox from '../ui/AlertBox'

// ETAP 7 — ochrona przed utratą niewygenerowanego formularza.
//   7a. Nawigacja wewnątrz aplikacji → useBlocker + modal (3 akcje).
//   7b. beforeunload → natywne ostrzeżenie przeglądarki.
// Guard NIE odpala się przy przechodzeniu między krokami tego samego kreatora
// (to zmiana stanu, nie nawigacja routera) ani po udanym generowaniu
// (markSaved gasi isDirty, allowNextNavigation ustawia bypass).
export default function UnsavedChangesGuard() {
  const wiz = useWizard()
  const [saveError, setSaveError] = useState(null)

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !wiz.guardBypassRef.current &&
      wiz.isDirty &&
      currentLocation.pathname !== nextLocation.pathname
  )

  // 7b — natywne ostrzeżenie przy zamknięciu/odświeżeniu karty.
  useEffect(() => {
    if (!wiz.isDirty) return
    const handler = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [wiz.isDirty])

  if (blocker.state !== 'blocked') return null

  const handleSaveDraft = () => {
    try {
      wiz.saveDraftAndMark()
    } catch (err) {
      // np. StorageQuotaError — nie przechodzimy dalej, pokazujemy komunikat.
      setSaveError(err.message || 'Nie udało się zapisać wersji roboczej.')
      return
    }
    blocker.proceed()
  }
  const handleDiscard = () => {
    wiz.discard()
    blocker.proceed()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-bold text-slate-900">Niedokończony formularz</h3>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          Wprowadzone dane nie zostały jeszcze wygenerowane. Zapisać bieżący postęp jako wersję
          roboczą, aby wrócić do niego później?
        </p>
        {saveError && (
          <div className="mt-4">
            <AlertBox type="error" title="Nie udało się zapisać">{saveError}</AlertBox>
          </div>
        )}
        <div className="flex flex-col gap-2.5 mt-6">
          <button
            onClick={handleSaveDraft}
            className="w-full text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg px-4 py-2.5 transition-colors"
          >
            Zapisz wersję roboczą
          </button>
          <button
            onClick={handleDiscard}
            className="w-full text-sm font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg px-4 py-2.5 transition-colors"
          >
            Odrzuć zmiany
          </button>
          <button
            onClick={() => blocker.reset()}
            className="w-full text-sm font-semibold text-slate-500 hover:text-slate-700 rounded-lg px-4 py-2.5 transition-colors"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>
  )
}
