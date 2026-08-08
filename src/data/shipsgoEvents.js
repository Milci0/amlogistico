import { Package, DoorOpen, ArrowUpToLine, ArrowUpRight, ArrowDownRight, ArrowDownToLine, DoorClosed, PackageCheck, Circle } from 'lucide-react'

// Kody zdarzeń ShipsGo (pole `event` w movements) — WYŁĄCZNIE etykiety/ikony do
// wyświetlenia, nic wrażliwego. Zweryfikowane na realnej odpowiedzi API
// (2026-08-06): EMSH, LOAD; pozostałe podane przez użytkownika jako
// zaobserwowane w innych przesyłkach.
//
// TO NIE JEST PEŁNA LISTA — ShipsGo może zwrócić kod, którego tu nie ma.
// Nieznany kod NIE znika: renderer (ContainerTimeline) używa
// `t(`tracking.shipsgoEvents.${code}`, { defaultValue: code })` na etykietę
// i SHIPSGO_EVENT_ICONS[code] || Circle na ikonę.
export const KNOWN_SHIPSGO_EVENTS = [
  'EMSH', // pusty wydany (empty out — nadanie)
  'GTIN', // brama in (gate in, port nadania)
  'LOAD', // załadunek na statek
  'DEPA', // wypłynięcie
  'ARRV', // przypłynięcie
  'DISC', // rozładunek
  'GTOT', // brama out (gate out, port docelowy)
  'EMRT', // zwrot pustego (empty return)
]

export const SHIPSGO_EVENT_ICONS = {
  EMSH: Package,
  GTIN: DoorOpen,
  LOAD: ArrowUpToLine,
  DEPA: ArrowUpRight,
  ARRV: ArrowDownRight,
  DISC: ArrowDownToLine,
  GTOT: DoorClosed,
  EMRT: PackageCheck,
}

// Ikona dla nieznanego kodu — neutralna kropka, żeby zdarzenie nie znikało.
export const SHIPSGO_EVENT_FALLBACK_ICON = Circle
