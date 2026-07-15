import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getCurrentUserId } from '../../services/currentUser'
import { saveDraft } from '../../services/documentSetsRepo'
import { buildMeta } from '../../services/documentGeneration'
import { getFlow } from './flowSteps'
import { createEmptySnapshot, cloneSnapshot } from './wizardState'

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
export function WizardProvider({ children, flowType = 'have_transport', mode = 'create', initialSet = null }) {
  const flow = getFlow(flowType)
  const totalSteps = flow.steps.length

  const initialSnapshot = useMemo(
    () => (initialSet?.formData ? cloneSnapshot(initialSet.formData) : createEmptySnapshot()),
    [initialSet]
  )

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

  // Guard: „Zapisz wersję roboczą". W edit → NOWY draft z derivedFromId=oryginał
  // (oryginał nietknięty). W resume → upsert tego samego draftu. W create → nowy.
  function saveDraftAndMark() {
    const partial = {
      id: mode === 'resume' ? setId : undefined,
      flowType,
      totalSteps,
      lastStep: step,
      maxStepReached,
      formData: snapshot,
      meta: buildMeta(snapshot),
      derivedFromId,
    }
    const saved = saveDraft(partial)
    setBaseline(cloneSnapshot(snapshot))
    clearAutosave(flowType)
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
    discard,
    allowNextNavigation,
  }

  return <WizardCtx.Provider value={value}>{children}</WizardCtx.Provider>
}
