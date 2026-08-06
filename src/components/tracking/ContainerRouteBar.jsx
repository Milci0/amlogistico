import { useTranslation } from 'react-i18next'
import { formatDocumentDate } from '../../utils/formatDate'
import { computeVoyageProgress } from '../../utils/voyageProgress'

// Pasek trasy ze stanu 5: port załadunku po lewej, port rozładunku po prawej,
// pomiędzy pasek postępu.
//
// POSTĘP LICZONY Z DAT, nie z pola `transit_percentage` z ShipsGo — patrz
// src/utils/voyageProgress.js. Gdy brakuje którejś daty, paska po prostu nie ma:
// zero na pasku sugerowałoby, że rejs stoi w miejscu, a to inna informacja niż
// „nie wiemy".
//
// Na mobile (poniżej sm) układ przechodzi w pionowy: dwa porty jeden pod drugim,
// pasek pionowy między nimi.
export default function ContainerRouteBar({ loading, discharge, loadingDate, dischargeDate }) {
  const { t } = useTranslation('pages')
  const { percent } = computeVoyageProgress(loadingDate, dischargeDate)

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      <Port
        name={loading?.name}
        code={loading?.code}
        date={loadingDate}
        label={t('tracking.portOfLoading')}
        unknown={t('tracking.container.portUnknown')}
      />

      {/* Dwa osobne paski zamiast jednego przełączanego klasami: układ pionowy
          na mobile i poziomy od sm różnią się wymiarem, który trzeba ustawić
          stylem inline (Tailwind nie generuje klas z wartości wyliczanych
          w czasie działania). Jeden element musiałby wtedy nieść oba wymiary
          naraz i jeden z nich zawsze byłby błędny. */}
      <div className="flex sm:flex-1 items-center gap-2 pl-1 sm:pl-0">
        <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0" aria-hidden="true" />

        {/* mobile: pionowy */}
        <div className="sm:hidden w-1.5 h-10 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
          {percent !== null && <div className="w-full bg-orange-600" style={{ height: `${percent}%` }} />}
        </div>

        {/* od sm: poziomy */}
        <div className="hidden sm:block flex-1 h-1.5 rounded-full bg-gray-100 dark:bg-slate-700 overflow-hidden">
          {percent !== null && <div className="h-full bg-orange-600" style={{ width: `${percent}%` }} />}
        </div>

        <span className="w-2 h-2 rounded-full border-2 border-orange-600 shrink-0" aria-hidden="true" />
      </div>

      <Port
        name={discharge?.name}
        code={discharge?.code}
        date={dischargeDate}
        label={t('tracking.portOfDischarge')}
        unknown={t('tracking.container.portUnknown')}
        align="right"
      />

      {percent !== null && (
        <p className="sr-only">{t('tracking.container.progressLabel', { percent })}</p>
      )}
    </div>
  )
}

function Port({ name, code, date, label, unknown, align = 'left' }) {
  return (
    <div className={`min-w-0 ${align === 'right' ? 'sm:text-right' : ''}`}>
      <p className="text-[11px] text-gray-400 dark:text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{name || unknown}</p>
      <p className="text-xs text-gray-500 dark:text-slate-400">
        {[code, date ? formatDocumentDate(date) : null].filter(Boolean).join(' · ')}
      </p>
    </div>
  )
}
