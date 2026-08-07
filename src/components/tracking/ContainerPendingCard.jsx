import { useTranslation } from 'react-i18next'
import { Check, RefreshCw, Loader2, Info } from 'lucide-react'
import { formatDocumentDate } from '../../utils/formatDate'
import ContainerStatusBadge from './ContainerStatusBadge'

// Stan 3 makiety: numer przyjęty, ShipsGo dociąga dane od przewoźnika.
//
// CELOWO BEZ LICZNIKA ODLICZAJĄCEGO i bez konkretnego ETA. Czas zależy od
// armatora i potrafi wynieść od kilkunastu minut do kilku godzin. Fałszywa
// precyzja szkodzi tu bardziej niż uczciwa niepewność: użytkownik, któremu
// obiecano „5 minut", wraca po pięciu minutach i traci zaufanie do całej funkcji.

const STEPS = [
  { key: 'verified', state: 'done' },
  { key: 'sent', state: 'done' },
  { key: 'carrier', state: 'now' },
  { key: 'route', state: 'next' },
]

function StepMarker({ state, index }) {
  if (state === 'done') {
    return (
      <span className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 flex items-center justify-center shrink-0">
        <Check className="w-3.5 h-3.5" strokeWidth={2.5} />
      </span>
    )
  }
  if (state === 'now') {
    return (
      <span className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-400 flex items-center justify-center shrink-0">
        <Loader2 className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" strokeWidth={2.5} />
      </span>
    )
  }
  return (
    <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500 text-xs font-semibold flex items-center justify-center shrink-0">
      {index + 1}
    </span>
  )
}

export default function ContainerPendingCard({ container, onRefresh, refreshing, pollingExhausted }) {
  const { t } = useTranslation('pages')

  return (
    <div className="border border-orange-300 dark:border-orange-900 rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20">
        <div className="min-w-0">
          <p className="text-base font-mono tracking-wider font-semibold text-orange-900 dark:text-orange-200">
            {container.containerNumber}
          </p>
          <p className="text-xs text-orange-800/80 dark:text-orange-300/70 mt-0.5">
            {t('tracking.container.addedAt', { date: formatDocumentDate(container.addedAt, true) })}
          </p>
        </div>
        <ContainerStatusBadge status={container.status} archived={container.archived} />
      </div>

      <div className="p-5 bg-white dark:bg-slate-800">
        <div className="flex gap-3 px-4 py-3 rounded-lg border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20">
          <Info className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" strokeWidth={1.75} />
          <div className="min-w-0">
            <p className="text-sm font-medium text-orange-900 dark:text-orange-200">
              {t('tracking.container.pending.title')}
            </p>
            <p className="text-sm text-orange-800 dark:text-orange-300 mt-1 leading-relaxed">
              {t('tracking.container.pending.body')}
            </p>
          </div>
        </div>

        <ol className="mt-5 flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <li key={step.key} className={`flex items-start gap-3 ${step.state === 'next' ? 'opacity-60' : ''}`}>
              <StepMarker state={step.state} index={i} />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {t(`tracking.container.pending.steps.${step.key}.title`)}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                  {t(`tracking.container.pending.steps.${step.key}.desc`)}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* Przycisk ręcznego odświeżenia pojawia się dopiero, gdy automatyczne
            sprawdzanie się wyczerpało (15 minut). Wcześniej byłby zaproszeniem
            do klikania w coś, co i tak dzieje się samo. */}
        {pollingExhausted && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            {t('tracking.container.refreshNow')}
          </button>
        )}
      </div>
    </div>
  )
}
