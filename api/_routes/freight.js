import express from 'express'
import { getFreightosRates, getFallbackRates } from '../_lib/freightos.js'

const router = express.Router()

// ── Stawki frachtowe — proxy do Freightos + cache ─────────────────────────────
//
// Freightos ma limit ok. 100 zapytań/h per IP, więc każdą trasę trzymamy w cache
// przez 5 minut. W odróżnieniu od /api/news (jeden wspólny payload) cache jest tu
// kluczowany po trasie, więc trzymamy Mapę wpisów zamiast jednego obiektu.

const CACHE_TTL = 5 * 60 * 1000
const cache = new Map()

function cacheKey({ origin, destination, loadtype, quantity }) {
  return `${origin}_${destination}_${loadtype}_${quantity ?? 1}`
}

// Wspólna logika dla POST i GET — obie trasy zwracają ten sam kształt odpowiedzi:
// { success, source, cached, rates, error }
async function handleQuotes(params, res) {
  if (!params.origin || !params.destination || !params.loadtype) {
    return res.status(400).json({
      success: false,
      error: 'Brakuje wymaganych pól: origin, destination, loadtype',
    })
  }

  const key = cacheKey(params)
  const hit = cache.get(key)
  if (hit && hit.expires > Date.now()) {
    return res.json({ ...hit.data, cached: true })
  }

  const result = await getFreightosRates(params)

  // Freightos milczy lub nie pokrywa trasy → spróbuj lokalnej tabeli.
  if (!result.success || result.rates.length === 0) {
    const fallback = getFallbackRates(params.origin, params.destination)
    if (fallback.length > 0) {
      const data = { success: true, source: 'fallback', cached: false, rates: fallback, error: null }
      cache.set(key, { data, expires: Date.now() + CACHE_TTL })
      return res.json(data)
    }
    // Status 200 — brak pokrycia trasy to nie błąd serwera. Nie cache'ujemy pustki,
    // żeby kolejne żądanie spróbowało ponownie (tak samo jak diesel.js/ecb.js).
    return res.json({
      success: false,
      source: 'freightos',
      cached: false,
      rates: [],
      error: result.error ?? 'Brak wyników dla tej trasy',
    })
  }

  const data = { success: true, source: 'freightos', cached: false, rates: result.rates, error: null }
  cache.set(key, { data, expires: Date.now() + CACHE_TTL })
  res.json(data)
}

// POST /api/freight/quotes — pełne zapytanie, parametry w body
router.post('/quotes', async (req, res) => {
  try {
    const b = req.body ?? {}
    await handleQuotes({
      origin:      b.origin,
      destination: b.destination,
      loadtype:    b.loadtype,
      weight:      Number(b.weight) || 10000,
      quantity:    Number(b.quantity) || 1,
      estimate:    b.estimate ?? true,
    }, res)
  } catch (e) {
    console.error('[freight] POST /quotes nie powiodło się:', e)
    res.status(500).json({ success: false, rates: [], error: 'Wewnętrzny błąd serwera' })
  }
})

// GET /api/freight/quotes — szybki szacunek, parametry w query stringu
// np. ?origin=PLGDN&destination=USNWK&loadtype=container20&weight=15000
router.get('/quotes', async (req, res) => {
  try {
    const q = req.query
    await handleQuotes({
      origin:      q.origin,
      destination: q.destination,
      loadtype:    q.loadtype,
      weight:      Number(q.weight) || 10000,
      quantity:    Number(q.quantity) || 1,
      estimate:    true, // GET zawsze w trybie szacunku
    }, res)
  } catch (e) {
    console.error('[freight] GET /quotes nie powiodło się:', e)
    res.status(500).json({ success: false, rates: [], error: 'Wewnętrzny błąd serwera' })
  }
})

export default router
