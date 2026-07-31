// ============================================================
// TradeRoutes.tsx — Zakładka "Trasy handlowe" dla AMLogistico
//
// Używa:
// - /api/freight/quotes (nasz proxy do Freightos)
// - freightosService.ts (PORT_CODES, typy)
//
// Instalacja zależności: npm install (wszystko z React ecosystem)
// ============================================================

'use client'

import { useState, useCallback } from 'react'
import type { FreightosRate } from '@/lib/freightosService'
import { PORT_CODES } from '@/lib/freightosService'

// ── TYPY LOKALNE ─────────────────────────────────────────────

type LoadType = 'container20' | 'container40' | 'container40HC' | 'pallets' | 'boxes'
type TransportMode = 'sea' | 'air' | 'road' | 'rail'

interface QuoteResult {
  success: boolean
  rates: FreightosRate[]
  source: 'freightos' | 'fallback'
  error?: string
  cached?: boolean
}

interface SearchParams {
  fromInput: string
  toInput: string
  fromCode: string
  toCode: string
  loadtype: LoadType
  quantity: number
  weight: number
  mode: TransportMode
  incoterms: string
}

// ── DANE STATYCZNE ───────────────────────────────────────────

const LOAD_TYPES: { value: LoadType; label: string; multiplier: number }[] = [
  { value: 'container20',   label: "20' Standard FCL",  multiplier: 1    },
  { value: 'container40',   label: "40' Standard FCL",  multiplier: 1.75 },
  { value: 'container40HC', label: "40' High Cube FCL", multiplier: 1.95 },
  { value: 'pallets',       label: 'Palety (LCL)',      multiplier: 0.5  },
  { value: 'boxes',         label: 'Paczki (LCL)',      multiplier: 0.3  },
]

const PORT_SUGGESTIONS = {
  from: [
    { label: 'DCT Gdańsk',   code: 'PLGDN' },
    { label: 'Port Gdynia',  code: 'PLGDY' },
    { label: 'Hamburg',      code: 'DEHAM' },
    { label: 'Rotterdam',    code: 'NLRTM' },
    { label: 'WAW Lotnisko', code: 'WAW'   },
  ],
  to: [
    { label: 'Port Newark NJ',   code: 'USNWK' },
    { label: 'Shanghai',         code: 'CNSHA' },
    { label: 'Singapur',         code: 'SGSIN' },
    { label: 'Felixstowe (UK)',  code: 'GBFXT' },
    { label: 'Jebel Ali (AE)',   code: 'AEJEA' },
    { label: 'Santos (BR)',      code: 'BRSSZ' },
  ],
}

// Mapa carrier logo (fallback na inicjały)
const CARRIER_COLORS: Record<string, string> = {
  FCL:     'bg-blue-900/40 text-blue-300',
  LCL:     'bg-teal-900/40 text-teal-300',
  AIR:     'bg-indigo-900/40 text-indigo-300',
  EXPRESS: 'bg-orange-900/40 text-orange-300',
}

// ── KOMPONENT ────────────────────────────────────────────────

export default function TradeRoutes() {
  const [params, setParams] = useState<SearchParams>({
    fromInput:  'Gdańsk, Polska',
    toInput:    'New York, USA',
    fromCode:   'PLGDN',
    toCode:     'USNWK',
    loadtype:   'container20',
    quantity:   1,
    weight:     15000,
    mode:       'sea',
    incoterms:  'FOB',
  })

  const [loading,  setLoading]  = useState(false)
  const [results,  setResults]  = useState<QuoteResult | null>(null)
  const [searched, setSearched] = useState(false)

  // ── WYSZUKIWANIE ──────────────────────────────────────────

  const search = useCallback(async () => {
    if (!params.fromCode || !params.toCode) return

    setLoading(true)
    setSearched(true)

    try {
      const response = await fetch('/api/freight/quotes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin:      params.fromCode,
          destination: params.toCode,
          loadtype:    params.loadtype,
          weight:      params.weight,
          quantity:    params.quantity,
        }),
      })

      const data: QuoteResult = await response.json()
      setResults(data)

    } catch (err) {
      setResults({
        success: false,
        rates:   [],
        source:  'fallback',
        error:   'Błąd połączenia z serwerem',
      })
    } finally {
      setLoading(false)
    }
  }, [params])

  // ── HELPERY ───────────────────────────────────────────────

  const setPort = (dir: 'from' | 'to', label: string, code: string) => {
    if (dir === 'from') {
      setParams(p => ({ ...p, fromInput: label, fromCode: code }))
    } else {
      setParams(p => ({ ...p, toInput: label, toCode: code }))
    }
    setResults(null)
  }

  const swapPorts = () => {
    setParams(p => ({
      ...p,
      fromInput: p.toInput,
      toInput:   p.fromInput,
      fromCode:  p.toCode,
      toCode:    p.fromCode,
    }))
    setResults(null)
  }

  const formatPrice = (min: number, max: number, currency: string) => {
    const fmt = (n: number) => new Intl.NumberFormat('pl-PL', { style: 'currency', currency, maximumFractionDigits: 0 }).format(n)
    if (min === max) return fmt(min)
    return `${fmt(min)} – ${fmt(max)}`
  }

  const modeLabel: Record<FreightosRate['mode'], string> = {
    FCL:     'Morski FCL (pełny kontener)',
    LCL:     'Morski LCL (drobnica)',
    AIR:     'Lotniczy',
    EXPRESS: 'Ekspresowy',
  }

  const modeIcon: Record<FreightosRate['mode'], string> = {
    FCL:     '🚢',
    LCL:     '📦',
    AIR:     '✈️',
    EXPRESS: '⚡',
  }

  // ── RENDER ────────────────────────────────────────────────

  return (
    <div className="p-6 max-w-screen-xl mx-auto">

      {/* NAGŁÓWEK */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-white">Trasy handlowe</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Stawki frachtowe w czasie rzeczywistym via Freightos · informacje celne · dokumenty
          </p>
        </div>
        <button
          className="px-4 py-2 text-sm font-semibold bg-green-500 text-gray-900 rounded-lg hover:bg-green-400 transition-colors"
          onClick={() => alert('Przechodzi do formularza nowego zlecenia z prefilled trasą')}
        >
          + Nowe zlecenie
        </button>
      </div>

      {/* KARTA WYSZUKIWARKI */}
      <div className="bg-[#1a2338] border border-white/8 rounded-xl p-5 mb-5">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-4">
          Wyszukaj trasę
        </p>

        {/* GŁÓWNY ROW */}
        <div className="grid grid-cols-[1fr_36px_1fr_140px_110px] gap-2 items-end mb-4">

          {/* FROM */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Miejsce nadania</label>
            <input
              className="bg-[#0f1623] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500"
              value={params.fromInput}
              onChange={e => setParams(p => ({ ...p, fromInput: e.target.value, fromCode: '' }))}
              placeholder="Miasto, port lub lotnisko..."
            />
          </div>

          {/* SWAP */}
          <button
            onClick={swapPorts}
            className="h-9 bg-white/5 border border-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:text-green-400 hover:border-green-500/40 transition-colors self-end"
            aria-label="Zamień kierunki"
          >
            ⇄
          </button>

          {/* TO */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Miejsce przeznaczenia</label>
            <input
              className="bg-[#0f1623] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-green-500"
              value={params.toInput}
              onChange={e => setParams(p => ({ ...p, toInput: e.target.value, toCode: '' }))}
              placeholder="Miasto, port lub lotnisko..."
            />
          </div>

          {/* INCOTERMS */}
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-400 font-medium">Incoterms</label>
            <select
              className="bg-[#0f1623] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-green-500"
              value={params.incoterms}
              onChange={e => setParams(p => ({ ...p, incoterms: e.target.value }))}
            >
              {['FOB','CIF','EXW','DDP','DAP','CFR','FCA'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* SEARCH BTN */}
          <button
            onClick={search}
            disabled={loading}
            className="h-9 bg-green-500 hover:bg-green-400 disabled:opacity-50 text-gray-900 font-semibold text-sm rounded-lg px-4 flex items-center gap-2 transition-colors self-end"
          >
            {loading ? (
              <span className="animate-spin">⟳</span>
            ) : (
              <>🔍 Szukaj</>
            )}
          </button>
        </div>

        {/* PORTY SZYBKIEGO WYBORU */}
        <div className="flex gap-5 items-start">
          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1.5">Porty wyjścia</p>
            <div className="flex flex-wrap gap-1.5">
              {PORT_SUGGESTIONS.from.map(p => (
                <button
                  key={p.code}
                  onClick={() => setPort('from', p.label, p.code)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    params.fromCode === p.code
                      ? 'bg-green-500/10 border-green-500/40 text-green-400'
                      : 'bg-white/3 border-white/8 text-gray-500 hover:border-green-500/30 hover:text-green-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px bg-white/7 self-stretch" />

          <div>
            <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-1.5">Porty docelowe</p>
            <div className="flex flex-wrap gap-1.5">
              {PORT_SUGGESTIONS.to.map(p => (
                <button
                  key={p.code}
                  onClick={() => setPort('to', p.label, p.code)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    params.toCode === p.code
                      ? 'bg-green-500/10 border-green-500/40 text-green-400'
                      : 'bg-white/3 border-white/8 text-gray-500 hover:border-green-500/30 hover:text-green-400'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-px bg-white/7 self-stretch" />

          {/* TYP ŁADUNKU + ILOŚĆ */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] text-gray-600 uppercase tracking-wider">Ładunek</p>
            <div className="flex gap-2 items-center">
              <select
                className="bg-[#0f1623] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-green-500"
                value={params.loadtype}
                onChange={e => setParams(p => ({ ...p, loadtype: e.target.value as LoadType }))}
              >
                {LOAD_TYPES.map(l => (
                  <option key={l.value} value={l.value}>{l.label}</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                max={50}
                className="w-16 bg-[#0f1623] border border-white/10 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-green-500"
                value={params.quantity}
                onChange={e => setParams(p => ({ ...p, quantity: Number(e.target.value) }))}
              />
              <span className="text-xs text-gray-600">szt.</span>
            </div>
          </div>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center py-16 text-gray-400 text-sm gap-3">
          <span className="animate-spin text-green-400 text-xl">⟳</span>
          Pobieranie stawek z Freightos API...
        </div>
      )}

      {/* WYNIKI */}
      {!loading && searched && results && (
        <>
          {/* SOURCE BADGE */}
          <div className={`mb-4 px-3 py-2 rounded-lg text-xs flex items-center gap-2 ${
            results.source === 'freightos'
              ? 'bg-green-500/8 border border-green-500/15 text-green-400/70'
              : 'bg-amber-500/8 border border-amber-500/15 text-amber-400/70'
          }`}>
            <span>
              {results.source === 'freightos'
                ? '● Stawki pobrane w czasie rzeczywistym z Freightos API'
                : '⚠ Stawki orientacyjne (Freightos API niedostępne) — zaktualizuj po przywróceniu połączenia'}
            </span>
            {results.cached && <span className="ml-auto opacity-60">cache 5 min</span>}
          </div>

          {/* BRAK WYNIKÓW */}
          {!results.success || results.rates.length === 0 ? (
            <div className="bg-[#1a2338] border border-white/7 rounded-xl p-8 text-center">
              <p className="text-gray-400 text-sm mb-1">Brak wyników dla tej trasy</p>
              <p className="text-gray-600 text-xs">{results.error ?? 'Spróbuj innych portów lub środka transportu'}</p>
            </div>
          ) : (
            /* KARTY STAWEK */
            <div className="grid grid-cols-1 gap-3 mb-5">
              {results.rates.map((rate, i) => (
                <div
                  key={i}
                  className={`bg-[#1a2338] border rounded-xl p-4 transition-colors hover:border-green-500/25 ${
                    i === 0 ? 'border-green-500/30' : 'border-white/7'
                  }`}
                >
                  <div className="flex items-start gap-3">

                    {/* ICON */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${CARRIER_COLORS[rate.mode] ?? 'bg-gray-800 text-gray-400'}`}>
                      {modeIcon[rate.mode]}
                    </div>

                    {/* INFO */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-white">{modeLabel[rate.mode]}</span>
                        {i === 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-green-500/15 text-green-400 font-medium">
                            Najlepsza opcja
                          </span>
                        )}
                        {rate.source === 'fallback' as string && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400">
                            orientacyjna
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>Tranzyt: <strong className="text-gray-300">{rate.transitMin}–{rate.transitMax} dni</strong></span>
                        <span>Ładunek: <strong className="text-gray-300">{params.quantity}× {LOAD_TYPES.find(l=>l.value===params.loadtype)?.label}</strong></span>
                        <span>Trasa: <strong className="text-gray-300">{params.fromCode} → {params.toCode}</strong></span>
                        {rate.quoteId && <span>ID: <strong className="text-gray-300 font-mono">{rate.quoteId}</strong></span>}
                      </div>
                    </div>

                    {/* CENA */}
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">
                        {formatPrice(rate.priceMin, rate.priceMax, rate.currency)}
                      </div>
                      <div className="text-xs text-gray-500">za sztukę · {rate.currency}</div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col gap-1.5 ml-2">
                      {rate.quoteUrl ? (
                        <a
                          href={rate.quoteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 text-xs font-semibold bg-green-500 text-gray-900 rounded-lg hover:bg-green-400 transition-colors whitespace-nowrap"
                        >
                          Zarezerwuj →
                        </a>
                      ) : (
                        <button className="px-3 py-1.5 text-xs font-semibold bg-green-500/10 border border-green-500/25 text-green-400 rounded-lg hover:bg-green-500/20 transition-colors whitespace-nowrap">
                          Szczegóły
                        </button>
                      )}
                      <button
                        className="px-3 py-1.5 text-xs text-gray-500 border border-white/7 rounded-lg hover:border-white/15 transition-colors whitespace-nowrap"
                        onClick={() => alert(`Tworzy zlecenie z prefilled: ${params.fromCode} → ${params.toCode}, ${rate.mode}`)}
                      >
                        + Zlecenie
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

          {/* INFO CELNE — statyczna sekcja */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#1a2338] border border-white/7 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Wymagane dokumenty na tej trasie
              </p>
              <p className="text-xs text-gray-400 mb-2">
                Na podstawie {params.fromCode} → {params.toCode} system dobierze komplet dokumentów automatycznie.
              </p>
              <button
                className="text-xs text-green-400 hover:text-green-300 transition-colors"
                onClick={() => alert('Przechodzi do kreatora dokumentów z prefilled trasą')}
              >
                Przejdź do generatora dokumentów →
              </button>
            </div>
            <div className="bg-[#1a2338] border border-white/7 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                Freightos — jak działa integracja
              </p>
              <ul className="text-xs text-gray-500 space-y-1">
                <li>• Stawki aktualizowane kilka razy dziennie</li>
                <li>• Cache 5 minut po stronie serwera</li>
                <li>• Limit: 100 zapytań/godzinę (dev) — wyższy po rejestracji</li>
                <li>• <a href="https://developer.freightos.com" target="_blank" className="text-green-400 hover:underline">developer.freightos.com</a> — rejestracja</li>
              </ul>
            </div>
          </div>

        </>
      )}

      {/* PUSTY STAN */}
      {!loading && !searched && (
        <div className="text-center py-16">
          <div className="text-4xl mb-3">🗺</div>
          <p className="text-gray-400 text-sm mb-1">Wybierz miejsca nadania i przeznaczenia</p>
          <p className="text-gray-600 text-xs">Aplikacja pobierze aktualne stawki frachtowe i pokaże dostępnych spedytorów</p>
        </div>
      )}

    </div>
  )
}
