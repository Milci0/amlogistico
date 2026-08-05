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
// Numer kontenera dla /enable i /refresh NIGDY nie przychodzi w body żądania —
// bierzemy go WYŁĄCZNIE z zapisanego DocumentSet. Wyjątek świadomy: /lookup
// (zakładka „Numer kontenera") PRZYJMUJE dowolny numer wpisany przez usera —
// to jego cel (wolne wyszukiwanie). Ochronę kosztową dla /lookup dają: ten sam
// allowlist co reszta, walidacja kształtu (ISO 6346), cache po numerze i osobny,
// twardszy rate-limit (patrz api/_lib/shipsgoRateLimit.js) — bo tu KAŻDY
// dopuszczony user może odpytać o CUDZY kontener, nie tylko swój zapisany.

import { Router } from 'express'
import { prisma } from '../_lib/prisma.js'
import { requireAuth } from '../_lib/auth.js'
import { createOceanShipment, getOceanShipment, trimShipmentData } from '../_lib/shipsgo.js'
import { lookupSchema } from '../_validation/shipsgoTracking.js'
import { tryConsumeLookup } from '../_lib/shipsgoRateLimit.js'

const router = Router()

// Nie odpytuj ShipsGo ponownie, jeśli ONI SAMI sprawdzili dane mniej niż
// godzinę temu (checked_at) — kolejne zapytanie i tak zwróciłoby to samo.
const CHECKED_AT_FRESH_MS = 60 * 60 * 1000

// Cache wyników /lookup po znormalizowanym numerze kontenera (NIE per-user —
// jeśli dwóch userów sprawdza ten sam kontener, drugi dostaje ten sam wynik za
// darmo, bez nowego zapytania do ShipsGo). TTL jak CHECKED_AT_FRESH_MS z tego
// samego powodu. Best-effort w pamięci procesu (patrz uwaga w shipsgoRateLimit.js).
const lookupCache = new Map()

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

// GET /api/shipsgo-tracking/status — frontend pyta raz przy wejściu w
// szczegóły przesyłki, żeby wiedzieć czy pokazywać przycisk. `enabled` tu
// znaczy „włączone I dostępne dla TEGO usera" — dwa różne powody (flaga
// globalna / allowlist) dają ten sam wynik z frontu, nie ma potrzeby ich rozróżniać.
router.get('/status', async (req, res, next) => {
  try {
    if (!isEnabled()) return res.json({ enabled: false })
    const allowed = await isUserAllowed(req.userId)
    res.json({ enabled: allowed })
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

// POST /api/shipsgo-tracking/:documentSetId/enable — tworzy śledzenie.
// KOSZTUJE KREDYT — wywoływane WYŁĄCZNIE na świadomy klik „Włącz śledzenie",
// nigdy automatycznie. Idempotentne: jeśli set już ma zapisane shipsgo.id,
// nic nie wołamy (chroni przed podwójnym kliknięciem/race conditionem).
router.post('/:documentSetId/enable', async (req, res, next) => {
  try {
    if (!isEnabled()) return res.status(503).json({ error: 'Śledzenie ShipsGo jest wyłączone' })
    if (!(await isUserAllowed(req.userId))) return res.status(403).json({ error: 'Brak dostępu' })

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
    if (!(await isUserAllowed(req.userId))) return res.status(403).json({ error: 'Brak dostępu' })

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

// POST /api/shipsgo-tracking/lookup — wolne wyszukiwanie po numerze kontenera
// wpisanym w zakładce „Numer kontenera" (nie wymaga zapisanego DocumentSet).
// KOSZTUJE KREDYT przy pierwszym sprawdzeniu danego kontenera (poza duplikatem
// po stronie ShipsGo, który jest darmowy) — dlatego kolejność bramek: allowlist
// → kształt numeru → CACHE → dopiero na końcu rate-limit + realne wywołanie,
// żeby trafienie w cache nigdy nie zużywało limitu.
router.post('/lookup', async (req, res, next) => {
  try {
    if (!isEnabled()) return res.status(503).json({ error: 'Śledzenie ShipsGo jest wyłączone' })
    if (!(await isUserAllowed(req.userId))) return res.status(403).json({ error: 'Brak dostępu' })

    const parsed = lookupSchema.safeParse(req.body)
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Nieprawidłowy numer kontenera' })
    }
    const containerNo = parsed.data.containerNumber

    const cached = lookupCache.get(containerNo)
    if (cached && cached.expires > Date.now()) {
      return res.json({ success: true, cached: true, shipsgo: cached.data })
    }

    const limit = tryConsumeLookup(req.userId)
    if (!limit.ok) {
      return res.status(429).json({ error: 'Zbyt wiele wyszukiwań w krótkim czasie', retryAfter: limit.retryAfter })
    }

    const result = await createOceanShipment({ reference: `freeform-${containerNo}`, containerNumber: containerNo })
    if (!result.success) {
      return res.status(502).json({ error: result.error || 'ShipsGo nie odpowiedziało' })
    }

    // Duplikat (409) bez pełnych danych w ciele — rzadki brzeg (patrz komentarz
    // w createOceanShipment). Nie mamy `id`, więc nie ma czego cache'ować ani
    // zwrócić — front prosi usera o ponowną próbę za chwilę.
    if (!result.data?.id) {
      return res.json({ success: true, cached: false, shipsgo: null, pending: true })
    }

    const snapshot = trimShipmentData(result.data)
    lookupCache.set(containerNo, { data: snapshot, expires: Date.now() + CHECKED_AT_FRESH_MS })
    res.json({ success: true, cached: false, shipsgo: snapshot })
  } catch (e) {
    next(e)
  }
})

export default router
