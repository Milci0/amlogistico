// ============================================================
// insuranceService.ts
// Serwis integracji z Loadsure API dla AMLogistico
// Nowy plik — wrzuć do: src/lib/insuranceService.ts
//
// Loadsure API docs: https://developer.loadsure.com
// Partner program:   https://www.loadsure.net/freight-platform-partners
//
// .env.local:
//   LOADSURE_API_KEY=your_key_here
//   LOADSURE_API_URL=https://api.loadsure.net/v1
//   LOADSURE_WEBHOOK_SECRET=your_webhook_secret
// ============================================================

// ── TYPY ────────────────────────────────────────────────────

export type CoverageType = 'ICC_A' | 'ICC_B' | 'ICC_C'
export type PolicyStatus = 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING'
export type ClaimStatus  = 'SUBMITTED' | 'IN_REVIEW' | 'APPROVED' | 'PAID' | 'REJECTED'

export interface InsuranceQuoteRequest {
  // Trasa
  originCountry:      string   // kod ISO np. "PL"
  originCity:         string
  destinationCountry: string
  destinationCity:    string
  transportMode:      'sea' | 'air' | 'road' | 'rail'

  // Ładunek
  cargoDescription:   string
  cargoCategory:      string   // z cargo_categories_database.json
  hsCode?:            string
  cargoValue:         number   // wartość w walucie
  currency:           string   // "EUR" | "USD" | "PLN"
  weight:             number   // kg
  quantity:           number

  // Opcje
  coverageType:       CoverageType
  dangerous?:         boolean
  hazardCode?:        string
  perishable?:        boolean
  refrigerated?:      boolean
}

export interface InsuranceQuote {
  quoteId:        string
  provider:       'loadsure' | 'marsh' | 'fallback'
  coverageType:   CoverageType
  premium:        number
  currency:       string
  coverageLimit:  number
  deductible:     number
  validUntil:     string   // ISO date
  conditions?:    string[]
}

export interface InsuranceQuoteResponse {
  success:  boolean
  quotes:   InsuranceQuote[]
  source:   'loadsure' | 'fallback'
  error?:   string
}

export interface PolicyBindRequest {
  quoteId:    string
  shipmentId: string   // ID zlecenia w AMLogistico
  userId:     string

  shipper: {
    companyName: string
    email:       string
    country:     string
    taxId?:      string
  }

  consignee: {
    companyName: string
    email:       string
    country:     string
  }

  departureDate: string   // ISO date
  arrivalDate?:  string
  vesselName?:   string
  containerNo?:  string
  blNumber?:     string   // Bill of Lading number
}

export interface Policy {
  id:             string
  loadsureRef:    string
  shipmentId:     string
  userId:         string
  status:         PolicyStatus
  coverageType:   CoverageType
  premium:        number
  currency:       string
  coverageLimit:  number
  deductible:     number
  issuedAt:       string
  expiresAt:      string
  certificateUrl: string   // link do PDF certyfikatu
  origin:         string
  destination:    string
  cargoDescription: string
}

export interface ClaimRequest {
  policyId:    string
  shipmentId:  string
  description: string
  lossDate:    string
  lossAmount:  number
  currency:    string
  documents?:  string[]  // base64 PDF/zdjęcia
}

// ── STAWKI BAZOWE DO KALKULATORA ────────────────────────────
// Aktualizuj co miesiąc lub pobieraj z Loadsure API

export const BASE_RATES: Record<string, number> = {
  'general':       0.37,
  'machinery':     0.28,
  'electronics':   0.52,
  'food_chilled':  0.45,
  'food_frozen':   0.48,
  'valuable':      0.65,
  'chemicals':     0.58,
  'vehicles':      0.35,
  'textiles':      0.25,
  'metals':        0.22,
  'medicines':     0.55,
  'dangerous':     0.85,
}

export const COVERAGE_MULTIPLIERS: Record<CoverageType, number> = {
  ICC_A: 1.00,  // all risk — najszerszy
  ICC_B: 0.75,  // named perils
  ICC_C: 0.55,  // podstawowy
}

export const MODE_MULTIPLIERS: Record<string, number> = {
  sea:  1.00,
  air:  0.85,   // niższe ryzyko
  road: 0.90,
  rail: 0.80,
}

// ── KALKULATOR LOKALNY (bez API) ────────────────────────────
// Używany gdy Loadsure API niedostępne lub brak klucza

export function calculatePremiumLocally(params: {
  cargoValue:    number
  cargoCategory: string
  coverageType:  CoverageType
  transportMode: string
  dangerous?:    boolean
  perishable?:   boolean
}): number {
  const baseRate    = BASE_RATES[params.cargoCategory] ?? BASE_RATES['general']
  const coverageMul = COVERAGE_MULTIPLIERS[params.coverageType]
  const modeMul     = MODE_MULTIPLIERS[params.transportMode] ?? 1.0
  const dangerousMul = params.dangerous  ? 1.5 : 1.0
  const perishMul    = params.perishable ? 1.2 : 1.0

  const rate    = baseRate * coverageMul * modeMul * dangerousMul * perishMul
  const premium = Math.round(params.cargoValue * rate / 100)

  return Math.max(premium, 25)  // minimum €25 składki
}

// ── 1. POBIERANIE WYCENY ────────────────────────────────────

export async function getInsuranceQuotes(
  params: InsuranceQuoteRequest
): Promise<InsuranceQuoteResponse> {
  const apiKey = process.env.LOADSURE_API_KEY
  const apiUrl = process.env.LOADSURE_API_URL ?? 'https://api.loadsure.net/v1'

  if (!apiKey) {
    // Tryb demo — lokalna kalkulacja
    console.warn('[InsuranceService] Brak LOADSURE_API_KEY — tryb demo')
    return getFallbackQuotes(params)
  }

  try {
    const res = await fetch(`${apiUrl}/quotes`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
        'Accept':        'application/json',
      },
      body: JSON.stringify({
        origin: {
          country: params.originCountry,
          city:    params.originCity,
        },
        destination: {
          country: params.destinationCountry,
          city:    params.destinationCity,
        },
        transportMode:    params.transportMode,
        cargo: {
          description:  params.cargoDescription,
          commodityCode: params.hsCode,
          value: {
            amount:   params.cargoValue,
            currency: params.currency,
          },
          weight:     params.weight,
          quantity:   params.quantity,
          dangerous:  params.dangerous ?? false,
          hazardCode: params.hazardCode,
          perishable: params.perishable ?? false,
          refrigerated: params.refrigerated ?? false,
        },
        coverageType: params.coverageType,
      }),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    return parseLoadsureQuotes(data, params)

  } catch (err) {
    console.error('[InsuranceService] Quote error:', err)
    return getFallbackQuotes(params)
  }
}

// ── 2. BINDOWANIE POLISY (ZAKUP) ────────────────────────────

export async function bindPolicy(req: PolicyBindRequest): Promise<{
  success:        boolean
  policy?:        Policy
  certificateUrl?: string
  error?:         string
}> {
  const apiKey = process.env.LOADSURE_API_KEY
  const apiUrl = process.env.LOADSURE_API_URL ?? 'https://api.loadsure.net/v1'

  if (!apiKey) {
    // Tryb demo
    return {
      success: true,
      policy: getMockPolicy(req),
      certificateUrl: 'https://example.com/demo-certificate.pdf',
    }
  }

  try {
    const res = await fetch(`${apiUrl}/policies`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        quoteId:       req.quoteId,
        shipper:       req.shipper,
        consignee:     req.consignee,
        departureDate: req.departureDate,
        arrivalDate:   req.arrivalDate,
        vesselName:    req.vesselName,
        containerNo:   req.containerNo,
        blNumber:      req.blNumber,
        metadata: {
          shipmentId: req.shipmentId,
          platform:   'amlogistico',
        },
      }),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)

    const data = await res.json()
    const policy = parseLoadsurePolicy(data, req)

    return {
      success:        true,
      policy,
      certificateUrl: data.certificateUrl ?? data.certificate?.url,
    }

  } catch (err) {
    console.error('[InsuranceService] Bind error:', err)
    return {
      success: false,
      error:   err instanceof Error ? err.message : 'Błąd zakupu polisy',
    }
  }
}

// ── 3. POBIERANIE POLISY ────────────────────────────────────

export async function getPolicy(loadsureRef: string): Promise<Policy | null> {
  const apiKey = process.env.LOADSURE_API_KEY
  const apiUrl = process.env.LOADSURE_API_URL ?? 'https://api.loadsure.net/v1'

  if (!apiKey) return null

  try {
    const res = await fetch(`${apiUrl}/policies/${loadsureRef}`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    })
    if (!res.ok) return null
    const data = await res.json()
    return parseLoadsurePolicy(data, null)
  } catch {
    return null
  }
}

// ── 4. ZGŁOSZENIE SZKODY ────────────────────────────────────

export async function submitClaim(req: ClaimRequest): Promise<{
  success:  boolean
  claimId?: string
  error?:   string
}> {
  const apiKey = process.env.LOADSURE_API_KEY
  const apiUrl = process.env.LOADSURE_API_URL ?? 'https://api.loadsure.net/v1'

  if (!apiKey) {
    return { success: true, claimId: `DEMO_CLAIM_${Date.now()}` }
  }

  try {
    const res = await fetch(`${apiUrl}/claims`, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
      },
      body: JSON.stringify({
        policyId:    req.policyId,
        description: req.description,
        lossDate:    req.lossDate,
        claimedAmount: {
          amount:   req.lossAmount,
          currency: req.currency,
        },
        documents: req.documents ?? [],
        metadata:  { shipmentId: req.shipmentId },
      }),
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const data = await res.json()
    return { success: true, claimId: String(data.id ?? data.claimId ?? '') }

  } catch (err) {
    return {
      success: false,
      error:   err instanceof Error ? err.message : 'Błąd zgłoszenia szkody',
    }
  }
}

// ── PARSERY ─────────────────────────────────────────────────

function parseLoadsureQuotes(
  data: unknown,
  params: InsuranceQuoteRequest
): InsuranceQuoteResponse {
  try {
    const d = data as Record<string, unknown>
    const quotes: InsuranceQuote[] = []

    const rawQuotes = Array.isArray(d.quotes) ? d.quotes : d.quote ? [d.quote] : []

    for (const q of rawQuotes) {
      const quote = q as Record<string, unknown>
      const premium = (quote.premium as Record<string,unknown>)
      quotes.push({
        quoteId:       String(quote.id ?? quote.quoteId ?? ''),
        provider:      'loadsure',
        coverageType:  params.coverageType,
        premium:       Number((premium?.amount as number) ?? quote.amount ?? 0),
        currency:      String((premium?.currency as string) ?? params.currency),
        coverageLimit: Number(quote.coverageLimit ?? quote.limit ?? params.cargoValue),
        deductible:    Number(quote.deductible ?? quote.excess ?? 500),
        validUntil:    String(quote.validUntil ?? quote.expiresAt ?? ''),
      })
    }

    return { success: quotes.length > 0, quotes, source: 'loadsure' }
  } catch {
    return getFallbackQuotes(params)
  }
}

function parseLoadsurePolicy(data: unknown, req: PolicyBindRequest | null): Policy {
  const d = data as Record<string, unknown>
  return {
    id:               String(d.id ?? d.policyId ?? ''),
    loadsureRef:      String(d.reference ?? d.ref ?? d.id ?? ''),
    shipmentId:       req?.shipmentId ?? String((d.metadata as Record<string,unknown>)?.shipmentId ?? ''),
    userId:           req?.userId ?? '',
    status:           'ACTIVE',
    coverageType:     String(d.coverageType ?? 'ICC_A') as CoverageType,
    premium:          Number((d.premium as Record<string,unknown>)?.amount ?? d.premiumAmount ?? 0),
    currency:         String((d.premium as Record<string,unknown>)?.currency ?? 'EUR'),
    coverageLimit:    Number(d.coverageLimit ?? d.limit ?? 0),
    deductible:       Number(d.deductible ?? d.excess ?? 500),
    issuedAt:         String(d.issuedAt ?? new Date().toISOString()),
    expiresAt:        String(d.expiresAt ?? d.validUntil ?? ''),
    certificateUrl:   String(d.certificateUrl ?? d.certificate?.url ?? ''),
    origin:           String(d.origin ?? ''),
    destination:      String(d.destination ?? ''),
    cargoDescription: String(d.cargoDescription ?? ''),
  }
}

// ── FALLBACK — dane orientacyjne bez API ────────────────────

function getFallbackQuotes(params: InsuranceQuoteRequest): InsuranceQuoteResponse {
  const premium = calculatePremiumLocally({
    cargoValue:    params.cargoValue,
    cargoCategory: params.cargoCategory,
    coverageType:  params.coverageType,
    transportMode: params.transportMode,
    dangerous:     params.dangerous,
    perishable:    params.perishable,
  })

  return {
    success: true,
    source:  'fallback',
    quotes: [
      {
        quoteId:       `FALLBACK_${Date.now()}`,
        provider:      'fallback',
        coverageType:  params.coverageType,
        premium,
        currency:      params.currency,
        coverageLimit: params.cargoValue,
        deductible:    Math.max(Math.round(params.cargoValue * 0.01), 250),
        validUntil:    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
  }
}

function getMockPolicy(req: PolicyBindRequest): Policy {
  const ref = `LSR-${new Date().getFullYear()}-${String(Math.floor(Math.random()*90000)+10000)}`
  return {
    id:               `pol_${Date.now()}`,
    loadsureRef:      ref,
    shipmentId:       req.shipmentId,
    userId:           req.userId,
    status:           'ACTIVE',
    coverageType:     'ICC_A',
    premium:          187,
    currency:         'EUR',
    coverageLimit:    50000,
    deductible:       500,
    issuedAt:         new Date().toISOString(),
    expiresAt:        new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    certificateUrl:   'https://example.com/demo-certificate.pdf',
    origin:           req.shipper.companyName,
    destination:      req.consignee.companyName,
    cargoDescription: 'Demo — brak klucza API',
  }
}
