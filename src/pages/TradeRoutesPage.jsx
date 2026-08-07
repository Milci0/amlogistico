import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import FreightRates from '../components/freight/FreightRates'
import useFreightRates from '../hooks/useFreightRates'
import { inputCls, labelCls } from '../components/auth/AuthShell'

// ── Opcje formularza ────────────────────────────────────────────────────────────

// Same wartości; etykiety idą z tłumaczeń (`pages` → routes.loadTypes).
const LOAD_TYPE_VALUES = ['container20', 'container40', 'container40HC', 'pallets', 'boxes']

// Chipy szybkiego wyboru — kody UN/LOCODE zgodne z PORT_CODES w api/_lib/freightos.js
const PORT_SUGGESTIONS = {
  from: [
    { label: 'DCT Gdańsk',  code: 'PLGDN' },
    { label: 'Port Gdynia', code: 'PLGDY' },
    { label: 'Hamburg',     code: 'DEHAM' },
    { label: 'Rotterdam',   code: 'NLRTM' },
  ],
  to: [
    { label: 'Port Newark', code: 'USNWK' },
    { label: 'Shanghai',    code: 'CNSHA' },
    { label: 'Singapore',   code: 'SGSIN' },
    { label: 'Felixstowe',  code: 'GBFXT' },
    { label: 'Jebel Ali',   code: 'AEJEA' },
    { label: 'Santos',      code: 'BRSSZ' },
  ],
}

// Listy chipów są rozłączne (nadania = europejskie, cele = zamorskie), więc po
// zamianie kierunku wartość pola trafia do listy tego drugiego. Rząd chipów bierze
// listę pasującą do aktualnej wartości — inaczej zaznaczenie znikałoby po swapie.
function suggestionsFor(value, primary, secondary) {
  const code = value.trim().toUpperCase()
  return secondary.some(p => p.code === code) ? secondary : primary
}

// ── Ikony (inline SVG — w tym pliku świadomie bez lucide-react) ─────────────────

// Dwa węzły trasy połączone przerywaną linią.
function RouteIcon({ className = '' }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.7}
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18" cy="5" r="2.5" />
      <path strokeDasharray="3 3" d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5" />
    </svg>
  )
}

// ── Chip portu ──────────────────────────────────────────────────────────────────

function PortChip({ label, code, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors
        ${active
          ? 'border-amber-500 dark:border-amber-400 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'}`}
    >
      {label}
      <span className="ml-1.5 font-mono opacity-50">{code}</span>
    </button>
  )
}

// Kropka-węzeł wewnątrz pola: nadanie = wypełniona, cel = obwódka.
function NodeDot({ hollow = false }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${
        hollow
          ? 'border-2 border-amber-500 dark:border-amber-400'
          : 'bg-amber-500 dark:bg-amber-400'
      }`}
    />
  )
}

// Przerywany łącznik trasy — dekoracja obok przycisku zamiany kierunku.
// Ukryty na mobile, gdzie pola układają się w pionie i pozioma linia nie ma sensu.
function RouteDash({ arrow = false }) {
  return (
    <span aria-hidden="true" className="hidden sm:flex items-center shrink-0">
      <span className="w-5 border-t border-dashed border-amber-300 dark:border-amber-700" />
      {arrow && (
        <svg className="w-2.5 h-2.5 -ml-px text-amber-400 dark:text-amber-600" fill="none"
          stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round"
          viewBox="0 0 24 24">
          <path d="m9 5 7 7-7 7" />
        </svg>
      )}
    </span>
  )
}

// ── Strona ──────────────────────────────────────────────────────────────────────

export default function TradeRoutesPage() {
  const { t } = useTranslation('pages')
  const navigate = useNavigate()
  const { loading, result, searched, search } = useFreightRates()

  const [origin, setOrigin] = useState('PLGDN')
  const [destination, setDestination] = useState('USNWK')
  const [loadtype, setLoadtype] = useState('container20')
  const [quantity, setQuantity] = useState(1)
  const [weight, setWeight] = useState(15000)

  const canSearch = origin.trim() && destination.trim()

  const originPorts = suggestionsFor(origin, PORT_SUGGESTIONS.from, PORT_SUGGESTIONS.to)
  const destinationPorts = suggestionsFor(destination, PORT_SUGGESTIONS.to, PORT_SUGGESTIONS.from)

  function handleSwap() {
    setOrigin(destination)
    setDestination(origin)
  }

  function handleSearch() {
    if (!canSearch) return
    search({
      origin: origin.trim().toUpperCase(),
      destination: destination.trim().toUpperCase(),
      loadtype,
      weight: Number(weight) || 10000,
      quantity: Number(quantity) || 1,
    })
  }

  const routeLabel = `${origin.toUpperCase()} - ${destination.toUpperCase()}`
  const cargoLabel = `${quantity}× ${t(`routes.loadTypes.${loadtype}`, { defaultValue: loadtype })}`

  return (
    <div className="max-w-3xl mx-auto">
      <Helmet>
        <title>{t('routes.metaTitle')}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Nagłówek z akcentem — ten sam wzorzec co /insurance, inny kolor i ikona. */}
      <div className="flex items-start gap-4 border border-gray-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-800 mb-6">
        <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/40 dark:to-orange-900/30 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900">
          <RouteIcon className="w-[26px] h-[26px]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('routes.title')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {t('routes.subtitle')}
          </p>
        </div>
      </div>

      {/* ── Wyszukiwarka ────────────────────────────────────────────── */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-6 bg-white dark:bg-slate-800 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 sm:items-end">
          <div>
            <label className={labelCls} htmlFor="freight-origin">{t('routes.from')}</label>
            <div className="relative">
              <NodeDot />
              <input
                id="freight-origin"
                className={`${inputCls} pl-8`}
                placeholder={t('routes.originPlaceholder')}
                value={origin}
                onChange={e => setOrigin(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 justify-self-center">
            <RouteDash />
            <button
              type="button"
              onClick={handleSwap}
              title={t('routes.swap')}
              aria-label={t('routes.swap')}
              className="h-[42px] px-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-500 dark:text-slate-400 hover:border-gray-300 dark:hover:border-slate-500 hover:text-gray-700 dark:hover:text-slate-200 transition-colors shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8}
                strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M8 3 4 7l4 4M4 7h16" />
                <path d="m16 21 4-4-4-4M20 17H4" />
              </svg>
            </button>
            <RouteDash arrow />
          </div>

          <div>
            <label className={labelCls} htmlFor="freight-destination">{t('routes.to')}</label>
            <div className="relative">
              <NodeDot hollow />
              <input
                id="freight-destination"
                className={`${inputCls} pl-8`}
                placeholder={t('routes.destinationPlaceholder')}
                value={destination}
                onChange={e => setDestination(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-400 dark:text-slate-500 w-11 shrink-0">{t('routes.from')}</span>
          {originPorts.map(p => (
            <PortChip
              key={p.code}
              {...p}
              active={origin.trim().toUpperCase() === p.code}
              onClick={() => setOrigin(p.code)}
            />
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-400 dark:text-slate-500 w-11 shrink-0">{t('routes.to')}</span>
          {destinationPorts.map(p => (
            <PortChip
              key={p.code}
              {...p}
              active={destination.trim().toUpperCase() === p.code}
              onClick={() => setDestination(p.code)}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className={labelCls} htmlFor="freight-loadtype">{t('routes.loadType')}</label>
            <select
              id="freight-loadtype"
              className={inputCls}
              value={loadtype}
              onChange={e => setLoadtype(e.target.value)}
            >
              {LOAD_TYPE_VALUES.map(v => (
                <option key={v} value={v}>{t(`routes.loadTypes.${v}`)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="freight-quantity">{t('routes.quantity')}</label>
            <input
              id="freight-quantity"
              type="number"
              min={1}
              max={50}
              className={inputCls}
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="freight-weight">{t('routes.weight')}</label>
            <input
              id="freight-weight"
              type="number"
              min={1}
              className={inputCls}
              value={weight}
              onChange={e => setWeight(e.target.value)}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSearch}
          disabled={!canSearch || loading}
          className="w-full flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-300 dark:disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}
            strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          {t('routes.search')}
        </button>
      </div>

      {/* ── Wyniki ──────────────────────────────────────────────────── */}
      <FreightRates
        result={result}
        loading={loading}
        searched={searched}
        routeLabel={routeLabel}
        cargoLabel={cargoLabel}
      />

      {/* ── Stan początkowy ─────────────────────────────────────────── */}
      {!searched && !loading && (
        <div className="flex flex-col items-center justify-center text-center bg-white dark:bg-slate-800 border border-dashed border-gray-300 dark:border-slate-600 rounded-2xl py-14 px-6">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5}
              strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
              <path d="M9 20 3 17V4l6 3m0 13 6-3m-6 3V7m6 10 6 3V7l-6-3m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <p className="font-medium text-gray-700 dark:text-slate-200">{t('routes.emptyTitle')}</p>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1 max-w-sm">
            {t('routes.emptyBody')}
          </p>
        </div>
      )}

      {/* ── Dokumenty na tej trasie ─────────────────────────────────── */}
      {searched && !loading && (
        <div className="mt-6 border border-gray-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-800 flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">{t('routes.docsTitle')}</p>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
              {t('routes.docsBody')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/blank-templates')}
            className="shrink-0 px-5 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-sm font-medium hover:border-gray-300 dark:hover:border-slate-500 transition-colors"
          >
            {t('routes.docsCta')}
          </button>
        </div>
      )}

      {/* Warunki API Freightos wymagają wskazania źródła wraz z linkiem. */}
      <p className="text-xs text-gray-400 dark:text-slate-500 mt-4 text-center text-pretty">
        {t('routes.creditPrefix')}{' '}
        <a href="https://www.freightos.com" target="_blank" rel="noopener noreferrer"
          className="underline hover:text-gray-600 dark:hover:text-slate-300">
          Freightos
        </a>
        {t('routes.creditSuffix')}
      </p>
    </div>
  )
}
