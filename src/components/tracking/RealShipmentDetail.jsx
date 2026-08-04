import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import { BRANCHES } from '../../data/trackingMock'
import { markDelivered } from '../../services/documentSetsRepo'
import ShipmentStatusBadge from './ShipmentStatusBadge'
import ShipmentDateline from './ShipmentDateline'
import VoyageDetails from './VoyageDetails'
import CargoSummary from './CargoSummary'
import ContainerTrackerBlock from './ContainerTrackerBlock'

// Widok szczegółów REALNEJ przesyłki (zasilany zestawem dokumentów, nie
// makietą — patrz utils/shipmentFromSet.js). Numer kontenera i dane rejsu to
// dane handlowe klienta: nic z tego nie opuszcza aplikacji poza linkami
// wychodzącymi do trackerów (target="_blank"), które user sam kliknie.
export default function RealShipmentDetail({ shipment }) {
  const { t } = useTranslation('pages')
  const { t: tCountry } = useTranslation('countries')
  const branch = BRANCHES[shipment.branch] || BRANCHES.road
  const BranchIcon = branch.icon
  const [marking, setMarking] = useState(false)
  const [markError, setMarkError] = useState(false)
  const [delivered, setDelivered] = useState(shipment.delivered)

  const status = delivered ? 'delivered' : shipment.status

  async function handleSetDelivered(next) {
    setMarking(true)
    setMarkError(false)
    try {
      await markDelivered(shipment.id, next)
      setDelivered(next)
    } catch {
      setMarkError(true)
    } finally {
      setMarking(false)
    }
  }

  return (
    <div>
      <Link
        to="/tracking"
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-300 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
        {t('tracking.backToList')}
      </Link>

      {/* Nagłówek */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-6">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
          <BranchIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-bold text-gray-900 dark:text-white truncate">
            {shipment.route.fromCity || '—'} ({tCountry(shipment.route.fromCountry, { defaultValue: shipment.route.fromCountry })})
            {' → '}
            {shipment.route.toCity || '—'} ({tCountry(shipment.route.toCountry, { defaultValue: shipment.route.toCountry })})
          </h1>
          {shipment.cargoDescription && (
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5 truncate">{shipment.cargoDescription}</p>
          )}
        </div>
        <div className="text-right shrink-0">
          <ShipmentStatusBadge status={status} />
        </div>
      </div>

      {/* Status: notka + akcja — dostępna przy KAŻDYM statusie poza „Dostarczona"
          (user zawsze może wiedzieć więcej niż wyliczony z dat status), ale
          wyeksponowana tylko przy „ETA minęła" — to naturalny moment na
          potwierdzenie, reszta dostaje dyskretny przycisk. Przy „Dostarczona"
          zamienia się w cofnięcie, na wypadek pomyłki. */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-6">
        <p className="text-xs text-gray-400 dark:text-slate-500">{t('tracking.statusNote')}</p>

        {status === 'delivered' ? (
          <button
            type="button"
            onClick={() => handleSetDelivered(false)}
            disabled={marking}
            className="mt-3 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-60 transition-colors"
          >
            {marking ? t('tracking.marking') : t('tracking.markNotDelivered')}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => handleSetDelivered(true)}
            disabled={marking}
            className={
              status === 'eta_passed'
                ? 'mt-3 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white transition-colors'
                : 'mt-3 px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-700 disabled:opacity-60 transition-colors'
            }
          >
            {marking ? t('tracking.marking') : t('tracking.markDelivered')}
          </button>
        )}

        {markError && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-2">{t('tracking.markDeliveredError')}</p>
        )}
      </div>

      <div className="space-y-6">
        <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-4">
            {t('tracking.timeline')}
          </h3>
          <ShipmentDateline dates={shipment.dates} delivered={delivered} />
        </div>

        <VoyageDetails voyage={shipment.voyage} />
        <CargoSummary cargo={shipment.cargo} />

        <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-4">
            {t('tracking.trackerSection')}
          </h3>
          {shipment.voyage.containerNo ? (
            <ContainerTrackerBlock containerNo={shipment.voyage.containerNo} showCheckDigitWarning={false} />
          ) : (
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {t('tracking.addContainerNumber')}{' '}
              <Link
                to={`/new-document?editId=${shipment.id}`}
                className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline"
              >
                {t('tracking.editSet')}
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
