// Postęp rejsu na pasku trasy, liczony WYŁĄCZNIE z dat.
//
// DLACZEGO NIE `transit_percentage` Z SHIPSGO: to pole potrafi zwrócić 99 dla
// przesyłki tuż po wypłynięciu i wprowadza spedytora w błąd. Data załadunku,
// data rozładunku i dzisiejsza data są danymi, które można sprawdzić, więc
// pasek liczymy z nich. Surowa wartość z API zostaje w migawce jako informacja,
// ale nie steruje niczym w interfejsie.

// Zwraca:
//   percent   – 0..100 albo null, gdy nie da się policzyć (brak którejś z dat
//               albo daty w złej kolejności). null = NIE rysuj paska postępu,
//               zamiast rysować zero i sugerować, że rejs stoi w miejscu.
//   state     – 'before' | 'during' | 'after' | null
export function computeVoyageProgress(loadingDate, dischargeDate, now = new Date()) {
  const start = toTime(loadingDate)
  const end = toTime(dischargeDate)
  if (start === null || end === null || end <= start) return { percent: null, state: null }

  const current = now.getTime()
  if (current <= start) return { percent: 0, state: 'before' }
  if (current >= end) return { percent: 100, state: 'after' }

  const percent = Math.round(((current - start) / (end - start)) * 100)
  return { percent: Math.min(100, Math.max(0, percent)), state: 'during' }
}

function toTime(value) {
  if (!value) return null
  const d = new Date(value)
  const t = d.getTime()
  return Number.isFinite(t) ? t : null
}

// Czy data rozładunku przesunęła się względem pierwotnej. Opóźnienie to
// najważniejsza informacja dla spedytora, więc pokazujemy je przy zdarzeniu.
// Porównujemy z dokładnością do doby: przesunięcie o godzinę w obrębie tego
// samego dnia nie jest zmianą, o której warto krzyczeć.
export function isDateChanged(current, initial) {
  const a = toTime(current)
  const b = toTime(initial)
  if (a === null || b === null) return false
  return new Date(a).toDateString() !== new Date(b).toDateString()
}
