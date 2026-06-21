import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'

function initials(user) {
  const src = (user?.companyName || user?.email || 'OK').trim()
  return src.slice(0, 2).toUpperCase()
}

export default function Topbar({ onOpenSidebar }) {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Zamknij dropdown po kliknięciu poza nim
  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  async function handleLogout() {
    setMenuOpen(false)
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex items-center gap-3 px-4 md:px-6 h-16 border-b border-slate-200 shrink-0">
      {/* Hamburger — mobile */}
      <button
        onClick={onOpenSidebar}
        className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
        aria-label="Otwórz menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Niezalogowany — przyciski logowania zamiast dzwonka/avatara */}
      {!loading && !user && (
        <div className="flex items-center gap-2 ml-auto">
          <Link
            to="/login"
            className="text-sm font-medium text-slate-700 hover:text-emerald-700 px-3 py-2 transition-colors"
          >
            Zaloguj się
          </Link>
          <Link
            to="/register"
            className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Zarejestruj się
          </Link>
        </div>
      )}

      {/* Zalogowany — dzwonek, menu, avatar */}
      {!loading && user && (
      <div className="flex items-center gap-2 ml-auto">
        {/* Dzwonek */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
          aria-label="Powiadomienia"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {/* Więcej (…) z menu wylogowania */}
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
            aria-label="Więcej"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="5" cy="12" r="1.6" />
              <circle cx="12" cy="12" r="1.6" />
              <circle cx="19" cy="12" r="1.6" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-sm font-medium text-slate-900 truncate">{user?.companyName || 'Moje konto'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Wyloguj
              </button>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
          {initials(user)}
        </div>
      </div>
      )}
    </header>
  )
}
