import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ExternalLink, CheckCircle2 } from 'lucide-react'
import { analyzeContainerNumber } from '../../utils/containerNumber'
import { lookupCarrierByPrefix, resolveTrackerUrl, AGGREGATORS } from '../../data/containerPrefixes'
import AlertBox from '../ui/AlertBox'

const inputCls =
  'w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm font-mono tracking-wider text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-colors'

// Numer wpisany przez użytkownika żyje WYŁĄCZNIE w tym stanie komponentu — nic
// tu nie trafia do localStorage, bazy ani console.log (dane handlowe klienta).
export default function ContainerLookup() {
  const { t } = useTranslation('pages')
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    if (!input.trim()) {
      setResult(null)
      return
    }
    const analysis = analyzeContainerNumber(input)
    const carrier = analysis.prefix ? lookupCarrierByPrefix(analysis.prefix) : null
    setResult({ ...analysis, carrier })
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg flex-1">
          <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" strokeWidth={2} />
          <input
            type="text"
            className="bg-transparent text-sm font-mono tracking-wider outline-none flex-1 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
            placeholder={t('tracking.container.inputPlaceholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0"
        >
          {t('tracking.container.checkButton')}
        </button>
      </form>

      {result && (
        <div className="space-y-4">
          {result.valid === false && (
            <AlertBox type="warning">{t('tracking.container.checkDigitWarning')}</AlertBox>
          )}

          {result.carrier ? (
            <>
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg border-l-4 bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 dark:border-emerald-500">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" strokeWidth={1.75} />
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                  {t('tracking.container.recognized', { carrier: result.carrier.name, prefix: result.prefix })}
                </p>
              </div>

              <a
                href={resolveTrackerUrl(result.carrier, result.normalized)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors group"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {t('tracking.container.directLinkLabel', { carrier: result.carrier.name })}
                  </p>
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                    {t('tracking.container.directLinkBadge')}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-emerald-500 shrink-0" strokeWidth={1.75} />
              </a>
            </>
          ) : (
            <AlertBox type="info">{t('tracking.container.unrecognized')}</AlertBox>
          )}

          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
              {t('tracking.container.aggregatorsTitle')}
            </p>
            <div className="flex flex-col gap-2">
              {AGGREGATORS.map((agg) => (
                <a
                  key={agg.id}
                  href={agg.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600 transition-colors group"
                >
                  <span className="text-sm font-medium text-gray-700 dark:text-slate-200">{agg.name}</span>
                  <ExternalLink className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:group-hover:text-slate-300 shrink-0" strokeWidth={1.75} />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-slate-500 mt-6">
        {t('tracking.container.footerNote')}
      </p>
    </div>
  )
}
