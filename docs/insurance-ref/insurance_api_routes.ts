// ============================================================
// insurance_api_routes.ts — API Routes dla ubezpieczeń
// Nowy plik — rozbij na osobne pliki jak przy freight:
//
//  src/app/api/insurance/quotes/route.ts   — wyceny
//  src/app/api/insurance/bind/route.ts     — zakup polisy
//  src/app/api/insurance/policies/route.ts — lista polis
//  src/app/api/insurance/claims/route.ts   — zgłoszenie szkody
//  src/app/api/insurance/webhook/route.ts  — powiadomienia Loadsure
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import {
  getInsuranceQuotes,
  bindPolicy,
  getPolicy,
  submitClaim,
  type InsuranceQuoteRequest,
  type PolicyBindRequest,
  type ClaimRequest,
} from '@/lib/insuranceService'
import { db } from '@/lib/db'

// ──────────────────────────────────────────────────────
// 1. QUOTES  →  POST /api/insurance/quotes
// ──────────────────────────────────────────────────────

export async function POST_quotes(req: NextRequest) {
  const body: InsuranceQuoteRequest = await req.json()

  if (!body.cargoValue || !body.originCountry || !body.destinationCountry) {
    return NextResponse.json(
      { success: false, error: 'Brakuje wymaganych pól: cargoValue, originCountry, destinationCountry' },
      { status: 400 }
    )
  }

  const result = await getInsuranceQuotes(body)
  return NextResponse.json(result)
}

// ──────────────────────────────────────────────────────
// 2. BIND  →  POST /api/insurance/bind
// ──────────────────────────────────────────────────────
// Kupuje polisę, zapisuje do bazy, wysyła email z certyfikatem

export async function POST_bind(req: NextRequest) {
  try {
    const body: PolicyBindRequest & { cargoValue: number; currency: string; coverageType: string } = await req.json()

    if (!body.quoteId || !body.shipmentId || !body.userId) {
      return NextResponse.json({ success: false, error: 'Brakuje quoteId, shipmentId lub userId' }, { status: 400 })
    }

    // Binduj polisę przez Loadsure API
    const result = await bindPolicy(body)

    if (!result.success || !result.policy) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 })
    }

    // Zapisz polisę do bazy AMLogistico
    const policy = await db.insurancePolicy.create({
      data: {
        userId:          body.userId,
        shipmentId:      body.shipmentId,
        loadsureRef:     result.policy.loadsureRef,
        status:          'ACTIVE',
        coverageType:    result.policy.coverageType,
        premium:         result.policy.premium,
        currency:        result.policy.currency,
        coverageLimit:   result.policy.coverageLimit,
        deductible:      result.policy.deductible,
        certificateUrl:  result.certificateUrl ?? '',
        issuedAt:        new Date(result.policy.issuedAt),
        expiresAt:       new Date(result.policy.expiresAt),
      },
    })

    // Zaktualizuj zlecenie — oznacz jako ubezpieczone
    await db.shipment.update({
      where: { id: body.shipmentId },
      data:  { insurancePolicyId: policy.id },
    })

    // Wyślij email z certyfikatem (przez emailService.ts)
    // await sendInsuranceCertificate({ to: ..., certificateUrl: result.certificateUrl })

    return NextResponse.json({
      success:        true,
      policyId:       policy.id,
      loadsureRef:    result.policy.loadsureRef,
      certificateUrl: result.certificateUrl,
      premium:        result.policy.premium,
      currency:       result.policy.currency,
    })

  } catch (err) {
    console.error('[POST /api/insurance/bind]', err)
    return NextResponse.json({ success: false, error: 'Wewnętrzny błąd serwera' }, { status: 500 })
  }
}

// ──────────────────────────────────────────────────────
// 3. POLICIES  →  GET /api/insurance/policies
// ──────────────────────────────────────────────────────

export async function GET_policies(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const userId     = searchParams.get('userId')     ?? ''
  const shipmentId = searchParams.get('shipmentId') ?? ''

  const where: Record<string, unknown> = {}
  if (userId)     where.userId     = userId
  if (shipmentId) where.shipmentId = shipmentId

  const policies = await db.insurancePolicy.findMany({
    where,
    orderBy: { issuedAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ success: true, policies })
}

// ──────────────────────────────────────────────────────
// 4. CLAIMS  →  POST /api/insurance/claims
// ──────────────────────────────────────────────────────

export async function POST_claims(req: NextRequest) {
  try {
    const body: ClaimRequest = await req.json()

    if (!body.policyId || !body.description || !body.lossAmount) {
      return NextResponse.json(
        { success: false, error: 'Brakuje policyId, description lub lossAmount' },
        { status: 400 }
      )
    }

    // Pobierz loadsureRef z bazy
    const policy = await db.insurancePolicy.findUnique({
      where:  { id: body.policyId },
      select: { loadsureRef: true },
    })

    if (!policy) {
      return NextResponse.json({ success: false, error: 'Nie znaleziono polisy' }, { status: 404 })
    }

    const result = await submitClaim({
      ...body,
      policyId: policy.loadsureRef,  // Loadsure potrzebuje swojego ref
    })

    if (result.success) {
      // Zapisz zgłoszenie szkody do bazy
      await db.insuranceClaim.create({
        data: {
          policyId:    body.policyId,
          shipmentId:  body.shipmentId,
          loadsureRef: result.claimId ?? '',
          status:      'SUBMITTED',
          description: body.description,
          lossDate:    new Date(body.lossDate),
          lossAmount:  body.lossAmount,
          currency:    body.currency,
        },
      })
    }

    return NextResponse.json(result)

  } catch (err) {
    return NextResponse.json({ success: false, error: 'Błąd zgłoszenia szkody' }, { status: 500 })
  }
}

// ──────────────────────────────────────────────────────
// 5. WEBHOOK  →  POST /api/insurance/webhook
// ──────────────────────────────────────────────────────
// Loadsure wysyła powiadomienia o zmianie statusu polisy i szkód.
// Ustaw URL w panelu Loadsure: https://amlogistico.com/api/insurance/webhook

export async function POST_webhook(req: NextRequest) {
  const signature = req.headers.get('x-loadsure-signature') ?? ''
  const secret    = process.env.LOADSURE_WEBHOOK_SECRET ?? ''
  const body      = await req.text()

  // Weryfikacja podpisu
  const crypto  = require('crypto')
  const expected = crypto.createHmac('sha256', secret).update(body).digest('hex')
  if (signature !== expected && secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const event = JSON.parse(body) as {
    type:      string
    policyId:  string
    claimId?:  string
    status?:   string
    data:      Record<string, unknown>
  }

  console.log(`[Insurance Webhook] ${event.type} — policy ${event.policyId}`)

  switch (event.type) {
    case 'policy.issued':
      await db.insurancePolicy.updateMany({
        where: { loadsureRef: event.policyId },
        data:  {
          status:         'ACTIVE',
          certificateUrl: String(event.data.certificateUrl ?? ''),
        },
      })
      break

    case 'policy.cancelled':
      await db.insurancePolicy.updateMany({
        where: { loadsureRef: event.policyId },
        data:  { status: 'CANCELLED' },
      })
      break

    case 'policy.expired':
      await db.insurancePolicy.updateMany({
        where: { loadsureRef: event.policyId },
        data:  { status: 'EXPIRED' },
      })
      break

    case 'claim.approved':
      await db.insuranceClaim.updateMany({
        where: { loadsureRef: event.claimId ?? '' },
        data:  { status: 'APPROVED' },
      })
      break

    case 'claim.paid':
      await db.insuranceClaim.updateMany({
        where: { loadsureRef: event.claimId ?? '' },
        data:  {
          status:     'PAID',
          paidAmount: Number(event.data.paidAmount ?? 0),
          paidAt:     new Date(),
        },
      })
      break
  }

  return NextResponse.json({ received: true })
}
