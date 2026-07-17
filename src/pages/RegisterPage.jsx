import { Helmet } from 'react-helmet-async'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../lib/api'
import AlertBox from '../components/ui/AlertBox'
import AuthShell, { inputCls, labelCls, submitCls } from '../components/auth/AuthShell'

export default function RegisterPage() {
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
      setFieldErrors({ confirmPassword: 'Hasła nie są zgodne' })
      setError('Popraw zaznaczone pola.')
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
        setError('Konto z tym adresem email już istnieje. Zaloguj się.')
      } else if (err instanceof ApiError && err.status === 400) {
        setFieldErrors(err.data?.fields || {})
        setError('Popraw zaznaczone pola.')
      } else if (err instanceof ApiError && err.status === 0) {
        setError('Brak połączenia z serwerem. Spróbuj ponownie.')
      } else {
        setError('Coś poszło nie tak. Spróbuj ponownie.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Helmet>
        <title>Rejestracja | AMLogistico</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <AuthShell
        title="Załóż konto"
        subtitle="Zacznij generować dokumenty spedycyjne"
        footer={
          <>
            Masz już konto?{' '}
            <Link to="/login" className="text-emerald-600 font-medium hover:underline">
              Zaloguj się
            </Link>
          </>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {error && <AlertBox type="error">{error}</AlertBox>}

          <div>
            <label htmlFor="fullName" className={labelCls}>Imię i nazwisko</label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              className={inputCls}
              placeholder="Jan Kowalski"
              value={form.fullName}
              onChange={upd('fullName')}
              required
            />
            {fieldErrors.fullName && <p className="text-xs text-red-600 mt-1">{fieldErrors.fullName}</p>}
          </div>

          <div>
            <label htmlFor="email" className={labelCls}>Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={inputCls}
              placeholder="ty@firma.pl"
              value={form.email}
              onChange={upd('email')}
              required
            />
            {fieldErrors.email && <p className="text-xs text-red-600 mt-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="phone" className={labelCls}>Numer telefonu</label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              className={inputCls}
              placeholder="+48 500 600 700"
              value={form.phone}
              onChange={upd('phone')}
              required
            />
            {fieldErrors.phone && <p className="text-xs text-red-600 mt-1">{fieldErrors.phone}</p>}
          </div>

          <div>
            <label htmlFor="password" className={labelCls}>Hasło</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={inputCls}
              placeholder="min. 8 znaków"
              value={form.password}
              onChange={upd('password')}
              required
            />
            {fieldErrors.password && <p className="text-xs text-red-600 mt-1">{fieldErrors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className={labelCls}>Powtórz hasło</label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={inputCls}
              placeholder="powtórz hasło"
              value={form.confirmPassword}
              onChange={upd('confirmPassword')}
              required
            />
            {fieldErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{fieldErrors.confirmPassword}</p>}
          </div>

          <div>
            <label htmlFor="companyName" className={labelCls}>
              Nazwa firmy <span className="text-gray-400 font-normal">(opcjonalnie)</span>
            </label>
            <input
              id="companyName"
              type="text"
              autoComplete="organization"
              className={inputCls}
              placeholder="np. ABC Sp. z o.o."
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
              Akceptuję{' '}
              {/* TODO: podłączyć /regulamin i /polityka-prywatnosci */}
              <a href="#" className="text-emerald-600 hover:underline">regulamin</a>{' '}i{' '}
              <a href="#" className="text-emerald-600 hover:underline">politykę prywatności</a>
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
              Chcę otrzymywać informacje o nowościach i promocjach
            </span>
          </label>

          <button type="submit" className={submitCls} disabled={loading || !termsAccepted}>
            {loading ? 'Tworzenie konta…' : 'Zarejestruj się'}
          </button>
        </form>
      </AuthShell>
    </>
  )
}
