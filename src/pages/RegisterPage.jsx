import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../lib/api'
import AlertBox from '../components/ui/AlertBox'
import AuthShell, { inputCls, labelCls, submitCls } from '../components/auth/AuthShell'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '', companyName: '', vatNumber: '' })
  const [fieldErrors, setFieldErrors] = useState({}) // { email, password, companyName } z backendu (400)
  const [error, setError] = useState('') // ogólny błąd
  const [loading, setLoading] = useState(false)

  const upd = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setFieldErrors({})
    setLoading(true)
    try {
      await register({
        email: form.email,
        password: form.password,
        companyName: form.companyName,
        vatNumber: form.vatNumber.trim() || undefined,
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
          <label htmlFor="companyName" className={labelCls}>Nazwa firmy</label>
          <input
            id="companyName"
            type="text"
            autoComplete="organization"
            className={inputCls}
            placeholder="np. ABC Sp. z o.o."
            value={form.companyName}
            onChange={upd('companyName')}
            required
          />
          {fieldErrors.companyName && <p className="text-xs text-red-600 mt-1">{fieldErrors.companyName}</p>}
        </div>

        <div>
          <label htmlFor="vatNumber" className={labelCls}>
            NIP / VAT <span className="text-gray-400 font-normal">(opcjonalnie)</span>
          </label>
          <input
            id="vatNumber"
            type="text"
            className={inputCls}
            placeholder="PL1234567890"
            value={form.vatNumber}
            onChange={upd('vatNumber')}
          />
        </div>

        <button type="submit" className={submitCls} disabled={loading}>
          {loading ? 'Tworzenie konta…' : 'Załóż konto'}
        </button>
      </form>
    </AuthShell>
  )
}
