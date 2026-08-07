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

// Tworzenie sledzenia potrafi trwac dluzej niz zwykly odczyt, bo ShipsGo
// dociaga dane od przewoznika. Przy 10 s nasz serwer poddawal sie ZANIM przyszla
// odpowiedz, pokazywal userowi blad, a sledzenie i tak powstawalo po ich stronie
// (i kosztowalo kredyt) — user placil i nie widzial nic. Funkcja na Vercelu ma
// maxDuration 60 s (vercel.json), wiec 25 s miesci sie z zapasem na reszte obslugi.
const TIMEOUT_MS = 10000
const CREATE_TIMEOUT_MS = 25000

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

// Wspólny kształt błędu z odpowiedzi HTTP. `retryAfter` (sekundy) bierzemy
// z nagłówka X-RateLimit-Reset, żeby przy 429 móc powiedzieć użytkownikowi
// KIEDY spróbować ponownie, zamiast samego „za chwilę".
async function errorFromResponse(res) {
  const body = await res.json().catch(() => null)
  const reset = res.headers.get('x-ratelimit-reset')
  const resetNum = reset ? Number(reset) : null
  // Nagłówek bywa podawany albo jako liczba sekund do resetu, albo jako
  // znacznik czasu uniksowy. Wartość większa niż rok w sekundach to na pewno
  // znacznik, więc liczymy różnicę; mniejsza to już gotowy odstęp.
  let retryAfter = null
  if (Number.isFinite(resetNum) && resetNum > 0) {
    retryAfter = resetNum > 31_536_000 ? Math.max(1, resetNum - Math.floor(Date.now() / 1000)) : resetNum
  }
  return {
    success: false,
    data: null,
    error: body?.message || null,
    code: codeForStatus(res.status),
    retryAfter,
  }
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
  UNKNOWN: { status: 502, message: 'ShipsGo nie odpowiedziało poprawnie. Ten numer został zapisany jako wymagający sprawdzenia i nie będzie automatycznie ponawiany, żeby uniknąć podwójnej opłaty. Skontaktuj się z nami, jeśli problem się powtórzy.' },
  CREATE_UNCERTAIN: { status: 502, message: 'Nie udało się potwierdzić utworzenia śledzenia w ShipsGo, mimo że żądanie zostało przyjęte. Ten numer został zapisany jako wymagający sprawdzenia i nie będzie automatycznie ponawiany, żeby uniknąć podwójnej opłaty. Skontaktuj się z nami, jeśli problem się powtórzy.' },
}

// Zamienia { code } z createOceanShipment/getOceanShipment/getShipmentGeojson
// na { status, message } gotowe do res.status(status).json({ error: message }).
export function describeShipsgoError(code) {
  return ERROR_DESCRIPTIONS[code] || ERROR_DESCRIPTIONS.UNKNOWN
}

// Blad TRWALY = wina samego numeru kontenera; ponawianie nic nie da, a kazda
// proba to ryzyko kolejnego kredytu. Reszta (siec, timeout, 429, 402, 401) jest
// PRZEJSCIOWA: po ustaniu przyczyny ten sam numer ma prawo sprobowac ponownie.
// Rozroznienie decyduje, czy w container_tracking zostaje `failed`, czy wiersz
// jest kasowany (patrz releaseReservation w containerTrackingRepo.js).
export function isPermanentError(code) {
  return code === 'NOT_FOUND' || code === 'VALIDATION'
}

// Statusy rejsu wg ShipsGo Ocean. Trzymane tutaj, bo to slownik API, a nie nasz
// wlasny — front mapuje je na etykiety i kolory (patrz containerStatus.js).
export const OCEAN_STATUSES = [
  'NEW', 'INPROGRESS', 'BOOKED', 'LOADED', 'SAILING', 'ARRIVED', 'DISCHARGED', 'UNTRACKED',
]

// ── DLACZEGO NIE WYSYLAMY POLA `reference` ─────────────────────────────────
// ShipsGo sprawdza duplikaty przed naliczeniem kredytu, ale jesli w zadaniu
// jest `reference`, ZAWSZE bierze ono udzial w tym sprawdzeniu. Wysylanie
// jakiejkolwiek etykiety zawezalo wiec dedupe do „ten kontener Z TA SAMA
// etykieta". Historycznie kosztowalo to realne pieniadze dwa razy:
//   1. wyszukiwarka slala `freeform-{numer}`, a „Wlacz sledzenie" id zestawu
//      dokumentow — to samo pudlo, dwie etykiety, dwa platne sledzenia
//      (potwierdzone na koncie: MMAU1313642, 2026-08-05),
//   2. ujednolicona etykieta `container-{numer}` naprawila punkt 1, ale nie
//      dedupowala sie ze sledzeniami zalozonymi WCZESNIEJ, pod starymi
//      etykietami — ponowne sprawdzenie takiego kontenera platiloby trzeci raz.
// Brak `reference` sprawia, ze dedupe idzie po samym `container_number`
// i lapie KAZDE istniejace sledzenie tego pudla na naszym koncie.

// Koperta odpowiedzi ShipsGo: pojedynczy zasob jest zagniezdzony pod kluczem
// nazwanym po zasobie, nie zwracany plasko. POTWIERDZONE na realnym koncie
// (2026-08-06): POST /ocean/shipments zwraca
// {"message":"SUCCESS","shipment":{"id":6559745,...}}, nie {"id":...} na
// gornym poziomie. Wczesniejszy kod zakladal plaska strukture i przez to
// gubil `id` przy KAZDYM udanym utworzeniu — kredyt szedl, a przesylka
// zostawala bez zapisanego shipsgoId (dwa realne przypadki: TLLU1080331,
// MMAU1351730). Unwrap jest bezpieczny takze dla juz plaskiej odpowiedzi:
// gdy `shipment` nie istnieje, zwraca body bez zmian.
function unwrapShipment(body) {
  return body?.shipment ?? body?.data ?? body ?? null
}

// Jak wyzej, ale dla odpowiedzi z LISTA przesylek (GET .../ocean/shipments
// z filtrem). Klucz listy NIEPOTWIERDZONY na realnym koncie — po analogii do
// `shipment` (liczba pojedyncza dla jednego zasobu) zakladamy `shipments`
// (liczba mnoga dla listy), z fallbackiem na `data` i na goła tablice.
function unwrapShipmentList(body) {
  if (Array.isArray(body)) return body
  if (Array.isArray(body?.shipments)) return body.shipments
  if (Array.isArray(body?.data)) return body.data
  return []
}

async function shipsgoFetch(path, options = {}) {
  const { timeoutMs = TIMEOUT_MS, ...fetchOptions } = options
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(`${SHIPSGO_API_URL}${path}`, {
      ...fetchOptions,
      signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Shipsgo-User-Token': getToken(),
        ...fetchOptions.headers,
      },
    })
    return res
  } finally {
    clearTimeout(timer)
  }
}

// POST /ocean/shipments — tworzy śledzenie. KOSZTUJE KREDYT (poza duplikatem).
// Body niesie WYŁĄCZNIE `container_number`, a `carrier` tylko wtedy, gdy
// użytkownik wskazał go jawnie (stan „Bez śledzenia" → „Wskaż przewoźnika").
// Domyślnie ShipsGo sam wykrywa linię z numeru kontenera.
// `reference` NIE jest wysyłany nigdy — patrz komentarz wyżej, to warunek
// działania deduplikacji po stronie ShipsGo.
// Zwraca { success, alreadyExists, data, error }. 409 (ALREADY_EXISTS) traktujemy
// jako sukces bez opłaty, nie jako błąd.
export async function createOceanShipment({ containerNumber, carrier }) {
  try {
    const body = { container_number: containerNumber }
    if (carrier) body.carrier = carrier

    const res = await shipsgoFetch('/ocean/shipments', {
      method: 'POST',
      body: JSON.stringify(body),
      timeoutMs: CREATE_TIMEOUT_MS,
    })

    if (res.status === 409) {
      // Duplikat — bez opłaty. Ciało może (ale nie musi) nieść dane istniejącego
      // śledzenia; jeśli nie niesie, wywołujący dociągnie przez GET osobno.
      const body = await res.json().catch(() => null)
      return { success: true, alreadyExists: true, data: unwrapShipment(body), error: null, code: null }
    }

    if (!res.ok) return { ...(await errorFromResponse(res)), alreadyExists: false }

    const resBody = await res.json()
    return { success: true, alreadyExists: false, data: unwrapShipment(resBody), error: null, code: null }
  } catch (e) {
    console.error('[shipsgo] createOceanShipment nie powiodło się:', e)
    return { success: false, alreadyExists: false, data: null, error: null, code: 'NETWORK' }
  }
}

// GET /ocean/shipments/{id} — pobiera dane. NIE kosztuje kredytu.
export async function getOceanShipment(id) {
  try {
    const res = await shipsgoFetch(`/ocean/shipments/${encodeURIComponent(id)}`, { method: 'GET' })
    if (!res.ok) return errorFromResponse(res)
    const body = await res.json()
    return { success: true, data: unwrapShipment(body), error: null, code: null }
  } catch (e) {
    console.error('[shipsgo] getOceanShipment nie powiodło się:', e)
    return { success: false, data: null, error: null, code: 'NETWORK' }
  }
}

// Ratunek na wypadek 409 ALREADY_EXISTS, którego ciało nie niesie `id`
// istniejącej przesyłki. Bez id nie umiemy jej później odpytać, a kredyt już
// kiedyś za nią zapłacono. GET nie kosztuje, więc próba jest darmowa.
//
// Numer kontenera jest ZWYKŁYM parametrem zapytania, nie wpisem w `filters[]`:
// dokumentacja dopuszcza w `filters[]` dla oceanu wyłącznie status, carrier,
// port_of_loading_country, date_of_loading, tags i creator. Wcześniejsze
// `filters[container_number]=eq:` albo kończyło się odrzuceniem zapytania,
// albo — gorzej — zwracało NIEfiltrowaną listę całego konta i podpinało pod nasz
// numer pierwszą lepszą cudzą przesyłkę. Dlatego wynik i tak sprawdzamy po
// stronie Node: bierzemy wyłącznie przesyłkę o dokładnie tym numerze, a brak
// dopasowania zwraca null i wywołujący prosi o ponowienie zamiast płacić drugi raz.
export async function findOceanShipmentByContainer(containerNumber) {
  try {
    const query = `container_number=${encodeURIComponent(containerNumber)}`
    const res = await shipsgoFetch(`/ocean/shipments?${query}`, { method: 'GET' })
    if (!res.ok) return null
    const body = await res.json()
    const list = unwrapShipmentList(body)
    const wanted = String(containerNumber).trim().toUpperCase()
    return list.find((s) => s?.id != null && String(s.container_number || '').trim().toUpperCase() === wanted) || null
  } catch (e) {
    console.error('[shipsgo] findOceanShipmentByContainer nie powiodło się:', e)
    return null
  }
}

// Trasa przychodzi w kopercie { message, geojson } — POTWIERDZONE na realnym
// tokenie 2026-08-08. Wcześniej zakładaliśmy gołe FeatureCollection na najwyższym
// poziomie, przez co trimGeojson odrzucał KAŻDĄ odpowiedź i mapa nigdy nie miała
// czego narysować. Gołą kolekcję zostawiamy jako wariant, bo ten sam kształt
// przychodzi też webhookiem.
function unwrapGeojson(body) {
  if (!body) return null
  if (body.type === 'FeatureCollection') return body
  return body.geojson || body.data?.geojson || body.data || null
}

// GET /ocean/shipments/{id}/geojson — trasa (porty + współrzędne) do rysowania
// na własnej mapie (patrz src/components/tracking/ShipmentMap.jsx). NIE kosztuje
// kredytu — ten sam limit współdzielony 100 req/min co reszta GET-ów.
export async function getShipmentGeojson(id) {
  try {
    const res = await shipsgoFetch(`/ocean/shipments/${encodeURIComponent(id)}/geojson`, { method: 'GET' })
    if (!res.ok) return errorFromResponse(res)
    const body = await res.json()
    return { success: true, data: unwrapGeojson(body), error: null, code: null }
  } catch (e) {
    console.error('[shipsgo] getShipmentGeojson nie powiodło się:', e)
    return { success: false, data: null, error: null, code: 'NETWORK' }
  }
}

// Pierwsza niepusta wartość spośród kilku ścieżek. Kolejność argumentów NIE jest
// przypadkowa: na pierwszym miejscu stoi ścieżka z dokumentacji ShipsGo, dalej
// warianty zgadywane, zanim dokumentacja trafiła do repo. Zgadywanki zostają
// jako zabezpieczenie do czasu potwierdzenia kształtu na realnym tokenie, ale
// nigdy nie wygrywają z udokumentowaną nazwą. Brak dopasowania → null, a front
// pokazuje „brak danych" zamiast fałszywej wartości.
function firstOf(...values) {
  for (const v of values) {
    if (v !== undefined && v !== null && v !== '') return v
  }
  return null
}

// Jak firstOf, ale dla pól LICZBOWYCH. Osobna funkcja, bo dla liczb zero jest
// wartością pełnoprawną (0 procent trasy, 0 kg CO2), a firstOf odrzuciłoby je
// razem z pustym stringiem.
function firstNumber(...values) {
  for (const v of values) {
    if (typeof v === 'number' && Number.isFinite(v)) return v
  }
  return null
}

// Typ kontenera składany z DWÓCH osobnych pól odpowiedzi (`size` i `type`,
// np. 20 + „High Cube"). Wcześniej czytaliśmy nieistniejące `size_type`, przez
// co nagłówek pokazywał samo „1 kontener" bez rozmiaru. Sklejamy tylko części
// niepuste, więc sam typ nie daje wiodącej spacji, a sam rozmiar nie gubi się
// przez brak drugiego pola.
function containerLabel(c) {
  if (!c) return null
  const parts = [c.size, c.type]
    .filter((v) => v !== undefined && v !== null && String(v).trim() !== '')
    .map((v) => String(v).trim())
  return parts.length > 0 ? parts.join(' ') : firstOf(c.size_type, c.container_type)
}

// Lista portów przeładunku. ShipsGo podaje w `route.ts_count` samą LICZBĘ
// przeładunków, a kafelek „Przeładunki" potrzebuje nazw, więc porty wyciągamy
// z ruchów kontenera: unikalne lokalizacje w kolejności wystąpienia, z
// pominięciem portu załadunku i wyładunku.
//
// Porównanie idzie po KODZIE lokalizacji, nie po nazwie, bo ten sam port bywa
// w odpowiedzi nazwany różnie w różnych polach (port załadunku „CALLAO (LIMA)"
// obok ruchu w „CALLAO") i porównanie po nazwie wpisałoby port załadunku jako
// przeładunek. Lokalizacja bez kodu jest pomijana z tego samego powodu: nie da
// się jej rozstrzygnąć względem trasy, a zgadywanie zafałszowałoby kafelek.
function collectTranshipments(movements, polLocation, podLocation) {
  const skip = new Set([polLocation?.code, podLocation?.code].filter(Boolean))
  const seen = new Set()
  const out = []
  for (const m of movements) {
    const code = m.location?.code
    if (!code || skip.has(code) || seen.has(code)) continue
    seen.add(code)
    out.push(m.location)
  }
  return out
}

function trimLocation(loc) {
  if (!loc) return null
  return {
    code: loc.code || null,
    name: loc.name || null,
    country: loc.country?.name || loc.country || null,
  }
}

function trimMovements(list) {
  return (list || []).map((m) => ({
    event: m.event || null,
    // 'ACT' = zdarzenie faktyczne, 'EST' = szacowane. Front oznacza szacowane
    // etykietą i przygaszonym kolorem, żeby nikt nie planował odbioru na
    // podstawie prognozy myśląc, że to fakt.
    status: m.status || null,
    location: trimLocation(m.location),
    vessel: m.vessel?.name || m.vessel || null,
    voyage: m.voyage || null,
    timestamp: m.timestamp || null,
  }))
}

// Przycina pełną odpowiedź ShipsGo do tego, co faktycznie wyświetlamy —
// zapisywane w ContainerTracking.snapshot (i w kopii w DocumentSet.meta dla
// zakładki „Lista przesyłek"). Nie trzymamy całego payloadu (mniej danych
// klienta w naszej bazie niż konieczne, mniejszy JSON).
export function trimShipmentData(raw) {
  if (!raw) return null

  const containersRaw = Array.isArray(raw.containers) ? raw.containers : []
  const first = containersRaw[0] || null
  // `route` czytane RAZ do zmiennej, bo mieszkają w nim nie tylko porty, ale też
  // czas przewozu, postęp i emisja CO2 — te trzy były wcześniej czytane
  // z poziomu głównego odpowiedzi i przez to zawsze puste.
  const route = raw.route || {}
  const pol = route.port_of_loading || null
  const pod = route.port_of_discharge || null

  const loadingDate = firstOf(pol?.date_of_loading, pol?.date, raw.date_of_loading)
  const dischargeDate = firstOf(pod?.date_of_discharge, pod?.date, pod?.eta, raw.date_of_discharge, raw.eta)
  const dischargeDateInitial = firstOf(pod?.date_of_discharge_initial, pod?.date_initial, raw.date_of_discharge_initial)

  const loadingLocation = trimLocation(pol?.location)
  const dischargeLocation = trimLocation(pod?.location)

  // Statek i rejs: bierzemy z ostatniego ruchu, który je niesie (najświeższa
  // znana jednostka), a gdy ruchów nie ma, z pól przesyłki.
  const allMovements = trimMovements(first?.movements)
  const lastWithVessel = [...allMovements].reverse().find((m) => m.vessel) || null

  // Liczba przeładunków wprost z odpowiedzi. Rozróżnienie null kontra 0 jest
  // istotne dla użytkownika: 0 znaczy „przewoźnik potwierdził przewóz
  // bezpośredni", brak pola znaczy „jeszcze nie wiadomo". Kafelek pokazuje
  // w każdym z tych przypadków co innego.
  const tsCount = firstNumber(route.ts_count)
  const transhipments = collectTranshipments(allMovements, loadingLocation, dischargeLocation)

  // Rozjazd oznacza, że ruchy nie pokrywają całej trasy (np. lokalizacje bez
  // kodu). Autorytatywna jest wtedy liczba z API, a lista nazw zostaje
  // najlepszym przybliżeniem — to nie jest powód, żeby odrzucić całą odpowiedź.
  if (tsCount !== null && tsCount !== transhipments.length) {
    console.warn('[shipsgo] route.ts_count nie zgadza sie z liczba portow wyliczonych z ruchow:', tsCount, 'kontra', transhipments.length)
  }

  return {
    id: raw.id ?? null,
    status: raw.status || null,
    containerStatus: first?.status || null,
    // Kod linii nazywa się w odpowiedzi `code`; `scac` było zgadywanką i przez
    // to kolumna carrier_scac zostawała pusta. Nazwa pola w NASZEJ migawce
    // zostaje bez zmian (front i baza już jej używają), zmienia się źródło.
    carrier: raw.carrier ? { scac: firstOf(raw.carrier.code, raw.carrier.scac), name: raw.carrier.name || null } : null,
    bookingNumber: raw.booking_number || null,

    // ── Trasa ────────────────────────────────────────────────────────────────
    loadingLocation,
    dischargeLocation,
    loadingDate,
    dischargeDate,
    dischargeDateInitial,
    tsCount,
    transhipments,

    // ── Kontenery ────────────────────────────────────────────────────────────
    // Liczba i typ trafiają do nagłówka stanu 5 („1 kontener 40 High Cube").
    containerCount: containersRaw.length || 0,
    containers: containersRaw.map((c) => ({
      number: c.number || c.container_number || null,
      type: containerLabel(c),
      status: c.status || null,
    })),
    containerType: containerLabel(first),

    // ── Rejs ─────────────────────────────────────────────────────────────────
    vessel: firstOf(lastWithVessel?.vessel, raw.vessel?.name, raw.vessel),
    voyageNo: firstOf(lastWithVessel?.voyage, raw.voyage),
    transitTime: firstNumber(route.transit_time, raw.transit_time),
    co2Emission: firstNumber(route.co2_emission, raw.co2_emission),

    movements: allMovements,
    mapToken: raw.tokens?.map || null,
    checkedAt: raw.checked_at || null,
    discardedAt: raw.discarded_at || null,
    fetchedAt: new Date().toISOString(),

    // ── Zgodność wsteczna z zakładką „Lista przesyłek" ───────────────────────
    // RealShipmentDetail i utils/shipmentFromSet.js czytają te nazwy z migawek
    // zapisanych w DocumentSet.meta. Zostają jako aliasy, żeby stare zestawy
    // dalej się renderowały.
    eta: dischargeDate,
    loadingDateInitial: firstOf(pol?.date_of_loading_initial, pol?.date_initial),
    // transit_percentage jest wartością Z API i tak jest prezentowane. Pasek
    // postępu na osi czasu własnej przesyłki liczy się osobno z dat (patrz
    // src/utils/voyageProgress.js), bo ta wartość potrafi zwracać 99 dla
    // przesyłki tuż po wypłynięciu.
    transitPercentage: firstNumber(route.transit_percentage, raw.transit_percentage),
  }
}

// Statusy odcinka trasy w GeoJSON-ie ShipsGo. PAST i CURRENT rysujemy linią
// ciągłą w kolorze akcentu, FUTURE przerywaną i przygaszoną.
const FEATURE_STATUSES = ['PAST', 'CURRENT', 'FUTURE']

// Współrzędna GeoJSON to [lng, lat] — sprawdzamy kształt, zanim trafi na mapę.
function isCoordPair(c) {
  return Array.isArray(c) && c.length >= 2 && typeof c[0] === 'number' && typeof c[1] === 'number'
}

// Przycina odpowiedź GET .../geojson do geometrii + właściwości, których
// faktycznie używa mapa (patrz ShipmentMap.jsx). Kształt POTWIERDZONY na realnym
// tokenie 2026-08-08:
//   • koperta { message, geojson: FeatureCollection } (rozpakowuje unwrapGeojson),
//   • Point   → properties.status + properties.location.{code,name,country},
//   • Line    → properties.status + properties.vessel.{name,imo} + properties.voyage
//               + properties.events.{DEPA,ARRV} + properties.current
//               (null albo { index, coordinates: [lng, lat] }).
// Nazwa portu leży w properties.location.name, a NIE w properties.name — dawne
// założenie zostawiało wszystkie dymki markerów puste. Pola `name` na najwyższym
// poziomie pilnujemy dalej jako wariantu zapasowego.
//
// Nie ufamy niczemu poza `type`/`geometry`/`coordinates`; nieznane właściwości są
// ignorowane, a cały obiekt jest odrzucany (→ null), jeśli nie pasuje do kształtu
// FeatureCollection albo nie ma ani jednego użytecznego obiektu. Front dostaje
// wtedy `null` i pokazuje prostokąt z informacją zamiast pustej mapy świata
// (tak wygląda przesyłka w stanie INPROGRESS: features to pusta tablica).
export function trimGeojson(input) {
  const raw = unwrapGeojson(input)
  if (!raw || raw.type !== 'FeatureCollection' || !Array.isArray(raw.features)) return null

  const features = raw.features
    .map((f) => {
      if (!f?.geometry?.type || !f.geometry.coordinates) return null
      const type = f.geometry.type
      if (type !== 'Point' && type !== 'LineString' && type !== 'MultiLineString') return null

      const p = f.properties || {}
      const statusRaw = typeof p.status === 'string' ? p.status.toUpperCase() : null
      // Pozycja statku bywa `null` nawet na odcinku CURRENT (armator nie podał
      // jeszcze koordynatów) — to normalny stan, nie błąd.
      const current = isCoordPair(p.current?.coordinates) ? p.current.coordinates : null

      return {
        geometry: { type, coordinates: f.geometry.coordinates },
        properties: {
          name: p.location?.name || p.name || null,
          type: p.type || null,
          status: FEATURE_STATUSES.includes(statusRaw) ? statusRaw : null,
          current,
          vessel: p.vessel?.name || (typeof p.vessel === 'string' ? p.vessel : null),
          voyage: p.voyage || null,
        },
      }
    })
    .filter(Boolean)

  if (features.length === 0) return null
  return { type: 'FeatureCollection', features }
}

// GET /ocean/carriers?filters[status]=eq:ACTIVE — lista przewoźników do wyboru
// w stanie „Bez śledzenia". NIE kosztuje kredytu.
export async function getOceanCarriers() {
  try {
    const res = await shipsgoFetch('/ocean/carriers?filters[status]=eq:ACTIVE', { method: 'GET' })
    if (!res.ok) return errorFromResponse(res)
    const body = await res.json()
    // Kształt odpowiedzi niezweryfikowany — po analogii do potwierdzonego
    // `shipment`/`shipments` (patrz unwrapShipment) próbujemy też `carriers`,
    // obok gołej tablicy i koperty { data: [...] }.
    const list = Array.isArray(body) ? body : Array.isArray(body?.carriers) ? body.carriers : Array.isArray(body?.data) ? body.data : []
    const carriers = list
      .map((c) => ({ scac: c.scac || c.code || null, name: c.name || null }))
      .filter((c) => c.scac && c.name)
      .sort((a, b) => a.name.localeCompare(b.name))
    return { success: true, data: carriers, error: null, code: null }
  } catch (e) {
    console.error('[shipsgo] getOceanCarriers nie powiodło się:', e)
    return { success: false, data: null, error: null, code: 'NETWORK' }
  }
}
