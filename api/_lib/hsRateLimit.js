// Limit kosztowy wyszukiwarki kodu celnego — per użytkownik, osobne kubełki:
//   - 'classify' (Etap 1a, bez web_search):   60 zapytań / godzinę
//   - 'websearch' (Etap 1b, web_search ~7x droższy): 15 zapytań / godzinę
//
// Store w pamięci procesu = best-effort (na Vercelu resetuje się przy cold-starcie
// i nie jest współdzielony między instancjami). Twardy limit wymagałby Redis.
// Konsumujemy limit dopiero przy realnym wywołaniu API — trafienie w cache go NIE zjada.

const WINDOW_MS = 60 * 60 * 1000 // 1 godzina

const LIMITS = {
  classify: 60,
  websearch: 15,
}

// Map<`${userId}:${kind}`, number[]> — znaczniki czasu zapytań w oknie.
const hits = new Map()

function prune(arr, now) {
  const cutoff = now - WINDOW_MS
  let i = 0
  while (i < arr.length && arr[i] <= cutoff) i++
  return i > 0 ? arr.slice(i) : arr
}

// Sprawdza i (gdy w limicie) rejestruje jedno zapytanie. Zwraca { ok, retryAfter }.
// retryAfter = sekundy do zwolnienia najstarszego trafienia (dla nagłówka/komunikatu).
export function tryConsume(userId, kind) {
  const limit = LIMITS[kind]
  if (!limit) throw new Error(`Nieznany kubełek limitu: ${kind}`)

  const key = `${userId}:${kind}`
  const now = Date.now()
  const arr = prune(hits.get(key) || [], now)

  if (arr.length >= limit) {
    const retryAfter = Math.max(1, Math.ceil((arr[0] + WINDOW_MS - now) / 1000))
    hits.set(key, arr)
    return { ok: false, retryAfter, limit }
  }

  arr.push(now)
  hits.set(key, arr)
  return { ok: true, remaining: limit - arr.length, limit }
}

export { LIMITS }
