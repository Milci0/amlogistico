import express from 'express'
import * as XLSX from 'xlsx'

const router = express.Router()

// ── EC Weekly Oil Bulletin — średnia cena diesla EU-27 (z podatkami) ──────────
//
// Źródło: European Commission, Weekly Oil Bulletin („Prices History", plik .xlsx).
// Strona: https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en
// Licencja danych: CC BY 4.0 (wymagana atrybucja — pokazujemy ją w UI /news).
//
// Pobieranie jest DYNAMICZNE: najpierw ściągamy stronę biuletynu, z jej HTML wyciągamy
// aktualny link do pliku Excel (href z „oil_bulletin", kończący się na .xlsx/.xls),
// i dopiero ten URL pobieramy. Dzięki temu nie zależymy od zahardkodowanego linku,
// który EC co jakiś czas zmienia.
//
// W pliku arkusz „Prices with taxes": kolumna `EU_price_with_tax_diesel`
// (ważona średnia EU-27, w EUR/1000 l). Wiersze są posortowane MALEJĄCO wg daty
// (najnowszy tydzień na górze), data w kolumnie 0 jako serial Excela, kol. 1 = "EU_".
// Cenę detaliczną podajemy jako EUR/L (dzielimy przez 1000).

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

const BULLETIN_PAGE = 'https://energy.ec.europa.eu/data-and-analysis/weekly-oil-bulletin_en'
const ORIGIN = 'https://energy.ec.europa.eu'

const SHEET = 'Prices with taxes'
const DIESEL_COL_KEY = 'EU_price_with_tax_diesel'

// Cache w pamięci — bulletin aktualizowany raz w tygodniu, więc 6 h w zupełności wystarcza
// (chroni też przed timeoutem funkcji serverless przy pobieraniu ~4 MB pliku co request).
const CACHE_TTL = 6 * 60 * 60 * 1000
let cache = { ts: 0, data: null }

// ── Krok 1: pobranie strony biuletynu (timeout 8 s) ───────────────────────────

async function fetchBulletinPage() {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(BULLETIN_PAGE, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA },
    })
    if (!res.ok) throw new Error(`strona biuletynu zwróciła HTTP ${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

// ── Krok 2: wyciągnięcie aktualnego linku do pliku Excel z HTML ────────────────

function extractExcelUrl(html) {
  const hrefs = [...html.matchAll(/href="([^"]+)"/gi)].map(m => m[1])
  // href zawierający „oil_bulletin" i kończący się na .xlsx lub .xls
  // (dopuszczamy końcówkę przed ? lub # — link EC ma plik w parametrze ?filename=...).
  const candidates = hrefs.filter(
    h => /oil_bulletin/i.test(h) && /\.xlsx?(?:[?#]|$)/i.test(h),
  )
  if (!candidates.length) return null
  // Preferuj plik z PEŁNĄ HISTORIĄ cen (zawiera serię EU diesel, którą parsujemy) —
  // na stronie jest też np. „Oil_Bulletin_Duties_and_taxes.xlsx", którego nie chcemy.
  const pick = candidates.find(h => /history|prices/i.test(h)) || candidates[0]
  return pick.startsWith('http') ? pick : ORIGIN + pick
}

// ── Krok 3: pobranie pliku Excel z dynamicznego URL (timeout 10 s) ─────────────

async function fetchExcel(url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 10000)
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA },
    })
    if (!res.ok) throw new Error(`plik Excel zwrócił HTTP ${res.status}`)
    return Buffer.from(await res.arrayBuffer())
  } finally {
    clearTimeout(timer)
  }
}

// ── Krok 4: parsowanie arkusza (logika bez zmian) ─────────────────────────────

// Serial daty Excela (system 1900) → "YYYY-MM-DD". 25569 = dni między 1899-12-30 a 1970-01-01.
function serialToISO(serial) {
  const ms = Math.round((serial - 25569) * 86400 * 1000)
  return new Date(ms).toISOString().slice(0, 10)
}

function extractDiesel(buf) {
  const wb = XLSX.read(buf, { type: 'buffer' })
  const ws = wb.Sheets[SHEET]
  if (!ws) return null
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, blankrows: false })
  if (!rows.length) return null

  const header = rows[0].map(c => (c == null ? '' : String(c)))
  const dieselCol = header.indexOf(DIESEL_COL_KEY)
  if (dieselCol < 0) return null

  // Najnowszy tydzień = wiersz EU_ o największym serialu daty (dane są malejące, ale liczymy max dla pewności).
  let best = null
  for (const r of rows) {
    if (typeof r[0] === 'number' && r[1] === 'EU_' && typeof r[dieselCol] === 'number') {
      if (!best || r[0] > best[0]) best = r
    }
  }
  if (!best) return null

  const value = Math.round((best[dieselCol] / 1000) * 100) / 100 // EUR/1000L → EUR/L
  return { value, date: serialToISO(best[0]), unit: 'EUR/L', source: 'EC Oil Bulletin' }
}

// ── Orkiestracja — każdy krok w osobnym try/catch (błędy widoczne w logach Vercel) ──

async function loadDiesel() {
  // Krok 1: pobierz stronę biuletynu
  let html
  try {
    html = await fetchBulletinPage()
  } catch (e) {
    console.error('[diesel] krok 1 — pobranie strony biuletynu nie powiodło się:', e)
    return null
  }

  // Krok 2: wyciągnij aktualny link do pliku Excel
  let excelUrl
  try {
    excelUrl = extractExcelUrl(html)
    if (!excelUrl) throw new Error('nie znaleziono linku .xlsx/.xls z „oil_bulletin" na stronie')
  } catch (e) {
    console.error('[diesel] krok 2 — wyodrębnienie linku Excel nie powiodło się:', e)
    return null
  }

  // Krok 3: pobierz plik Excel z dynamicznie wyciągniętego URL
  let buf
  try {
    buf = await fetchExcel(excelUrl)
  } catch (e) {
    console.error('[diesel] krok 3 — pobranie pliku Excel nie powiodło się:', e, '| url:', excelUrl)
    return null
  }

  // Krok 4: sparsuj plik i wyciągnij cenę
  try {
    const data = extractDiesel(buf)
    if (!data) throw new Error('parser nie znalazł wiersza EU diesel w arkuszu')
    return data
  } catch (e) {
    console.error('[diesel] krok 4 — parsowanie pliku Excel nie powiodło się:', e)
    return null
  }
}

// ── Trasa ─────────────────────────────────────────────────────────────────────

// GET /api/diesel-price — { value, date, unit, source } lub { value: null, error: "unavailable" }
router.get('/', async (_req, res) => {
  if (cache.data && Date.now() - cache.ts < CACHE_TTL) {
    return res.json(cache.data)
  }
  const data = await loadDiesel()
  if (!data) {
    // Nie cache'ujemy porażki — przy kolejnym żądaniu spróbujemy ponownie.
    return res.json({ value: null, error: 'unavailable' })
  }
  cache = { ts: Date.now(), data }
  res.json(data)
})

export default router
