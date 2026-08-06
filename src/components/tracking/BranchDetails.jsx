import { Truck, Ship, Plane, Waypoints, Thermometer } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { BRANCHES, TRACKING_STATUSES } from '../../data/trackingMock'

const BRANCH_TITLE_ICON = { road: Truck, sea: Ship, air: Plane, multimodal: Waypoints }

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 dark:text-slate-500">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-0.5">{children}</p>
    </div>
  )
}

function RoadDetails({ details }) {
  const { t } = useTranslation('pages')
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label={t('tracking.carrier')}>{details.carrier}</Field>
      <Field label={t('tracking.vehicleReg')}>{details.vehicleReg}</Field>
      <Field label={t('tracking.driver')}>{details.driver}</Field>
      {details.temperature != null && (
        <div>
          <p className="text-[11px] text-gray-400 dark:text-slate-500">{t('tracking.temperature')}</p>
          <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-orange-700 dark:text-orange-400" strokeWidth={1.5} />
            {details.temperature}°C
          </p>
        </div>
      )}
    </div>
  )
}

function SeaDetails({ details }) {
  const { t } = useTranslation('pages')
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label={t('tracking.containerNo')}>{details.containerNo}</Field>
      <Field label={t('tracking.vesselVoyage')}>{details.vessel} · {details.voyageNo}</Field>
      <Field label={t('tracking.portOfLoading')}>{details.portOfLoading}</Field>
      <Field label={t('tracking.portOfDischarge')}>{details.portOfDischarge}</Field>
      <div className="sm:col-span-2">
        <p className="text-[11px] text-gray-400 dark:text-slate-500">{t('tracking.transshipments')}</p>
        <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-0.5">
          {details.transshipments?.length ? details.transshipments.join(', ') : t('tracking.noTransshipments')}
        </p>
      </div>
    </div>
  )
}

function AirDetails({ details }) {
  const { t } = useTranslation('pages')
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label={t('tracking.awbNo')}>{details.awbNo}</Field>
      <Field label={t('tracking.carrier')}>{details.carrier}</Field>
      <div className="sm:col-span-2">
        <p className="text-[11px] text-gray-400 dark:text-slate-500">{t('tracking.layoverAirports')}</p>
        <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-0.5">
          {details.layoverAirports?.length ? details.layoverAirports.join(', ') : t('tracking.directFlight')}
        </p>
      </div>
    </div>
  )
}

function MultimodalDetails({ details }) {
  const { t } = useTranslation('pages')
  return (
    <div className="space-y-2.5">
      {details.legs.map((leg, i) => {
        const LegIcon = BRANCHES[leg.branch].icon
        const status = TRACKING_STATUSES[leg.status]
        return (
          <div
            key={i}
            className="flex items-center gap-3 bg-gray-50 dark:bg-slate-900 rounded-lg p-3"
          >
            <div className="shrink-0 w-9 h-9 rounded-lg bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
              <LegIcon className="w-4 h-4 text-orange-700 dark:text-orange-400" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-slate-100">
                {t('tracking.leg', { number: i + 1 })} · {t(`tracking.branches.${leg.branch}`)}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                {leg.fromCity} → {leg.toCity}
                {leg.carrier && ` · ${leg.carrier}`}
                {leg.vessel && ` · ${leg.vessel}`}
              </p>
            </div>
            <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.badgeClass}`}>
              {t(`tracking.statuses.${leg.status}`)}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function BranchDetails({ shipment }) {
  const { t } = useTranslation('pages')
  const Icon = BRANCH_TITLE_ICON[shipment.branch]

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-orange-700 dark:text-orange-400" strokeWidth={1.5} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
          {t('tracking.detailsFor', { branch: t(`tracking.branches.${shipment.branch}`).toLowerCase() })}
        </h3>
      </div>

      {shipment.branch === 'road' && <RoadDetails details={shipment.branchDetails} />}
      {shipment.branch === 'sea' && <SeaDetails details={shipment.branchDetails} />}
      {shipment.branch === 'air' && <AirDetails details={shipment.branchDetails} />}
      {shipment.branch === 'multimodal' && <MultimodalDetails details={shipment.branchDetails} />}
    </div>
  )
}
