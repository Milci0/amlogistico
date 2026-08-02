import { Truck, Ship, Plane, Waypoints, Thermometer } from 'lucide-react'
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
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Przewoźnik">{details.carrier}</Field>
      <Field label="Nr rejestracyjny">{details.vehicleReg}</Field>
      <Field label="Kierowca">{details.driver}</Field>
      {details.temperature != null && (
        <div>
          <p className="text-[11px] text-gray-400 dark:text-slate-500">Temperatura (chłodnia)</p>
          <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-0.5 flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            {details.temperature}°C
          </p>
        </div>
      )}
    </div>
  )
}

function SeaDetails({ details }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Nr kontenera">{details.containerNo}</Field>
      <Field label="Statek / rejs">{details.vessel} · {details.voyageNo}</Field>
      <Field label="Port załadunku">{details.portOfLoading}</Field>
      <Field label="Port wyładunku">{details.portOfDischarge}</Field>
      <div className="sm:col-span-2">
        <p className="text-[11px] text-gray-400 dark:text-slate-500">Przeładunki</p>
        <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-0.5">
          {details.transshipments?.length ? details.transshipments.join(', ') : 'Bez przeładunków (bezpośredni)'}
        </p>
      </div>
    </div>
  )
}

function AirDetails({ details }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Field label="Nr AWB">{details.awbNo}</Field>
      <Field label="Przewoźnik">{details.carrier}</Field>
      <div className="sm:col-span-2">
        <p className="text-[11px] text-gray-400 dark:text-slate-500">Lotniska przesiadkowe</p>
        <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-0.5">
          {details.layoverAirports?.length ? details.layoverAirports.join(', ') : 'Brak — lot bezpośredni'}
        </p>
      </div>
    </div>
  )
}

function MultimodalDetails({ details }) {
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
            <div className="shrink-0 w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
              <LegIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-800 dark:text-slate-100">
                Odcinek {i + 1} · {BRANCHES[leg.branch].label}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                {leg.fromCity} → {leg.toCity}
                {leg.carrier && ` · ${leg.carrier}`}
                {leg.vessel && ` · ${leg.vessel}`}
              </p>
            </div>
            <span className={`shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full ${status.badgeClass}`}>
              {status.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function BranchDetails({ shipment }) {
  const Icon = BRANCH_TITLE_ICON[shipment.branch]

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
          Szczegóły transportu — {BRANCHES[shipment.branch].label.toLowerCase()}
        </h3>
      </div>

      {shipment.branch === 'road' && <RoadDetails details={shipment.branchDetails} />}
      {shipment.branch === 'sea' && <SeaDetails details={shipment.branchDetails} />}
      {shipment.branch === 'air' && <AirDetails details={shipment.branchDetails} />}
      {shipment.branch === 'multimodal' && <MultimodalDetails details={shipment.branchDetails} />}
    </div>
  )
}
