import { useTranslation } from 'react-i18next'
import AlertBox from '../ui/AlertBox'

// ── Prezentacja stawek frachtowych ────────────────────────────────────────────
//
// Komponent czysto prezentacyjny — dane bierze z useFreightRates.
// Wariant `compact` (mniejsze paddingi, bez badge „Najlepsza opcja", bez trasy
// na każdej karcie) jest pod osadzenie w kreatorze.

const MODE_COLORS = {
  FCL:     'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  LCL:     'bg-teal-50 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400 border-teal-200 dark:border-teal-800',
  AIR:     'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
  EXPRESS: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
}

// Inline SVG — w projekcie świadomie nie używamy lucide-react.
function ModeIcon({ mode }) {
  const paths = {
    FCL: (
      <>
        <rect x="2" y="7" width="20" height="10" rx="1" />
        <path d="M6 7v10M10 7v10M14 7v10M18 7v10" />
      </>
    ),
    LCL: (
      <>
        <path d="M2 21c.6.5 1.2 1 2.5 1C7 22 7 20 9.5 20c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.2.5 4.3 1.62 6" />
        <path d="M12 10V2M12 2H9" />
      </>
    ),
    AIR: <path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a.8.8 0 0 0-.8 1.3L8 11l-2 3H3l2 3 3 2 .5-3 3.5-2 3.5 4.2a.8.8 0 0 0 1.3-.8Z" />,
    EXPRESS: <path d="M13 2 3 14h8l-1 8 10-12h-8l1-8z" />,
  }
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[mode] ?? paths.FCL}
    </svg>
  )
}

function formatPrice(min, max, currency, locale) {
  const fmt = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency || 'USD',
    maximumFractionDigits: 0,
  })
  return min === max ? fmt.format(min) : `${fmt.format(min)} – ${fmt.format(max)}`
}

export default function FreightRates({
  result,
  loading,
  searched,
  routeLabel,
  cargoLabel,
  compact = false,
}) {
  // ── Ładowanie ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className={`flex items-center justify-center gap-3 text-sm text-gray-500 dark:text-slate-400 ${compact ? 'py-8' : 'py-16'}`}>
        <svg className="w-5 h-5 animate-spin text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Pobieram stawki...
      </div>
    )
  }

  const { t, i18n } = useTranslation('pages')

  if (!searched || !result) return null

  const rates = result.rates ?? []
  const isEmpty = !result.success || rates.length === 0

  return (
    <div>
      {/* ── Badge źródła — tylko gdy faktycznie mamy stawki, inaczej sprzeczne
          z AlertBox „Brak stawek" pod spodem (source:'freightos' + rates:[] jest
          poprawną odpowiedzią API dla trasy bez pokrycia, nie oznacza sukcesu) ── */}
      {!isEmpty && (
        <div
          className={`mb-4 px-3 py-2 rounded-lg text-xs flex items-center gap-2 border ${
            result.source === 'freightos'
              ? 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
              : 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
          }`}
        >
          <span>
            {result.source === 'freightos'
              ? t('freightRates.sourceFreightos')
              : t('freightRates.sourceFallback')}
          </span>
          {result.cached && <span className="ml-auto shrink-0 opacity-70">{t('freightRates.cached')}</span>}
        </div>
      )}

      {/* ── Stan pusty ────────────────────────────────────────────────────── */}
      {isEmpty ? (
        <AlertBox type="warning" title={t('freightRates.emptyTitle')}>
          {t('freightRates.emptyBody')}
        </AlertBox>
      ) : (
        /* ── Karty stawek ────────────────────────────────────────────────── */
        <div className={compact ? 'space-y-2' : 'space-y-3'}>
          {rates.map((rate, i) => (
            <div
              key={`${rate.mode}-${i}`}
              className={`bg-white dark:bg-slate-800 border rounded-xl transition-colors hover:border-emerald-300 dark:hover:border-emerald-700
                ${compact ? 'p-3' : 'p-4'}
                ${!compact && i === 0 ? 'border-emerald-300 dark:border-emerald-700' : 'border-gray-200 dark:border-slate-700'}
                ${compact ? '' : 'border-l-2 border-l-amber-600 hover:border-l-amber-600 dark:border-l-amber-500 dark:hover:border-l-amber-500 rounded-l-none'}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 shrink-0 rounded-lg border flex items-center justify-center ${MODE_COLORS[rate.mode] ?? 'bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-600'}`}>
                  <ModeIcon mode={rate.mode} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                      {t(`freightRates.modes.${rate.mode}`, { defaultValue: rate.mode })}
                    </span>
                    {!compact && i === 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-medium">
                        {t('freightRates.bestOption')}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-slate-400">
                    <span>
                      {t('freightRates.transit')}{' '}
                      <strong className="text-gray-700 dark:text-slate-300 font-medium">
                        {t('freightRates.transitDays', { min: rate.transitMin, max: rate.transitMax })}
                      </strong>
                    </span>
                    {cargoLabel && (
                      <span>
                        {t('freightRates.cargo')} <strong className="text-gray-700 dark:text-slate-300 font-medium">{cargoLabel}</strong>
                      </span>
                    )}
                    {!compact && routeLabel && (
                      <span>
                        {t('freightRates.route')} <strong className="text-gray-700 dark:text-slate-300 font-medium">{routeLabel}</strong>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`font-semibold text-gray-900 dark:text-white ${compact ? 'text-sm' : 'text-base'}`}>
                    {formatPrice(rate.priceMin, rate.priceMax, rate.currency, i18n.language)}
                  </div>
                  <div className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{rate.currency}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
