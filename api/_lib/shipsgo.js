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

// Model błędów v2: standardowe kody HTTP zamiast własnego formatu legacy.
// Mapujemy na `code`, żeby api/_routes/shipsgoTracking.js mogło zwrócić
// przyjazny komunikat PL per przypadek (zwłaszcza 402 brak kredytów i 429
// limit zapytań) zamiast jednego generycznego "ShipsGo nie odpowiedziało".
const STATUS_CODE_MAP = {
  401: 'UNAUTHORIZED',
  402: 'NO_CREDITS',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  409: 'CONFLICT',
  422: 'VALIDATION',
  429: 'RATE_LIMIT',
}

function codeForStatus(status) {
  return STATUS_CODE_MAP[status] || 'UNKNOWN'
}

// Komunikaty PL per kod błędu — WYŁĄCZNIE to, i nigdy surowy status/treść
// odpowiedzi ShipsGo, trafia do JSON-a zwracanego z api/_routes/shipsgoTracking.js.
// Ten sam wzorzec co reszta backendu (api/_routes/auth.js itd.) — komunikaty
// błędów backendu w tym projekcie są zawsze gotowym tekstem PL w polu `error`,
// nie kluczem i18n (i18n obowiązuje teksty UI pisane we froncie, nie tu).
const ERROR_DESCRIPTIONS = {
  UNAUTHORIZED: { status: 502, message: 'Błąd konfiguracji integracji ShipsGo. Spróbuj ponownie później.' },
  NO_CREDITS: { status: 402, message: 'Wyczerpano dostępne kredyty ShipsGo. Śledzenie będzie znów możliwe po doładowaniu konta.' },
  FORBIDDEN: { status: 502, message: 'Konto ShipsGo nie ma uprawnień do tej operacji.' },
  NOT_FOUND: { status: 404, message: 'ShipsGo nie zna tego numeru kontenera albo śledzenie wygasło.' },
  VALIDATION: { status: 422, message: 'ShipsGo odrzuciło numer kontenera jako nieprawidłowy.' },
  RATE_LIMIT: { status: 429, message: 'Zbyt wiele zapytań do ShipsGo w krótkim czasie. Spróbuj ponownie za chwilę.' },
  NETWORK: { status: 502, message: 'Nie udało się połączyć z ShipsGo. Spróbuj ponownie później.' },
  UNKNOWN: { status: 502, message: 'ShipsGo nie odpowiedziało poprawnie. Spróbuj ponownie później.' },
}

// Zamienia { code } z createOceanShipment/getOceanShipment/getShipmentGeojson
// na { status, message } gotowe do res.status(status).json({ error: message }).
export function describeShipsgoError(code) {
  return ERROR_DESCRIPTIONS[code] || ERROR_DESCRIPTIONS.UNKNOWN
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
      return { success: true, alreadyExists: true, data: body?.data ?? body ?? null, error: null, code: null }
    }

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      return {
        success: false,
        alreadyExists: false,
        data: null,
        error: body?.message || null,
        code: codeForStatus(res.status),
      }
    }

    const data = await res.json()
    return { success: true, alreadyExists: false, data, error: null, code: null }
  } catch (e) {
    console.error('[shipsgo] createOceanShipment nie powiodło się:', e)
    return { success: false, alreadyExists: false, data: null, error: null, code: 'NETWORK' }
  }
}

// GET /ocean/shipments/{id} — pobiera dane. NIE kosztuje kredytu.
export async function getOceanShipment(id) {
  try {
    const res = await shipsgoFetch(`/ocean/shipments/${encodeURIComponent(id)}`, { method: 'GET' })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      return { success: false, data: null, error: body?.message || null, code: codeForStatus(res.status) }
    }
    const data = await res.json()
    return { success: true, data, error: null, code: null }
  } catch (e) {
    console.error('[shipsgo] getOceanShipment nie powiodło się:', e)
    return { success: false, data: null, error: null, code: 'NETWORK' }
  }
}

// GET /ocean/shipments/{id}/geojson — trasa (porty + współrzędne) do rysowania
// na własnej mapie (patrz src/components/tracking/ShipmentMap.jsx). NIE kosztuje
// kredytu — ten sam limit współdzielony 100 req/min co reszta GET-ów.
export async function getShipmentGeojson(id) {
  try {
    const res = await shipsgoFetch(`/ocean/shipments/${encodeURIComponent(id)}/geojson`, { method: 'GET' })
    if (!res.ok) {
      const body = await res.json().catch(() => null)
      return { success: false, data: null, error: body?.message || null, code: codeForStatus(res.status) }
    }
    const data = await res.json()
    return { success: true, data, error: null, code: null }
  } catch (e) {
    console.error('[shipsgo] getShipmentGeojson nie powiodło się:', e)
    return { success: false, data: null, error: null, code: 'NETWORK' }
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
    // Data pierwotna vs. aktualna — jak wyżej, NIEZWERYFIKOWANE bez realnego
    // tokena. Brak dopasowania → null, front wtedy NIE pokazuje porównania
    // (patrz VoyageDetails.jsx), nie zgaduje.
    loadingDateInitial: raw.route?.port_of_loading?.date_initial || null,
    dischargeDateInitial: raw.route?.port_of_discharge?.date_initial || null,
    transitTime: typeof raw.transit_time === 'number' ? raw.transit_time : null,
    transitPercentage: typeof raw.transit_percentage === 'number' ? raw.transit_percentage : null,
    co2Emission: typeof raw.co2_emission === 'number' ? raw.co2_emission : null,
    movements,
    mapToken: raw.tokens?.map || null,
    checkedAt: raw.checked_at || null,
    fetchedAt: new Date().toISOString(),
  }
}

// Przycina odpowiedź GET .../geojson do samej geometrii + minimalnych etykiet
// potrzebnych na mapie (patrz ShipmentMap.jsx). NIEZWERYFIKOWANE bez realnego
// tokena — zakładamy standardowy FeatureCollection (GeoJSON RFC 7946), ale
// nie ufamy niczemu poza `type`/`geometry`/`coordinates`; nieznane właściwości
// są ignorowane, a cały obiekt jest odrzucany (→ null), jeśli nie pasuje do
// kształtu FeatureCollection. Front dostaje wtedy `null` i pokazuje fallback
// tekstowy (lista portów/dat) zamiast wybuchać na nieoczekiwanym formacie.
export function trimGeojson(raw) {
  if (!raw || raw.type !== 'FeatureCollection' || !Array.isArray(raw.features)) return null

  const features = raw.features
    .map((f) => {
      if (!f?.geometry?.type || !f.geometry.coordinates) return null
      const type = f.geometry.type
      if (type !== 'Point' && type !== 'LineString' && type !== 'MultiLineString') return null
      return {
        geometry: { type, coordinates: f.geometry.coordinates },
        properties: {
          name: f.properties?.name || null,
          type: f.properties?.type || null,
        },
      }
    })
    .filter(Boolean)

  if (features.length === 0) return null
  return { type: 'FeatureCollection', features }
}
