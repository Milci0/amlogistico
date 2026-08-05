// ── ShipsGo Ocean API — śledzenie kontenerów ────────────────────────────────
//
// Serwis działa WYŁĄCZNIE po stronie serwera. Token WYŁĄCZNIE z
// process.env.SHIPSGO_API_TOKEN — nigdy nie trafia do bundla frontendu, nigdy
// nie loguj go (patrz brak console.log z nagłówkami w tym pliku).
//
// Mamy 2 kredyty testowe i czekamy na wycenę — POST tworzy śledzenie i
// KOSZTUJE kredyt (poza duplikatem — 409 ALREADY_EXISTS jest darmowy, patrz
// createOceanShipment). GET nie kosztuje, ale limit współdzielony to
// ok. 100 req/min na całą firmę — cache/cooldown trzyma api/_routes/shipsgoTracking.js.

const SHIPSGO_API_URL = 'https://api.shipsgo.com/v2'
const TIMEOUT_MS = 10000

function getToken() {
  const token = process.env.SHIPSGO_API_TOKEN
  if (!token) throw new Error('Brak SHIPSGO_API_TOKEN w zmiennych środowiskowych')
  return token
}

async function shipsgoFetch(path, options = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(`${SHIPSGO_API_URL}${path}`, {
      ...options,
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Shipsgo-User-Token': getToken(),
        ...options.headers,
      },
    })
    return res
  } finally {
    clearTimeout(timer)
  }
}

// POST /ocean/shipments — tworzy śledzenie. KOSZTUJE KREDYT (poza duplikatem).
// `carrier` celowo NIE jest wysyłany — ShipsGo sam wykrywa linię z numeru kontenera.
// Zwraca { success, alreadyExists, data, error }. 409 (ALREADY_EXISTS) traktujemy
// jako sukces bez opłaty, nie jako błąd.
export async function createOceanShipment({ reference, containerNumber }) {
  try {
    const res = await shipsgoFetch('/ocean/shipments', {
      method: 'POST',
      body: JSON.stringify({ reference, container_number: containerNumber }),
    })

    if (res.status === 409) {
      // Duplikat — bez opłaty. Ciało może (ale nie musi) nieść dane istniejącego
      // śledzenia; jeśli nie niesie, wywołujący dociągnie przez GET osobno.
      const body = await res.json().catch(() => null)
      return { success: true, alreadyExists: true, data: body?.data ?? body ?? null, error: null }
    }

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      return { success: false, alreadyExists: false, data: null, error: body?.message || `ShipsGo zwróciło status ${res.status}` }
    }

    const data = await res.json()
    return { success: true, alreadyExists: false, data, error: null }
  } catch (e) {
    console.error('[shipsgo] createOceanShipment nie powiodło się:', e)
    return { success: false, alreadyExists: false, data: null, error: 'Błąd połączenia z ShipsGo' }
  }
}

// GET /ocean/shipments/{id} — pobiera dane. NIE kosztuje kredytu.
export async function getOceanShipment(id) {
  try {
    const res = await shipsgoFetch(`/ocean/shipments/${encodeURIComponent(id)}`, { method: 'GET' })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      return { success: false, data: null, error: body?.message || `ShipsGo zwróciło status ${res.status}` }
    }
    const data = await res.json()
    return { success: true, data, error: null }
  } catch (e) {
    console.error('[shipsgo] getOceanShipment nie powiodło się:', e)
    return { success: false, data: null, error: 'Błąd połączenia z ShipsGo' }
  }
}

// Przycina pełną odpowiedź ShipsGo do tego, co faktycznie wyświetlamy —
// zapisywane w DocumentSet.meta.shipment.shipsgo. Nie trzymamy całego payloadu
// (mniej danych klienta w naszej bazie niż konieczne, mniejszy JSON).
export function trimShipmentData(raw) {
  if (!raw) return null
  const movements = (raw.containers?.[0]?.movements || []).map((m) => ({
    event: m.event || null,
    status: m.status || null,
    location: m.location
      ? { code: m.location.code || null, name: m.location.name || null, country: m.location.country?.name || null }
      : null,
    vessel: m.vessel?.name || null,
    voyage: m.voyage || null,
    timestamp: m.timestamp || null,
  }))

  return {
    id: raw.id ?? null,
    status: raw.status || null,
    containerStatus: raw.containers?.[0]?.status || null,
    carrier: raw.carrier ? { scac: raw.carrier.scac || null, name: raw.carrier.name || null } : null,
    loadingLocation: raw.route?.port_of_loading?.location
      ? { code: raw.route.port_of_loading.location.code, name: raw.route.port_of_loading.location.name }
      : null,
    dischargeLocation: raw.route?.port_of_discharge?.location
      ? { code: raw.route.port_of_discharge.location.code, name: raw.route.port_of_discharge.location.name }
      : null,
    // NIEZWERYFIKOWANE bez realnego tokena (2 kredyty testowe, jeszcze nieużyte
    // na strukturę z ETA) — próbujemy kilku prawdopodobnych ścieżek pola z typowych
    // API śledzenia morskiego. Brak dopasowania → null, front pokazuje "brak danych"
    // zamiast fałszywej wartości. DO POTWIERDZENIA na pierwszej realnej odpowiedzi.
    eta: raw.route?.port_of_discharge?.date
      || raw.route?.port_of_discharge?.eta
      || raw.eta
      || null,
    movements,
    mapToken: raw.tokens?.map || null,
    checkedAt: raw.checked_at || null,
    fetchedAt: new Date().toISOString(),
  }
}
