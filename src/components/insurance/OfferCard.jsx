import { Check, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { COVERAGE_LABELS } from '../../data/insuranceRates'

// Karta pojedynczej oferty. Składka = szacunek z kalkulatora × mnożnik dostawcy;
// limit pokrycia = wartość ładunku wpisana w kalkulatorze.

export default function OfferCard({ provider, quote, onSelect }) {
  const { t, i18n } = useTranslation('pages')
  const formatMoney = (value, currency) =>
    `${Math.round(value).toLocaleString(i18n.language)} ${currency}`
  const premium = Math.round(quote.premium * provider.premiumMultiplier)
  const { recommended } = provider

  return (
    <div
      className={`flex flex-col rounded-xl p-5 bg-white dark:bg-slate-800 border transition-colors
        ${recommended
          ? 'border-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-200 dark:ring-emerald-800'
          : 'border-gray-200 dark:border-slate-700'}`}
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0
          ${recommended
            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
            : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400'}`}>
          <ShieldCheck className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">{provider.name}</p>
            {recommended && (
              <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {t('insurance.offer.recommended')}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{t(`insurance.providers.${provider.id}.tagline`)}</p>
        </div>
      </div>

      <div className="mt-4 pb-4 border-b border-gray-100 dark:border-slate-700">
        <p className="text-2xl font-bold text-slate-900 dark:text-white leading-none">
          {formatMoney(premium, quote.currency)}
        </p>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1.5">{t('insurance.purchase.oneOffPremium')}</p>
      </div>

      <dl className="py-4 space-y-1.5 text-sm border-b border-gray-100 dark:border-slate-700">
        <div className="flex justify-between gap-3">
          <dt className="text-gray-500 dark:text-slate-400">Limit pokrycia</dt>
          <dd className="text-gray-800 dark:text-slate-100 font-medium text-right">
            {formatMoney(quote.cargoValue, quote.currency)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-gray-500 dark:text-slate-400">{t('insurance.offer.deductible')}</dt>
          <dd className="text-gray-800 dark:text-slate-100 font-medium text-right">
            {formatMoney(provider.deductible, quote.currency)}
          </dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-gray-500 dark:text-slate-400">{t('insurance.offer.scope')}</dt>
          <dd className="text-gray-800 dark:text-slate-100 font-medium text-right">
            {t(`insurance.coverage.${quote.coverageType}.name`, { defaultValue: COVERAGE_LABELS[quote.coverageType]?.name ?? quote.coverageType })}
          </dd>
        </div>
      </dl>

      <ul className="py-4 space-y-2 flex-1">
        {t(`insurance.providers.${provider.id}.features`, { returnObjects: true }).map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <Check className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-gray-600 dark:text-slate-300">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={() => onSelect(provider, premium)}
        className="w-full px-5 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-sm font-medium hover:border-gray-300 dark:hover:border-slate-500 transition-colors"
      >
        {t(`insurance.providers.${provider.id}.cta`)}
      </button>
    </div>
  )
}
