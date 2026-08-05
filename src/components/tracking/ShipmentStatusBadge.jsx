import { useTranslation } from 'react-i18next'

// „ETA minęła" jest CELOWO tego samego neutralnego koloru co „Zaplanowana",
// nie amber/czerwony — minięcie ETA nie znaczy, że przesyłka jest opóźniona,
// tylko że nie mamy potwierdzenia dostawy. Zgadywanie „opóźniona" jest
// wprost zabronione (patrz shipmentFromSet.js).
// „W porcie docelowym"/„Rozładowany" to KONKRETY z ShipsGo (nie zgadywanie) —
// dostają własny odcień w gradiencie blue→indigo→teal→emerald, bliżej
// „Dostarczona" w miarę postępu, odróżnialny od neutralnego „ETA minęła".
const STATUS_STYLES = {
  planned: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300',
  in_transit: 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  in_destination_port: 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  discharged: 'bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  eta_passed: 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200',
  delivered: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
}

export default function ShipmentStatusBadge({ status, className = '' }) {
  const { t } = useTranslation('pages')
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[status] || STATUS_STYLES.planned} ${className}`}>
      {t(`tracking.realStatuses.${status}`)}
    </span>
  )
}
