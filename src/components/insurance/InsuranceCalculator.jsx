import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { inputCls, labelCls } from '../auth/AuthShell'
import {
  BASE_RATES,
  COVERAGE_LABELS,
  CURRENCIES,
  RATE_CATEGORY_LABELS,
  TRANSPORT_MODE_LABELS,
  calculatePremiumLocally,
} from '../../data/insuranceRates'

// Kalkulator składki — liczy na bieżąco, bez przycisku „Oblicz" i bez sieci.
// Wynik wypycha do rodzica przez onQuoteChange, żeby karty ofert widziały tę samą wycenę.

function CoverageChip({ code, active, onClick }) {
  const { t } = useTranslation('pages')
  const name = t(`insurance.coverage.${code}.name`, { defaultValue: COVERAGE_LABELS[code].name })
  const desc = t(`insurance.coverage.${code}.desc`, { defaultValue: COVERAGE_LABELS[code].desc })
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex-1 min-w-[9rem] text-left px-3 py-2.5 rounded-lg border transition-colors
        ${active
          ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'}`}
    >
      <span className={`block text-sm font-medium ${active
        ? 'text-emerald-700 dark:text-emerald-300'
        : 'text-gray-700 dark:text-slate-200'}`}>
        {name}
      </span>
      <span className={`block text-xs mt-0.5 ${active
        ? 'text-emerald-600/80 dark:text-emerald-400/80'
        : 'text-gray-500 dark:text-slate-400'}`}>
        {desc}
      </span>
    </button>
  )
}

function CheckboxRow({ id, checked, onChange, label }) {
  return (
    <label
      htmlFor={id}
      className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer hover:border-gray-300 dark:hover:border-slate-600 transition-colors"
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500"
      />
      <span className="text-sm text-gray-700 dark:text-slate-200">{label}</span>
    </label>
  )
}

const DEFAULTS = {
  cargoValue: 25000,
  currency: 'EUR',
  cargoCategory: 'general',
  transportMode: 'sea',
  coverageType: 'ICC_A',
  dangerous: false,
  perishable: false,
}

// Stan startowy kalkulatora wystawiony na zewnątrz, żeby strona miała czym zasilić karty
// ofert przy pierwszym renderze (efekt z onQuoteChange odpala się dopiero po montażu).
export const DEFAULT_QUOTE = { ...DEFAULTS, premium: calculatePremiumLocally(DEFAULTS) }

export default function InsuranceCalculator({ onQuoteChange }) {
  const { t, i18n } = useTranslation('pages')
  const [cargoValue, setCargoValue]       = useState(DEFAULTS.cargoValue)
  const [currency, setCurrency]           = useState(DEFAULTS.currency)
  const [cargoCategory, setCargoCategory] = useState(DEFAULTS.cargoCategory)
  const [transportMode, setTransportMode] = useState(DEFAULTS.transportMode)
  const [coverageType, setCoverageType]   = useState(DEFAULTS.coverageType)
  const [dangerous, setDangerous]         = useState(DEFAULTS.dangerous)
  const [perishable, setPerishable]       = useState(DEFAULTS.perishable)

  const numericValue = Number(cargoValue) || 0

  const premium = useMemo(
    () => calculatePremiumLocally({
      cargoValue: numericValue, cargoCategory, coverageType, transportMode, dangerous, perishable,
    }),
    [numericValue, cargoCategory, coverageType, transportMode, dangerous, perishable],
  )

  // Callback w ref — rodzic może przekazać funkcję inline, a efekt i tak nie zapętli się
  // na zmianie jej tożsamości (zależy wyłącznie od realnych wartości formularza).
  const cbRef = useRef(onQuoteChange)
  cbRef.current = onQuoteChange

  useEffect(() => {
    cbRef.current?.({
      cargoValue: numericValue,
      currency,
      cargoCategory,
      transportMode,
      coverageType,
      dangerous,
      perishable,
      premium,
    })
  }, [numericValue, currency, cargoCategory, transportMode, coverageType, dangerous, perishable, premium])

  const baseRate = BASE_RATES[cargoCategory] ?? BASE_RATES.general

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-800 space-y-5">
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">{t('insurance.calculator.title')}</p>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
          {t('insurance.calculator.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:items-end">
        <div>
          <label className={labelCls} htmlFor="ins-value">{t('insurance.calculator.cargoValue')}</label>
          <input
            id="ins-value"
            type="number"
            min={0}
            className={inputCls}
            value={cargoValue}
            onChange={(e) => setCargoValue(e.target.value)}
          />
        </div>
        <div className="sm:w-32">
          <label className={labelCls} htmlFor="ins-currency">{t('insurance.calculator.currency')}</label>
          <select
            id="ins-currency"
            className={inputCls}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className={labelCls} htmlFor="ins-category">{t('insurance.calculator.category')}</label>
          <select
            id="ins-category"
            className={inputCls}
            value={cargoCategory}
            onChange={(e) => setCargoCategory(e.target.value)}
          >
            {Object.entries(RATE_CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>
                {t(`insurance.rateCategories.${key}`, { defaultValue: label })} ({BASE_RATES[key].toFixed(2)}%)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="ins-mode">{t('insurance.calculator.mode')}</label>
          <select
            id="ins-mode"
            className={inputCls}
            value={transportMode}
            onChange={(e) => setTransportMode(e.target.value)}
          >
            {Object.entries(TRANSPORT_MODE_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{t(`insurance.modes.${key}`, { defaultValue: label })}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <span className={labelCls}>{t('insurance.calculator.coverage')}</span>
        <div className="flex flex-wrap gap-2">
          {Object.keys(COVERAGE_LABELS).map((code) => (
            <CoverageChip
              key={code}
              code={code}
              active={coverageType === code}
              onClick={() => setCoverageType(code)}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <CheckboxRow
          id="ins-dangerous"
          checked={dangerous}
          onChange={setDangerous}
          label={t('insurance.calculator.dangerous')}
        />
        <CheckboxRow
          id="ins-perishable"
          checked={perishable}
          onChange={setPerishable}
          label={t('insurance.calculator.perishable')}
        />
      </div>

      {/* Wynik — jedno z trzech miejsc, gdzie strona używa akcentu emerald */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300 uppercase tracking-wide">
              {t('insurance.calculator.estimated')}
            </p>
            <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 mt-1">
              {t('insurance.calculator.baseRate', { rate: baseRate.toFixed(2) })} ·{' '}
              {t(`insurance.coverage.${coverageType}.name`, { defaultValue: COVERAGE_LABELS[coverageType].name })} ·{' '}
              {t(`insurance.modes.${transportMode}`, { defaultValue: TRANSPORT_MODE_LABELS[transportMode] }).toLowerCase()}
            </p>
          </div>
          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300 leading-none">
            {premium.toLocaleString(i18n.language)} {currency}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400 dark:text-slate-500">
        {t('insurance.calculator.note')}
      </p>
    </div>
  )
}
