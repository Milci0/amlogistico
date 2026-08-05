import { useTranslation } from 'react-i18next'
import { Ship } from 'lucide-react'

function Field({ label, children }) {
  return (
    <div>
      <p className="text-[11px] text-gray-400 dark:text-slate-500">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mt-0.5">{children}</p>
    </div>
  )
}

// Sekcja „Dane rejsu" — puste pola POMIJANE (nie renderujemy pustych etykiet).
// Dla transportu drogowego większość tych pól w ogóle nie istnieje w danych
// kreatora (sekcja „Szczegóły kontenera i rejsu" jest tylko dla transportu
// morskiego), więc dla drogowych przesyłek cała sekcja się nie wyświetli.
export default function VoyageDetails({ voyage }) {
  const { t } = useTranslation('pages')
  const fields = [
    ['vessel', voyage.vessel],
    ['voyageNo', voyage.voyageNo],
    ['containerNo', voyage.containerNo],
    ['sealNo', voyage.sealNo],
    ['bookingNo', voyage.bookingNo],
    ['flag', voyage.flag],
    ['containerType', voyage.containerType],
    ['freightTerms', voyage.freightTerms],
  ].filter(([, value]) => value)

  if (fields.length === 0) return null

  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <Ship className="w-4 h-4 text-orange-700 dark:text-orange-400" strokeWidth={1.5} />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">
          {t('tracking.voyageDetails')}
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map(([key, value]) => (
          <Field key={key} label={t(`tracking.voyageFields.${key}`)}>{value}</Field>
        ))}
      </div>
    </div>
  )
}
