// ── Freightos — orientacyjne stawki frachtu morskiego i lotniczego ────────────
//
// Serwis działa WYŁĄCZNIE po stronie serwera. Nigdy nie wołaj Freightos
// bezpośrednio z przeglądarki — klucz API musi zostać na backendzie.
// Przepisane z docs/freightos-ref/freightosService.ts (TypeScript / Next.js) na ESM.
//
// Różnice względem referencji:
// - usunięta opcja `next: { revalidate: 300 }` (to cache Next.js, Node jej nie rozumie);
//   cache trzyma endpoint w api/routes/freight.js
// - dodany timeout przez AbortController, wzorzec z api/routes/diesel.js
// - klucz z process.env.FREIGHTOS_API_KEY; gdy pusty, po prostu nie trafia do query
//   stringa (endpoint działa bez klucza w trybie estimate)
//
// Dokumentacja: https://ship.freightos.com/api/shippingCalculator

const FREIGHTOS_API_URL = 'https://ship.freightos.com/api/shippingCalculator'

const TIMEOUT_MS = 8000

// ── Kody portów (UN/LOCODE) ───────────────────────────────────────────────────
// Freightos akceptuje kody UN/LOCODE (5 liter, morskie) lub kody IATA (3 litery,
// lotnicze), a także nazwy miast.
// Pełna lista: https://unece.org/trade/uncefact/unlocode-country-list

export const PORT_CODES = {
  // Polska
  'DCT Gdańsk':        { code: 'PLGDN', name: 'Gdańsk DCT',              type: 'sea' },
  'Port Gdynia':       { code: 'PLGDY', name: 'Gdynia BCT',              type: 'sea' },
  'WAW Lotnisko':      { code: 'WAW',   name: 'Warszawa Chopin',         type: 'air' },
  'KTW Pyrzowice':     { code: 'KTW',   name: 'Katowice Airport',        type: 'air' },

  // Niemcy
  'Hamburg':           { code: 'DEHAM', name: 'Hamburg Hafen',           type: 'sea' },
  'Bremerhaven':       { code: 'DEBRE', name: 'Bremerhaven',             type: 'sea' },
  'FRA Frankfurt':     { code: 'FRA',   name: 'Frankfurt Airport',       type: 'air' },

  // Holandia
  'Rotterdam':         { code: 'NLRTM', name: 'Rotterdam Europoort',     type: 'sea' },
  'Amsterdam AMS':     { code: 'AMS',   name: 'Amsterdam Schiphol',      type: 'air' },

  // USA
  'Port Newark NJ':    { code: 'USNWK', name: 'Newark / Port NJ',        type: 'sea' },
  'Savannah GA':       { code: 'USSAV', name: 'Savannah Garden City',    type: 'sea' },
  'Los Angeles':       { code: 'USLGB', name: 'Los Angeles / Long Beach', type: 'sea' },
  'Houston TX':        { code: 'USHOU', name: 'Houston Barbours Cut',    type: 'sea' },
  'JFK Nowy Jork':     { code: 'JFK',   name: 'New York JFK',            type: 'air' },
  'ORD Chicago':       { code: 'ORD',   name: "Chicago O'Hare",          type: 'air' },
  'LAX Los Angeles':   { code: 'LAX',   name: 'Los Angeles Int.',        type: 'air' },

  // Chiny
  'Shanghai':          { code: 'CNSHA', name: 'Shanghai SIPG',           type: 'sea' },
  'Shenzhen/Yantian':  { code: 'CNYTN', name: 'Shenzhen Yantian',        type: 'sea' },
  'Ningbo':            { code: 'CNNGB', name: 'Ningbo Port',             type: 'sea' },
  'Tianjin':           { code: 'CNTXG', name: 'Tianjin Port',            type: 'sea' },
  'PVG Shanghai':      { code: 'PVG',   name: 'Shanghai Pudong',         type: 'air' },
  'PEK Pekin':         { code: 'PEK',   name: 'Pekin Capital',           type: 'air' },

  // UK
  'Felixstowe':        { code: 'GBFXT', name: 'Port of Felixstowe',      type: 'sea' },
  'Southampton':       { code: 'GBSOU', name: 'Southampton',             type: 'sea' },
  'LHR Londyn':        { code: 'LHR',   name: 'London Heathrow',         type: 'air' },

  // Azja
  'Singapur':          { code: 'SGSIN', name: 'Singapore PSA',           type: 'sea' },
  'Port Klang MY':     { code: 'MYPKG', name: 'Port Klang Malaysia',     type: 'sea' },
  'Busan KR':          { code: 'KRBPU', name: 'Busan New Port',          type: 'sea' },
  'Tokyo/Yokohama':    { code: 'JPYOK', name: 'Yokohama',                type: 'sea' },
  'NRT Tokio':         { code: 'NRT',   name: 'Tokyo Narita',            type: 'air' },

  // Bliski Wschód / Afryka
  'Port Jebel Ali AE': { code: 'AEJEA', name: 'Jebel Ali Dubai',         type: 'sea' },
  'DXB Dubai':         { code: 'DXB',   name: 'Dubai International',     type: 'air' },
  'Casablanca MA':     { code: 'MACAS', name: 'Casablanca Port',         type: 'sea' },

  // Ameryka Łacińska
  'Santos BR':         { code: 'BRSSZ', name: 'Santos Brazil',           type: 'sea' },
  'Buenos Aires AR':   { code: 'ARBUE', name: 'Buenos Aires',            type: 'sea' },
}

// ── Główna funkcja zapytania ──────────────────────────────────────────────────

// params: { origin, destination, loadtype, weight, quantity?, width?, height?,
//           length?, volume?, mode?, hazardCode?, estimate?, currency? }
// Zwraca { success, rates, error } — nigdy nie rzuca wyjątku na zewnątrz.
export async function getFreightosRates(params) {
  const apiKey = process.env.FREIGHTOS_API_KEY

  const queryParams = new URLSearchParams({
    origin:      params.origin,
    destination: params.destination,
    loadtype:    params.loadtype,
    weight:      String(params.weight),
    quantity:    String(params.quantity ?? 1),
    format:      'json',
    resultSet:   'cheapestEachMode', // daje quoteId do ewentualnej rezerwacji
    ...(params.width      && { width:      String(params.width)  }),
    ...(params.height     && { height:     String(params.height) }),
    ...(params.length     && { length:     String(params.length) }),
    ...(params.volume     && { volume:     String(params.volume) }),
    ...(params.mode       && { mode:       params.mode }),
    ...(params.hazardCode && { hazardCode: params.hazardCode }),
    ...(params.estimate   && { estimate:   'true' }),
    ...(params.currency   && { currency:   params.currency }),
    ...(apiKey            && { apiKey }),
  })

  const url = `${FREIGHTOS_API_URL}?${queryParams.toString()}`

  // Freightos: limit ok. 100 zapytań/h per IP — cache trzyma api/routes/freight.js.
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) throw new Error(`Freightos API zwróciło status ${res.status}`)

    const data = await res.json()
    return parseFreightosResponse(data)
  } catch (e) {
    console.error('[freightos] zapytanie nie powiodło się:', e)
    return {
      success: false,
      rates: [],
      error: e instanceof Error ? e.message : 'Błąd połączenia z Freightos API',
    }
  } finally {
    clearTimeout(timer)
  }
}

// ── Parser odpowiedzi ─────────────────────────────────────────────────────────
//
// Freightos zwraca różne struktury zależnie od trybu — normalizujemy do jednego
// kształtu { mode, priceMin, priceMax, currency, transitMin, transitMax,
// quoteId, quoteUrl }.

function parseFreightosResponse(data) {
  try {
    const resp = data?.response
    if (!resp) return { success: false, rates: [], error: 'Brak odpowiedzi od Freightos' }
    if (resp.errors) return { success: false, rates: [], error: String(resp.errors) }

    const rates = []

    // Struktura przy resultSet=cheapestEachMode: resp.quotes.quote[]
    const quotes = resp.quotes
    if (quotes) {
      const quoteList = Array.isArray(quotes.quote)
        ? quotes.quote
        : quotes.quote ? [quotes.quote] : []

      for (const quote of quoteList) {
        const price = extractPrice(quote)
        const transit = extractTransit(quote)
        if (price && transit) {
          rates.push({
            mode:       extractMode(quote),
            priceMin:   price.min,
            priceMax:   price.max,
            currency:   price.currency,
            transitMin: transit.min,
            transitMax: transit.max,
            quoteId:    quote.id ?? null,
            quoteUrl:   quote.shareUrl ?? null,
          })
        }
      }
    }

    // Struktura przy estimate=true: resp.estimatedFreightRates.mode[]
    const estimates = resp.estimatedFreightRates
    if (estimates && rates.length === 0) {
      const modeList = Array.isArray(estimates.mode)
        ? estimates.mode
        : estimates.mode ? [estimates.mode] : []

      for (const modeObj of modeList) {
        const price = extractEstimatePrice(modeObj)
        const transit = extractTransit(modeObj)
        if (price) {
          rates.push({
            mode:       String(modeObj.mode ?? 'FCL').toUpperCase(),
            priceMin:   price.min,
            priceMax:   price.max,
            currency:   price.currency,
            transitMin: transit?.min ?? 0,
            transitMax: transit?.max ?? 0,
            quoteId:    null,
            quoteUrl:   null,
          })
        }
      }
    }

    return { success: rates.length > 0, rates, error: null }
  } catch (e) {
    console.error('[freightos] parsowanie odpowiedzi nie powiodło się:', e)
    return { success: false, rates: [], error: 'Błąd parsowania odpowiedzi Freightos' }
  }
}

// ── Helpery parsowania zagnieżdżonego JSON-a Freightos ────────────────────────

function extractMode(quote) {
  const raw = String(quote.transportationType ?? quote.mode ?? 'FCL').toUpperCase()
  if (raw.includes('AIR')) return 'AIR'
  if (raw.includes('EXPRESS')) return 'EXPRESS'
  if (raw.includes('LCL')) return 'LCL'
  return 'FCL'
}

function extractPrice(quote) {
  try {
    const total = quote.totalPrice ?? quote.price
    if (!total) return null
    const amount = total.amount ?? total.moneyAmount?.amount
    const currency = total.currency ?? total.moneyAmount?.currency ?? 'USD'
    if (amount == null) return null
    const num = Number(amount)
    if (Number.isNaN(num)) return null
    return { min: num, max: num, currency: String(currency) }
  } catch { return null }
}

function extractEstimatePrice(modeObj) {
  try {
    const price = modeObj.price
    if (!price) return null
    const minAmt = price.min?.moneyAmount
    const maxAmt = price.max?.moneyAmount
    if (!minAmt) return null
    const min = Number(minAmt.amount)
    if (Number.isNaN(min)) return null
    const max = Number(maxAmt?.amount ?? minAmt.amount)
    return {
      min,
      max: Number.isNaN(max) ? min : max,
      currency: String(minAmt.currency ?? 'USD'),
    }
  } catch { return null }
}

function extractTransit(obj) {
  try {
    const tt = obj.transitTimes
    if (!tt) return null
    return { min: Number(tt.min ?? 0), max: Number(tt.max ?? tt.min ?? 0) }
  } catch { return null }
}

// ── Wbudowane stawki fallback ─────────────────────────────────────────────────
//
// Gdy Freightos jest niedostępne lub limit zapytań wyczerpany, pokazujemy
// przybliżone stawki z lokalnej tabeli. Aktualizuj ręcznie (np. wg Freightos
// Baltic Index) — UI wyraźnie oznacza je jako orientacyjne.

export const FALLBACK_RATES = {
  'PLGDN-USNWK': [
    { mode: 'FCL', priceMin: 1750, priceMax: 2100, currency: 'USD', transitMin: 26, transitMax: 34, quoteId: null, quoteUrl: null },
    { mode: 'LCL', priceMin: 280,  priceMax: 420,  currency: 'USD', transitMin: 30, transitMax: 40, quoteId: null, quoteUrl: null },
    { mode: 'AIR', priceMin: 4200, priceMax: 5800, currency: 'USD', transitMin: 2,  transitMax: 4,  quoteId: null, quoteUrl: null },
  ],
  'PLGDN-CNSHA': [
    { mode: 'FCL', priceMin: 1100, priceMax: 1500, currency: 'USD', transitMin: 28, transitMax: 38, quoteId: null, quoteUrl: null },
    { mode: 'AIR', priceMin: 3500, priceMax: 4800, currency: 'USD', transitMin: 3,  transitMax: 6,  quoteId: null, quoteUrl: null },
  ],
  'CNSHA-PLGDN': [
    { mode: 'FCL', priceMin: 850,  priceMax: 1200, currency: 'USD', transitMin: 28, transitMax: 38, quoteId: null, quoteUrl: null },
    { mode: 'LCL', priceMin: 180,  priceMax: 280,  currency: 'USD', transitMin: 32, transitMax: 42, quoteId: null, quoteUrl: null },
    { mode: 'AIR', priceMin: 3200, priceMax: 4500, currency: 'USD', transitMin: 3,  transitMax: 6,  quoteId: null, quoteUrl: null },
  ],
  'PLGDN-GBFXT': [
    { mode: 'FCL', priceMin: 650,  priceMax: 950,  currency: 'USD', transitMin: 4,  transitMax: 8,  quoteId: null, quoteUrl: null },
    { mode: 'LCL', priceMin: 120,  priceMax: 200,  currency: 'USD', transitMin: 5,  transitMax: 10, quoteId: null, quoteUrl: null },
  ],
  'DEHAM-USNWK': [
    { mode: 'FCL', priceMin: 1800, priceMax: 2200, currency: 'USD', transitMin: 24, transitMax: 30, quoteId: null, quoteUrl: null },
    { mode: 'AIR', priceMin: 4500, priceMax: 6200, currency: 'USD', transitMin: 2,  transitMax: 3,  quoteId: null, quoteUrl: null },
  ],
}

export function getFallbackRates(origin, destination) {
  return FALLBACK_RATES[`${origin}-${destination}`] ?? []
}
