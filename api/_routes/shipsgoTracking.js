// api/_routes/shipsgoTracking.js
// Śledzenie kontenerów przez ShipsGo Ocean API — doczepione do istniejącej
// funkcji Express (limit funkcji serverless na Vercelu), mount w api/index.js.
//
// Cała integracja za flagą SHIPSGO_ENABLED (domyślnie wyłączona — mamy tylko
// 2 kredyty testowe i czekamy na wycenę). DODATKOWO, dopóki nie wykupimy
// pakietu, dostęp jest zawężony do SHIPSGO_ALLOWED_EMAILS (lista adresów po
// przecinku) — nawet gdy SHIPSGO_ENABLED=true na produkcji, zwykli userzy nie
// zobaczą przycisku. Pusta/nieustawiona SHIPSGO_ALLOWED_EMAILS = brak
// zawężenia (otwarte dla wszystkich, po wykupieniu pakietu wystarczy ją wyczyścić).
//
// ── OCHRONA KREDYTÓW (najważniejsza rzecz w tym pliku) ──────────────────────
// Kredyt ShipsGo płaci się za UTWORZENIE śledzenia, a to samo pudło da się
// sprawdzić dwiema ścieżkami: wyszukiwarką („Numer kontenera") i przyciskiem
// „Włącz śledzenie" na własnej przesyłce. Dlatego OBIE ścieżki przechodzą przez
// ten sam, TRWAŁY rejestr per numer kontenera (container_tracking, patrz
// api/_lib/containerTrackingRepo.js) i wysyłają do ShipsGo tę samą referencję
// (containerReference). Wcześniej każda ścieżka miała własną referencję i własny
// cache w pamięci procesu, przez co ten sam kontener bywał tworzony (i płacony)
// dwa razy — potwierdzone na koncie ShipsGo dla MMAU1313642 (2026-08-05).
//
// Numer kontenera dla /enable i /refresh NIGDY nie przychodzi w body żądania —
// bierzemy go WYŁĄCZNIE z zapisanego DocumentSet. Wyjątek świadomy: /lookup
// PRZYJMUJE numer wpisany przez usera (to jego cel), a chronią go: allowlist,
// walidacja ISO 6346, wspólny rejestr powyżej i osobny rate-limit.

import { Router } from 'express'
import { prisma } from '../_lib/prisma.js'
import { requireAuth } from '../_lib/auth.js'
import {
  createOceanShipment,
  getOceanShipment,
  getShipmentGeojson,
  trimShipmentData,
  trimGeojson,
  describeShipsgoError,
  isPermanentError,
  containerReference,
} from '../_lib/shipsgo.js'
import { isValidContainerNumber } from '../_lib/containerChecksum.js'
import { lookupSchema } from '../_validation/shipsgoTracking.js'
import { tryConsumeLookup } from '../_lib/shipsgoRateLimit.js'
import {
  getTracking,
  reserveTracking,
  saveSnapshot,
  markFailed,
  releaseReservation,
  shouldPoll,
} from '../_lib/containerTrackingRepo.js'

const router = Router()

function isEnabled() {
  // Zmienne środowiskowe są zawsze stringiem — !!process.env.SHIPSGO_ENABLED
  // byłoby prawdą też dla stringa "false" (patrz .env.example). Porównanie
  // z 'true' jest tu celowo dosłowne.
  return process.env.SHIPSGO_ENABLED === 'true' && !!process.env.SHIPSGO_API_TOKEN
}

function getAllowedEmails() {
  return (process.env.SHIPSGO_ALLOWED_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

// Brak/pusta lista = brak zawężenia (wszyscy userzy, docelowy stan po wykupieniu
// pakietu). Niepusta lista = tylko dopasowane adresy e-mail (case-insensitive).
async function isUserAllowed(userId) {
  const allowed = getAllowedEmails()
  if (allowed.length === 0) return true
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
  return !!user && allowed.includes(user.email.toLowerCase())
}

// Wszystkie trasy (także /status) wymagają zalogowania — /status musi znać
// usera, żeby sprawdzić SHIPSGO_ALLOWED_EMAILS, więc nie może być publiczna.
router.use(requireAuth)

// Wspólna bramka dla tras, które mogą sięgnąć do ShipsGo.
async function ensureAccess(req, res) {
  if (!isEnabled()) {
    res.status(503).json({ error: 'Śledzenie ShipsGo jest wyłączone' })
    return false
  }
  if (!(await isUserAllowed(req.userId))) {
    res.status(403).json({ error: 'Brak dostępu' })
    return false
  }
  return true
}

// GET /api/shipsgo-tracking/status — frontend pyta raz przy wejściu w
// szczegóły przesyłki, żeby wiedzieć czy pokazywać przycisk. `enabled` tu
// znaczy „włączone I dostępne dla TEGO usera" — dwa różne powody (flaga
// globalna / allowlist) dają ten sam wynik z frontu, nie ma potrzeby ich rozróżniać.
router.get('/status', async (req, res, next) => {
  try {
    if (!isEnabled()) return res.json({ enabled: false })
    res.json({ enabled: await isUserAllowed(req.userId) })
  } catch (e) {
    next(e)
  }
})

// Cudzy/nieistniejący set = 404 (nie ujawniamy istnienia) — ten sam wzorzec co documentSets.js.
async function loadOwnedSet(req, res) {
  const set = await prisma.documentSet.findFirst({
    where: { id: req.params.documentSetId, userId: req.userId },
  })
  if (!set) {
    res.status(404).json({ error: 'Nie znaleziono zestawu' })
    return null
  }
  return set
}

// Scala meta.shipment.shipsgo z resztą meta (PATCH-owy update Prisma nadpisuje
// `meta` w całości, więc scalamy ręcznie — ten sam wzorzec co markDelivered
// po stronie frontendu, tylko tu bezpośrednio na Prisma, bo jesteśmy już w API).
async function saveShipsgoSnapshot(set, snapshot) {
  const meta = {
    ...set.meta,
    shipment: { ...set.meta?.shipment, shipsgo: snapshot },
  }
  return prisma.documentSet.update({ where: { id: set.id }, data: { meta } })
}

// { code } → odpowiedź HTTP z przyjaznym komunikatem PL (nigdy surowy status/treść
// ShipsGo — patrz describeShipsgoError). Jedno miejsce dla wszystkich tras.
function sendShipsgoError(res, code) {
  const { status, message } = describeShipsgoError(code)
  return res.status(status).json({ error: message })
}

// Dociąga trasę (GeoJSON). NIE kosztuje kredytu, więc brak wyniku nie blokuje
// odpowiedzi: front dostaje resztę danych, a mapa spada na fallback tekstowy.
async function fetchGeojsonSafe(id) {
  const result = await getShipmentGeojson(id)
  if (!result.success) return null
  return trimGeojson(result.data)
}

// Kształt odpowiedzi WSPÓLNY dla /lookup, /enable i /refresh — front ma jeden
// zestaw stanów do obsłużenia niezależnie od tego, którą ścieżką przyszedł.
//   status: 'ready'   → `shipsgo` niesie dane do wyświetlenia
//           'pending' → utworzone w ShipsGo, dane jeszcze nie gotowe; wróć później
//           'failed'  → ShipsGo trwale odrzuciło ten numer
function trackingResponse(row) {
  return {
    success: true,
    status: row.status,
    shipsgo: row.snapshot ?? null,
    createdAt: row.createdAt,
    lastPolledAt: row.lastPolledAt,
  }
}

// Odpytuje ShipsGo o istniejące śledzenie i zapisuje wynik (GET, bez kredytu).
// Zwraca zaktualizowany wiersz albo, przy błędzie przejściowym, ten sprzed próby
// — user zobaczy wtedy ostatnie znane dane zamiast błędu.
async function pollAndSave(row) {
  const result = await getOceanShipment(row.shipsgoId)
  if (!result.success) {
    if (isPermanentError(result.code)) return markFailed(row.containerNo, result.code)
    return row
  }
  const snapshot = trimShipmentData(result.data)
  if (snapshot) snapshot.geojson = await fetchGeojsonSafe(row.shipsgoId)
  return saveSnapshot(row.containerNo, result.data?.id ?? row.shipsgoId, snapshot)
}

// Tworzy śledzenie w ShipsGo. KOSZTUJE KREDYT. Wywoływane WYŁĄCZNIE gdy
// reserveTracking() potwierdziło, że tego kontenera jeszcze u nas nie ma.
// Zwraca wiersz albo { error } z kodem do pokazania userowi.
async function createAndSave(containerNo) {
  const result = await createOceanShipment({
    reference: containerReference(containerNo),
    containerNumber: containerNo,
  })

  if (!result.success) {
    // Trwały błąd zostaje w bazie jako `failed` (nie próbuj w kółko), przejściowy
    // kasuje rezerwację, żeby pusty wiersz nie zablokował kontenera na zawsze.
    if (isPermanentError(result.code)) {
      await markFailed(containerNo, result.code)
    } else {
      await releaseReservation(containerNo)
    }
    return { error: result.code }
  }

  const shipsgoId = result.data?.id ?? null
  const snapshot = shipsgoId ? trimShipmentData(result.data) : null
  if (snapshot) snapshot.geojson = await fetchGeojsonSafe(shipsgoId)
  return { row: await saveSnapshot(containerNo, shipsgoId, snapshot) }
}

// Wspólny rdzeń dla /lookup i /enable: zwraca istniejące dane, dopytuje ShipsGo
// gdy wypada, a płatne utworzenie robi TYLKO gdy tego kontenera nie ma jeszcze
// w rejestrze. `allowCreate=false` pozwala odczytać stan bez ryzyka opłaty.
async function resolveTracking(containerNo, { allowCreate, onBeforeCreate }) {
  const existing = await getTracking(containerNo)

  if (existing) {
    const row = shouldPoll(existing) ? await pollAndSave(existing) : existing
    return { row }
  }

  if (!allowCreate) return { row: null }

  const reservation = await reserveTracking(containerNo)
  if (!reservation.created) {
    // Ktoś nas ubiegł między odczytem a rezerwacją — użyj jego wiersza.
    return { row: reservation.row }
  }

  // Limit kosztowy konsumujemy dopiero TU: przed nami jest już pewność, że to
  // realnie nowe, płatne utworzenie, a nie odczyt istniejącego śledzenia.
  if (onBeforeCreate) {
    const gate = await onBeforeCreate()
    if (!gate.ok) {
      await releaseReservation(containerNo)
      return { gateError: gate }
    }
  }

  return createAndSave(containerNo)
}

// POST /api/shipsgo-tracking/:documentSetId/enable — włącza śledzenie dla
// własnej przesyłki. Może kosztować kredyt, ale tylko gdy tego kontenera nie ma
// jeszcze w rejestrze (np. sprawdzonego wcześniej wyszukiwarką).
router.post('/:documentSetId/enable', async (req, res, next) => {
  try {
    if (!(await ensureAccess(req, res))) return

    const set = await loadOwnedSet(req, res)
    if (!set) return

    const containerNo = set.meta?.shipment?.containerNo
    if (!containerNo) {
      return res.status(400).json({ error: 'Zestaw nie ma numeru kontenera' })
    }

    // Bramka PRZED wysłaniem czegokolwiek do ShipsGo (kosztuje kredyt) — numer
    // zapisany w zestawie mógł być literówką z kreatora, której nikt nie poprawił
    // (ContainerTrackerBlock tylko OSTRZEGA w UI, nie blokuje zapisu formularza).
    if (!isValidContainerNumber(containerNo)) {
      return res.status(400).json({ error: 'Numer kontenera w tym zestawie nie przechodzi walidacji ISO 6346 (błędna cyfra kontrolna). Popraw go w edycji zestawu.' })
    }

    const { row, error } = await resolveTracking(containerNo, { allowCreate: true })
    if (error) return sendShipsgoError(res, error)

    // Zestaw dostaje kopię migawki, żeby lista przesyłek i szczegóły działały
    // bez odpytywania rejestru per wpis (i żeby migawka audytowa była kompletna).
    if (row.snapshot) await saveShipsgoSnapshot(set, row.snapshot)

    res.json(trackingResponse(row))
  } catch (e) {
    next(e)
  }
})

// GET /api/shipsgo-tracking/:documentSetId/refresh — dociąga świeże dane.
// NIE kosztuje kredytu i NIGDY nie tworzy nowego śledzenia (allowCreate:false):
// jeśli tego kontenera nie ma w rejestrze, user musi świadomie kliknąć „Włącz".
router.get('/:documentSetId/refresh', async (req, res, next) => {
  try {
    if (!(await ensureAccess(req, res))) return

    const set = await loadOwnedSet(req, res)
    if (!set) return

    const containerNo = set.meta?.shipment?.containerNo
    if (!containerNo) {
      return res.status(400).json({ error: 'Zestaw nie ma numeru kontenera' })
    }

    const { row } = await resolveTracking(containerNo, { allowCreate: false })
    if (!row) {
      return res.status(400).json({ error: 'Śledzenie nie zostało jeszcze włączone dla tego zestawu' })
    }

    if (row.snapshot) await saveShipsgoSnapshot(set, row.snapshot)

    res.json(trackingResponse(row))
  } catch (e) {
    next(e)
  }
})

// POST /api/shipsgo-tracking/lookup — wolne wyszukiwanie po numerze kontenera
// wpisanym w zakładce „Numer kontenera" (nie wymaga zapisanego DocumentSet).
// Kolejność bramek: dostęp → kształt numeru → cyfra kontrolna → rejestr →
// dopiero na końcu rate-limit i płatne utworzenie (patrz onBeforeCreate), żeby
// odczyt istniejącego śledzenia nigdy nie zużywał limitu ani kredytu.
router.post('/lookup', async (req, res, next) => {
  try {
    if (!(await ensureAccess(req, res))) return

    const parsed = lookupSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Nieprawidłowy numer kontenera' })
    }
    const containerNo = parsed.data.containerNumber

    // Kształt (4 litery + 7 cyfr) już sprawdzony przez lookupSchema — tu dokładamy
    // cyfrę kontrolną. Front i tak nie woła tego endpointu przy błędnej cyfrze
    // (patrz ContainerLookup.jsx), ale backend nie ufa temu bez własnej bramki —
    // to jedyne miejsce w całej integracji, gdzie numer pochodzi wprost od usera.
    if (!isValidContainerNumber(containerNo)) {
      return res.status(400).json({ error: 'Nieprawidłowa cyfra kontrolna numeru kontenera (norma ISO 6346). Sprawdź, czy numer jest wpisany poprawnie.' })
    }

    const { row, error, gateError } = await resolveTracking(containerNo, {
      allowCreate: true,
      onBeforeCreate: async () => {
        const limit = tryConsumeLookup(req.userId)
        return limit.ok ? { ok: true } : { ok: false, retryAfter: limit.retryAfter }
      },
    })

    if (gateError) {
      return res.status(429).json({ error: 'Zbyt wiele wyszukiwań w krótkim czasie', retryAfter: gateError.retryAfter })
    }
    if (error) return sendShipsgoError(res, error)

    res.json(trackingResponse(row))
  } catch (e) {
    next(e)
  }
})

export default router
