import { Thermometer, Scale, ClipboardCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatTempRange } from '../../data/cargoCategories'

// Notka z potwierdzonym zakresem temperatury transportu (patrz CARGO_TEMP_RANGES
// w cargoCategories.js) + badge "wymóg prawny"/"dobra praktyka". Wspólna dla
// CargoCategoryPicker (kreator, puste szablony) i CargoSummary (śledzenie ładunku),
// żeby te dwa miejsca nie rozjeżdżały się wizualnie.

export default function TempRangeNote({ range }) {
  const { t } = useTranslation('cargo')
  if (!range) return null

  return (
    <div className="flex items-start gap-2 px-3.5 py-3 bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 rounded-lg">
      <Thermometer className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" strokeWidth={1.5} />
      <div className="flex-1">
        <p className="text-xs text-sky-800 dark:text-sky-300">
          <span className="font-medium">{t('temp.label')}</span> {formatTempRange(range)}
        </p>
        <span
          className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium
            ${range.legal
              ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
              : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300'}`}
        >
          {range.legal
            ? <><Scale className="w-3 h-3" strokeWidth={1.5} /> {t('temp.legal')}</>
            : <><ClipboardCheck className="w-3 h-3" strokeWidth={1.5} /> {t('temp.practice')}</>}
        </span>
      </div>
    </div>
  )
}
