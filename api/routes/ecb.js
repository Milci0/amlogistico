import express from 'express'

const router = express.Router()

// ── Stopa referencyjna EBC (main refinancing operations) ──────────────────────
//
// ECB SDMX API (bez klucza). Seria FM.B.U2.EUR.4F.KR.MRR_FR.LEV = poziom stopy MRO.
// Format csvdata, ostatnia obserwacja. Dane publiczne na licencji CC BY 4.0.
//
// CSV ma stałe kolumny: TIME_PERIOD i OBS_VALUE występują PRZED polami w cudzysłowach
// (TITLE/TITLE_COMPL z przecinkami), więc dla nich bezpieczny jest prosty split po ",".

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

const ECB_URL =
  'https://data-api.ecb.europa.eu/service/data/FM/B.U2.EUR.4F.KR.MRR_FR.LEV?format=csvdata&lastNObservations=1'

// Cache w pamięci — stopa zmienia się rzadko, 6 h spokojnie wystarcza.
const CACHE_TTL = 6 * 60 * 60 * 1000
let cache = { ts: 0, data: null }

async function fetchText(url, timeout = 8000) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, { redirect: 'follow', signal: ctrl.signal, headers: { 'User-Agent': UA } })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

async function loadEcbRate() {
  try {
    const csv = await fetchText(ECB_URL)
    const lines = csv.trim().split(/\r?\n/)
    if (lines.length < 2) throw new Error('pusty CSV EBC')

    const header = lines[0].split(',')
    const iDate = header.indexOf('TIME_PERIOD')
    const iVal = header.indexOf('OBS_VALUE')
    if (iDate < 0 || iVal < 0) throw new Error('brak kolumn TIME_PERIOD/OBS_VALUE w CSV EBC')

    const last = lines[lines.length - 1].split(',') // lastNObservations=1 → jeden wiersz danych
    const value = Number(last[iVal])
    if (Number.isNaN(value)) throw new Error('nieliczbowa wartość stopy EBC')

    return { value: Math.round(value * 100) / 100, date: last[iDate], unit: '%', source: 'ECB' }
  } catch (e) {
    console.error('[ecb] pobranie/parsowanie stopy EBC nie powiodło się:', e)
    return null
  }
}

// GET /api/ecb-rate — { value, date, unit, source } lub { value: null, error: 'unavailable' }
router.get('/', async (_req, res) => {
  if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
    return res.json(cache.data)
  }
  const data = await loadEcbRate()
  if (!data) {
    return res.json({ value: null, error: 'unavailable' })
  }
  cache = { ts: Date.now(), data }
  res.json(data)
})

export default router
