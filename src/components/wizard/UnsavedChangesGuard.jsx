import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
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

  const handleSaveDraft = async () => {
    try {
      await wiz.saveDraftAndMark()
    } catch (err) {
      // Błąd zapisu (np. sieć/serwer) — nie przechodzimy dalej, pokazujemy komunikat.
      setSaveError(err.message || 'Nie udało się zapisać wersji roboczej.')
      return
    }
    blocker.proceed()
  }
  const handleDiscard = () => {
    wiz.discard()
    blocker.proceed()
  }

  // Karta na środku ekranu (jak pierwotny modal), ale BEZ przyciemnionej nakładki —
  // `bg-black/40` + `shadow-xl` dawały na ciemnym motywie brzydką czarną ramkę.
  // Renderowana przez portal do <body>: kreator siedzi w kontenerach z animacją
  // (`animate-page-in`/StepTransition), a element z `transform` tworzy nowy blok
  // zawierający — bez portalu `position: fixed` przyczepiłby się do kreatora
  // i karta odjeżdżałaby przy scrollowaniu.
  // Nawigacja pozostaje wstrzymana (blocker), dopóki user nie wybierze akcji.
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg shadow-slate-900/10 dark:shadow-black/30 p-6 animate-page-in">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Niedokończony formularz</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
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
            className="w-full text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2.5 transition-colors"
          >
            Odrzuć zmiany
          </button>
          <button
            onClick={() => blocker.reset()}
            className="w-full text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg px-4 py-2.5 transition-colors"
          >
            Anuluj
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
