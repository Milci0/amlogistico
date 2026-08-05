// Limit kosztowy dla WOLNEGO wyszukiwania kontenera (POST /shipsgo-tracking/lookup).
// W odróżnieniu od śledzenia doczepionego do własnych zestawów dokumentów, tu
// każdy dopuszczony user (patrz SHIPSGO_ALLOWED_EMAILS) może wpisać DOWOLNY
// numer kontenera — potrzebny twardszy hamulec kosztowy niż sam allowlist.
// Trafienie w cache (patrz lookupCache w shipsgoTracking.js) NIE zużywa limitu —
// konsumujemy go dopiero przy realnym wywołaniu ShipsGo, ten sam wzorzec co
// api/_lib/hsRateLimit.js.
//
// Store w pamięci procesu = best-effort (resetuje się przy cold-starcie na
// Vercelu, nie jest współdzielony między instancjami) — akceptowalne, bo to
// tylko hamulec bezpieczeństwa, nie docelowy limit (docelowo: wycena pakietu).

const WINDOW_MS = 60 * 60 * 1000 // 1 godzina
const LIMIT = 5 // mamy tylko 2 kredyty testowe na cały zespół — celowo bardzo nisko

const hits = new Map() // Map<userId, number[]>

function prune(arr, now) {
  const cutoff = now - WINDOW_MS
  let i = 0
  while (i < arr.length && arr[i] <= cutoff) i++
  return i > 0 ? arr.slice(i) : arr
}

export function tryConsumeLookup(userId) {
  const now = Date.now()
  const arr = prune(hits.get(userId) || [], now)

  if (arr.length >= LIMIT) {
    const retryAfter = Math.max(1, Math.ceil((arr[0] + WINDOW_MS - now) / 1000))
    hits.set(userId, arr)
    return { ok: false, retryAfter }
  }

  arr.push(now)
  hits.set(userId, arr)
  return { ok: true, remaining: LIMIT - arr.length }
}
