// ============================================================
// freightosService.ts
// Serwis integracji z Freightos API dla AMLogistico
//
// WAŻNE: Ten plik działa na backendzie (Next.js API route / Express)
// Nigdy nie wywołuj Freightos bezpośrednio z frontendu — API key
// musi pozostać po stronie serwera.
//
// Dokumentacja Freightos: https://ship.freightos.com/api/shippingCalculator
// ============================================================

// ── TYPY ────────────────────────────────────────────────────

export type LoadType =
  | 'boxes'
  | 'pallets'
  | 'container20'
  | 'container40'
  | 'container40HC'
  | 'container45'

export type TransportMode = 'air' | 'LCL' | 'FCL' | 'express'

export interface FreightosQuoteRequest {
  origin: string        // Kody UN/LOCODE portów lub miasto np. "PLGDN" (Gdańsk) | "USNWK" (Newark)
  destination: string   // np. "USNWK" | "New York, NY" | "JFK"
  loadtype: LoadType
  weight: number        // kg
  quantity?: number     // liczba jednostek / kontenerów
  width?: number        // cm (dla boxes/pallets)
  height?: number       // cm
  length?: number       // cm
  volume?: number       // CBM (alternatywa dla wymiarów)
  mode?: TransportMode  // opcjonalne ograniczenie trybu
  hazardCode?: string   // UN Number dla DG np. "1263"
  estimate?: boolean    // true = szybki szacunek bez pełnych kwotowań
  currency?: string     // domyślnie USD
}

export interface FreightosRate {
  mode: 'FCL' | 'LCL' | 'AIR' | 'EXPRESS'
  priceMin: number
  priceMax: number
  currency: string
  transitMin: number   // dni
  transitMax: number   // dni
  quoteId?: string     // dostępne przy resultSet=cheapestEachMode
  quoteUrl?: string    // link do pełnej oferty na Freightos
}

export interface FreightosResponse {
  success: boolean
  rates: FreightosRate[]
  error?: string
  raw?: unknown        // surowa odpowiedź do debugowania
}

// ── KODY PORTÓW (UN/LOCODE) ─────────────────────────────────
// Freightos akceptuje kody UN/LOCODE (5 liter) lub nazwy miast.
// Pełna lista: https://unece.org/trade/uncefact/unlocode-country-list
// Freightos też akceptuje kody IATA lotnisk (3 litery) dla air cargo.

export const PORT_CODES: Record<string, { code: string; name: string; type: 'sea' | 'air' }> = {
  // Polska
  'DCT Gdańsk':        { code: 'PLGDN', name: 'Gdańsk DCT',           type: 'sea' },
  'Port Gdynia':       { code: 'PLGDY', name: 'Gdynia BCT',            type: 'sea' },
  'WAW Lotnisko':      { code: 'WAW',   name: 'Warszawa Chopin',        type: 'air' },
  'KTW Pyrzowice':     { code: 'KTW',   name: 'Katowice Airport',       type: 'air' },

  // Niemcy
  'Hamburg':           { code: 'DEHAM', name: 'Hamburg Hafen',          type: 'sea' },
  'Bremerhaven':       { code: 'DEBRE', name: 'Bremerhaven',            type: 'sea' },
  'FRA Frankfurt':     { code: 'FRA',   name: 'Frankfurt Airport',      type: 'air' },

  // Holandia
  'Rotterdam':         { code: 'NLRTM', name: 'Rotterdam Europoort',    type: 'sea' },
  'Amsterdam AMS':     { code: 'AMS',   name: 'Amsterdam Schiphol',     type: 'air' },

  // USA
  'Port Newark NJ':    { code: 'USNWK', name: 'Newark / Port NJ',       type: 'sea' },
  'Savannah GA':       { code: 'USSAV', name: 'Savannah Garden City',   type: 'sea' },
  'Los Angeles':       { code: 'USLGB', name: 'Los Angeles / Long Beach',type: 'sea' },
  'Houston TX':        { code: 'USHOU', name: 'Houston Barbours Cut',   type: 'sea' },
  'JFK Nowy Jork':     { code: 'JFK',   name: 'New York JFK',           type: 'air' },
  'ORD Chicago':       { code: 'ORD',   name: 'Chicago O\'Hare',        type: 'air' },
  'LAX Los Angeles':   { code: 'LAX',   name: 'Los Angeles Int.',       type: 'air' },

  // Chiny
  'Shanghai':          { code: 'CNSHA', name: 'Shanghai SIPG',          type: 'sea' },
  'Shenzhen/Yantian':  { code: 'CNYTN', name: 'Shenzhen Yantian',      type: 'sea' },
  'Ningbo':            { code: 'CNNGB', name: 'Ningbo Port',            type: 'sea' },
  'Tianjin':           { code: 'CNTXG', name: 'Tianjin Port',           type: 'sea' },
  'PVG Shanghai':      { code: 'PVG',   name: 'Shanghai Pudong',        type: 'air' },
  'PEK Pekin':         { code: 'PEK',   name: 'Pekin Capital',          type: 'air' },

  // UK
  'Felixstowe':        { code: 'GBFXT', name: 'Port of Felixstowe',     type: 'sea' },
  'Southampton':       { code: 'GBSOU', name: 'Southampton',            type: 'sea' },
  'LHR Londyn':        { code: 'LHR',   name: 'London Heathrow',        type: 'air' },

  // Azja
  'Singapur':          { code: 'SGSIN', name: 'Singapore PSA',          type: 'sea' },
  'Port Klang MY':     { code: 'MYPKG', name: 'Port Klang Malaysia',    type: 'sea' },
  'Busan KR':          { code: 'KRBPU', name: 'Busan New Port',         type: 'sea' },
  'Tokyo/Yokohama':    { code: 'JPYOK', name: 'Yokohama',               type: 'sea' },
  'NRT Tokio':         { code: 'NRT',   name: 'Tokyo Narita',           type: 'air' },

  // Bliski Wschód / Afryka
  'Port Jebel Ali AE': { code: 'AEJEA', name: 'Jebel Ali Dubai',        type: 'sea' },
  'DXB Dubai':         { code: 'DXB',   name: 'Dubai International',    type: 'air' },
  'Casablanca MA':     { code: 'MACAS', name: 'Casablanca Port',        type: 'sea' },

  // Ameryka Łacińska
  'Santos BR':         { code: 'BRSSZ', name: 'Santos Brazil',          type: 'sea' },
  'Buenos Aires AR':   { code: 'ARBUE', name: 'Buenos Aires',           type: 'sea' },
}

// ── GŁÓWNA FUNKCJA ZAPYTANIA ─────────────────────────────────

export async function getFreightosRates(
  params: FreightosQuoteRequest
): Promise<FreightosResponse> {
  const FREIGHTOS_API_URL = 'https://ship.freightos.com/api/shippingCalculator'

  // Klucz API z zmiennych środowiskowych — nigdy nie hardkoduj!
  const apiKey = process.env.FREIGHTOS_API_KEY

  // Budujemy query string
  const queryParams = new URLSearchParams({
    origin:      params.origin,
    destination: params.destination,
    loadtype:    params.loadtype,
    weight:      String(params.weight),
    quantity:    String(params.quantity ?? 1),
    format:      'json',
    resultSet:   'cheapestEachMode',  // dostajemy quoteId do rezerwacji
    ...(params.width    && { width:  String(params.width)  }),
    ...(params.height   && { height: String(params.height) }),
    ...(params.length   && { length: String(params.length) }),
    ...(params.volume   && { volume: String(params.volume) }),
    ...(params.mode     && { mode:   params.mode           }),
    ...(params.hazardCode && { hazardCode: params.hazardCode }),
    ...(params.estimate && { estimate: 'true'              }),
    ...(params.currency && { currency: params.currency     }),
    ...(apiKey          && { apiKey                        }),
  })

  const url = `${FREIGHTOS_API_URL}?${queryParams.toString()}`

  try {
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' },
      // Freightos: max 100 req/h per IP — cache na serwerze!
      next: { revalidate: 300 }, // Next.js: cache 5 minut
    })

    if (!response.ok) {
      throw new Error(`Freightos API zwróciło status ${response.status}`)
    }

    const data = await response.json()

    // Freightos zwraca różne struktury zależnie od trybu
    // Normalizujemy do naszego formatu
    return parseFreightosResponse(data)

  } catch (error) {
    console.error('[FreightosService] Błąd zapytania:', error)
    return {
      success: false,
      rates: [],
      error: error instanceof Error ? error.message : 'Błąd połączenia z Freightos API',
    }
  }
}

// ── PARSER ODPOWIEDZI ────────────────────────────────────────

function parseFreightosResponse(data: unknown): FreightosResponse {
  try {
    const resp = (data as Record<string, unknown>).response as Record<string, unknown>

    // Pusta odpowiedź lub błąd
    if (!resp) {
      return { success: false, rates: [], error: 'Brak odpowiedzi od Freightos' }
    }

    // Freightos zwraca errors jako string jeśli coś nie gra
    if (resp.errors) {
      return { success: false, rates: [], error: String(resp.errors) }
    }

    const rates: FreightosRate[] = []

    // Struktura przy resultSet=cheapestEachMode: resp.quotes.quote[]
    const quotes = resp.quotes as Record<string, unknown>
    if (quotes) {
      const quoteList = Array.isArray(quotes.quote)
        ? quotes.quote
        : quotes.quote ? [quotes.quote] : []

      for (const q of quoteList) {
        const quote = q as Record<string, unknown>
        const mode = extractMode(quote)
        const price = extractPrice(quote)
        const transit = extractTransit(quote)

        if (price && transit) {
          rates.push({
            mode,
            priceMin:    price.min,
            priceMax:    price.max,
            currency:    price.currency,
            transitMin:  transit.min,
            transitMax:  transit.max,
            quoteId:     quote.id as string | undefined,
            quoteUrl:    quote.shareUrl as string | undefined,
          })
        }
      }
    }

    // Struktura przy estimate=true: resp.estimatedFreightRates
    const estimates = resp.estimatedFreightRates as Record<string, unknown>
    if (estimates && rates.length === 0) {
      const modeData = estimates.mode
      const modeList = Array.isArray(modeData) ? modeData : modeData ? [modeData] : []

      for (const m of modeList) {
        const modeObj = m as Record<string, unknown>
        const price = extractEstimatePrice(modeObj)
        const transit = extractTransit(modeObj)

        if (price) {
          rates.push({
            mode: (modeObj.mode as string ?? 'FCL').toUpperCase() as FreightosRate['mode'],
            priceMin:   price.min,
            priceMax:   price.max,
            currency:   price.currency,
            transitMin: transit?.min ?? 0,
            transitMax: transit?.max ?? 0,
          })
        }
      }
    }

    return {
      success: rates.length > 0,
      rates,
      raw: data,
    }

  } catch (err) {
    return { success: false, rates: [], error: 'Błąd parsowania odpowiedzi Freightos', raw: data }
  }
}

// Helpery do parsowania zagnieżdżonego JSON Freightos
function extractMode(quote: Record<string, unknown>): FreightosRate['mode'] {
  const raw = (quote.transportationType as string ?? quote.mode as string ?? 'FCL').toUpperCase()
  if (raw.includes('AIR'))     return 'AIR'
  if (raw.includes('EXPRESS')) return 'EXPRESS'
  if (raw.includes('LCL'))     return 'LCL'
  return 'FCL'
}

function extractPrice(quote: Record<string, unknown>) {
  try {
    const total = (quote.totalPrice as Record<string, unknown>)
      ?? (quote.price as Record<string, unknown>)
    if (!total) return null
    const amount = total.amount ?? (total.moneyAmount as Record<string,unknown>)?.amount
    const currency = total.currency ?? (total.moneyAmount as Record<string,unknown>)?.currency ?? 'USD'
    if (!amount) return null
    const num = Number(amount)
    return { min: num, max: num, currency: String(currency) }
  } catch { return null }
}

function extractEstimatePrice(modeObj: Record<string, unknown>) {
  try {
    const price = modeObj.price as Record<string, unknown>
    if (!price) return null
    const minAmt = (price.min as Record<string,unknown>)?.moneyAmount as Record<string,unknown>
    const maxAmt = (price.max as Record<string,unknown>)?.moneyAmount as Record<string,unknown>
    if (!minAmt) return null
    return {
      min:      Number(minAmt.amount),
      max:      Number(maxAmt?.amount ?? minAmt.amount),
      currency: String(minAmt.currency ?? 'USD'),
    }
  } catch { return null }
}

function extractTransit(obj: Record<string, unknown>) {
  try {
    const tt = obj.transitTimes as Record<string, unknown>
    if (!tt) return null
    return { min: Number(tt.min ?? 0), max: Number(tt.max ?? tt.min ?? 0) }
  } catch { return null }
}

// ── WBUDOWANE STAWKI FALLBACK ────────────────────────────────
// Gdy Freightos API jest niedostępne lub quota wyczerpana,
// aplikacja pokazuje przybliżone stawki z lokalnej bazy.
// Aktualizuj co miesiąc ręcznie lub z Freightos Baltic Index.

export const FALLBACK_RATES: Record<string, FreightosRate[]> = {
  'PLGDN-USNWK': [
    { mode: 'FCL', priceMin: 1750, priceMax: 2100, currency: 'USD', transitMin: 26, transitMax: 34 },
    { mode: 'LCL', priceMin: 280,  priceMax: 420,  currency: 'USD', transitMin: 30, transitMax: 40 },
    { mode: 'AIR', priceMin: 4200, priceMax: 5800, currency: 'USD', transitMin: 2,  transitMax: 4  },
  ],
  'PLGDN-CNSHA': [
    { mode: 'FCL', priceMin: 1100, priceMax: 1500, currency: 'USD', transitMin: 28, transitMax: 38 },
    { mode: 'AIR', priceMin: 3500, priceMax: 4800, currency: 'USD', transitMin: 3,  transitMax: 6  },
  ],
  'CNSHA-PLGDN': [
    { mode: 'FCL', priceMin: 850,  priceMax: 1200, currency: 'USD', transitMin: 28, transitMax: 38 },
    { mode: 'LCL', priceMin: 180,  priceMax: 280,  currency: 'USD', transitMin: 32, transitMax: 42 },
    { mode: 'AIR', priceMin: 3200, priceMax: 4500, currency: 'USD', transitMin: 3,  transitMax: 6  },
  ],
  'PLGDN-GBFXT': [
    { mode: 'FCL', priceMin: 650,  priceMax: 950,  currency: 'USD', transitMin: 4,  transitMax: 8  },
    { mode: 'LCL', priceMin: 120,  priceMax: 200,  currency: 'USD', transitMin: 5,  transitMax: 10 },
  ],
  'DEHAM-USNWK': [
    { mode: 'FCL', priceMin: 1800, priceMax: 2200, currency: 'USD', transitMin: 24, transitMax: 30 },
    { mode: 'AIR', priceMin: 4500, priceMax: 6200, currency: 'USD', transitMin: 2,  transitMax: 3  },
  ],
}

export function getFallbackRates(origin: string, destination: string): FreightosRate[] {
  const key = `${origin}-${destination}`
  return FALLBACK_RATES[key] ?? []
}
