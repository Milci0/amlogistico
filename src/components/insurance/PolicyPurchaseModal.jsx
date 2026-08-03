import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Modal from '../ui/Modal'
import AlertBox from '../ui/AlertBox'
import { inputCls, labelCls } from '../auth/AuthShell'
import { COUNTRIES } from '../../data/mockData'
import { COVERAGE_LABELS } from '../../data/insuranceRates'

// Modal zakupu polisy — WYŁĄCZNIE layout. Formularz żyje w stanie komponentu,
// przycisk kończący nie wysyła ani nie zapisuje niczego. Zakup ruszy po podpisaniu
// umowy z ubezpieczycielem; do tego czasu ostatni ekran to komunikat informacyjny.

const STEP_KEYS = ['parties', 'details']

// Klik w dowolne miejsce pola daty otwiera natywny kalendarz (jak w kreatorze).
const openDatePicker = (e) => {
  try { e.currentTarget.showPicker?.() } catch { /* brak wsparcia / brak gestu */ }
}

function Field({ id, label, value, onChange, type = 'text', placeholder, full, onClick }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className={labelCls} htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onClick={onClick}
        placeholder={placeholder}
        className={type === 'date' ? `${inputCls} cursor-pointer` : inputCls}
      />
    </div>
  )
}

function CountryField({ id, label, value, onChange }) {
  const { t } = useTranslation('countries')
  return (
    <div>
      <label className={labelCls} htmlFor={id}>{label}</label>
      <select id={id} className={inputCls} value={value} onChange={(e) => onChange(e.target.value)}>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>{t(c.code, { defaultValue: c.name })}</option>
        ))}
      </select>
    </div>
  )
}

export default function PolicyPurchaseModal({ provider, premium, quote, onClose }) {
  const { t, i18n } = useTranslation('pages')
  const formatMoney = (value, currency) =>
    `${Math.round(value).toLocaleString(i18n.language)} ${currency}`
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)

  const [form, setForm] = useState({
    shipperCompany: '',
    shipperEmail: '',
    shipperCountry: 'PL',
    shipperTaxId: '',
    consigneeCompany: '',
    consigneeEmail: '',
    consigneeCountry: 'DE',
    departureDate: '',
    vesselName: '',
    containerNo: '',
    blNumber: '',
    shipmentId: '',
  })

  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }))

  return (
    <Modal title={t('insurance.purchase.title')} onClose={onClose}>
      {/* Podsumowanie wybranej oferty */}
      <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 p-4 mb-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              {provider.name} · {t(`insurance.providers.${provider.id}.tagline`)}
            </p>
            <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-1">
              {t(`insurance.coverage.${quote.coverageType}.name`, { defaultValue: COVERAGE_LABELS[quote.coverageType]?.name ?? quote.coverageType })}
              {' '}· {t('insurance.purchase.limit')}{' '}
              {formatMoney(quote.cargoValue, quote.currency)} · {t('insurance.purchase.deductible')}{' '}
              {formatMoney(provider.deductible, quote.currency)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-emerald-700 dark:text-emerald-300 leading-none">
              {formatMoney(premium, quote.currency)}
            </p>
            <p className="text-[11px] text-emerald-700/70 dark:text-emerald-400/70 mt-1">
              {t('insurance.purchase.oneOffPremium')}
            </p>
          </div>
        </div>
      </div>

      {done ? (
        <>
          <AlertBox type="info" title={t('insurance.purchase.doneTitle')}>
            {t('insurance.purchase.doneBody')}
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
          {/* Zakładki kroków */}
          <div className="flex border-b border-gray-200 dark:border-slate-700 mb-5">
            {STEP_KEYS.map((stepKey, i) => {
              const active = step === i + 1
              return (
                <button
                  key={stepKey}
                  type="button"
                  onClick={() => setStep(i + 1)}
                  aria-current={active ? 'step' : undefined}
                  className={`flex-1 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                    active
                      ? 'text-emerald-700 dark:text-emerald-300 border-emerald-500 dark:border-emerald-400'
                      : 'text-gray-500 dark:text-slate-400 border-transparent hover:text-gray-700 dark:hover:text-slate-200'
                  }`}
                >
                  {i + 1}. {t(`insurance.purchase.steps.${stepKey}`)}
                </button>
              )
            })}
          </div>

          {step === 1 && (
            <div className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-3">{t('insurance.purchase.sender')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field id="pol-ship-company" label={t('insurance.purchase.companyName')} value={form.shipperCompany} onChange={set('shipperCompany')} full />
                  <Field id="pol-ship-email" label={t('insurance.purchase.email')} type="email" value={form.shipperEmail} onChange={set('shipperEmail')} />
                  <CountryField id="pol-ship-country" label={t('insurance.purchase.country')} value={form.shipperCountry} onChange={set('shipperCountry')} />
                  <Field id="pol-ship-tax" label={t('insurance.purchase.taxId')} value={form.shipperTaxId} onChange={set('shipperTaxId')} full />
                </div>
              </div>

              <div className="pt-5 border-t border-gray-100 dark:border-slate-700">
                <p className="text-sm font-semibold text-gray-800 dark:text-slate-100 mb-3">{t('insurance.purchase.receiver')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field id="pol-cons-company" label={t('insurance.purchase.companyName')} value={form.consigneeCompany} onChange={set('consigneeCompany')} full />
                  <Field id="pol-cons-email" label={t('insurance.purchase.email')} type="email" value={form.consigneeEmail} onChange={set('consigneeEmail')} />
                  <CountryField id="pol-cons-country" label={t('insurance.purchase.country')} value={form.consigneeCountry} onChange={set('consigneeCountry')} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field id="pol-departure" label={t('insurance.purchase.departureDate')} type="date" value={form.departureDate} onChange={set('departureDate')} onClick={openDatePicker} full />
              <Field id="pol-vessel" label={t('insurance.purchase.vesselName')} value={form.vesselName} onChange={set('vesselName')} />
              <Field id="pol-container" label={t('insurance.purchase.containerNo')} value={form.containerNo} onChange={set('containerNo')} placeholder="MSCU1234567" />
              <Field id="pol-bl" label={t('insurance.purchase.blNumber')} value={form.blNumber} onChange={set('blNumber')} full />
              <Field id="pol-shipment" label={t('insurance.purchase.shipmentId')} value={form.shipmentId} onChange={set('shipmentId')} full placeholder={t('insurance.purchase.shipmentIdPlaceholder')} />
            </div>
          )}

          {/* Stopka */}
          <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-gray-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => (step > 1 ? setStep(1) : onClose())}
              className="px-5 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 text-sm font-medium hover:border-gray-300 dark:hover:border-slate-500 transition-colors"
            >
              {step === 1 ? t('actions.cancel', { ns: 'common' }) : t('actions.back', { ns: 'common' })}
            </button>

            {step < STEP_KEYS.length ? (
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
              >
                {t('actions.next', { ns: 'common' })}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setDone(true)}
                className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
              >
                {t('insurance.purchase.buy')}
              </button>
            )}
          </div>
        </>
      )}
    </Modal>
  )
}
