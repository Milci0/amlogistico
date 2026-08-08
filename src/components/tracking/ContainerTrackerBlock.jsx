import { useTranslation } from 'react-i18next'
import { ExternalLink, CheckCircle2 } from 'lucide-react'
import { identifyContainer } from '../../utils/containerNumber'
import { resolveTrackerUrl, AGGREGATORS } from '../../data/containerPrefixes'
import AlertBox from '../ui/AlertBox'

// Blok „rozpoznano linię / kontener leasingowany / nierozpoznane + agregatory"
// dla DANEGO numeru kontenera. Jedyny konsument: ContainerDetail.jsx
// (persystentny rejestr ShipsGo) — „Lista przesyłek" (RealShipmentDetail,
// numer wzięty z zapisanego zestawu dokumentów) USUNIĘTA 2026-08-08 razem
// z całym przełącznikiem widoku na tej zakładce.
//
// showCheckDigitWarning=false w widoku szczegółów (numer pochodzi z
// zapisanych danych, nie ze świeżo wpisywanego pola) — zostaje jako
// przełącznik, bo literówka w kreatorze też jest możliwa i warto ją sygnalizować.
//
// showFallbackLinks=true domyślnie (link do trackera przewoźnika + sekcja
// agregatorów) — ContainerDetail.jsx zostawia default, ale renderuje ten
// komponent WYŁĄCZNIE gdy container.status === 'UNTRACKED', czyli dokładnie
// wtedy, gdy ShipsGo nie ma żadnych danych — fallback ma sens tylko w tym
// jednym stanie.
//
// Cała zakładka „Śledzenie ładunku" jest w ciemnym pomarańczu (dopasowanie
// do Trasy handlowe, pod którym wisi w menu — patrz TrackingPage.jsx), więc na
// dziś jest tylko jeden akcent. Zostaje jako obiekt/prop (nie stałe klasy) —
// tania furtka, gdyby kiedyś jednak trzeba było odróżnić dwa miejsca użycia.
const ACCENTS = {
  orange: {
    recognizedWrap: 'bg-orange-50 dark:bg-orange-900/30 border-orange-600 dark:border-orange-600',
    recognizedIcon: 'text-orange-700 dark:text-orange-400',
    recognizedText: 'text-orange-900 dark:text-orange-300',
    linkBorder: 'border-orange-200 dark:border-orange-900 hover:border-orange-600 dark:hover:border-orange-700',
    linkBadge: 'text-orange-700 dark:text-orange-400',
    linkIconHover: 'group-hover:text-orange-600',
  },
}

export default function ContainerTrackerBlock({ containerNo, showCheckDigitWarning = true, accent = 'orange', showFallbackLinks = true }) {
  const { t } = useTranslation('pages')
  const result = identifyContainer(containerNo)
  const a = ACCENTS[accent] || ACCENTS.orange

  return (
    <div className="space-y-4">
      {showCheckDigitWarning && result.valid === false && (
        <AlertBox type="warning">{t('tracking.container.checkDigitWarning')}</AlertBox>
      )}

      {showFallbackLinks && result.carrier?.type === 'carrier' && (
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

      {showFallbackLinks && (
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
      )}
    </div>
  )
}
