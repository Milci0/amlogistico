// api/_routes/tracking.js — zakładka „Numer kontenera" w Śledzeniu ładunku.
// Doczepione do istniejącej funkcji Express (limit funkcji serverless na
// Vercelu), mount w api/index.js pod /api/tracking.
//
// ── OCHRONA KREDYTÓW (najważniejsza rzecz w tym pliku) ──────────────────────
// Kredyt ShipsGo płaci się za UTWORZENIE śledzenia. Jedyne miejsce, które wysyła
// płatny POST, to createAndSave() i jest ono wywoływane WYŁĄCZNIE po tym, jak
// reserveTracking() potwierdzi wstawieniem wiersza, że dla tego numeru nie ma
// aktywnego rejsu. Wyścig dwóch równoczesnych żądań rozstrzyga częściowy indeks
// unikalny w bazie (scripts/apply-tracking-index.js), nie kolejność w Node.
//
// Wszystko poza tworzeniem czyta z NASZEJ bazy: lista, szczegóły i polling
// z frontendu nie dotykają ShipsGo w ogóle. Aktualizacje przychodzą webhookiem,
// a ręczne odświeżenie jest zabezpieczeniem na wypadek, gdyby webhook nie działał.

import { Router } from 'express'
import crypto from 'node:crypto'
import { requireAuth } from '../_lib/auth.js'
import { ensureShipsgoAccess, hasShipsgoAccess } from '../_lib/shipsgoAccess.js'
import { getOceanCarriers, describeShipsgoError } from '../_lib/shipsgo.js'
import { persistShipment, pollAndSave, createAndSave } from '../_lib/shipsgoSync.js'
import { mapLimit } from '../_lib/rss.js'
import { isContainerReady, notifyContainerReady } from '../_lib/containerReadyNotifications.js'
import { validateContainerNumber } from '../_lib/containerChecksum.js'
import { createContainerSchema, containerNumberParam } from '../_validation/shipsgoTracking.js'
import { tryConsumeLookup } from '../_lib/shipsgoRateLimit.js'
import {
  findActiveByNumber,
  findLatestArchivedByNumber,
  findByShipsgoId,
  findById,
  reserveTracking,
  markDiscarded,
  releaseReservation,
  shouldPoll,
  isAwaitingCarrierData,
  canManualRefresh,
  isArchived,
  linkUser,
  hideForUser,
  listForUser,
  findVisibleForUser,
  findVisibleByIdForUser,
  listPreviousVoyages,
} from '../_lib/containerTrackingRepo.js'

const router = Router()

// ── Webhook: PRZED requireAuth ──────────────────────────────────────────────
// ShipsGo woła go bez sesji użytkownika, więc musi być zdefiniowany zanim
// router.use(requireAuth) zacznie obowiązywać (Express dopasowuje trasy
// w kolejności rejestracji, a middleware nie dotyka tras zdefiniowanych wyżej).

// Porównanie podpisu w STAŁYM czasie. Nigdy operatorem == ani ===: porównanie
// bajt po bajcie z wczesnym wyjściem zdradza, ile znaków się zgadza, co pozwala
// odtworzyć podpis próba po próbie.
function signatureMatches(rawBody, provided, secret) {
  if (!provided || !secret || !rawBody) return false
  const mac = crypto.createHmac('sha256', secret).update(rawBody).digest()
  // Kodowanie podpisu nie jest udokumentowane, więc akceptujemy hex i base64,
  // z opcjonalnym prefiksem „sha256=" (spotykany u wielu dostawców webhooków).
  const value = String(provided).replace(/^sha256=/i, '').trim()
  const expected = [mac.toString('hex'), mac.toString('base64')]
  return expected.some((candidate) => {
    const a = Buffer.from(candidate, 'utf8')
    const b = Buffer.from(value, 'utf8')
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  })
}

// Payload webhooka: dokumentacja opisuje zdarzenie i obiekt przesyłki, ale nie
// podaje pełnego drzewa koperty, więc sprawdzamy kilka prawdopodobnych miejsc.
function extractShipment(body) {
  return body?.data?.shipment || body?.shipment || body?.data || null
}

// POST /api/tracking/shipsgo-webhook — publiczny, bez sesji użytkownika.
// Przetwarzanie MUSI być idempotentne: przy błędzie 5xx ShipsGo ponawia
// po 1, 5 i 10 minutach, a ten sam event może przyjść dwa razy.
router.post('/shipsgo-webhook', async (req, res) => {
  try {
    const secret = process.env.SHIPSGO_WEBHOOK_SECRET
    if (!secret) {
      console.error('[tracking] webhook odrzucony: brak SHIPSGO_WEBHOOK_SECRET')
      return res.status(401).json({ error: 'Brak konfiguracji' })
    }

    // rawBody ustawia express.json({ verify }) w api/index.js — podpis liczy się
    // z bajtów, które faktycznie przyszły, nie z ponownie serializowanego JSON-a
    // (kolejność kluczy i białe znaki zmieniłyby wynik HMAC).
    const raw = req.rawBody
    if (!signatureMatches(raw, req.get('X-Shipsgo-Webhook-Signature'), secret)) {
      return res.status(401).json({ error: 'Nieprawidłowy podpis' })
    }

    const event = req.body?.event || req.body?.type || null
    const shipment = extractShipment(req.body)
    const shipsgoId = shipment?.id ?? null

    if (!shipsgoId) return res.status(200).json({ ok: true, ignored: 'brak id przesyłki' })

    const row = await findByShipsgoId(Number(shipsgoId))
    // Przesyłka spoza naszego rejestru (np. utworzona wprost w panelu ShipsGo)
    // nie jest błędem, po prostu nas nie dotyczy. 200, żeby nie generować ponowień.
    if (!row) return res.status(200).json({ ok: true, ignored: 'nieznana przesyłka' })

    if (event === 'OCEAN.SHIPMENTS.SHIPMENT_DELETED') {
      await markDiscarded(row.id, shipment?.discarded_at)
      return res.status(200).json({ ok: true })
    }

    // Domyślnie traktujemy zdarzenie jak SHIPMENT_UPDATED. Nadpisanie tymi samymi
    // danymi daje ten sam wiersz, więc powtórka jest bezpieczna.
    await persistShipment(row.id, shipment)
    return res.status(200).json({ ok: true })
  } catch (e) {
    // Zwracamy 200 mimo błędu po naszej stronie tylko wtedy, gdy podpis był
    // poprawny i problem jest nasz — inaczej ShipsGo ponawiałoby w kółko coś,
    // czego ponowienie nie naprawi. Błąd zostaje w logach.
    console.error('[tracking] blad przetwarzania webhooka:', e)
    return res.status(200).json({ ok: false })
  }
})

// ── Od tego miejsca wszystko wymaga zalogowania ─────────────────────────────
router.use(requireAuth)

// { code } → odpowiedź HTTP z przyjaznym komunikatem PL. Surowy status i treść
// odpowiedzi ShipsGo NIGDY nie trafiają do interfejsu (patrz describeShipsgoError).
function sendShipsgoError(res, code, retryAfter) {
  const { status, message } = describeShipsgoError(code)
  const payload = { error: message }
  if (retryAfter) payload.retryAfter = retryAfter
  return res.status(status).json(payload)
}

// ── Odświeżanie w locie przy odczycie ───────────────────────────────────────
// DLACZEGO TO TU JEST: pierwotnie zakładaliśmy, że aktualizacje wpycha webhook
// ShipsGo, więc odczyt czytał wyłącznie z bazy, a odpytywanie z przeglądarki
// tylko sprawdzało, czy coś już przyszło. Webhook wymaga jednak rocznej
// subskrypcji i nie został podłączony, przez co ta pętla nigdy nie miała czego
// znaleźć: kontener wisiał na „Pobieramy dane", choć ShipsGo znało już trasę.
//
// GET do ShipsGo NIE kosztuje kredytu (kredyt schodzi wyłącznie przy POST,
// patrz nagłówek api/_lib/shipsgo.js), więc odczyt może sam dociągnąć świeże
// dane. Częstotliwość ogranicza shouldPoll(): minuta dla rejsu czekającego na
// dane armatora, 5 minut dla rejsu w drodze. Limit jest NA REJS i pilnuje go
// serwer, więc dziesięć otwartych kart daje jedno zapytanie do ShipsGo, nie
// dziesięć, a przeglądarka może pytać nas tak często, jak wygodnie.
//
// Odświeżenie jest DODATKIEM do odczytu, nigdy jego warunkiem: brak dostępu,
// błąd sieci czy awaria ShipsGo mają zwrócić ostatnie znane dane, a nie zamienić
// działający odczyt w błąd.
const LIST_REFRESH_MAX = 5
const LIST_REFRESH_CONCURRENCY = 3

// pollAndSave() zwraca surowy wiersz rejsu, a odczyty per użytkownik dokładają
// `addedAt` z powiązania (to po nim lista pokazuje „8 minut temu"). Bez tego
// odświeżony wiersz gubiłby datę dodania i wracał do createdAt.
function keepUserFields(fresh, original) {
  return { ...fresh, addedAt: original.addedAt }
}

// Gdy odświeżenie sprawiło, że rejs stał się gotowy, powiadomienie ma pójść OD
// RAZU do wszystkich obserwujących, a nie czekać na nocne zadanie cykliczne.
// notifyContainerReady() jest idempotentne (pilnuje tego kolumna
// ready_notified_at), więc wołanie go przy każdym odświeżeniu jest bezpieczne.
// Nieudane powiadomienie nie może zepsuć odczytu, po który przyszedł user.
async function announceIfReady(row) {
  try {
    if (isContainerReady(row)) await notifyContainerReady(row)
  } catch (e) {
    console.error('[tracking] nie udalo sie wyslac powiadomienia o gotowosci:', row.containerNumber, e)
  }
}

async function refreshIfStale(userId, row) {
  if (!shouldPoll(row)) return row
  if (!(await hasShipsgoAccess(userId))) return row
  try {
    const fresh = keepUserFields(await pollAndSave(row), row)
    await announceIfReady(fresh)
    return fresh
  } catch (e) {
    console.error('[tracking] odswiezenie przy odczycie nie powiodlo sie:', row.containerNumber, e)
    return row
  }
}

// Lista: odświeżamy rejsy, którym minął odstęp, ale najwyżej LIST_REFRESH_MAX
// naraz, żeby wejście na listę nie czekało na kilkanaście zapytań sieciowych.
// Najdawniej sprawdzane idą pierwsze, więc przy dłuższej liście porcje rotują
// zamiast w kółko brać tych samych rekordów (ten sam wzorzec co w cronie).
// Rejsy czekające na dane armatora mają pierwszeństwo: to one wiszą userowi
// na ekranie jako „Pobieramy dane".
function pollOrder(a, b) {
  const awaiting = Number(isAwaitingCarrierData(b)) - Number(isAwaitingCarrierData(a))
  if (awaiting !== 0) return awaiting
  return new Date(a.lastPolledAt || 0) - new Date(b.lastPolledAt || 0)
}

async function refreshStaleRows(userId, rows) {
  const stale = rows.filter(shouldPoll).sort(pollOrder).slice(0, LIST_REFRESH_MAX)
  if (stale.length === 0) return rows
  if (!(await hasShipsgoAccess(userId))) return rows

  const freshById = new Map()
  await mapLimit(stale, LIST_REFRESH_CONCURRENCY, async (row) => {
    try {
      const fresh = keepUserFields(await pollAndSave(row), row)
      freshById.set(row.id, fresh)
      await announceIfReady(fresh)
    } catch (e) {
      console.error('[tracking] odswiezenie na liscie nie powiodlo sie:', row.containerNumber, e)
    }
  })
  return rows.map((r) => freshById.get(r.id) || r)
}

// ── Kształt odpowiedzi dla frontendu ────────────────────────────────────────
// Wiersz listy: tylko to, co widać w wierszu. Bez snapshotu i bez geojsona,
// żeby lista dziesięciu kontenerów nie ciągnęła megabajta trasy.
function toListItem(row) {
  const s = row.snapshot || {}
  return {
    // NASZE id rejsu. Potrzebne, bo numer kontenera wraca w kolejnych rejsach:
    // odnośnik z powiadomienia i oznaczanie powiadomienia jako przeczytane muszą
    // wskazywać jednoznacznie ten jeden transport.
    id: row.id,
    containerNumber: row.containerNumber,
    status: row.status,
    fetchState: row.fetchState,
    archived: isArchived(row),
    discardedAt: row.discardedAt,
    carrier: row.carrierName ? { scac: row.carrierScac, name: row.carrierName } : null,
    portOfLoading: s.loadingLocation || null,
    portOfDischarge: s.dischargeLocation || null,
    addedAt: row.addedAt || row.createdAt,
    updatedAt: row.updatedAt,
  }
}

function toDetail(row, previousVoyages = []) {
  return {
    ...toListItem(row),
    shipsgoId: row.shipsgoId,
    bookingNumber: row.bookingNumber,
    checkedAt: row.checkedAt,
    mapToken: row.mapToken,
    createdAt: row.createdAt,
    snapshot: row.snapshot || null,
    geojson: row.geojson || null,
    previousVoyages: previousVoyages.map((v) => ({
      containerNumber: v.containerNumber,
      status: v.status,
      discardedAt: v.discardedAt,
      createdAt: v.createdAt,
    })),
  }
}

// POST /api/tracking/containers — jedyna trasa, która może wydać kredyt.
router.post('/containers', async (req, res, next) => {
  try {
    const parsed = createContainerSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Nieprawidłowy numer kontenera' })
    }
    const { containerNumber, carrier, startNewVoyage } = parsed.data

    // Cyfra kontrolna: druga bramka po kształcie numeru, jeszcze przed
    // jakimkolwiek kontaktem z ShipsGo. Front sprawdza to samo (patrz
    // src/utils/containerNumber.js), ale backend nie ufa temu bez własnej
    // kontroli, bo to jedyne miejsce w integracji, gdzie numer pochodzi
    // wprost od użytkownika. Każdy odrzucony tutaj numer to oszczędzony kredyt.
    const check = validateContainerNumber(containerNumber)
    if (!check.ok) {
      return res.status(400).json({
        error: check.code === 'checksum'
          ? 'Ten numer kontenera nie przechodzi weryfikacji (norma ISO 6346). Sprawdź, czy wszystkie znaki zostały przepisane poprawnie.'
          : 'Nieprawidłowy format numeru kontenera (oczekiwane 4 litery + 7 cyfr, np. MSCU1234567).',
      })
    }

    // 1. Aktywny rejs w rejestrze: podepnij użytkownika i oddaj zapisane dane.
    //    Zero zapytań do ShipsGo, zero kredytów. Dotyczy to również sytuacji,
    //    gdy użytkownik wcześniej usunął ten kontener ze swojej listy —
    //    usunięcie było tylko ukryciem.
    const active = await findActiveByNumber(containerNumber)
    if (active) {
      const fresh = shouldPoll(active) ? await pollAndSave(active) : active
      await linkUser(req.userId, fresh.id)
      return res.json({ success: true, container: toDetail(fresh) })
    }

    // 2. Brak aktywnego, ale jest ARCHIWALNY (zakończony rejs): NIE twórz nowego
    //    śledzenia z automatu. Pokaż dane archiwalne z adnotacją i poczekaj na
    //    jawną decyzję użytkownika (startNewVoyage). Automatyczne utworzenie
    //    zużyłoby kredyt bez jego wiedzy, a pokazanie starej trasy bez adnotacji
    //    wyglądałoby jak bieżący transport.
    if (!startNewVoyage) {
      const archived = await findLatestArchivedByNumber(containerNumber)
      if (archived) {
        await linkUser(req.userId, archived.id)
        return res.json({ success: true, container: toDetail(archived), archived: true })
      }
    }

    // 3. Płatna ścieżka. Dostęp sprawdzamy DOPIERO tutaj, żeby odczyt istniejących
    //    danych działał także po wyłączeniu flagi.
    if (!(await ensureShipsgoAccess(req, res))) return

    const reservation = await reserveTracking(containerNumber)
    if (!reservation.created) {
      // Ktoś nas ubiegł między odczytem a rezerwacją (dwa kliknięcia w tej samej
      // sekundzie, dwie instancje serverless). Używamy jego wiersza.
      const row = reservation.row
      if (!row) return sendShipsgoError(res, 'UNKNOWN')
      await linkUser(req.userId, row.id)
      return res.json({ success: true, container: toDetail(row) })
    }

    // Limit kosztowy konsumujemy dopiero TU: przed nami jest już pewność, że to
    // realnie nowe, płatne utworzenie, a nie odczyt istniejącego śledzenia.
    const limit = tryConsumeLookup(req.userId)
    if (!limit.ok) {
      await releaseReservation(reservation.row.id)
      return res.status(429).json({ error: 'Zbyt wiele wyszukiwań w krótkim czasie', retryAfter: limit.retryAfter })
    }

    const { row, error, retryAfter } = await createAndSave(reservation.row, { containerNumber, carrier })
    if (error) {
      // createAndSave() zachowuje wiersz (fetchState:'failed') dla wyników
      // NIEJEDNOZNACZNYCH (kredyt mógł już zostać policzony), zamiast go
      // kasować - patrz obszerny komentarz w shipsgoSync.js. Bez podpięcia
      // usera taki wiersz byłby niewidoczny na liście mimo zapłaconego
      // kredytu (dokładnie to się stało 2026-08-06 z TLLU1080331/MMAU1351730,
      // zanim naprawiono ręcznie) - user nie widziałby nawet stanu „Błąd
      // utworzenia" i nie mógłby go usunąć.
      const kept = await findById(reservation.row.id)
      if (kept) await linkUser(req.userId, kept.id)
      return sendShipsgoError(res, error, retryAfter)
    }

    await linkUser(req.userId, row.id)
    res.json({ success: true, container: toDetail(row), created: true })
  } catch (e) {
    next(e)
  }
})

// GET /api/tracking/containers — lista kontenerów użytkownika (bez ukrytych).
// Czyta z bazy i po drodze dociąga rejsy, którym minął odstęp
// (patrz refreshStaleRows: darmowe GET-y, limit odstępu po stronie serwera).
router.get('/containers', async (req, res, next) => {
  try {
    const rows = await refreshStaleRows(req.userId, await listForUser(req.userId))
    // Rekordy archiwalne pod aktywne, w obrębie grupy najnowsze pierwsze
    // (listForUser sortuje już po addedAt malejąco).
    const items = rows.map(toListItem)
    const active = items.filter((i) => !i.archived)
    const archived = items.filter((i) => i.archived)
    res.json({ containers: [...active, ...archived] })
  } catch (e) {
    next(e)
  }
})

// Wspólne wczytanie rejsu po numerze z ścieżki. Brak dostępu = 404 (nie 403 —
// nie ujawniamy, że taki rekord w ogóle istnieje). Ten sam wzorzec co documentSets.js.
async function loadOwnContainer(req, res) {
  const parsed = containerNumberParam.safeParse(req.params.containerNumber)
  if (!parsed.success) {
    res.status(400).json({ error: 'Nieprawidłowy numer kontenera' })
    return null
  }
  const row = await findVisibleForUser(req.userId, parsed.data)
  if (!row) {
    res.status(404).json({ error: 'Nie znaleziono kontenera na Twojej liście' })
    return null
  }
  return row
}

// GET /api/tracking/containers/by-id/:trackingId — pełne dane rejsu wskazanego
// NASZYM id. Tędy wchodzi odnośnik z powiadomienia „kontener gotowy do śledzenia":
// ten sam numer kontenera potrafi mieć kilka rejsów, a powiadomienie dotyczy
// dokładnie jednego. Czyta wyłącznie z bazy, zero zapytań do ShipsGo.
// Zarejestrowane PRZED trasą z numerem, żeby kolejność dopasowania była oczywista.
router.get('/containers/by-id/:trackingId', async (req, res, next) => {
  try {
    const found = await findVisibleByIdForUser(req.userId, req.params.trackingId)
    if (!found) return res.status(404).json({ error: 'Nie znaleziono kontenera na Twojej liście' })
    const row = await refreshIfStale(req.userId, found)
    const previous = await listPreviousVoyages(req.userId, row.containerNumber, row.id)
    res.json({ container: toDetail(row, previous) })
  } catch (e) {
    next(e)
  }
})

// GET /api/tracking/containers/:containerNumber — pełne dane jednego rejsu
// (snapshot + geojson). To jest endpoint, który odpytuje przeglądarka, więc to
// TU dzieje się automatyczne odświeżanie: gdy minął odstęp, dociąga świeże dane
// z ShipsGo darmowym GET-em, zanim odpowie (patrz refreshIfStale).
router.get('/containers/:containerNumber', async (req, res, next) => {
  try {
    const found = await loadOwnContainer(req, res)
    if (!found) return
    const row = await refreshIfStale(req.userId, found)
    const previous = await listPreviousVoyages(req.userId, row.containerNumber, row.id)
    res.json({ container: toDetail(row, previous) })
  } catch (e) {
    next(e)
  }
})

// POST /api/tracking/containers/:containerNumber/refresh — ręczne odświeżenie.
// GET do ShipsGo (bez kredytu), zabezpieczenie na wypadek niedziałającego
// webhooka, nie podstawowy mechanizm aktualizacji. Cooldown 5 minut NA REJS,
// niezależnie od liczby użytkowników, którzy go śledzą.
router.post('/containers/:containerNumber/refresh', async (req, res, next) => {
  try {
    const row = await loadOwnContainer(req, res)
    if (!row) return
    if (!(await ensureShipsgoAccess(req, res))) return

    if (!row.shipsgoId) {
      return res.status(400).json({ error: 'Ten kontener nie ma jeszcze śledzenia w ShipsGo' })
    }
    if (isArchived(row)) {
      return res.status(400).json({ error: 'Rejs jest zakończony, jego dane nie są już aktualizowane' })
    }
    if (!canManualRefresh(row)) {
      return res.status(429).json({ error: 'Dane były odświeżane przed chwilą. Spróbuj ponownie za kilka minut.' })
    }

    const updated = await pollAndSave(row)
    const previous = await listPreviousVoyages(req.userId, updated.containerNumber, updated.id)
    res.json({ container: toDetail(updated, previous) })
  } catch (e) {
    next(e)
  }
})

// DELETE /api/tracking/containers/:containerNumber — ukrywa rejs na liście
// użytkownika. NIE woła DELETE w ShipsGo: tam usunięcie jest nieodwracalne,
// a ponowne dodanie to nowy kredyt. Dzięki temu ponowne wpisanie tego samego
// numeru przywraca wpis za darmo.
router.delete('/containers/:containerNumber', async (req, res, next) => {
  try {
    const row = await loadOwnContainer(req, res)
    if (!row) return
    await hideForUser(req.userId, row.id)
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
})

// GET /api/tracking/carriers — lista przewoźników do ręcznego wskazania
// w stanie „Bez śledzenia". NIE kosztuje kredytu. Cache w pamięci procesu:
// lista zmienia się rzadko, a limit 100 req/min jest współdzielony dla całej firmy.
let carriersCache = { data: null, at: 0 }
const CARRIERS_TTL_MS = 12 * 60 * 60 * 1000

router.get('/carriers', async (req, res, next) => {
  try {
    if (!(await ensureShipsgoAccess(req, res))) return

    if (carriersCache.data && Date.now() - carriersCache.at < CARRIERS_TTL_MS) {
      return res.json({ carriers: carriersCache.data })
    }
    const result = await getOceanCarriers()
    if (!result.success) return sendShipsgoError(res, result.code, result.retryAfter)

    carriersCache = { data: result.data, at: Date.now() }
    res.json({ carriers: result.data })
  } catch (e) {
    next(e)
  }
})

export default router
