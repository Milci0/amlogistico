// ============================================================
// app/api/freight/quotes/route.ts  (Next.js App Router)
// ─ lub ─
// pages/api/freight/quotes.ts       (Next.js Pages Router)
//
// Ten plik to serwer-side proxy między frontendem AMLogistico
// a Freightos API. Ukrywa klucz API i dodaje cache.
//
// URL: POST /api/freight/quotes
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import {
  getFreightosRates,
  getFallbackRates,
  type FreightosQuoteRequest,
} from '@/lib/freightosService'  // dostosuj ścieżkę do swojej struktury

// Cache w pamięci — prosta implementacja bez Redisa
// Dla produkcji zamień na Redis (upstash.io ma darmowy tier)
const cache = new Map<string, { data: unknown; expires: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000  // 5 minut — stawki zmieniają się często

function getCacheKey(params: FreightosQuoteRequest): string {
  return `${params.origin}_${params.destination}_${params.loadtype}_${params.quantity ?? 1}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as FreightosQuoteRequest

    // Walidacja — podstawowe pola wymagane
    if (!body.origin || !body.destination || !body.loadtype) {
      return NextResponse.json(
        { success: false, error: 'Brakuje wymaganych pól: origin, destination, loadtype' },
        { status: 400 }
      )
    }

    // Sprawdź cache
    const cacheKey = getCacheKey(body)
    const cached = cache.get(cacheKey)
    if (cached && cached.expires > Date.now()) {
      return NextResponse.json({ ...cached.data, cached: true })
    }

    // Wywołaj Freightos API
    const result = await getFreightosRates(body)

    // Jeśli Freightos nie odpowiedział — użyj fallback
    if (!result.success || result.rates.length === 0) {
      const fallback = getFallbackRates(body.origin, body.destination)
      if (fallback.length > 0) {
        return NextResponse.json({
          success:   true,
          rates:     fallback,
          source:    'fallback',  // frontend może pokazać "dane orientacyjne"
          error:     result.error,
        })
      }
      return NextResponse.json(
        { success: false, rates: [], error: result.error ?? 'Brak wyników dla tej trasy' },
        { status: 200 }  // 200 bo to nie błąd serwera — po prostu brak tras
      )
    }

    // Zapisz do cache
    const responseData = { success: true, rates: result.rates, source: 'freightos' }
    cache.set(cacheKey, { data: responseData, expires: Date.now() + CACHE_TTL_MS })

    return NextResponse.json(responseData)

  } catch (error) {
    console.error('[/api/freight/quotes] Błąd:', error)
    return NextResponse.json(
      { success: false, error: 'Wewnętrzny błąd serwera' },
      { status: 500 }
    )
  }
}

// Endpoint GET dla szybkich szacunków (bez body, z query params)
// Np: GET /api/freight/quotes?origin=PLGDN&destination=USNWK&loadtype=container20&weight=15000
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const params: FreightosQuoteRequest = {
    origin:      searchParams.get('origin')      ?? '',
    destination: searchParams.get('destination') ?? '',
    loadtype:    (searchParams.get('loadtype')   ?? 'container20') as FreightosQuoteRequest['loadtype'],
    weight:      Number(searchParams.get('weight') ?? 10000),
    quantity:    Number(searchParams.get('quantity') ?? 1),
    estimate:    true,  // dla GET używamy szybkiego szacunku
  }

  if (!params.origin || !params.destination) {
    return NextResponse.json(
      { success: false, error: 'Parametry origin i destination są wymagane' },
      { status: 400 }
    )
  }

  const result = await getFreightosRates(params)
  const fallback = !result.success ? getFallbackRates(params.origin, params.destination) : []

  return NextResponse.json({
    success: result.success || fallback.length > 0,
    rates:   result.success ? result.rates : fallback,
    source:  result.success ? 'freightos' : 'fallback',
  })
}
