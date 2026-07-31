'use client'

// ============================================================
// InsuranceTab.tsx — Zakładka ubezpieczeń cargo
// Nowy plik — wrzuć do: src/components/insurance/InsuranceTab.tsx
//
// Podłącz jako stronę:
//   src/app/(dashboard)/ubezpieczenia/page.tsx
//   export default function Page() { return <InsuranceTab /> }
// ============================================================

import { useState, useEffect, useCallback } from 'react'
import type { Policy, InsuranceQuote, CoverageType } from '@/lib/insuranceService'
import { calculatePremiumLocally, BASE_RATES, COVERAGE_MULTIPLIERS } from '@/lib/insuranceService'
import PolicyPurchaseModal from './PolicyPurchaseModal'
import ClaimModal from './ClaimModal'

// ── TYPY LOKALNE ────────────────────────────────────────────

interface QuoteParams {
  cargoValue:    number
  cargoCategory: string
  coverageType:  CoverageType
  transportMode: string
  currency:      string
}

// ── KOMPONENT GŁÓWNY ────────────────────────────────────────

export default function InsuranceTab() {
  const [policies,       setPolicies]       = useState<Policy[]>([])
  const [quotes,         setQuotes]         = useState<InsuranceQuote[]>([])
  const [loadingQuotes,  setLoadingQuotes]  = useState(false)
  const [loadingPolicies,setLoadingPolicies]= useState(true)
  const [purchaseQuote,  setPurchaseQuote]  = useState<InsuranceQuote | null>(null)
  const [claimPolicy,    setClaimPolicy]    = useState<Policy | null>(null)
  const [quoteSource,    setQuoteSource]    = useState<'loadsure' | 'fallback'>('fallback')

  const [params, setParams] = useState<QuoteParams>({
    cargoValue:    50000,
    cargoCategory: 'general',
    coverageType:  'ICC_A',
    transportMode: 'sea',
    currency:      'EUR',
  })

  // Wylicz premię lokalnie dla kalkulatora (natychmiastowe)
  const localPremium = calculatePremiumLocally(params)

  // Pobierz polisy użytkownika
  useEffect(() => {
    fetch('/api/insurance/policies')
      .then(r => r.json())
      .then(d => setPolicies(d.policies ?? MOCK_POLICIES))
      .catch(() => setPolicies(MOCK_POLICIES))
      .finally(() => setLoadingPolicies(false))
  }, [])

  // Pobierz wyceny z API
  const fetchQuotes = useCallback(async () => {
    setLoadingQuotes(true)
    try {
      const res  = await fetch('/api/insurance/quotes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          originCountry:      'PL',
          originCity:         'Gdańsk',
          destinationCountry: 'US',
          destinationCity:    'Newark',
          transportMode:      params.transportMode,
          cargoDescription:   'Ładunek ogólny',
          cargoCategory:      params.cargoCategory,
          cargoValue:         params.cargoValue,
          currency:           params.currency,
          weight:             10000,
          quantity:           1,
          coverageType:       params.coverageType,
        }),
      })
      const data = await res.json()
      setQuotes(data.quotes ?? [])
      setQuoteSource(data.source ?? 'fallback')
    } catch {
      setQuotes([])
    } finally {
      setLoadingQuotes(false)
    }
  }, [params])

  useEffect(() => { fetchQuotes() }, [fetchQuotes])

  // Statystyki
  const activePolicies = policies.filter(p => p.status === 'ACTIVE')
  const totalCoverage  = activePolicies.reduce((s, p) => s + p.coverageLimit, 0)
  const totalPremium   = activePolicies.reduce((s, p) => s + p.premium, 0)
  const avgRate        = totalCoverage > 0
    ? ((totalPremium / totalCoverage) * 100).toFixed(2)
    : '0.00'

  // ── RENDER ────────────────────────────────────────────────

  return (
    <div className="p-5 bg-[#141b2d] min-h-screen">

      {/* STATYSTYKI */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <StatCard label="Aktywne polisy"       value={String(activePolicies.length)}  sub="w tym miesiącu"     badge={{ text: `+${activePolicies.length}`, color: 'green' }} />
        <StatCard label="Ubezpieczona wartość" value={`€${Math.round(totalCoverage/1000)}k`} sub="łącznie cargo" />
        <StatCard label="Składki zapłacone"    value={`€${totalPremium}`}             sub={`śr. ${avgRate}% wartości`} badge={{ text: 'Rynkowa stawka', color: 'amber' }} />
        <StatCard label="Zgłoszone szkody"     value="0"                              sub="brak szkód"         badge={{ text: 'Bezszkodowy', color: 'green' }} />
      </div>

      {/* BANER — aktywne zlecenie bez ubezpieczenia */}
      <div className="bg-green-500/7 border border-green-500/18 rounded-xl p-3 flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">
          Masz aktywne zlecenie bez ubezpieczenia?{' '}
          <strong className="text-white">Dodaj ochronę do przesyłki Gdańsk → Newark · Ładunek €{params.cargoValue.toLocaleString()}.</strong>
        </p>
        <button
          onClick={() => quotes[0] && setPurchaseQuote(quotes[0])}
          className="px-3 py-1.5 bg-green-500 text-gray-900 font-semibold text-xs rounded-lg whitespace-nowrap hover:bg-green-400 transition-colors"
        >
          Ubezpiecz teraz →
        </button>
      </div>

      {/* GŁÓWNA SIATKA */}
      <div className="grid grid-cols-[1fr_290px] gap-3 mb-4">

        {/* OFERTY */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <i className="ti ti-shield-check text-green-500/60 text-[13px]" aria-hidden="true"></i>
              Dostępne oferty
            </p>
            <button onClick={fetchQuotes} className="text-[11px] text-green-400 hover:text-green-300">
              ↻ Odśwież
            </button>
          </div>

          {loadingQuotes ? (
            <div className="flex items-center justify-center py-12 text-gray-500 text-sm gap-2">
              <span className="animate-spin text-green-400">⏳</span> Pobieranie wycen...
            </div>
          ) : (
            <div className="flex flex-col gap-2">

              {/* LOADSURE */}
              <QuoteCard
                name="Loadsure · Thames All-Risk"
                sub="Pokrycie all-risk do $2M · natychmiastowy certyfikat"
                iconColor="bg-green-500/15 text-green-400"
                premium={quotes[0]?.premium ?? localPremium}
                currency={params.currency}
                tags={[
                  { label: '★ Najlepszy wybór', color: 'green' },
                  { label: 'All-risk ICC(A)',    color: 'blue'  },
                  { label: 'Certyfikat w 40 sek.', color: 'green' },
                  { label: 'Szkody w kilka dni', color: 'amber' },
                ]}
                meta={[
                  { key: 'Pokrycie',  val: 'do $2 000 000' },
                  { key: 'Franszyza', val: `$${quotes[0]?.deductible ?? 500}` },
                  { key: 'Zasięg',    val: 'globalny' },
                  { key: 'Ważność',   val: 'na trasę' },
                ]}
                highlighted
                btnLabel="Kup teraz →"
                onBuy={() => quotes[0] && setPurchaseQuote(quotes[0])}
              />

              {/* MARSH */}
              <QuoteCard
                name="Marsh · CargoCover Standard"
                sub="Polisa roczna obrotowa · obsługa brokera"
                iconColor="bg-indigo-500/15 text-indigo-400"
                premium={Math.round((quotes[0]?.premium ?? localPremium) * 0.77)}
                currency={params.currency}
                tags={[
                  { label: 'ICC(A) + kradzież', color: 'blue'  },
                  { label: '1-2 dni robocze',   color: 'amber' },
                ]}
                meta={[
                  { key: 'Pokrycie',  val: 'do €5 000 000' },
                  { key: 'Franszyza', val: '€300' },
                  { key: 'Zasięg',    val: 'globalny' },
                ]}
                btnLabel="Zapytaj →"
                btnStyle="bg-indigo-500/15 text-indigo-400 border border-indigo-500/25"
                onBuy={() => alert('Marsh — wkrótce dostępne po podpisaniu umowy partnerskiej')}
              />

            </div>
          )}

          <div className={`mt-2 p-2 rounded-lg text-[10px] flex items-center gap-1.5 ${
            quoteSource === 'loadsure'
              ? 'bg-green-500/5 border border-green-500/12 text-green-400/60'
              : 'bg-amber-500/5 border border-amber-500/12 text-amber-400/60'
          }`}>
            <i className="ti ti-info-circle text-[13px]" aria-hidden="true"></i>
            {quoteSource === 'loadsure'
              ? <>Stawki pobierane w czasie rzeczywistym przez <strong className="text-green-400/80">Loadsure API</strong></>
              : 'Stawki orientacyjne — dodaj LOADSURE_API_KEY aby pobrać wyceny na żywo'
            }
          </div>
        </div>

        {/* PRAWY PANEL */}
        <div className="flex flex-col gap-2.5">

          {/* KALKULATOR */}
          <div className="bg-[#1a2338] border border-white/7 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/6">
              <span className="text-[11px] font-medium text-gray-500">Kalkulator składki</span>
              <span className="text-[10px] text-green-500/50">via Loadsure</span>
            </div>
            <div className="p-3">
              <CalcField label="Wartość ładunku (EUR)">
                <input
                  type="number"
                  value={params.cargoValue}
                  onChange={e => setParams(p => ({ ...p, cargoValue: Number(e.target.value) }))}
                  className="w-full bg-[#0f1623] border border-white/10 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-green-500"
                />
              </CalcField>
              <CalcField label="Rodzaj ładunku">
                <select
                  value={params.cargoCategory}
                  onChange={e => setParams(p => ({ ...p, cargoCategory: e.target.value }))}
                  className="w-full bg-[#0f1623] border border-white/10 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-green-500"
                >
                  {Object.entries(CARGO_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v} ({BASE_RATES[k]?.toFixed(2)}%)</option>
                  ))}
                </select>
              </CalcField>
              <CalcField label="Zakres ochrony">
                <select
                  value={params.coverageType}
                  onChange={e => setParams(p => ({ ...p, coverageType: e.target.value as CoverageType }))}
                  className="w-full bg-[#0f1623] border border-white/10 rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-green-500"
                >
                  <option value="ICC_A">ICC(A) — all risk</option>
                  <option value="ICC_B">ICC(B) — named perils</option>
                  <option value="ICC_C">ICC(C) — podstawowe</option>
                </select>
              </CalcField>
              <div className="h-px bg-white/6 my-2.5" />
              <CalcRow k="Wartość ładunku" v={`€${params.cargoValue.toLocaleString()}`} />
              <CalcRow k="Stawka bazowa"   v={`${(BASE_RATES[params.cargoCategory] ?? 0.37).toFixed(2)}%`} />
              <CalcRow k="Korekta zakresu" v={`×${COVERAGE_MULTIPLIERS[params.coverageType].toFixed(2)}`} />
              <CalcRow k="Szacowana składka" v={`€${localPremium.toLocaleString()}`} highlight />
              <p className="text-[10px] text-gray-700 mt-1.5">* Orientacyjna wycena. Finalna cena z Loadsure API.</p>
            </div>
          </div>

          {/* ZAKRESY ICC */}
          <div className="bg-[#1a2338] border border-white/7 rounded-xl overflow-hidden">
            <div className="px-3 py-2.5 border-b border-white/6">
              <span className="text-[11px] font-medium text-gray-500">Zakresy ochrony</span>
            </div>
            <div className="p-3">
              {[
                { name: 'ICC(A) — All Risk',     desc: 'Wszystkie ryzyka · najszerszy zakres · zalecany',  icon: 'ti-shield',      color: 'text-green-400  bg-green-500/12' },
                { name: 'ICC(B) — Named Perils', desc: 'Pożar, zatonięcie, zderzenie · bez kradzieży',    icon: 'ti-shield-half', color: 'text-indigo-400 bg-indigo-500/12' },
                { name: 'ICC(C) — Podstawowe',   desc: 'Wypadek środka transportu · zakres minimalny',    icon: 'ti-shield-off',  color: 'text-amber-400  bg-amber-500/12' },
              ].map(({ name, desc, icon, color }) => (
                <div key={name} className="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0">
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 ${color}`}>
                    <i className={`ti ${icon} text-[13px]`} aria-hidden="true"></i>
                  </div>
                  <div>
                    <p className="text-[12px] font-medium text-white">{name}</p>
                    <p className="text-[10px] text-gray-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* AKTYWNE POLISY */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#1a2338] border border-white/7 rounded-xl p-3">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <i className="ti ti-file-certificate text-green-500/60 text-[13px]" aria-hidden="true"></i>
            Aktywne polisy
          </p>
          {loadingPolicies ? (
            <p className="text-xs text-gray-500">Wczytywanie...</p>
          ) : policies.length === 0 ? (
            <p className="text-xs text-gray-500">Brak aktywnych polis.</p>
          ) : (
            policies.slice(0, 4).map(policy => (
              <div key={policy.id} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0 text-xs">
                <div>
                  <span className="text-gray-300 font-mono">{policy.loadsureRef}</span>
                  <span className="text-gray-600 ml-2">{policy.origin} → {policy.destination}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-medium ${policy.status === 'ACTIVE' ? 'text-green-400' : 'text-gray-500'}`}>
                    {policy.status === 'ACTIVE' ? 'Aktywna' : 'Wygasła'}
                  </span>
                  {policy.certificateUrl && (
                    <a href={policy.certificateUrl} target="_blank" rel="noopener noreferrer" className="text-[10px] text-green-400 hover:text-green-300">
                      PDF ↗
                    </a>
                  )}
                  {policy.status === 'ACTIVE' && (
                    <button onClick={() => setClaimPolicy(policy)} className="text-[10px] text-red-400 hover:text-red-300">
                      Szkoda
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        <div className="bg-[#1a2338] border border-white/7 rounded-xl p-3">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <i className="ti ti-info-circle text-green-500/60 text-[13px]" aria-hidden="true"></i>
            Jak to działa
          </p>
          {[
            'Wpisz wartość ładunku i trasę — instant quote z Loadsure API',
            'Kup polisę jednym kliknięciem — certyfikat PDF w 40 sekund',
            'Szkodę zgłaszasz przez AMLogistico — wypłata w kilka dni',
            'Ochrona automatycznie sugerowana przy tworzeniu zlecenia',
          ].map(tip => (
            <div key={tip} className="flex items-start gap-2 py-1.5 border-b border-white/5 last:border-0">
              <i className="ti ti-check text-green-500/60 text-[12px] mt-0.5 flex-shrink-0" aria-hidden="true"></i>
              <span className="text-[11px] text-gray-400">{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MODALE */}
      {purchaseQuote && (
        <PolicyPurchaseModal
          quote={purchaseQuote}
          onSuccess={() => { setPurchaseQuote(null); window.location.reload() }}
          onCancel={() => setPurchaseQuote(null)}
        />
      )}
      {claimPolicy && (
        <ClaimModal
          policy={claimPolicy}
          onSuccess={() => setClaimPolicy(null)}
          onCancel={() => setClaimPolicy(null)}
        />
      )}

    </div>
  )
}

// ── KOMPONENTY POMOCNICZE ───────────────────────────────────

function StatCard({ label, value, sub, badge }: {
  label: string; value: string; sub: string
  badge?: { text: string; color: 'green' | 'amber' }
}) {
  const badgeCls = badge?.color === 'green'
    ? 'bg-green-500/12 text-green-400'
    : 'bg-amber-500/12 text-amber-400'
  return (
    <div className="bg-[#1a2338] border border-white/7 rounded-xl p-3">
      <p className="text-[11px] text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-medium text-white leading-none">{value}</p>
      <p className="text-[11px] text-gray-600 mt-1">{sub}</p>
      {badge && <span className={`inline-block text-[9px] font-medium px-1.5 py-0.5 rounded mt-1.5 ${badgeCls}`}>{badge.text}</span>}
    </div>
  )
}

function QuoteCard({ name, sub, iconColor, premium, currency, tags, meta, highlighted, btnLabel, btnStyle, onBuy }: {
  name: string; sub: string; iconColor: string
  premium: number; currency: string
  tags: { label: string; color: string }[]
  meta: { key: string; val: string }[]
  highlighted?: boolean; btnLabel: string; btnStyle?: string
  onBuy: () => void
}) {
  const tagCls: Record<string, string> = {
    green: 'bg-green-500/12 text-green-400',
    blue:  'bg-indigo-500/15 text-indigo-400',
    amber: 'bg-amber-500/12 text-amber-400',
  }
  return (
    <div className={`bg-[#1a2338] border rounded-xl p-3 ${highlighted ? 'border-green-500/30' : 'border-white/7'}`}>
      <div className="flex items-center gap-2.5 mb-2">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColor}`}>
          <i className="ti ti-shield-check text-[15px]" aria-hidden="true"></i>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-white truncate">{name}</p>
          <p className="text-[11px] text-gray-500 mt-0.5 truncate">{sub}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[15px] font-medium text-white">€{premium.toLocaleString()}</p>
          <p className="text-[10px] text-gray-600">jednorazowa składka</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map(t => <span key={t.label} className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${tagCls[t.color]}`}>{t.label}</span>)}
      </div>
      <div className="flex items-center gap-3 pt-2 border-t border-white/6">
        {meta.map(m => (
          <span key={m.key} className="text-[10px] text-gray-600">{m.key}: <strong className="text-gray-400 font-medium">{m.val}</strong></span>
        ))}
        <button
          onClick={onBuy}
          className={`ml-auto px-3 py-1 text-[11px] font-semibold rounded-md ${btnStyle ?? 'bg-green-500 text-gray-900 hover:bg-green-400'}`}
        >
          {btnLabel}
        </button>
      </div>
    </div>
  )
}

function CalcField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-2">
      <p className="text-[10px] text-gray-500 mb-1">{label}</p>
      {children}
    </div>
  )
}

function CalcRow({ k, v, highlight }: { k: string; v: string; highlight?: boolean }) {
  return (
    <div className={`flex justify-between py-1 px-1.5 rounded mb-0.5 ${highlight ? 'bg-green-500/7 border border-green-500/18' : 'bg-white/3'}`}>
      <span className={`text-[11px] ${highlight ? 'text-green-400 font-medium' : 'text-gray-500'}`}>{k}</span>
      <span className={`text-[11px] font-medium ${highlight ? 'text-green-400 text-[13px]' : 'text-white'}`}>{v}</span>
    </div>
  )
}

// ── STAŁE ───────────────────────────────────────────────────

const CARGO_LABELS: Record<string, string> = {
  general:      'Ogólny cargo',
  machinery:    'Maszyny przemysłowe',
  electronics:  'Elektronika',
  food_chilled: 'Żywność chłodzona',
  food_frozen:  'Żywność mrożona',
  valuable:     'Towary wartościowe',
  chemicals:    'Chemikalia',
  vehicles:     'Pojazdy',
  textiles:     'Tekstylia',
  metals:       'Metale',
  medicines:    'Farmaceutyki',
  dangerous:    'Towar niebezpieczny',
}

const MOCK_POLICIES: Policy[] = [
  {
    id: 'pol_001', loadsureRef: 'LSR-2026-00341', shipmentId: 'ship_001', userId: 'u1',
    status: 'ACTIVE', coverageType: 'ICC_A', premium: 187, currency: 'EUR',
    coverageLimit: 50000, deductible: 500,
    issuedAt: '2026-07-01T10:00:00Z', expiresAt: '2026-08-15T10:00:00Z',
    certificateUrl: '#', origin: 'Gdańsk', destination: 'Newark', cargoDescription: 'Jabłka świeże',
  },
  {
    id: 'pol_002', loadsureRef: 'LSR-2026-00298', shipmentId: 'ship_002', userId: 'u1',
    status: 'ACTIVE', coverageType: 'ICC_A', premium: 312, currency: 'EUR',
    coverageLimit: 85000, deductible: 500,
    issuedAt: '2026-06-15T10:00:00Z', expiresAt: '2026-08-01T10:00:00Z',
    certificateUrl: '#', origin: 'Hamburg', destination: 'Shanghai', cargoDescription: 'Maszyny CNC',
  },
  {
    id: 'pol_003', loadsureRef: 'LSR-2026-00201', shipmentId: 'ship_003', userId: 'u1',
    status: 'EXPIRED', coverageType: 'ICC_B', premium: 95, currency: 'EUR',
    coverageLimit: 30000, deductible: 300,
    issuedAt: '2026-05-01T10:00:00Z', expiresAt: '2026-06-10T10:00:00Z',
    certificateUrl: '#', origin: 'Gdańsk', destination: 'Felixstowe', cargoDescription: 'Meble',
  },
]
