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
  markPollMiss,
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
// Zwraca zaktualizowany wiersz albo, przy błędzie, ten sprzed próby: user
// zobaczy wtedy ostatnie znane dane zamiast błędu.
//
// ŻADEN błąd odpytania nie zatrzaskuje rekordu jako `failed`. Ta ścieżka dotyczy
// przesyłki, która JUŻ istnieje i za którą JUŻ zapłacono kredyt, więc nie ma
// czego chronić przed ponowieniem (GET jest darmowy), a jest co stracić:
// `failed` wyłącza rekord z odpytywania na zawsze i pokazuje czerwoną kartę
// zamiast danych. Odróżnia to tę funkcję od createAndSave(), gdzie `failed`
// jest właśnie zabezpieczeniem przed drugą, płatną próbą (patrz komentarz tam).
// Powody, dla których poprawny rekord dostaje 404, są realne i przemijające:
// inny SHIPSGO_API_TOKEN w środowisku (baza jest jedna, konta ShipsGo dwa),
// przesyłka usunięta ręcznie w panelu, awaria po ich stronie.
export async function pollAndSave(row) {
  const result = await getOceanShipment(row.shipsgoId)
  if (!result.success) {
    if (isPermanentError(result.code)) return markPollMiss(row.id, result.code)
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
    // Rozstrzygnięcie "kasować rezerwację czy nie" idzie po tym, czy jest
    // PEWNE, że ShipsGo nie policzyło kredytu:
    //   - isPermanentError (404/422) - ShipsGo jawnie odrzuciło numer, request
    //     nie mógł się powieść -> bezpiecznie zostawić `failed`, nie kasować
    //   - 401/402/403/429/NETWORK - request odrzucony PRZED przetworzeniem
    //     (zły token, brak kredytów, limit, brak połączenia) -> na pewno bez
    //     opłaty, bezpiecznie skasować rezerwację i pozwolić na nową próbę
    //   - KAŻDY INNY kod (dawne 'UNKNOWN' z nietypowego statusu, np. 500/503)
    //     - NIEJEDNOZNACZNE: ShipsGo mogło już przetworzyć i policzyć kredyt,
    //     zanim zwróciło zły status. Skasowanie rezerwacji pozwoliłoby kolejnej
    //     próbie wysłać DRUGI płatny POST na ten sam numer - realny przypadek,
    //     który się zdarzył (2026-08-08): kredyt zjedzony, wiersz skasowany,
    //     zero śladu w bazie. Dlatego taki wynik ZOSTAJE w bazie jako `failed`
    //     zamiast znikać, i NIE jest ponawiany automatycznie.
    const definitelyNotCharged = ['UNAUTHORIZED', 'NO_CREDITS', 'FORBIDDEN', 'RATE_LIMIT', 'NETWORK'].includes(result.code)
    if (isPermanentError(result.code) || !definitelyNotCharged) {
      if (!definitelyNotCharged && !isPermanentError(result.code)) {
        console.error('[shipsgo] utworzenie zakonczone niejednoznacznym bledem, zatrzymuje rezerwacje zamiast kasowac:', containerNumber, result.code, result.error)
      }
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
    // ShipsGo POTWIERDZIŁO utworzenie (2xx) - kredyt niemal na pewno poszedł -
    // ale nie udało się odczytać `id` ani odnaleźć przesyłki przez GET.
    // Z TEGO SAMEGO POWODU co wyżej: rezerwacja ZOSTAJE (jako `failed`,
    // z kodem opisującym dokładnie ten przypadek), retry NIE tworzy drugiej,
    // płatnej przesyłki dla tego samego numeru.
    console.error('[shipsgo] POST zwrocil sukces, ale brak id przesylki - mozliwy policzony kredyt bez zapisanego shipsgoId:', containerNumber, JSON.stringify(result.data))
    await markFailed(row.id, 'CREATE_UNCERTAIN')
    return { error: 'CREATE_UNCERTAIN' }
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
