import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, RefreshCw, ExternalLink, Leaf } from 'lucide-react'
import { BRANCHES } from '../../data/trackingMock'
import { markDelivered } from '../../services/documentSetsRepo'
import { getShipsgoStatus, enableTracking, refreshTracking } from '../../services/shipsgoRepo'
import { mapShipsgoStatus } from '../../utils/shipmentFromSet'
import { formatDocumentDate } from '../../utils/formatDate'
import ShipmentStatusBadge from './ShipmentStatusBadge'
import ShipmentDateline from './ShipmentDateline'
import ShipmentMap from './ShipmentMap'
import VoyageDetails from './VoyageDetails'
import CargoSummary from './CargoSummary'
import ContainerTrackerBlock from './ContainerTrackerBlock'

// Widok szczegółów REALNEJ przesyłki (zasilany zestawem dokumentów, nie
// makietą — patrz utils/shipmentFromSet.js). Numer kontenera i dane rejsu to
// dane handlowe klienta: nic z tego nie opuszcza aplikacji poza linkami
// wychodzącymi do trackerów (target="_blank") i wywołaniami do NASZEGO
// backendu (ShipsGo woła wyłącznie backend, token nigdy nie trafia tutaj).
export default function RealShipmentDetail({ shipment }) {
  const { t } = useTranslation('pages')
  const { t: tCountry } = useTranslation('countries')
  const branch = BRANCHES[shipment.branch] || BRANCHES.road
  const BranchIcon = branch.icon
  const [marking, setMarking] = useState(false)
  const [markError, setMarkError] = useState(false)
  const [delivered, setDelivered] = useState(shipment.delivered)

  // ── ShipsGo — dostępność globalna (feature flag) + stan śledzenia tego seta ──
  const [shipsgoAvailable, setShipsgoAvailable] = useState(false)
  const [shipsgo, setShipsgo] = useState(shipment.shipsgo)
  const [shipsgoBusy, setShipsgoBusy] = useState(false)
  const [shipsgoError, setShipsgoError] = useState(false)

  useEffect(() => {
    let active = true
    getShipsgoStatus().then((enabled) => { if (active) setShipsgoAvailable(enabled) })
    return () => { active = false }
  }, [])

  const shipsgoStatus = shipsgo ? mapShipsgoStatus(shipsgo.containerStatus, shipsgo.status) : null
  const status = delivered ? 'delivered' : (shipsgoStatus || shipment.status)
  const dataSource = shipsgo ? 'shipsgo' : 'manual'

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

  // KOSZTUJE KREDYT po stronie ShipsGo (poza duplikatem) — wyłącznie na klik.
  async function handleEnableTracking() {
    setShipsgoBusy(true)
    setShipsgoError(false)
    try {
      const res = await enableTracking(shipment.id)
      if (res.shipsgo) setShipsgo(res.shipsgo)
    } catch {
      setShipsgoError(true)
    } finally {
      setShipsgoBusy(false)
    }
  }

  // NIE kosztuje kredytu — backend i tak respektuje cooldown (checked_at).
  async function handleRefreshTracking() {
    setShipsgoBusy(true)
    setShipsgoError(false)
    try {
      const res = await refreshTracking(shipment.id)
      if (res.shipsgo) setShipsgo(res.shipsgo)
    } catch {
      setShipsgoError(true)
    } finally {
      setShipsgoBusy(false)
    }
  }

  return (
    <div>
      <Link
        to="/tracking"
        className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-300 font-medium hover:text-orange-700 dark:hover:text-orange-400 transition-colors mb-4"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.8} />
        {t('tracking.backToList')}
      </Link>

      {/* Nagłówek */}
      <div className="flex flex-wrap items-center gap-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-6">
        <div className="shrink-0 w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
          <BranchIcon className="w-6 h-6 text-orange-700 dark:text-orange-400" strokeWidth={1.5} />
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

      {/* Mapa + dane z ShipsGo — WYŁĄCZNIE gdy śledzenie zostało włączone dla
          tego zestawu (shipsgo.id). Bez tego nie mamy geometrii trasy ani
          transit_time/co2 — pokazywanie pustej karty nie miałoby sensu. */}
      {shipsgo?.id && (shipsgo.loadingDateInitial || shipsgo.dischargeDateInitial) && (
        <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-6">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-4">
            {t('tracking.map.routeDates')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {shipsgo.loadingDateInitial && (
              <div>
                <p className="text-[11px] text-gray-400 dark:text-slate-500">{t('tracking.portOfLoading')}</p>
                <p className="text-sm mt-0.5">
                  {shipsgo.eta && shipsgo.eta !== shipsgo.loadingDateInitial && (
                    <span className="line-through text-gray-400 dark:text-slate-500 mr-2">
                      {formatDocumentDate(shipsgo.loadingDateInitial)}
                    </span>
                  )}
                  <span className="font-medium text-gray-800 dark:text-slate-100">
                    {formatDocumentDate(shipsgo.loadingDateInitial)}
                  </span>
                </p>
              </div>
            )}
            {shipsgo.dischargeDateInitial && (
              <div>
                <p className="text-[11px] text-gray-400 dark:text-slate-500">{t('tracking.portOfDischarge')}</p>
                <p className="text-sm mt-0.5">
                  {shipsgo.eta && shipsgo.eta !== shipsgo.dischargeDateInitial && (
                    <span className="line-through text-gray-400 dark:text-slate-500 mr-2">
                      {formatDocumentDate(shipsgo.dischargeDateInitial)}
                    </span>
                  )}
                  <span className="font-medium text-gray-800 dark:text-slate-100">
                    {formatDocumentDate(shipsgo.eta || shipsgo.dischargeDateInitial)}
                  </span>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {shipsgo?.id && (
        <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-6">
          <ShipmentMap
            geojson={shipsgo.geojson}
            accent="orange"
            fallbackPorts={{ from: shipsgo.loadingLocation?.name, to: shipsgo.dischargeLocation?.name }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
            {shipsgo.carrier?.name && (
              <div>
                <p className="text-[11px] text-gray-400 dark:text-slate-500">{t('tracking.carrier')}</p>
                <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-0.5">
                  {shipsgo.carrier.name}{shipsgo.carrier.scac ? ` (${shipsgo.carrier.scac})` : ''}
                </p>
              </div>
            )}

            {typeof shipsgo.transitPercentage === 'number' && (
              <div className="col-span-2 sm:col-span-1">
                <p className="text-[11px] text-gray-400 dark:text-slate-500">
                  {t('tracking.map.transitProgress')}
                  {typeof shipsgo.transitTime === 'number' && ` · ${t('tracking.map.transitDays', { count: shipsgo.transitTime })}`}
                </p>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 mt-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-600"
                    style={{ width: `${Math.min(100, Math.max(0, shipsgo.transitPercentage))}%` }}
                  />
                </div>
              </div>
            )}

            {typeof shipsgo.co2Emission === 'number' && (
              <div className="flex items-start gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                <div>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">{t('tracking.map.co2')}</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-0.5">
                    {t('tracking.map.co2Value', { value: shipsgo.co2Emission })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {shipsgo.mapToken && (
            <a
              href={`https://map.shipsgo.com/ocean/shipments/${shipsgo.id}?token=${shipsgo.mapToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 hover:text-orange-700 dark:hover:text-orange-400 transition-colors mt-5"
            >
              {t('tracking.map.openInShipsgo')}
              <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
            </a>
          )}
        </div>
      )}

      {/* Status: notka + akcja — dostępna przy KAŻDYM statusie poza „Dostarczona"
          (user zawsze może wiedzieć więcej niż wyliczony/API status), ale
          wyeksponowana przy „ETA minęła" i „Rozładowany" — to naturalne
          momenty na potwierdzenie, reszta dostaje dyskretny przycisk. Przy
          „Dostarczona" zamienia się w cofnięcie, na wypadek pomyłki. */}
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
              status === 'eta_passed' || status === 'discharged'
                ? 'mt-3 px-4 py-2 rounded-lg text-sm font-semibold bg-orange-700 hover:bg-orange-800 disabled:opacity-60 text-white transition-colors'
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
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
                {t('tracking.timeline')}
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400">
                {t(dataSource === 'shipsgo' ? 'tracking.dataSourceShipsgo' : 'tracking.dataSourceManual')}
              </span>
            </div>

            {shipsgoAvailable && shipment.voyage.containerNo && (
              shipsgo?.id ? (
                <button
                  type="button"
                  onClick={handleRefreshTracking}
                  disabled={shipsgoBusy}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-slate-300 hover:text-orange-700 dark:hover:text-orange-400 disabled:opacity-60 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${shipsgoBusy ? 'animate-spin' : ''}`} strokeWidth={1.75} />
                  {shipsgoBusy ? t('tracking.refreshing') : t('tracking.refresh')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleEnableTracking}
                  disabled={shipsgoBusy}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-orange-700 hover:bg-orange-800 disabled:opacity-60 text-white transition-colors"
                >
                  {shipsgoBusy ? t('tracking.enabling') : t('tracking.enableTracking')}
                </button>
              )
            )}
          </div>

          {shipsgoError && (
            <p className="text-xs text-red-600 dark:text-red-400 mb-3">{t('tracking.shipsgoError')}</p>
          )}

          <ShipmentDateline dates={shipment.dates} delivered={delivered} movements={shipsgo?.movements} />
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
                className="text-orange-700 dark:text-orange-400 font-medium hover:underline"
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
