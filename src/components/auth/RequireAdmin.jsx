import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

// Chroni trasy administratora. Niezalogowany → /login; zalogowany bez uprawnień
// admina → strona główna (nie ujawniamy istnienia panelu). Backend i tak weryfikuje
// isAdmin przy każdej wysyłce (requireAdmin) — to tylko warstwa UI.
export default function RequireAdmin() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-slate-100">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!user.isAdmin) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
