import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Loader2 } from 'lucide-react'
import { listCarriers } from '../../services/containerTrackingRepo'
import Modal from '../ui/Modal'
import AlertBox from '../ui/AlertBox'

// Stan 6, akcja „Wskaż przewoźnika". Lista pochodzi z GET /ocean/carriers przez
// nasz backend (nie kosztuje kredytu), ale POTWIERDZENIE wyboru tworzy NOWE
// śledzenie, czyli zużywa kolejny kredyt. Dlatego ostrzeżenie jest widoczne od
// razu, a nie schowane w tekście przycisku.
export default function CarrierPickerModal({ containerNumber, onCancel, onConfirm, submitting }) {
  const { t } = useTranslation('pages')
  const [carriers, setCarriers] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [selected, setSelected] = useState('')

  useEffect(() => {
    let active = true
    listCarriers()
      .then((list) => { if (active) setCarriers(list) })
      .catch((e) => { if (active) setLoadError(e) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  return (
    <Modal title={t('tracking.container.untracked.pickCarrier')} onClose={onCancel} maxWidth="max-w-md">
      <div className="px-5 py-4 space-y-4">
        <p className="text-sm text-gray-600 dark:text-slate-300">
          {t('tracking.container.untracked.pickCarrierBody', { number: containerNumber })}
        </p>

        <AlertBox type="warning">{t('tracking.container.untracked.creditWarning')}</AlertBox>

        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
            {t('tracking.container.untracked.loadingCarriers')}
          </div>
        ) : loadError ? (
          <AlertBox type="warning">{loadError.message}</AlertBox>
        ) : (
          <label className="block">
            <span className="text-xs font-medium text-gray-500 dark:text-slate-400">
              {t('tracking.container.untracked.carrierLabel')}
            </span>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="mt-1 w-full px-3 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-sm text-gray-800 dark:text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              <option value="">{t('tracking.container.untracked.carrierPlaceholder')}</option>
              {carriers.map((c) => (
                <option key={c.scac} value={c.scac}>{c.name} ({c.scac})</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex gap-3 px-5 py-4 border-t border-gray-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 rounded-lg px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          {t('tracking.container.cancel')}
        </button>
        <button
          type="button"
          disabled={!selected || submitting}
          onClick={() => onConfirm(selected)}
          className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold bg-orange-700 hover:bg-orange-800 disabled:opacity-60 text-white rounded-lg px-4 py-2.5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />}
          {t('tracking.container.untracked.confirmCarrier')}
        </button>
      </div>
    </Modal>
  )
}
