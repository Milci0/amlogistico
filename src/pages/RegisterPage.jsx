import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../lib/api'
import AlertBox from '../components/ui/AlertBox'
import AuthShell, { inputCls, labelCls, submitCls } from '../components/auth/AuthShell'

export default function RegisterPage() {
  const { t } = useTranslation('pages')
  const { t: tc } = useTranslation('common')
  const { t: te } = useTranslation('errors')
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [marketingConsent, setMarketingConsent] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({}) // z backendu (400)
  const [error, setError] = useState('') // ogólny błąd
  const [loading, setLoading] = useState(false)

  const upd = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setFieldErrors({})

    // Walidacja zgodności haseł po stronie klienta
    if (form.password !== form.confirmPassword) {
      setFieldErrors({ confirmPassword: te('passwordsMismatch') })
      setError(te('fixFields'))
      return
    }

    setLoading(true)
    try {
      await register({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        companyName: form.companyName.trim() || undefined,
        termsAccepted,
        marketingConsent,
      })
      navigate('/', { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError(te('emailTaken'))
      } else if (err instanceof ApiError && err.status === 400) {
        setFieldErrors(err.data?.fields || {})
        setError(te('fixFields'))
      } else if (err instanceof ApiError && err.status === 0) {
        setError(te('noConnection'))
      } else {
        setError(te('generic'))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>{t('auth.register.metaTitle')}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <AuthShell
        title={t('auth.register.title')}
        subtitle={t('auth.register.subtitle')}
        footer={
          <>
            {t('auth.register.hasAccount')}{' '}
            <Link to="/login" className="text-emerald-600 font-medium hover:underline">
              {tc('auth.login')}
            </Link>
          </>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {error && <AlertBox type="error">{error}</AlertBox>}

          <div>
            <label htmlFor="fullName" className={labelCls}>{t('auth.register.fullName')}</label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              className={inputCls}
              placeholder={t('auth.register.fullNamePlaceholder')}
              value={form.fullName}
              onChange={upd('fullName')}
              required
            />
            {fieldErrors.fullName && <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className={labelCls}>{t('auth.register.email')}</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={inputCls}
              placeholder={t('auth.register.emailPlaceholder')}
              value={form.email}
              onChange={upd('email')}
              required
            />
            {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className={labelCls}>{t('auth.register.phone')}</label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              className={inputCls}
              placeholder={t('auth.register.phonePlaceholder')}
              value={form.phone}
              onChange={upd('phone')}
              required
            />
            {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
          </div>

          <div>
            <label htmlFor="password" className={labelCls}>{t('auth.register.password')}</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={inputCls}
              placeholder={t('auth.register.passwordPlaceholder')}
              value={form.password}
              onChange={upd('password')}
              required
            />
            {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className={labelCls}>{t('auth.register.confirmPassword')}</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={inputCls}
              placeholder={t('auth.register.confirmPasswordPlaceholder')}
              value={form.confirmPassword}
              onChange={upd('confirmPassword')}
              required
            />
            {fieldErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>}
          </div>

          <div>
            <label htmlFor="companyName" className={labelCls}>
              {t('auth.register.companyName')} <span className="text-gray-400 font-normal">{t('auth.register.optional')}</span>
            </label>
            <input
              id="companyName"
              type="text"
              autoComplete="organization"
              className={inputCls}
              placeholder={t('auth.register.companyNamePlaceholder')}
              value={form.companyName}
              onChange={upd('companyName')}
            />
            {fieldErrors.companyName && <p className="text-xs text-red-600 mt-1">{fieldErrors.companyName}</p>}
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer shrink-0"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
            />
            <span className="text-sm text-gray-600 dark:text-slate-300">
              {t('auth.register.termsPrefix')}{' '}
              {/* TODO: podłączyć /regulamin i /polityka-prywatnosci */}
              <a href="#" className="text-emerald-600 hover:underline">{t('auth.register.termsLink')}</a>{' '}
              {t('auth.register.termsAnd')}{' '}
              <a href="#" className="text-emerald-600 hover:underline">{t('auth.register.privacyLink')}</a>
            </span>
          </label>

          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer shrink-0"
              checked={marketingConsent}
              onChange={(e) => setMarketingConsent(e.target.checked)}
            />
            <span className="text-sm text-gray-600 dark:text-slate-300">
              {t('auth.register.marketing')}
            </span>
          </label>

          <button type="submit" className={submitCls} disabled={loading || !termsAccepted}>
            {loading ? t('auth.register.submitting') : t('auth.register.submit')}
          </button>
        </form>
      </AuthShell>
    </>
  )
}
