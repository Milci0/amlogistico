import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getCurrentUserId } from '../../services/currentUser'
import { upsertProgress } from '../../services/documentSetsRepo'
import { buildMeta, buildEngineResult } from '../../services/documentGeneration'
import { getFlow } from './flowSteps'
import { createEmptySnapshot, cloneSnapshot } from './wizardState'
import Toast from '../ui/Toast'

// ── Autozapis (ETAP 7c) — osobny slot per flowType, NIE pojawia się na draftach ──
// Klucz zawiera flowType, bo obie ścieżki (A/B) mogą być otwarte w osobnych
// zakładkach jednocześnie i nie mogą sobie nadpisywać autozapisu.

function autosaveKey(flowType) {
  return `amlogistico:v1:${getCurrentUserId()}:wizardAutosave:${flowType}`
}

function legacyAutosaveKey() {
  return `amlogistico:v1:${getCurrentUserId()}:wizardAutosave`
}

// Jednorazowa migracja starego (bez sufiksu) klucza → ...:wizardAutosave:have_transport.
let legacyMigrated = false
function migrateLegacyAutosave() {
  if (legacyMigrated) return
  legacyMigrated = true
  try {
    const legacy = localStorage.getItem(legacyAutosaveKey())
    if (legacy == null) return
    const target = autosaveKey('have_transport')
    if (localStorage.getItem(target) == null) localStorage.setItem(target, legacy)
    localStorage.removeItem(legacyAutosaveKey())
  } catch {
    /* ignore */
  }
}

export function readAutosave(flowType) {
  migrateLegacyAutosave()
  try {
    const raw = localStorage.getItem(autosaveKey(flowType))
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeAutosave(flowType, payload) {
  try {
    localStorage.setItem(autosaveKey(flowType), JSON.stringify(payload))
  } catch {
    // Autozapis jest best-effort — brak miejsca nie może przerwać pracy w kreatorze.
  }
}

export function clearAutosave(flowType) {
  try {
    localStorage.removeItem(autosaveKey(flowType))
  } catch {
    /* ignore */
  }
}

// ── Kontekst ───────────────────────────────────────────────────────────────────

const WizardCtx = createContext(null)

export function useWizard() {
  const ctx = useContext(WizardCtx)
  if (!ctx) throw new Error('useWizard musi być użyte wewnątrz <WizardProvider>')
  return ctx
}

// mode:
//   'create' — nowy zestaw (derivedFromId = null)
//   'resume' — wznowienie draftu (setId = id draftu, upsert)
//   'edit'   — edycja gotowego (setId = id ORYGINAŁU → zapisywany jako derivedFromId)
export function WizardProvider({ children, flowType = 'have_transport', mode = 'create', initialSet = null, defaultCurrency = null }) {
  const flow = getFlow(flowType)
  const totalSteps = flow.steps.length

  // Świeży kreator (create, bez zestawu źródłowego) startuje z domyślną walutą
  // z profilu użytkownika, jeśli ją ustawił. Edit/resume/restore ładują zapisaną
  // migawkę bez zmian — nie nadpisujemy waluty z historii.
  const initialSnapshot = useMemo(() => {
    if (initialSet?.formData) return cloneSnapshot(initialSet.formData)
    const empty = createEmptySnapshot()
    if (mode === 'create' && defaultCurrency) empty.cargo.currency = defaultCurrency
    return empty
  }, [initialSet, mode, defaultCurrency])

  const [snapshot, setSnapshot] = useState(initialSnapshot)
  // edit → zawsze od ostatniego kroku (dokumenty gotowe od razu); resume → od lastStep.
  const [step, setStep] = useState(
    mode === 'edit' ? totalSteps : initialSet?.lastStep || 1
  )
  const [maxStepReached, setMaxStepReached] = useState(
    mode === 'edit' ? totalSteps : Math.max(initialSet?.maxStepReached || 1, initialSet?.lastStep || 1)
  )
  const [baseline, setBaseline] = useState(() => cloneSnapshot(initialSnapshot))

  const setId = initialSet?.id || null
  const derivedFromId =
    mode === 'edit' ? initialSet?.id || null : initialSet?.derivedFromId || null
  // Dobór dokumentów z momentu utworzenia oryginału — do wykrycia zmiany w edit.
  const originalEngineResult = mode === 'edit' ? initialSet?.engineResult || null : null

  const guardBypassRef = useRef(false)

  // ── ETAP 6 — zapis powiązany z pozycją kroku ──────────────────────────────────
  // Jeden rekord na sesję kreatora, upsertowany na KAŻDEJ zmianie kroku. Status
  // wynika z pozycji: ostatni krok (docs) → 'completed', wcześniejsze → 'draft'.
  // create  → rekord nie istnieje, dopóki user nie ruszy się z kroku 1 (activeRecordIdRef = null).
  // resume  → kontynuacja istniejącego draftu (activeRecordIdRef = setId).
  // edit    → NOWA kopia (derivedFromId = oryginał) tworzona natychmiast po otwarciu
  //           edytora (edit startuje już na ostatnim kroku — patrz niżej), więc
  //           activeRecordIdRef startuje jako null i dostaje świeże id z pierwszego zapisu.
  const activeRecordIdRef = useRef(mode === 'resume' ? setId : null)
  // Ostatnio wygenerowany komplet dokumentów tej sesji — dopóki user nie kliknie
  // Generuj, zapisy „przy zmianie kroku” nie mają czego wysłać (poza edit, który
  // dziedziczy selectedDocs oryginału, dopóki nie wygeneruje na nowo).
  const generatedDocsRef = useRef(initialSet?.selectedDocs || [])
  const snapshotRef = useRef(snapshot)
  useEffect(() => {
    snapshotRef.current = snapshot
  }, [snapshot])

  const [toast, setToast] = useState(null)
  const toastTimerRef = useRef(null)
  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current) }, [])

  function showToast(message, type = 'success') {
    setToast({ message, type, key: Date.now() })
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(null), 3000)
  }

  // Rdzeń zapisu — używany zarówno przez efekt „zmiana kroku”, jak i przez
  // saveDraftAndMark (guard nawigacji) i recordGenerated (Krok 4/6 → Generuj).
  async function persistProgress(stepNumber, snap) {
    const status = stepNumber >= totalSteps ? 'completed' : 'draft'
    const partial = {
      flowType,
      totalSteps,
      lastStep: stepNumber,
      maxStepReached: Math.max(maxStepReached, stepNumber),
      formData: snap,
      engineResult: buildEngineResult(snap),
      selectedDocs: generatedDocsRef.current,
      meta: buildMeta(snap),
      derivedFromId,
    }
    const saved = await upsertProgress(activeRecordIdRef.current, partial, status)
    activeRecordIdRef.current = saved.id
    setBaseline(cloneSnapshot(snap))
    return { saved, status }
  }

  // Efekt: przy KAŻDEJ zmianie kroku (Dalej/Wstecz/klik w StepBar) zapisz postęp.
  // edit startuje na ostatnim kroku — pierwsze wywołanie (na mount) tworzy tam
  // od razu kopię ze statusem 'completed' (patrz komentarz przy activeRecordIdRef).
  const mountedRef = useRef(false)
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true
      if (mode !== 'edit') return
    }
    let cancelled = false
    persistProgress(step, snapshotRef.current)
      .then(({ status }) => {
        if (cancelled) return
        if (status === 'draft') showToast('Zapisano wersję roboczą')
      })
      .catch((err) => {
        if (cancelled) return
        showToast(err.message || 'Nie udało się zapisać postępu.', 'error')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])

  const isDirty = useMemo(
    () => JSON.stringify(snapshot) !== JSON.stringify(baseline),
    [snapshot, baseline]
  )

  // Autozapis co 1500 ms — tylko gdy są niezapisane zmiany.
  useEffect(() => {
    if (!isDirty) return
    const t = setTimeout(() => {
      writeAutosave(flowType, {
        flowType,
        step,
        maxStepReached,
        snapshot,
        savedAt: new Date().toISOString(),
      })
    }, 1500)
    return () => clearTimeout(t)
  }, [snapshot, isDirty, flowType, step, maxStepReached])

  function setStepData(sliceKey, updater) {
    setSnapshot((prev) => {
      const nextSlice = typeof updater === 'function' ? updater(prev[sliceKey]) : updater
      return { ...prev, [sliceKey]: nextSlice }
    })
  }

  function goToStep(n) {
    const target = Math.min(Math.max(n, 1), totalSteps)
    setStep(target)
    setMaxStepReached((m) => Math.max(m, target))
  }

  function next() {
    goToStep(step + 1)
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 1))
  }

  function validateStep(n) {
    const def = flow.steps[n - 1]
    return def ? def.validate(snapshot) : true
  }

  // Po udanym wygenerowaniu / jawnym zapisie — zrównanie baseline gasi isDirty,
  // dzięki czemu guard nie blokuje nawigacji, a autozapis przestaje pisać.
  function markSaved() {
    setBaseline(cloneSnapshot(snapshot))
    clearAutosave(flowType)
  }

  function reset() {
    const empty = createEmptySnapshot()
    setSnapshot(empty)
    setBaseline(cloneSnapshot(empty))
    setStep(1)
    setMaxStepReached(1)
    clearAutosave(flowType)
  }

  // Guard: „Zapisz wersję roboczą" — upsert TEGO SAMEGO rekordu, który już
  // obsługuje zmiany kroku (activeRecordIdRef); status wynika z bieżącego kroku.
  async function saveDraftAndMark() {
    // Await najpierw — przy błędzie zapisu nie gasimy isDirty ani autozapisu.
    const { saved } = await persistProgress(step, snapshot)
    clearAutosave(flowType)
    return saved
  }

  // Krok 4/6 → „Generuj dokumenty": zapisuje realnie wybrany komplet na tym samym
  // rekordzie (już 'completed' od wejścia na ten krok — patrz efekt wyżej).
  async function recordGenerated(selectedDocKeys) {
    generatedDocsRef.current = selectedDocKeys
    const { saved } = await persistProgress(totalSteps, snapshotRef.current)
    return saved
  }

  // Guard: „Odrzuć zmiany" — nic nie zapisujemy, gasimy isDirty i autozapis.
  function discard() {
    setBaseline(cloneSnapshot(snapshot))
    clearAutosave(flowType)
  }

  // Pozwól najbliższej nawigacji przejść bez pytania (używane po completeSet,
  // gdy programowo przechodzimy do /history).
  function allowNextNavigation() {
    guardBypassRef.current = true
  }

  const value = {
    flowType,
    flow,
    totalSteps,
    mode,
    setId,
    derivedFromId,
    originalEngineResult,
    snapshot,
    setStepData,
    currentStep: step,
    maxStepReached,
    goToStep,
    next,
    prev,
    validateStep,
    isDirty,
    guardBypassRef,
    markSaved,
    reset,
    saveDraftAndMark,
    recordGenerated,
    discard,
    allowNextNavigation,
  }

  return (
    <WizardCtx.Provider value={value}>
      {children}
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} />}
    </WizardCtx.Provider>
  )
}
