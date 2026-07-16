// ── Definicje kroków ścieżek kreatora — JEDNO źródło prawdy ────────────────────
//
// totalSteps NIGDY nie jest hardcodowane w komponentach — pochodzi stąd
// (flow.steps.length). Walidacja każdego kroku też jest tu (validate(snapshot)),
// dzięki czemu StepBar, przyciski „Dalej" i guard patrzą na tę samą regułę.
//
// Obecnie zaimplementowana jest tylko ścieżka 'have_transport' (4 kroki —
// „Mam już transport"). Ścieżka 'find_transport' (6 kroków — „Szukam transportu",
// z wyszukiwaniem spedytora i wyceną) NIE jest jeszcze napisana; gdy powstanie,
// wystarczy dodać tu jej wpis — reszta (historia, drafty, guard, persystencja)
// działa już generycznie po flowType/totalSteps.

const nonEmpty = (v) => !!(v && String(v).trim())

// Walidatory wspólnych kroków — JEDNA definicja dzielona między ścieżki, żeby
// reguły „Trasa" / „Towar" / „Strony" nie rozjechały się między flow.
const validateRoute = (s) =>
  nonEmpty(s.route.transport) &&
  nonEmpty(s.route.fromCountry) &&
  nonEmpty(s.route.fromCity) &&
  nonEmpty(s.route.toCountry) &&
  nonEmpty(s.route.toCity) &&
  nonEmpty(s.route.loadDate)

const validateCargo = (s) => nonEmpty(s.cargo.cargoName)

const validateParties = (s) =>
  nonEmpty(s.parties.sender.name) &&
  nonEmpty(s.parties.receiver.name) &&
  nonEmpty(s.parties.carrier.name)

// Ścieżka „Szukam transportu" — przewoźnik jeszcze nieznany, więc go nie wymagamy
// (sekcja „Przewoźnik" jest wtedy ukryta w kreatorze).
const validatePartiesNoCarrier = (s) =>
  nonEmpty(s.parties.sender.name) &&
  nonEmpty(s.parties.receiver.name)

export const FLOWS = {
  have_transport: {
    flowType: 'have_transport',
    label: 'Mam już transport',
    steps: [
      { key: 'route', label: 'Trasa', validate: validateRoute },
      { key: 'cargo', label: 'Towar', validate: validateCargo },
      { key: 'parties', label: 'Strony', validate: validateParties },
      { key: 'docs', label: 'Dokumenty', validate: () => true },
    ],
  },
  find_transport: {
    flowType: 'find_transport',
    label: 'Szukam transportu',
    steps: [
      { key: 'route', label: 'Trasa', validate: validateRoute },
      { key: 'cargo', label: 'Towar', validate: validateCargo },
      { key: 'parties', label: 'Strony', validate: validatePartiesNoCarrier },
      { key: 'forwarders', label: 'Spedytorzy', validate: () => true },
      { key: 'quote', label: 'Wycena', validate: () => true },
      { key: 'docs', label: 'Dokumenty', validate: () => true },
    ],
  },
  // Nie jest ścieżką kreatora (nie ma stron w wizardzie) — istnieje wyłącznie po to,
  // żeby DocumentCard/getFlowLabel pokazywały poprawną etykietę dla wpisów historii
  // pochodzących z /blank-templates (patrz kind:'blank' w documentSetsRepo).
  blank_templates: {
    flowType: 'blank_templates',
    label: 'Puste szablony',
    steps: [{ key: 'result', label: 'Wynik', validate: () => true }],
  },
}

// Mapowanie parametru ?path= na flowType — trzymane obok rejestru, żeby nie
// dublować literałów 'A'/'B' w warstwie stron.
export const PATH_TO_FLOW = {
  A: 'have_transport',
  B: 'find_transport',
}

export const DEFAULT_FLOW_TYPE = 'have_transport'

export function getFlow(flowType) {
  return FLOWS[flowType] || FLOWS[DEFAULT_FLOW_TYPE]
}

export function getTotalSteps(flowType) {
  return getFlow(flowType).steps.length
}

export function getStepLabel(flowType, stepNumber) {
  const steps = getFlow(flowType).steps
  return steps[stepNumber - 1]?.label || ''
}

export function getFlowLabel(flowType) {
  return getFlow(flowType).label
}
