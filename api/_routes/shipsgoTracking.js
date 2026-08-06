// api/_routes/shipsgoTracking.js — śledzenie ShipsGo doczepione do WŁASNEJ
// przesyłki użytkownika (zakładka „Lista przesyłek", przycisk „Włącz śledzenie").
// Wolne wyszukiwanie po numerze kontenera mieszka osobno, w api/_routes/tracking.js.
//
// Cała integracja za flagą SHIPSGO_ENABLED + allowlistą SHIPSGO_ALLOWED_EMAILS
// (patrz api/_lib/shipsgoAccess.js).
//
// ── OCHRONA KREDYTÓW ────────────────────────────────────────────────────────
// Kredyt ShipsGo płaci się za UTWORZENIE śledzenia, a to samo pudło da się
// sprawdzić dwiema ścieżkami: wyszukiwarką („Numer kontenera") i tym przyciskiem.
// Dlatego OBIE ścieżki przechodzą przez ten sam, TRWAŁY rejestr per rejs
// (container_tracking, patrz api/_lib/containerTrackingRepo.js) i tę samą
// funkcję tworzącą (api/_lib/shipsgoSync.js). Wcześniej każda ścieżka miała
// własny cache w pamięci procesu, przez co ten sam kontener bywał tworzony
// (i płacony) dwa razy — potwierdzone na koncie ShipsGo dla MMAU1313642
// (2026-08-05).
//
// Numer kontenera dla /enable i /refresh NIGDY nie przychodzi w body żądania —
// bierzemy go WYŁĄCZNIE z zapisanego DocumentSet.

import { Router } from 'express'
import { prisma } from '../_lib/prisma.js'
import { requireAuth } from '../_lib/auth.js'
import { isShipsgoEnabled, isUserAllowed, ensureShipsgoAccess } from '../_lib/shipsgoAccess.js'
import { describeShipsgoError } from '../_lib/shipsgo.js'
import { resolveTracking } from '../_lib/shipsgoSync.js'
import { isValidContainerNumber } from '../_lib/containerChecksum.js'
import { linkUser } from '../_lib/containerTrackingRepo.js'

const router = Router()

// Wszystkie trasy (także /status) wymagają zalogowania — /status musi znać
// usera, żeby sprawdzić SHIPSGO_ALLOWED_EMAILS, więc nie może być publiczna.
router.use(requireAuth)

// GET /api/shipsgo-tracking/status — frontend pyta raz przy wejściu w
// szczegóły przesyłki, żeby wiedzieć czy pokazywać przycisk. `enabled` tu
// znaczy „włączone I dostępne dla TEGO usera" — dwa różne powody (flaga
// globalna / allowlist) dają ten sam wynik z frontu, nie ma potrzeby ich rozróżniać.
router.get('/status', async (req, res, next) => {
  try {
    if (!isShipsgoEnabled()) return res.json({ enabled: false })
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
//
// Do zestawu trafia snapshot Z DOKLEJONĄ trasą: zakładka „Lista przesyłek"
// czyta geojson spod `meta.shipment.shipsgo.geojson` (patrz RealShipmentDetail),
// a w rejestrze rejsów trasa siedzi w osobnej kolumnie.
async function saveShipsgoSnapshot(set, row) {
  const shipsgo = { ...row.snapshot, geojson: row.geojson ?? null }
  const meta = {
    ...set.meta,
    shipment: { ...set.meta?.shipment, shipsgo },
  }
  return prisma.documentSet.update({ where: { id: set.id }, data: { meta } })
}

// { code } → odpowiedź HTTP z przyjaznym komunikatem PL (nigdy surowy status/treść
// ShipsGo — patrz describeShipsgoError). Jedno miejsce dla wszystkich tras.
function sendShipsgoError(res, code, retryAfter) {
  const { status, message } = describeShipsgoError(code)
  const payload = { error: message }
  if (retryAfter) payload.retryAfter = retryAfter
  return res.status(status).json(payload)
}

// Kształt odpowiedzi WSPÓLNY dla /enable i /refresh — front ma jeden zestaw
// stanów do obsłużenia niezależnie od tego, którą ścieżką przyszedł.
//   status: 'ready'   → `shipsgo` niesie dane do wyświetlenia
//           'pending' → utworzone w ShipsGo, dane jeszcze nie gotowe; wróć później
//           'failed'  → ShipsGo trwale odrzuciło ten numer
function trackingResponse(row) {
  return {
    success: true,
    status: row.fetchState,
    shipsgo: row.snapshot ? { ...row.snapshot, geojson: row.geojson ?? null } : null,
    createdAt: row.createdAt,
    lastPolledAt: row.lastPolledAt,
  }
}

// POST /api/shipsgo-tracking/:documentSetId/enable — włącza śledzenie dla
// własnej przesyłki. Może kosztować kredyt, ale tylko gdy dla tego kontenera
// nie ma jeszcze aktywnego rejsu (np. sprawdzonego wcześniej wyszukiwarką).
router.post('/:documentSetId/enable', async (req, res, next) => {
  try {
    if (!(await ensureShipsgoAccess(req, res))) return

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

    const normalized = containerNo.toUpperCase().replace(/[\s-]/g, '')
    const { row, error, retryAfter } = await resolveTracking(normalized, { allowCreate: true })
    if (error) return sendShipsgoError(res, error, retryAfter)

    // Właściciel zestawu widzi ten rejs także w zakładce „Numer kontenera" —
    // to ten sam transport, więc nie ma powodu, żeby wpisywał numer ponownie.
    await linkUser(req.userId, row.id)

    // Zestaw dostaje kopię migawki, żeby lista przesyłek i szczegóły działały
    // bez odpytywania rejestru per wpis (i żeby migawka audytowa była kompletna).
    if (row.snapshot) await saveShipsgoSnapshot(set, row)

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
    if (!(await ensureShipsgoAccess(req, res))) return

    const set = await loadOwnedSet(req, res)
    if (!set) return

    const containerNo = set.meta?.shipment?.containerNo
    if (!containerNo) {
      return res.status(400).json({ error: 'Zestaw nie ma numeru kontenera' })
    }

    const normalized = containerNo.toUpperCase().replace(/[\s-]/g, '')
    const { row } = await resolveTracking(normalized, { allowCreate: false })
    if (!row) {
      return res.status(400).json({ error: 'Śledzenie nie zostało jeszcze włączone dla tego zestawu' })
    }

    if (row.snapshot) await saveShipsgoSnapshot(set, row)

    res.json(trackingResponse(row))
  } catch (e) {
    next(e)
  }
})

export default router
