import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../lib/api'
import AlertBox from '../components/ui/AlertBox'
import AuthShell, { inputCls, labelCls, submitCls } from '../components/auth/AuthShell'

export default function LoginPage() {
  const { t } = useTranslation('pages')
  const { t: tc } = useTranslation('common')
  const { t: te } = useTranslation('errors')
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(te('invalidCredentials'))
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
        <title>{t('auth.login.metaTitle')}</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <AuthShell
        title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      footer={
        <>
          {t('auth.login.noAccount')}{' '}
          <Link to="/register" className="text-emerald-600 font-medium hover:underline">
            {tc('auth.register')}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {error && <AlertBox type="error">{error}</AlertBox>}

        <div>
          <label htmlFor="email" className={labelCls}>{t('auth.login.email')}</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={inputCls}
            placeholder={t('auth.login.emailPlaceholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className={labelCls}>{t('auth.login.password')}</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={inputCls}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className={submitCls} disabled={loading}>
          {loading ? t('auth.login.submitting') : t('auth.login.submit')}
        </button>
      </form>
      </AuthShell>
    </>
  )
}
