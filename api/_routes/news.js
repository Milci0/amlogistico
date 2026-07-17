import express from 'express'
import { fetchText, parseFeed, mapLimit } from '../_lib/rss.js'

const router = express.Router()

// ── Źródła newsów — WYŁĄCZNIE bezpośrednie feedy RSS wydawców ──────────────────
// Świadomie NIE używamy Google News RSS (news.google.com/rss): nota licencyjna feedu
// zezwala tylko na „personal, non-commercial use within a personal feed reader",
// a robots.txt Google blokuje ścieżkę /rss — komercyjne pobieranie łamałoby Warunki
// Google. Zostają tylko feedy publikowane wprost przez wydawców (syndykacja RSS).
//
// USUNIĘTE ŹRÓDŁA:
// - Lloyd's List (lloydslist.com) — ToS: "personal, non-commercial use only"
// - JOC (joc.com) — zakaz republikowania bez pisemnej zgody (S&P Global)
// - Reuters (reuters.com) — ToS zakazuje komercyjnej redystrybucji treści (też nagłówków)
// - Trans.info, Eurologistics, Cła PL — szły przez Google News RSS (naruszenie ToS Google)
//
// TRYB NAJBEZPIECZNIEJSZY: zwracamy tylko TYTUŁ + LINK do oryginału (bez opisu, bez zdjęć).

const SOURCES = [
  // Morski / Świat
  { id: 'freightwaves', name: 'FreightWaves', url: 'https://www.freightwaves.com/news/feed', geo: ['swiat'], transport: ['morski'] },
  { id: 'loadstar',     name: 'The Loadstar', url: 'https://theloadstar.com/feed/',          geo: ['swiat'], transport: ['morski'] },
  { id: 'splash247',    name: 'Splash247',    url: 'https://splash247.com/feed/',            geo: ['swiat'], transport: ['morski'] },
  { id: 'supplychain',  name: 'Supply Chain Dive', url: 'https://www.supplychaindive.com/feeds/news/', geo: ['swiat'], transport: ['morski'] },
  // Morski — Polska
  { id: 'namiary',      name: 'Namiary',      url: 'https://www.namiary.pl/feed/',           geo: ['polska', 'swiat'], transport: ['morski'] },
  // Drogowy / Polska
  { id: 'truckpl',      name: 'Truck.pl',     url: 'https://www.truck.pl/feed/',             geo: ['polska'], transport: ['drogowy'] },
  { id: '40ton',        name: '40ton',        url: 'https://40ton.net/feed/',                geo: ['polska'], transport: ['drogowy'] },
  // Cła i regulacje
  { id: 'customstoday', name: 'Customs Today',url: 'https://customstoday.com.pk/feed/',       geo: ['swiat'], transport: ['cla'] },
  { id: 'globaltrade',  name: 'Global Trade', url: 'https://www.globaltrademag.com/feed/',    geo: ['swiat'], transport: ['cla'] },
  { id: 'tradegov',     name: 'Trade.gov',    url: 'https://www.trade.gov/rss.xml',           geo: ['swiat'], transport: ['cla'] },
]

const ALERT_KW = [
  'strike', 'disruption', 'shortage', 'crisis', 'attack', 'blockade', 'closure',
  'sanction', 'embargo', 'conflict', 'delay', 'congestion',
  'strajk', 'ograniczen', 'opóźni', 'zakaz', 'sankcj', 'kryzys', 'blokad', 'awaria', 'wypadek',
]

const MAX_PER_SOURCE = 18
const ONE_YEAR = 365 * 24 * 3_600_000

function isAlert(title = '', desc = '') {
  const t = `${title} ${desc}`.toLowerCase()
  return ALERT_KW.some(k => t.includes(k))
}

// ── Pobranie i normalizacja artykułów jednego źródła ──────────────────────────

async function loadSource(src) {
  const xml = await fetchText(src.url, { timeout: 9000 })
  const items = parseFeed(xml).slice(0, MAX_PER_SOURCE)

  return items
    .filter(it => {
      const d = new Date(it.pubDate)
      return isNaN(d) || Date.now() - d.getTime() < ONE_YEAR
    })
    // TRYB NAJBEZPIECZNIEJSZY: zwracamy tylko tytuł + link (bez fragmentu opisu).
    // Opis z feedu używamy wyłącznie wewnętrznie do wykrywania alertów, nie wysyłamy go.
    .map(it => ({
      title: it.title,
      link: it.link,
      pubDate: it.pubDate || new Date().toISOString(),
      geo: src.geo,
      transport: src.transport,
      isAlert: isAlert(it.title, it.description),
      sourceId: src.id,
      sourceName: src.name,
    }))
}

// ── Ticker: WYŁĄCZNIE dane z realnych źródeł na żywo (kursy NBP) ───────────────
//
// Indeksy WCI (Drewry), BDI (Baltic Exchange), SCFI (Shanghai) są licencjonowane.
// Nie wyświetlaj ich bez wykupionej licencji lub oficjalnego API partnera.
// (Wcześniej były zahardkodowane obok napisu „Na żywo" — usunięte jako mylące.)
//
// Diesel EU (EC Oil Bulletin) jest dostarczany osobnym endpointem GET /api/diesel-price
// (parsuje .xlsx przez SheetJS) i dokładany do paska po stronie frontu — patrz routes/diesel.js.

async function buildTicker() {
  const ticker = []
  try {
    const [eur, usd] = await Promise.all([
      fetchText('https://api.nbp.pl/api/exchangerates/rates/a/eur/?format=json', { timeout: 5000 }),
      fetchText('https://api.nbp.pl/api/exchangerates/rates/a/usd/?format=json', { timeout: 5000 }),
    ])
    const eurPln = JSON.parse(eur).rates[0].mid
    const usdPln = JSON.parse(usd).rates[0].mid
    ticker.push({ label: 'EUR/PLN', value: eurPln.toFixed(4) })
    ticker.push({ label: 'USD/PLN', value: usdPln.toFixed(4) })
    ticker.push({ label: 'EUR/USD', value: (eurPln / usdPln).toFixed(4) })
  } catch { /* NBP niedostępne — ticker pozostaje pusty, „Na żywo" się nie pokaże */ }
  return ticker
}

// ── Cache w pamięci (stale-while-revalidate) ──────────────────────────────────

const CACHE_TTL = 15 * 60 * 1000
let cache = { ts: 0, data: null }
let refreshing = null

async function buildPayload() {
  const [perSource, ticker] = await Promise.all([
    mapLimit(SOURCES, SOURCES.length, async src => {
      try { return await loadSource(src) } catch { return [] }
    }),
    buildTicker(),
  ])

  // Scal, usuń duplikaty (po linku/tytule), posortuj malejąco wg daty.
  const seen = new Set()
  const articles = perSource.flat()
    .filter(a => {
      const key = a.link || a.title
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))

  return { articles, ticker, updatedAt: new Date().toISOString() }
}

function refresh() {
  if (!refreshing) {
    refreshing = buildPayload()
      .then(data => { cache = { ts: Date.now(), data }; return data })
      .finally(() => { refreshing = null })
  }
  return refreshing
}

// ── Trasy ─────────────────────────────────────────────────────────────────────

// GET /api/news — zagregowane artykuły + ticker
// ?refresh=1 → wymusza świeże pobranie (pomija 15-min cache); używa go przycisk „Odśwież".
router.get('/', async (req, res) => {
  const force = req.query.refresh === '1'
  const age = Date.now() - cache.ts

  if (force) {
    const data = await refresh()           // wymuszone — czekamy na świeże dane
    return res.json(data)
  }
  if (cache.data && age < CACHE_TTL) {
    return res.json(cache.data)            // świeży cache
  }
  if (cache.data) {
    refresh()                              // przeterminowany — odśwież w tle, zwróć stare
    return res.json(cache.data)
  }
  const data = await refresh()             // brak cache — czekamy na pierwsze pobranie
  res.json(data)
})

export default router
