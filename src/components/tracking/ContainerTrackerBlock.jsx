import { useTranslation } from 'react-i18next'
import { ExternalLink, CheckCircle2 } from 'lucide-react'
import { identifyContainer } from '../../utils/containerNumber'
import { resolveTrackerUrl, AGGREGATORS } from '../../data/containerPrefixes'
import AlertBox from '../ui/AlertBox'

// Blok „rozpoznano linię / kontener leasingowany / nierozpoznane + agregatory"
// dla DANEGO numeru kontenera — WSPÓLNY dla ContainerLookup.jsx (wyszukiwarka
// w zakładce „Śledzenie ładunku") i widoku szczegółów przesyłki (numer wzięty
// z zapisanego zestawu dokumentów). Rozpoznawanie linii NIE jest tu duplikowane
// względem ContainerLookup — oba miejsca wołają identifyContainer().
//
// showCheckDigitWarning=false w widoku przesyłki (numer pochodzi z zapisanych
// danych, nie ze świeżo wpisywanego pola) — zostaje jako przełącznik, bo
// literówka w kreatorze też jest możliwa i warto ją sygnalizować.
//
// accent — 'emerald' (domyślny, widok szczegółów własnej przesyłki) albo
// 'amber' (zakładka „Numer kontenera", akcent dopasowany do Trasy handlowe).
// Tylko klasy Tailwind, zero logiki — reszta bloku (agregatory, ostrzeżenia) zostaje neutralna.
const ACCENTS = {
  emerald: {
    recognizedWrap: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-500 dark:border-emerald-500',
    recognizedIcon: 'text-emerald-600 dark:text-emerald-400',
    recognizedText: 'text-emerald-800 dark:text-emerald-300',
    linkBorder: 'border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600',
    linkBadge: 'text-emerald-600 dark:text-emerald-400',
    linkIconHover: 'group-hover:text-emerald-500',
  },
  amber: {
    recognizedWrap: 'bg-amber-50 dark:bg-amber-900/30 border-amber-500 dark:border-amber-500',
    recognizedIcon: 'text-amber-600 dark:text-amber-400',
    recognizedText: 'text-amber-800 dark:text-amber-300',
    linkBorder: 'border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600',
    linkBadge: 'text-amber-600 dark:text-amber-400',
    linkIconHover: 'group-hover:text-amber-500',
  },
}

export default function ContainerTrackerBlock({ containerNo, showCheckDigitWarning = true, accent = 'emerald' }) {
  const { t } = useTranslation('pages')
  const result = identifyContainer(containerNo)
  const a = ACCENTS[accent] || ACCENTS.emerald

  return (
    <div className="space-y-4">
      {showCheckDigitWarning && result.valid === false && (
        <AlertBox type="warning">{t('tracking.container.checkDigitWarning')}</AlertBox>
      )}

      {result.carrier?.type === 'carrier' && (
        <>
          <div className={`flex items-center gap-2 px-4 py-3 rounded-lg border-l-4 ${a.recognizedWrap}`}>
            <CheckCircle2 className={`w-5 h-5 shrink-0 ${a.recognizedIcon}`} strokeWidth={1.75} />
            <p className={`text-sm font-medium ${a.recognizedText}`}>
              {t('tracking.container.recognized', { carrier: result.carrier.name, prefix: result.prefix })}
            </p>
          </div>

          <a
            href={resolveTrackerUrl(result.carrier, result.normalized)}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-between gap-3 p-4 rounded-xl border bg-white dark:bg-slate-800 transition-colors group ${a.linkBorder}`}
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {t('tracking.container.directLinkLabel', { carrier: result.carrier.name })}
              </p>
              <p className={`text-xs font-medium mt-0.5 ${a.linkBadge}`}>
                {t('tracking.container.directLinkBadge')}
              </p>
            </div>
            <ExternalLink className={`w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0 ${a.linkIconHover}`} strokeWidth={1.75} />
          </a>
        </>
      )}

      {result.carrier?.type === 'lessor' && (
        <AlertBox type="warning">
          {t('tracking.container.leased', { lessor: result.carrier.name })}
        </AlertBox>
      )}

      {!result.carrier && (
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
  )
}
