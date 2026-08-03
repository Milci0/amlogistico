import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../ui/Modal'
import AlertBox from '../ui/AlertBox'
import { inputCls, labelCls } from '../auth/AuthShell'
import { CURRENCIES } from '../../data/insuranceRates'

// Modal zgłoszenia szkody — WYŁĄCZNIE layout. „Zgłoś szkodę" nic nie wysyła.

const openDatePicker = (e) => {
  try { e.currentTarget.showPicker?.() } catch { /* brak wsparcia / brak gestu */ }
}

export default function ClaimModal({ policy, onClose }) {
  const { t, i18n } = useTranslation('pages')
  const [done, setDone] = useState(false)
  const [lossDate, setLossDate] = useState('')
  const [lossAmount, setLossAmount] = useState('')
  const [currency, setCurrency] = useState(policy.currency)
  const [description, setDescription] = useState('')

  return (
    <Modal title={t('insurance.claim.title')} onClose={onClose}>
      {/* Polisa, której dotyczy zgłoszenie */}
      <div className="rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900/40 p-4 mb-5">
        <p className="text-sm font-semibold text-gray-800 dark:text-slate-100">
          {policy.origin} → {policy.destination}
        </p>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">
          <span className="font-mono">{policy.ref}</span> · {policy.provider} · {t('insurance.claim.coverageUpTo')}{' '}
          {policy.coverageLimit.toLocaleString(i18n.language)} {policy.currency}
        </p>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
          {(i18n.language.startsWith('en') && policy.cargoDescriptionEn) || policy.cargoDescription}
        </p>
      </div>

      {done ? (
        <>
          <AlertBox type="info" title={t('insurance.claim.doneTitle')}>
            {t('insurance.claim.doneBody')}
          </AlertBox>
          <div className="flex justify-end mt-5 pt-5 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
            >
              {t('actions.close', { ns: 'common' })}
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={labelCls} htmlFor="claim-date">{t('insurance.claim.lossDate')}</label>
                <input
                  id="claim-date"
                  type="date"
                  className={`${inputCls} cursor-pointer`}
                  value={lossDate}
                  onClick={openDatePicker}
                  onChange={(e) => setLossDate(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
                <div>
                  <label className={labelCls} htmlFor="claim-amount">{t('insurance.claim.claimAmount')}</label>
                  <input
                    id="claim-amount"
                    type="number"
                    min={0}
                    className={inputCls}
                    value={lossAmount}
                    onChange={(e) => setLossAmount(e.target.value)}
                    placeholder={t('insurance.claim.claimAmountPlaceholder')}
                  />
                </div>
                <div className="w-24">
                  <label className={labelCls} htmlFor="claim-currency">{t('insurance.claim.currency')}</label>
                  <select
                    id="claim-currency"
                    className={inputCls}
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className={labelCls} htmlFor="claim-description">{t('insurance.claim.description')}</label>
              <textarea
                id="claim-description"
                rows={4}
                className={`${inputCls} resize-none`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('insurance.claim.descriptionPlaceholder')}
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-sm font-medium hover:border-gray-300 dark:hover:border-slate-500 transition-colors"
            >
              {t('actions.cancel', { ns: 'common' })}
            </button>
            <button
              type="button"
              onClick={() => setDone(true)}
              className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
            >
              {t('insurance.claim.submit')}
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
