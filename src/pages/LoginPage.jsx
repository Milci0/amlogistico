import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { ApiError } from '../lib/api'
import AlertBox from '../components/ui/AlertBox'
import AuthShell, { inputCls, labelCls, submitCls } from '../components/auth/AuthShell'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/app/dashboard'

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
        setError('Nieprawidłowy email lub hasło.')
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
      title="Zaloguj się"
      subtitle="Wejdź do panelu AMLogistico"
      footer={
        <>
          Nie masz konta?{' '}
          <Link to="/register" className="text-blue-600 font-medium hover:underline">
            Zarejestruj się
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className={labelCls}>Hasło</label>
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
          {loading ? 'Logowanie…' : 'Zaloguj się'}
        </button>
      </form>
    </AuthShell>
  )
}
