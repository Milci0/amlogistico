import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Navigation, Loader2 } from 'lucide-react'
import AlertBox from '../components/ui/AlertBox'
import { getShipment } from '../data/trackingMock'
import { useDocumentSetList } from '../hooks/useDocumentSets'
import { buildShipments } from '../utils/shipmentFromSet'
import TrackingList from '../components/tracking/TrackingList'
import TrackingDetail from '../components/tracking/TrackingDetail'
import RealShipmentDetail from '../components/tracking/RealShipmentDetail'
import ContainerLookup from '../components/tracking/ContainerLookup'

// Zakładka „Śledzenie ładunku" (wysuwana spod „Trasy handlowe" w menu).
// Lista/szczegóły przesyłek — od 2026-08-06 zasilane REALNYMI danymi z zestawów
// dokumentów kreatora (patrz utils/shipmentFromSet.js): przesyłka to projekcja
// DocumentSet, nie osobny rekord — edycja/usunięcie zestawu automatycznie
// aktualizuje/usuwa wpis. Przykładowe dane (data/trackingMock.js) pokazują się
// WYŁĄCZNIE gdy user nie ma jeszcze żadnej realnej przesyłki, wyraźnie
// oznaczone jako przykład (patrz TrackingList).
// Zakładka „Numer kontenera" — rozpoznanie linii po prefiksie BIC + linki
// wychodzące do trackerów przewoźników/agregatorów, a od 2026-08-06 DODATKOWO
// realne dane z ShipsGo Ocean API (gdy włączone, patrz ContainerLookup.jsx) —
// zero przechowywania wpisanych numerów po naszej stronie w obu przypadkach.

const TABS = [
  { id: 'list', labelKey: 'tracking.tabs.list' },
  { id: 'container', labelKey: 'tracking.tabs.container' },
]

// Cała zakładka (obie pod-zakładki) w ciemnym pomarańczu — dopasowanie do
// TradeRoutesPage (/routes), pod którym „Śledzenie ładunku" wisi w menu, ale
// wyraźnie ciemniejsze (orange-600/700/800, nie amber-500/600 jak w /routes),
// żeby dwie sąsiadujące zakładki dało się rozróżnić na pierwszy rzut oka.
const TAB_ACCENT = 'border-orange-600 dark:border-orange-400 bg-orange-50 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300'

export default function TrackingPage() {
  const { t } = useTranslation('pages')
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState('list')
  const shipmentId = searchParams.get('shipmentId')

  const { sets, loading } = useDocumentSetList({ status: 'completed' })
  const shipments = useMemo(() => buildShipments(sets), [sets])

  const realShipment = shipmentId ? shipments.find((s) => s.id === shipmentId) : null
  // Przykłady (mock) trafiają do lookupu TYLKO dopóki user nie ma żadnej
  // realnej przesyłki — jak tylko pojawi się pierwsza, TrackingList przestaje
  // je pokazywać, więc link do przykładu też przestaje mieć sens.
  const mockShipment = !realShipment && shipmentId && !loading && shipments.length === 0
    ? getShipment(shipmentId)
    : null
  const shipment = realShipment || mockShipment

  return (
    <div className="max-w-5xl mx-auto">
      <Helmet>
        <title>{t('tracking.metaTitle')}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {!shipment && (
        <div className="flex items-start gap-4 border border-gray-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-800 mb-6">
          <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/40 dark:to-amber-900/30 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-900">
            <Navigation className="w-[26px] h-[26px]" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('tracking.title')}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {t('tracking.subtitle')}
            </p>
          </div>
        </div>
      )}

      {!shipment && (
        <div className="flex gap-2 mb-5">
          {TABS.map(({ id, labelKey }) => {
            const active = tab === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium border transition-colors
                  ${active
                    ? TAB_ACCENT
                    : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'}`}
              >
                {t(labelKey)}
              </button>
            )
          })}
        </div>
      )}

      {shipmentId && !shipment && !loading && tab === 'list' && (
        <div className="mb-6">
          <AlertBox type="warning" title={t('tracking.notFoundTitle')}>
            {t('tracking.notFoundBody', { id: shipmentId })}
          </AlertBox>
        </div>
      )}

      {realShipment ? (
        <RealShipmentDetail shipment={realShipment} />
      ) : mockShipment ? (
        <TrackingDetail shipment={mockShipment} />
      ) : tab === 'container' ? (
        <ContainerLookup />
      ) : loading ? (
        <div className="flex items-center justify-center py-16 text-gray-400 dark:text-slate-500">
          <Loader2 className="w-5 h-5 animate-spin" strokeWidth={1.75} />
        </div>
      ) : (
        <TrackingList shipments={shipments} />
      )}
    </div>
  )
}
