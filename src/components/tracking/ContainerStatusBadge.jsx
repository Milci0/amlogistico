import { useTranslation } from 'react-i18next'
import { resolveContainerStatus } from '../../data/containerStatus'

// Plakietka statusu rejsu. Pulsująca kropka WYŁĄCZNIE dla stanu „Pobieramy dane"
// i tylko wtedy, gdy użytkownik nie prosił o ograniczenie animacji
// (motion-reduce wyłącza sam ruch, kropka zostaje).
export default function ContainerStatusBadge({ status, archived, className = '' }) {
  const { t } = useTranslation('pages')
  const style = resolveContainerStatus({ status, archived })

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium whitespace-nowrap ${style.badge} ${className}`}
    >
      <span className="relative flex w-2 h-2 shrink-0">
        {style.pulse && (
          <span
            className={`absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping motion-reduce:animate-none ${style.dot}`}
            aria-hidden="true"
          />
        )}
        <span className={`relative inline-flex w-2 h-2 rounded-full ${style.dot}`} aria-hidden="true" />
      </span>
      {t(style.labelKey)}
    </span>
  )
}
