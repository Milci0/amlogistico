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
