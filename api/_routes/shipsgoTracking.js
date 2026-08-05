// api/_routes/shipsgoTracking.js
// Śledzenie kontenerów przez ShipsGo Ocean API — doczepione do istniejącej
// funkcji Express (limit funkcji serverless na Vercelu), mount w api/index.js.
//
// Cała integracja za flagą SHIPSGO_ENABLED (domyślnie wyłączona — mamy tylko
// 2 kredyty testowe i czekamy na wycenę). Container number NIGDY nie
// przychodzi w body żądania — bierzemy go WYŁĄCZNIE z zapisanego DocumentSet,
// żeby nikt nie mógł podesłać dowolnego numeru i zmarnować kredytu na coś
// spoza naszych danych.

import { Router } from 'express'
import { prisma } from '../_lib/prisma.js'
import { requireAuth } from '../_lib/auth.js'
import { createOceanShipment, getOceanShipment, trimShipmentData } from '../_lib/shipsgo.js'

const router = Router()

// Nie odpytuj ShipsGo ponownie, jeśli ONI SAMI sprawdzili dane mniej niż
// godzinę temu (checked_at) — kolejne zapytanie i tak zwróciłoby to samo.
const CHECKED_AT_FRESH_MS = 60 * 60 * 1000

function isEnabled() {
  return !!process.env.SHIPSGO_ENABLED && !!process.env.SHIPSGO_API_TOKEN
}

// GET /api/shipsgo-tracking/status — bez auth (nic wrażliwego), frontend pyta
// raz przy wejściu w szczegóły przesyłki, żeby wiedzieć czy pokazywać przycisk.
router.get('/status', (_req, res) => {
  res.json({ enabled: isEnabled() })
})

router.use(requireAuth)

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

// POST /api/shipsgo-tracking/:documentSetId/enable — tworzy śledzenie.
// KOSZTUJE KREDYT — wywoływane WYŁĄCZNIE na świadomy klik „Włącz śledzenie",
// nigdy automatycznie. Idempotentne: jeśli set już ma zapisane shipsgo.id,
// nic nie wołamy (chroni przed podwójnym kliknięciem/race conditionem).
router.post('/:documentSetId/enable', async (req, res, next) => {
  try {
    if (!isEnabled()) return res.status(503).json({ error: 'Śledzenie ShipsGo jest wyłączone' })

    const set = await loadOwnedSet(req, res)
    if (!set) return

    const existing = set.meta?.shipment?.shipsgo
    if (existing?.id) {
      return res.json({ success: true, alreadyEnabled: true, shipsgo: existing })
    }

    const containerNo = set.meta?.shipment?.containerNo
    if (!containerNo) {
      return res.status(400).json({ error: 'Zestaw nie ma numeru kontenera' })
    }

    const result = await createOceanShipment({ reference: set.id, containerNumber: containerNo })
    if (!result.success) {
      return res.status(502).json({ error: result.error || 'ShipsGo nie odpowiedziało' })
    }

    // Duplikat (409) może nie nieść pełnych danych w ciele odpowiedzi —
    // wtedy nie mamy jeszcze `id` do zapisania i klient musi kliknąć „Odśwież"
    // po tym, jak sami dociągniemy śledzenie po stronie ShipsGo (rzadki brzeg).
    if (!result.data?.id) {
      return res.json({ success: true, alreadyEnabled: result.alreadyExists, shipsgo: null })
    }

    const snapshot = trimShipmentData(result.data)
    await saveShipsgoSnapshot(set, snapshot)
    res.json({ success: true, alreadyEnabled: result.alreadyExists, shipsgo: snapshot })
  } catch (e) {
    next(e)
  }
})

// GET /api/shipsgo-tracking/:documentSetId/refresh — dociąga świeże dane.
// NIE kosztuje kredytu, ale i tak respektujemy checked_at (patrz CHECKED_AT_FRESH_MS)
// — po co odpytywać ponownie, jeśli ShipsGo sam jeszcze nie zdążył sprawdzić.
router.get('/:documentSetId/refresh', async (req, res, next) => {
  try {
    if (!isEnabled()) return res.status(503).json({ error: 'Śledzenie ShipsGo jest wyłączone' })

    const set = await loadOwnedSet(req, res)
    if (!set) return

    const existing = set.meta?.shipment?.shipsgo
    if (!existing?.id) {
      return res.status(400).json({ error: 'Śledzenie nie zostało jeszcze włączone dla tego zestawu' })
    }

    const checkedAt = existing.checkedAt ? new Date(existing.checkedAt).getTime() : 0
    if (Date.now() - checkedAt < CHECKED_AT_FRESH_MS) {
      return res.json({ success: true, fresh: false, shipsgo: existing })
    }

    const result = await getOceanShipment(existing.id)
    if (!result.success) {
      return res.status(502).json({ error: result.error || 'ShipsGo nie odpowiedziało' })
    }

    const snapshot = trimShipmentData(result.data)
    await saveShipsgoSnapshot(set, snapshot)
    res.json({ success: true, fresh: true, shipsgo: snapshot })
  } catch (e) {
    next(e)
  }
})

export default router
