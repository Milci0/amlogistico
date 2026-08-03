import { useSearchParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { Navigation } from 'lucide-react'
import AlertBox from '../components/ui/AlertBox'
import { getShipment } from '../data/trackingMock'
import TrackingList from '../components/tracking/TrackingList'
import TrackingDetail from '../components/tracking/TrackingDetail'

// Zakładka „Śledzenie ładunku" (wysuwana spod „Trasy handlowe" w menu) — WYŁĄCZNIE
// makieta. Zero API, zero WebSocketów, zero integracji z przewoźnikami: dane
// z data/trackingMock.js, cel to ocena układu (lista → szczegóły), nie działająca
// funkcja śledzenia.

export default function TrackingPage() {
  const { t } = useTranslation('pages')
  const [searchParams] = useSearchParams()
  const shipmentId = searchParams.get('shipmentId')
  const shipment = shipmentId ? getShipment(shipmentId) : null

  return (
    <div className="max-w-5xl mx-auto">
      <Helmet>
        <title>{t('tracking.metaTitle')}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {!shipment && (
        <div className="flex items-start gap-4 border border-gray-200 dark:border-slate-700 rounded-xl p-5 bg-white dark:bg-slate-800 mb-6">
          <div className="w-12 h-12 rounded-xl shrink-0 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/40 dark:to-teal-900/30 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900">
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

      {shipmentId && !shipment && (
        <div className="mb-6">
          <AlertBox type="warning" title={t('tracking.notFoundTitle')}>
            {t('tracking.notFoundBody', { id: shipmentId })}
          </AlertBox>
        </div>
      )}

      {shipment ? <TrackingDetail shipment={shipment} /> : <TrackingList />}
    </div>
  )
}
