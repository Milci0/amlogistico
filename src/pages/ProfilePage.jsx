import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { api, ApiError } from '../lib/api'
import AlertBox from '../components/ui/AlertBox'
import { inputCls, labelCls, submitCls } from '../components/auth/AuthShell'
import { formatDocumentDate } from '../utils/formatDate'

// Identyfikatory zakładek zostają po polsku: siedzą w URL (?tab=) i zmiana
// złamałaby istniejące linki (np. z dzwonka i menu konta).
const TABS = [
  { id: 'dane-osobowe', labelKey: 'profile.tabs.personal' },
  { id: 'firma', labelKey: 'profile.tabs.company' },
  { id: 'preferencje', labelKey: 'profile.tabs.preferences' },
  { id: 'bezpieczenstwo', labelKey: 'profile.tabs.security' },
  { id: 'zgody', labelKey: 'profile.tabs.consents' },
]
const TAB_IDS = TABS.map((t) => t.id)

function Field({ label, htmlFor, hint, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelCls}>{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{hint}</p>}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  )
}

function Card({ children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
      {children}
    </div>
  )
}

// Wspólny stan zapisu jednej zakładki (idle/loading/success/error + błędy pól)
function useSaveState() {
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [fieldErrors, setFieldErrors] = useState({})
  const [message, setMessage] = useState('')
  return { status, setStatus, fieldErrors, setFieldErrors, message, setMessage }
}

// Zapis pól profilu przez PATCH /profile z aktualizacją AuthContext
function useProfileSave(updateUser) {
  const { t } = useTranslation('pages')
  const s = useSaveState()

  async function save(patch) {
    s.setStatus('loading')
    s.setFieldErrors({})
    s.setMessage('')
    try {
      const { profile } = await api.patch('/profile', patch)
      updateUser(profile)
      s.setStatus('success')
      s.setMessage(t('profile.saved'))
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        s.setFieldErrors(err.data?.fields || {})
        s.setMessage(t('profile.fixFields'))
      } else {
        s.setMessage(t('profile.saveFailed'))
      }
      s.setStatus('error')
    }
  }

  return { ...s, save }
}

function SaveBar({ status, message, label }) {
  const { t } = useTranslation('pages')
  return (
    <div className="flex items-center gap-3 pt-2">
      <button type="submit" className={submitCls + ' w-auto px-6'} disabled={status === 'loading'}>
        {status === 'loading' ? t('profile.saving') : (label ?? t('profile.save'))}
      </button>
      {status === 'success' && <span className="text-sm text-emerald-600 font-medium">{message}</span>}
      {status === 'error' && <span className="text-sm text-red-600 font-medium">{message}</span>}
    </div>
  )
}

// ── Zakładka: Dane osobowe ──────────────────────────────────────────────────────
function PersonalTab({ user, updateUser }) {
  const { t } = useTranslation('pages')
  const { status, fieldErrors, message, save } = useProfileSave(updateUser)
  const [form, setForm] = useState({ fullName: user.fullName || '', phone: user.phone || '' })
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <Card>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save(form) }}>
        <Field label={t('profile.personal.fullName')} htmlFor="fullName" error={fieldErrors.fullName}>
          <input id="fullName" className={inputCls} value={form.fullName} onChange={upd('fullName')} />
        </Field>
        <Field label={t('profile.personal.email')} htmlFor="email">
          <input id="email" className={inputCls + ' opacity-70 cursor-not-allowed'} value={user.email} readOnly />
        </Field>
        <Field label={t('profile.personal.phone')} htmlFor="phone" error={fieldErrors.phone}>
          <input id="phone" className={inputCls} value={form.phone} onChange={upd('phone')} />
        </Field>
        <SaveBar status={status} message={message} />
      </form>
    </Card>
  )
}

// ── Zakładka: Dane firmy ────────────────────────────────────────────────────────
function CompanyTab({ user, updateUser }) {
  const { t } = useTranslation('pages')
  const { status, fieldErrors, message, save } = useProfileSave(updateUser)
  const [form, setForm] = useState({
    companyName: user.companyName || '',
    vatNumber: user.vatNumber || '',
    eoriNumber: user.eoriNumber || '',
    address: user.address || '',
    postalCode: user.postalCode || '',
    city: user.city || '',
    country: user.country || '',
  })
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-4">
      <Card>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save(form) }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={t('profile.company.companyName')} htmlFor="companyName" error={fieldErrors.companyName}>
              <input id="companyName" className={inputCls} value={form.companyName} onChange={upd('companyName')} />
            </Field>
            <Field label={t('profile.company.vatNumber')} htmlFor="vatNumber" error={fieldErrors.vatNumber}>
              <input id="vatNumber" className={inputCls} value={form.vatNumber} onChange={upd('vatNumber')} />
            </Field>
          </div>
          <Field label={t('profile.company.eoriNumber')} htmlFor="eoriNumber" error={fieldErrors.eoriNumber}>
            <input id="eoriNumber" className={inputCls} value={form.eoriNumber} onChange={upd('eoriNumber')} />
          </Field>
          <Field label={t('profile.company.address')} htmlFor="address" error={fieldErrors.address}>
            <input id="address" className={inputCls} value={form.address} onChange={upd('address')} />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label={t('profile.company.postalCode')} htmlFor="postalCode" error={fieldErrors.postalCode}>
              <input id="postalCode" className={inputCls} value={form.postalCode} onChange={upd('postalCode')} />
            </Field>
            <Field label={t('profile.company.city')} htmlFor="city" error={fieldErrors.city}>
              <input id="city" className={inputCls} value={form.city} onChange={upd('city')} />
            </Field>
            <Field label={t('profile.company.country')} htmlFor="country" error={fieldErrors.country}>
              <input id="country" className={inputCls} value={form.country} onChange={upd('country')} />
            </Field>
          </div>
          <SaveBar status={status} message={message} />
        </form>
      </Card>
    </div>
  )
}

// ── Zakładka: Preferencje ───────────────────────────────────────────────────────
function PreferencesTab({ user, updateUser }) {
  const { t } = useTranslation('pages')
  const { status, fieldErrors, message, save } = useProfileSave(updateUser)
  const [form, setForm] = useState({
    defaultCurrency: user.defaultCurrency || '',
    preferredLanguage: user.preferredLanguage || 'PL',
  })
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <Card>
      <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); save(form) }}>
        <Field label={t('profile.preferences.defaultCurrency')} htmlFor="defaultCurrency" error={fieldErrors.defaultCurrency}>
          <select id="defaultCurrency" className={inputCls} value={form.defaultCurrency} onChange={upd('defaultCurrency')}>
            <option value="">{t('profile.preferences.noCurrency')}</option>
            {['EUR', 'PLN', 'USD', 'CHF'].map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label={t('profile.preferences.documentLanguage')} htmlFor="preferredLanguage">
          <select id="preferredLanguage" className={inputCls} value={form.preferredLanguage} onChange={upd('preferredLanguage')}>
            <option value="PL">{t('profile.preferences.polish')}</option>
            <option value="EN">{t('profile.preferences.english')}</option>
          </select>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">
            {t('profile.preferences.documentLanguageHint')}
          </p>
        </Field>
        <SaveBar status={status} message={message} />
      </form>
    </Card>
  )
}

// ── Zakładka: Bezpieczeństwo (zmiana hasła) ─────────────────────────────────────
function SecurityTab() {
  const { t } = useTranslation('pages')
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [status, setStatus] = useState('idle')
  const [fieldErrors, setFieldErrors] = useState({})
  const [message, setMessage] = useState('')
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setFieldErrors({})
    setMessage('')
    // Zgodność haseł po stronie klienta (backend też sprawdza)
    if (form.newPassword !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: t('profile.security.mismatch') })
      setStatus('error')
      return
    }
    try {
      await api.post('/auth/change-password', form)
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setStatus('success')
      setMessage(t('profile.security.changed'))
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setFieldErrors(err.data?.fields || {})
        setMessage(t('profile.fixFields'))
      } else if (err instanceof ApiError && err.status === 429) {
        setMessage(t('profile.security.tooManyAttempts'))
      } else {
        setMessage(t('profile.security.failed'))
      }
      setStatus('error')
    }
  }

  return (
    <Card>
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label={t('profile.security.currentPassword')} htmlFor="currentPassword" error={fieldErrors.currentPassword}>
          <input id="currentPassword" type="password" autoComplete="current-password" className={inputCls} value={form.currentPassword} onChange={upd('currentPassword')} />
        </Field>
        <Field label={t('profile.security.newPassword')} htmlFor="newPassword" error={fieldErrors.newPassword}>
          <input id="newPassword" type="password" autoComplete="new-password" className={inputCls} value={form.newPassword} onChange={upd('newPassword')} />
        </Field>
        <Field label={t('profile.security.confirmPassword')} htmlFor="confirmPassword" error={fieldErrors.confirmPassword}>
          <input id="confirmPassword" type="password" autoComplete="new-password" className={inputCls} value={form.confirmPassword} onChange={upd('confirmPassword')} />
        </Field>
        <SaveBar status={status} message={message} label={t('profile.security.submit')} />
        <p className="text-xs text-gray-400 dark:text-slate-500 pt-2">
          {t('profile.security.forgotHint')}
        </p>
      </form>
    </Card>
  )
}

// ── Zakładka: Zgody ─────────────────────────────────────────────────────────────
function ConsentsTab({ user, updateUser }) {
  const { t } = useTranslation('pages')
  const { status, fieldErrors, message, save } = useProfileSave(updateUser)
  const [marketingConsent, setMarketingConsent] = useState(!!user.marketingConsent)

  return (
    <Card>
      <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); save({ marketingConsent }) }}>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer shrink-0"
            checked={marketingConsent}
            onChange={(e) => setMarketingConsent(e.target.checked)}
          />
          <span className="text-sm text-gray-700 dark:text-slate-300">
            {t('profile.consents.marketing')}
          </span>
        </label>
        {fieldErrors.marketingConsent && <p className="text-xs text-red-600">{fieldErrors.marketingConsent}</p>}

        <div className="pt-2 border-t border-gray-100 dark:border-slate-700">
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t('profile.consents.termsAccepted')}{' '}
            <span className="font-medium text-gray-800 dark:text-slate-200">
              {user.termsAcceptedAt ? formatDocumentDate(user.termsAcceptedAt, true) : '-'}
            </span>
          </p>
        </div>

        <SaveBar status={status} message={message} />
      </form>
    </Card>
  )
}

export default function ProfilePage() {
  const { t } = useTranslation('pages')
  const { user, updateUser } = useAuth()
  const [params, setParams] = useSearchParams()

  const rawTab = params.get('tab')
  const activeTab = TAB_IDS.includes(rawTab) ? rawTab : 'dane-osobowe'

  function selectTab(id) {
    setParams({ tab: id }, { replace: true })
  }

  if (!user) return null // RequireAuth i tak chroni trasę

  return (
    <div className="max-w-3xl mx-auto">
      <Helmet>
        <title>{t('profile.metaTitle')}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profile.title')}</h1>
        <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">
          {t('profile.subtitle')}
        </p>
      </div>

      {/* Pod-zakładki */}
      <div className="flex flex-wrap gap-1.5 mb-6 border-b border-gray-200 dark:border-slate-700">
        {TABS.map((tab) => {
          const active = tab.id === activeTab
          return (
            <button
              key={tab.id}
              onClick={() => selectTab(tab.id)}
              className={
                'px-4 py-2.5 text-sm font-medium -mb-px border-b-2 transition-colors ' +
                (active
                  ? 'border-emerald-500 text-emerald-700 dark:text-emerald-400'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200')
              }
            >
              {tab.labelKey && t(tab.labelKey)}
            </button>
          )
        })}
      </div>

      {activeTab === 'dane-osobowe' && <PersonalTab key="p" user={user} updateUser={updateUser} />}
      {activeTab === 'firma' && <CompanyTab key="c" user={user} updateUser={updateUser} />}
      {activeTab === 'preferencje' && <PreferencesTab key="pref" user={user} updateUser={updateUser} />}
      {activeTab === 'bezpieczenstwo' && <SecurityTab key="s" />}
      {activeTab === 'zgody' && <ConsentsTab key="z" user={user} updateUser={updateUser} />}
    </div>
  )
}
