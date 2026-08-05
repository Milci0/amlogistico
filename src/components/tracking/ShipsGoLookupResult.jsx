import { useTranslation } from 'react-i18next'
import { Radar, Ship, MapPinned, ExternalLink, Leaf } from 'lucide-react'
import { formatDocumentDate } from '../../utils/formatDate'
import { mapShipsgoStatus } from '../../utils/shipmentFromSet'
import { SHIPSGO_EVENT_ICONS, SHIPSGO_EVENT_FALLBACK_ICON } from '../../data/shipsgoEvents'
import ShipmentStatusBadge from './ShipmentStatusBadge'
import ShipmentMap from './ShipmentMap'

// Wynik wolnego wyszukiwania „Numer kontenera" — realne dane z ShipsGo Ocean API
// dla DOWOLNEGO kontenera (nie tylko własnych przesyłek, patrz RealShipmentDetail).
// Ciemny pomarańcz — cała zakładka „Śledzenie ładunku" (patrz TrackingPage.jsx),
// wisi pod „Trasy handlowe" w menu, pokrewny akcent co TradeRoutesPage.

function Field({ icon: Icon, label, children }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 dark:text-slate-500 flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" strokeWidth={2} />}
        {label}
      </p>
      <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-0.5 truncate">{children}</p>
    </div>
  )
}

function TimelineRow({ Icon, filled, title, subtitle, isLast }) {
  return (
    <div className={`flex gap-4 ${filled ? '' : 'opacity-50'}`}>
      <div className="relative shrink-0 flex flex-col items-center">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center
            ${filled ? 'bg-orange-50 dark:bg-orange-900/30' : 'bg-gray-100 dark:bg-slate-700'}`}
        >
          <Icon
            className={`w-4 h-4 ${filled ? 'text-orange-700 dark:text-orange-400' : 'text-gray-400 dark:text-slate-500'}`}
            strokeWidth={1.5}
          />
        </div>
        {!isLast && (
          <span
            className={`w-px flex-1 mt-1 mb-1 ${filled ? 'bg-orange-300 dark:bg-orange-900' : 'border-l border-dashed border-slate-300 dark:border-slate-600'}`}
            aria-hidden="true"
          />
        )}
      </div>
      <div className="flex-1 pb-5">
        <p className="text-sm font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  )
}

export default function ShipsGoLookupResult({ data, cached }) {
  const { t } = useTranslation('pages')
  const movements = Array.isArray(data.movements) ? data.movements : []

  const status = mapShipsgoStatus(data.containerStatus, data.status)
  const lastVesselMovement = [...movements].reverse().find((m) => m.vessel) || null

  const portFrom = data.loadingLocation
    ? [data.loadingLocation.name, data.loadingLocation.code].filter(Boolean).join(' · ')
    : null
  const portTo = data.dischargeLocation
    ? [data.dischargeLocation.name, data.dischargeLocation.code].filter(Boolean).join(' · ')
    : null

  return (
    <div className="border border-orange-300 dark:border-orange-900 rounded-xl overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/30 dark:to-amber-900/20">
        <div className="flex items-center gap-2 min-w-0">
          <Radar className="w-4 h-4 text-orange-700 dark:text-orange-400 shrink-0" strokeWidth={1.75} />
          <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-200 truncate">
            {t('tracking.container.shipsgo.resultTitle')}
          </h3>
          {status && <ShipmentStatusBadge status={status} />}
        </div>
        <p className="text-xs text-orange-800/80 dark:text-orange-300/70 shrink-0">
          {data.checkedAt
            ? t('tracking.container.shipsgo.checkedAt', { date: formatDocumentDate(data.checkedAt, true) })
            : null}
          {cached && ` · ${t('tracking.container.shipsgo.cachedNote')}`}
        </p>
      </div>

      <div className="p-5 space-y-5 bg-white dark:bg-slate-800">
        <ShipmentMap
          geojson={data.geojson}
          accent="orange"
          fallbackPorts={{ from: data.loadingLocation?.name, to: data.dischargeLocation?.name }}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Field icon={MapPinned} label={t('tracking.portOfLoading')}>
            {portFrom || t('tracking.container.shipsgo.etaUnknown')}
          </Field>
          <Field icon={MapPinned} label={t('tracking.portOfDischarge')}>
            {portTo || t('tracking.container.shipsgo.etaUnknown')}
          </Field>
          <Field label={t('tracking.eta')}>
            {data.eta ? formatDocumentDate(data.eta) : t('tracking.container.shipsgo.etaUnknown')}
          </Field>
          <Field icon={Ship} label={t('tracking.container.shipsgo.vessel')}>
            {lastVesselMovement
              ? [lastVesselMovement.vessel, lastVesselMovement.voyage].filter(Boolean).join(' · ')
              : (data.carrier?.name || t('tracking.container.shipsgo.vesselUnknown'))}
          </Field>
        </div>

        {(typeof data.transitPercentage === 'number' || typeof data.co2Emission === 'number') && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {typeof data.transitPercentage === 'number' && (
              <div>
                <p className="text-[11px] text-gray-400 dark:text-slate-500">
                  {t('tracking.map.transitProgress')}
                  {typeof data.transitTime === 'number' && ` · ${t('tracking.map.transitDays', { count: data.transitTime })}`}
                </p>
                <div className="h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 mt-1.5 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-orange-600"
                    style={{ width: `${Math.min(100, Math.max(0, data.transitPercentage))}%` }}
                  />
                </div>
              </div>
            )}
            {typeof data.co2Emission === 'number' && (
              <div className="flex items-start gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" strokeWidth={1.75} />
                <div>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">{t('tracking.map.co2')}</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-0.5">
                    {t('tracking.map.co2Value', { value: data.co2Emission })}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            {t('tracking.container.shipsgo.timelineTitle')}
          </p>
          {movements.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {t('tracking.container.shipsgo.noMovements')}
            </p>
          ) : (
            <div>
              {movements.map((mv, i) => {
                const Icon = SHIPSGO_EVENT_ICONS[mv.event] || SHIPSGO_EVENT_FALLBACK_ICON
                const filled = mv.status === 'ACT'
                const locationLabel = mv.location
                  ? [mv.location.name, mv.location.country].filter(Boolean).join(', ')
                  : ''
                const extra = [mv.vessel, mv.voyage].filter(Boolean).join(' · ')
                return (
                  <TimelineRow
                    key={`${mv.event}-${mv.timestamp || i}`}
                    Icon={Icon}
                    filled={filled}
                    isLast={i === movements.length - 1}
                    title={t(`tracking.shipsgoEvents.${mv.event}`, { defaultValue: mv.event })}
                    subtitle={
                      <>
                        {mv.timestamp ? formatDocumentDate(mv.timestamp, true) : t('tracking.dateline.notProvided')}
                        {locationLabel && ` · ${locationLabel}`}
                        {extra && ` · ${extra}`}
                      </>
                    }
                  />
                )
              })}
            </div>
          )}
        </div>

        {data.mapToken && (
          <a
            href={`https://map.shipsgo.com/ocean/shipments/${data.id}?token=${data.mapToken}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400 hover:text-orange-700 dark:hover:text-orange-400 transition-colors"
          >
            {t('tracking.map.openInShipsgo')}
            <ExternalLink className="w-3 h-3" strokeWidth={1.75} />
          </a>
        )}
      </div>
    </div>
  )
}
