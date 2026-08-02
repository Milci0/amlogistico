import { FileText, TriangleAlert } from 'lucide-react'
import AlertBox from '../ui/AlertBox'
import { formatDocumentDate } from '../../utils/formatDate'
import { useTranslation } from 'react-i18next'
import { COVERAGE_LABELS } from '../../data/insuranceRates'

// Lista polis — dane przykładowe z MOCK_POLICIES. Żadne z działań nie sięga na serwer:
// „Certyfikat" i „Zgłoś szkodę" prowadzą do komunikatów, bo obsługa polis jeszcze nie żyje.

const STATUS_STYLES = {
  ACTIVE: {
    cls: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
  },
  EXPIRED: {
    cls: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-600',
  },
  CANCELLED: {
    cls: 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
  },
}

function StatusBadge({ status }) {
  const { t } = useTranslation('pages')
  const s = STATUS_STYLES[status] ?? STATUS_STYLES.EXPIRED
  return (
    <span className={`shrink-0 text-[11px] font-medium px-1.5 py-0.5 rounded border ${s.cls}`}>
      {t(`insurance.policies.status.${status}`, { defaultValue: status })}
    </span>
  )
}

export default function PolicyList({ policies, onCertificate, onClaim }) {
  const { t, i18n } = useTranslation('pages')

  return (
    <div className="space-y-3">
      <AlertBox type="warning">{t('insurance.policies.sample')}</AlertBox>

      <div className="border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 divide-y divide-gray-100 dark:divide-slate-700">
        {policies.map((policy) => (
          <div
            key={policy.id}
            className="p-4 flex flex-col lg:flex-row lg:items-center gap-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">
                  {policy.origin} → {policy.destination}
                </p>
                <StatusBadge status={policy.status} />
              </div>

              <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                {(i18n.language.startsWith('en') && policy.cargoDescriptionEn) || policy.cargoDescription}
              </p>

              <p className="text-xs text-gray-400 dark:text-slate-500 mt-1.5">
                <span className="font-mono">{policy.ref}</span> · {policy.provider} ·{' '}
                {t(`insurance.coverage.${policy.coverageType}.name`, { defaultValue: COVERAGE_LABELS[policy.coverageType]?.name ?? policy.coverageType })}
                {' '}· {t('insurance.policies.premium')}{' '}
                {policy.premium.toLocaleString(i18n.language)} {policy.currency}
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                {t('insurance.policies.validFrom', {
                  from: formatDocumentDate(policy.issuedAt),
                  to: formatDocumentDate(policy.expiresAt),
                })}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => onCertificate(policy)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-sm font-medium hover:border-gray-300 dark:hover:border-slate-500 transition-colors"
              >
                <FileText className="w-4 h-4" />
                {t('insurance.policies.certificate')}
              </button>
              <button
                type="button"
                onClick={() => onClaim(policy)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-sm font-medium hover:border-gray-300 dark:hover:border-slate-500 transition-colors"
              >
                <TriangleAlert className="w-4 h-4" />
                {t('insurance.policies.claim')}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
