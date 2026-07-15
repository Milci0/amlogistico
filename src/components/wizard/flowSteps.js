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

export const FLOWS = {
  have_transport: {
    flowType: 'have_transport',
    label: 'Mam już transport',
    steps: [
      {
        key: 'route',
        label: 'Trasa',
        validate: (s) =>
          nonEmpty(s.route.transport) &&
          nonEmpty(s.route.fromCountry) &&
          nonEmpty(s.route.fromCity) &&
          nonEmpty(s.route.toCountry) &&
          nonEmpty(s.route.toCity) &&
          nonEmpty(s.route.loadDate),
      },
      {
        key: 'cargo',
        label: 'Towar',
        validate: (s) => nonEmpty(s.cargo.cargoName),
      },
      {
        key: 'parties',
        label: 'Strony',
        validate: (s) =>
          nonEmpty(s.parties.sender.name) &&
          nonEmpty(s.parties.receiver.name) &&
          nonEmpty(s.parties.carrier.name),
      },
      {
        key: 'docs',
        label: 'Dokumenty',
        validate: () => true,
      },
    ],
  },
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
