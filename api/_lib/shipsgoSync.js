// Wspólna warstwa synchronizacji z ShipsGo dla OBU ścieżek w aplikacji:
// wyszukiwarki „Numer kontenera" (api/_routes/tracking.js) i przycisku
// „Włącz śledzenie" na własnej przesyłce (api/_routes/shipsgoTracking.js).
//
// Dlaczego jedno miejsce: kredyt płaci się za utworzenie śledzenia, a to samo
// pudło da się sprawdzić obiema ścieżkami. Gdy każda miała własną logikę,
// ten sam kontener bywał tworzony (i opłacany) dwa razy — potwierdzone na
// koncie ShipsGo dla MMAU1313642 (2026-08-05). Teraz płatny POST wychodzi
// z JEDNEJ funkcji (createAndSave) i tylko po potwierdzonej rezerwacji wiersza.

import {
  createOceanShipment,
  getOceanShipment,
  getShipmentGeojson,
  findOceanShipmentByContainer,
  trimShipmentData,
  trimGeojson,
  isPermanentError,
} from './shipsgo.js'
import {
  findActiveByNumber,
  reserveTracking,
  saveSnapshot,
  markFailed,
  releaseReservation,
  shouldPoll,
} from './containerTrackingRepo.js'

// Dociąga trasę (GeoJSON). NIE kosztuje kredytu, więc brak wyniku nie blokuje
// odpowiedzi: front dostaje resztę danych, a mapa spada na komunikat zastępczy.
export async function fetchGeojsonSafe(id) {
  const result = await getShipmentGeojson(id)
  if (!result.success) return null
  return trimGeojson(result.data)
}

// GeoJSON ma sens dopiero, gdy ShipsGo zna trasę. Przy NEW/INPROGRESS pole
// `route` jest puste, więc zapytanie byłoby tylko zużyciem limitu 100 req/min.
export function shouldFetchGeojson(status) {
  return !!status && status !== 'NEW' && status !== 'INPROGRESS'
}

// Zapisuje pełną odpowiedź ShipsGo (dane + trasa) w rekordzie rejsu.
export async function persistShipment(trackingId, raw) {
  const snapshot = trimShipmentData(raw)
  const shipsgoId = raw?.id ?? null
  const status = raw?.status || null
  const geojson = shipsgoId && shouldFetchGeojson(status) ? await fetchGeojsonSafe(shipsgoId) : null

  return saveSnapshot(trackingId, {
    shipsgoId,
    status,
    snapshot,
    geojson,
    carrier: snapshot?.carrier,
    bookingNumber: snapshot?.bookingNumber,
    mapToken: snapshot?.mapToken,
    checkedAt: snapshot?.checkedAt,
    discardedAt: snapshot?.discardedAt,
  })
}

// Odpytuje ShipsGo o istniejące śledzenie i zapisuje wynik (GET, bez kredytu).
// Zwraca zaktualizowany wiersz albo, przy błędzie przejściowym, ten sprzed próby
// — user zobaczy wtedy ostatnie znane dane zamiast błędu.
export async function pollAndSave(row) {
  const result = await getOceanShipment(row.shipsgoId)
  if (!result.success) {
    if (isPermanentError(result.code)) return markFailed(row.id, result.code)
    return row
  }
  return persistShipment(row.id, result.data)
}

// JEDYNE miejsce w aplikacji, które wysyła płatny POST do ShipsGo. Wywoływane
// WYŁĄCZNIE po tym, jak reserveTracking() potwierdzi wstawieniem wiersza, że dla
// tego numeru nie ma aktywnego rejsu.
export async function createAndSave(row, { containerNumber, carrier }) {
  const result = await createOceanShipment({ containerNumber, carrier })

  if (!result.success) {
    // Błąd TRWAŁY zostaje w bazie jako `failed` (nie próbuj w kółko), przejściowy
    // kasuje rezerwację, żeby pusty wiersz nie zablokował numeru na zawsze.
    if (isPermanentError(result.code)) {
      await markFailed(row.id, result.code)
    } else {
      await releaseReservation(row.id)
    }
    return { error: result.code, retryAfter: result.retryAfter }
  }

  let raw = result.data
  // 409 ALREADY_EXISTS to sukces BEZ opłaty, ale ciało nie zawsze niesie `id`.
  // Bez id nie umielibyśmy później odpytać opłaconej już przesyłki, więc
  // próbujemy ją odnaleźć (GET jest darmowy).
  if (!raw?.id) raw = await findOceanShipmentByContainer(containerNumber)
  if (!raw?.id) {
    await releaseReservation(row.id)
    return { error: 'UNKNOWN' }
  }

  return { row: await persistShipment(row.id, raw) }
}

// Zwraca dane aktywnego rejsu dla numeru, dopytując ShipsGo tylko gdy wypada,
// a płatne utworzenie robiąc TYLKO gdy aktywnego rejsu nie ma.
//
//   allowCreate    – false pozwala odczytać stan bez ryzyka opłaty
//   onBeforeCreate – bramka kosztowa (limit zapytań), sprawdzana DOPIERO gdy
//                    rezerwacja się udała, czyli gdy tworzenie jest realne
export async function resolveTracking(containerNumber, { allowCreate, carrier, onBeforeCreate } = {}) {
  const existing = await findActiveByNumber(containerNumber)

  if (existing) {
    const row = shouldPoll(existing) ? await pollAndSave(existing) : existing
    return { row }
  }

  if (!allowCreate) return { row: null }

  const reservation = await reserveTracking(containerNumber)
  if (!reservation.created) {
    // Ktoś nas ubiegł między odczytem a rezerwacją (dwa kliknięcia w tej samej
    // sekundzie, dwie instancje serverless). Używamy jego wiersza.
    return { row: reservation.row }
  }

  if (onBeforeCreate) {
    const gate = await onBeforeCreate()
    if (!gate.ok) {
      await releaseReservation(reservation.row.id)
      return { gateError: gate }
    }
  }

  return createAndSave(reservation.row, { containerNumber, carrier })
}
