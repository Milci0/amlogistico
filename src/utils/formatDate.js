// formatDocumentDate — jedyna funkcja formatowania dat we wszystkich szablonach PDF.
// Standard: DD.MM.RRRR (europejski, zgodny z CMR/Incoterms/UE).
//
// Obsługuje:
//   - Date object
//   - string ISO "YYYY-MM-DD" (z <input type="date">)
//   - string ISO datetime "YYYY-MM-DDTHH:MM" (ETD/ETA z godziną)
//   - null / undefined → ''
//
// includeTime: gdy true i wartość zawiera niezerową godzinę/minutę, dołącza "HH:MM".

export function formatDocumentDate(date, includeTime = false) {
  if (!date) return ''
  // Daty z <input type="date"> to "YYYY-MM-DD" — bez strefy czasowej.
  // Parsowanie przez `new Date("YYYY-MM-DD")` daje UTC midnight i może przesunąć
  // datę o 1 dzień w strefach UTC+. Dlatego doklejamy T00:00:00 (czas lokalny).
  const d =
    typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? new Date(date + 'T00:00:00')
      : new Date(date)

  if (isNaN(d.getTime())) return ''

  const datePart = d.toLocaleDateString('pl-PL') // zawsze DD.MM.RRRR
  if (includeTime && (d.getHours() !== 0 || d.getMinutes() !== 0)) {
    const timePart = d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
    return `${datePart} ${timePart}`
  }
  return datePart
}

// „przed chwilą", „18 min temu", „wczoraj" — czas ostatniej aktualizacji na
// liście śledzonych kontenerów. W ODRÓŻNIENIU od formatDocumentDate ta funkcja
// jest wyłącznie do interfejsu, więc respektuje język UI, a nie stałe pl-PL
// (tamto jest zamrożone, bo trafia na wydruki PDF).
//
// Intl.RelativeTimeFormat z numeric:'auto' sam daje „wczoraj"/„yesterday",
// więc nie dokładamy własnych kluczy tłumaczeń na coś, co przeglądarka wie lepiej.
const RELATIVE_UNITS = [
  { unit: 'year', ms: 365 * 24 * 60 * 60 * 1000 },
  { unit: 'month', ms: 30 * 24 * 60 * 60 * 1000 },
  { unit: 'day', ms: 24 * 60 * 60 * 1000 },
  { unit: 'hour', ms: 60 * 60 * 1000 },
  { unit: 'minute', ms: 60 * 1000 },
]

export function formatRelativeTime(value, locale = 'pl') {
  if (!value) return ''
  const time = new Date(value).getTime()
  if (!Number.isFinite(time)) return ''

  const diff = time - Date.now()
  const abs = Math.abs(diff)

  // Poniżej minuty „5 sekund temu" jest bardziej myślące niż informujące.
  if (abs < 60 * 1000) return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'second')

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  for (const { unit, ms } of RELATIVE_UNITS) {
    if (abs >= ms) return rtf.format(Math.round(diff / ms), unit)
  }
  return rtf.format(0, 'second')
}
