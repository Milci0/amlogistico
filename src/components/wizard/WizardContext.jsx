import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { getCurrentUserId } from '../../services/currentUser'
import { upsertProgress } from '../../services/documentSetsRepo'
import { buildMeta, buildEngineResult } from '../../services/documentGeneration'
import { peekPendingIncoterm, clearPendingIncoterm } from '../../services/pendingIncoterm'
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
export function WizardProvider({ children, flowType = 'have_transport', mode = 'create', initialSet = null, defaultCurrency = null }) {
  const flow = getFlow(flowType)
  const totalSteps = flow.steps.length

  // Świeży kreator (create, bez zestawu źródłowego) startuje z domyślną walutą
  // z profilu użytkownika, jeśli ją ustawił. Edit/resume/restore ładują zapisaną
  // migawkę bez zmian — nie nadpisujemy waluty z historii.
  const initialSnapshot = useMemo(() => {
    if (initialSet?.formData) return cloneSnapshot(initialSet.formData)
    const empty = createEmptySnapshot()
    // Waluty podpowiadamy TYLKO gdy użytkownik ustawił domyślną w profilu.
    // „Bez domyślnej waluty" (defaultCurrency puste) → pola waluty zostają puste.
    if (mode === 'create' && defaultCurrency) {
      empty.cargo.currency = defaultCurrency
      empty.terms.freightCurrency = defaultCurrency
    }
    return empty
  }, [initialSet, mode, defaultCurrency])

  // Incoterm „w podróży" z /incoterms (przycisk „Użyj w nowym zleceniu") — tylko
  // świeży create. Doklejany PO initialSnapshot i celowo NIE trafia do baseline,
  // żeby formularz startował jako „dirty" — alert wyjścia zapisze wersję roboczą,
  // nawet jeśli user nic więcej nie wypełnił.
  const [snapshot, setSnapshot] = useState(() => {
    if (mode !== 'create') return initialSnapshot
    const pendingIncoterm = peekPendingIncoterm()
    if (!pendingIncoterm) return initialSnapshot
    const withIncoterm = cloneSnapshot(initialSnapshot)
    withIncoterm.terms.incoterms = pendingIncoterm
    return withIncoterm
  })
  // edit → zawsze od ostatniego kroku (dokumenty gotowe od razu); resume → od lastStep.
  const [step, setStep] = useState(
    mode === 'edit' ? totalSteps : initialSet?.lastStep || 1
  )
  const [maxStepReached, setMaxStepReached] = useState(
    mode === 'edit' ? totalSteps : Math.max(initialSet?.maxStepReached || 1, initialSet?.lastStep || 1)
  )
  const [baseline, setBaseline] = useState(() => cloneSnapshot(initialSnapshot))

  // Bilet jednorazowy — zużyty (przeczytany do snapshotu powyżej albo nie było go
  // wcale), więc czyścimy, żeby kolejny świeży kreator w tej karcie go nie odziedziczył.
  useEffect(() => {
    if (mode === 'create') clearPendingIncoterm()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const setId = initialSet?.id || null
  const derivedFromId =
    mode === 'edit' ? initialSet?.id || null : initialSet?.derivedFromId || null
  // Dobór dokumentów z momentu utworzenia oryginału — do wykrycia zmiany w edit.
  const originalEngineResult = mode === 'edit' ? initialSet?.engineResult || null : null

  const guardBypassRef = useRef(false)

  // ── Jeden rekord na sesję kreatora — zapisywany TYLKO na wyraźną akcję ────────
  // Status wynika z pozycji kroku: ostatni krok (docs) → 'completed', wcześniej → 'draft'.
  // create  → rekord nie istnieje, dopóki user nie zapisze (alert wyjścia) lub nie wygeneruje.
  // resume  → kontynuacja istniejącego draftu (activeRecordIdRef = setId).
  // edit    → wejście w „Edytuj” NIE tworzy kopii; NOWA kopia (derivedFromId = oryginał)
  //           powstaje dopiero przy „Generuj” (recordGenerated) lub przy świadomym
  //           zapisie z alertu wyjścia. Brak zmian → żaden nowy wpis nie powstaje.
  const activeRecordIdRef = useRef(mode === 'resume' ? setId : null)
  // Ostatnio wygenerowany komplet dokumentów tej sesji (edit dziedziczy selectedDocs
  // oryginału, dopóki nie wygeneruje na nowo).
  const generatedDocsRef = useRef(initialSet?.selectedDocs || [])
  const snapshotRef = useRef(snapshot)
  useEffect(() => {
    snapshotRef.current = snapshot
  }, [snapshot])

  // Rdzeń zapisu — używany przez saveDraftAndMark (guard wyjścia z formularza)
  // i recordGenerated (Krok 4/6 → „Generuj”). NIE jest już wołany automatycznie
  // przy zmianie kroku — zapis powstaje tylko na wyraźną akcję użytkownika.
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

  // Brak automatycznego zapisu przy zmianie WCZEŚNIEJSZYCH kroków ani przy
  // otwarciu kreatora (dawniej efekt na [step] tworzył wpis co krok i pokazywał
  // toast „Zapisano wersję roboczą”). Kliknięcie „Rozpocznij” / wejście w kroki
  // 1–3 (6 dla ścieżki B) nie tworzy żadnego wpisu — dla nich wersja robocza
  // powstaje tylko gdy user wpisze dane i przy wyjściu potwierdzi zapis w alercie
  // (UnsavedChangesGuard → saveDraftAndMark).
  // WYJĄTEK — krok „Dokumenty" (ostatni): DocumentWizard.Step4 woła
  // recordGenerated() automatycznie zaraz po wejściu na ten krok (zanim user
  // kliknie „Pobierz”), więc zestaw trafia do historii jako 'completed' od razu.
  // Wyłączone dla mode==='edit' (edit startuje już na tym kroku — auto-zapis od
  // razu przy otwarciu edytora utworzyłby zbędną kopię bez żadnej zmiany usera).

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
    </WizardCtx.Provider>
  )
}
