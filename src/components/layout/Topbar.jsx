import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNews } from '../../context/NewsContext'
import { getCurrentUserId } from '../../services/currentUser'
import TemplateSearch from './TemplateSearch'

function initials(user) {
  const src = (user?.fullName || user?.companyName || user?.email || 'OK').trim()
  const parts = src.split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return src.slice(0, 2).toUpperCase()
}

function IconBtn({ onClick, label, children, innerRef }) {
  return (
    <button
      ref={innerRef}
      onClick={onClick}
      aria-label={label}
      className="relative w-9 h-9 flex items-center justify-center rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
    >
      {children}
    </button>
  )
}

// Hook: zamykanie dropdownu po kliknięciu poza i po Escape
function useDismissable(open, setOpen, ref) {
  useEffect(() => {
    if (!open) return
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, setOpen, ref])
}

// ── Dzwonek powiadomień ─────────────────────────────────────────────────────────
// Łączy dwa źródła: nieprzeczytane newsy (NewsContext) + zachętę do uzupełnienia
// profilu (klient, na podstawie user.profileCompleted). Licznik = suma.
function NotificationsBell({ user }) {
  const { hasUnread, markRead } = useNews()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useDismissable(open, setOpen, ref)

  const nudgeKey = `amlogistico:v1:${getCurrentUserId()}:profileNudgeDismissed`
  const [nudgeDismissed, setNudgeDismissed] = useState(() => {
    try { return localStorage.getItem(nudgeKey) === '1' } catch { return false }
  })

  // Nudge znika na zawsze gdy profil uzupełniony (niezależnie od flagi w localStorage)
  const showNudge = user?.profileCompleted === false && !nudgeDismissed
  const count = (hasUnread ? 1 : 0) + (showNudge ? 1 : 0)

  function dismissNudge(e) {
    e.stopPropagation()
    try { localStorage.setItem(nudgeKey, '1') } catch { /* best-effort */ }
    setNudgeDismissed(true)
  }

  function openNudge() {
    setOpen(false)
    navigate('/profile?tab=firma')
  }

  function openNews() {
    setOpen(false)
    markRead()
    navigate('/news')
  }

  return (
    <div className="relative" ref={ref}>
      <IconBtn onClick={() => setOpen((o) => !o)} label="Powiadomienia">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {count}
          </span>
        )}
      </IconBtn>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-50">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Powiadomienia</p>
          </div>

          {count === 0 && (
            <p className="px-3 py-4 text-sm text-slate-400 text-center">Brak nowych powiadomień</p>
          )}

          {showNudge && (
            <div className="flex items-start gap-2 px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors">
              <button onClick={openNudge} className="flex-1 text-left">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Uzupełnij dane firmy</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Wypełnimy je za Ciebie przy generowaniu dokumentów — zaoszczędzisz czas przy każdym zleceniu.
                </p>
              </button>
              <button
                onClick={dismissNudge}
                aria-label="Odrzuć"
                className="shrink-0 text-slate-300 hover:text-slate-500 dark:hover:text-slate-200 p-0.5"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          {hasUnread && (
            <button
              onClick={openNews}
              className="w-full text-left flex items-start gap-2 px-3 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">Nowe artykuły w Newsach</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Zobacz najnowsze informacje z branży transportowej i celnej.
                </p>
              </div>
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Menu konta (avatar) ─────────────────────────────────────────────────────────
function AccountMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useDismissable(open, setOpen, ref)

  const displayName = user?.fullName || user?.companyName || 'Moje konto'

  const items = [
    { label: 'Mój profil', to: '/profile' },
    { label: 'Abonament', to: '/subscription' },
    { label: 'Zmień hasło', to: '/profile?tab=bezpieczenstwo' },
  ]

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Menu konta"
        className="w-9 h-9 rounded-full bg-slate-900 dark:bg-slate-600 text-white flex items-center justify-center text-xs font-bold hover:opacity-80 transition-opacity"
      >
        {initials(user)}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg py-1 z-50">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{displayName}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              onClick={() => setOpen(false)}
              className="block px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {it.label}
            </Link>
          ))}
          <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
          <button
            onClick={() => { setOpen(false); onLogout() }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Wyloguj się
          </button>
        </div>
      )}
    </div>
  )
}

export default function Topbar({ onOpenSidebar }) {
  const { user, loading, logout } = useAuth()
  const { dark, toggle } = useTheme()
  const navigate = useNavigate()
  const location = useLocation()
  const isDocumentationTab = location.pathname === '/history'

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="flex items-center gap-3 px-4 md:px-6 h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shrink-0">
      {/* Hamburger — mobile */}
      <button
        onClick={onOpenSidebar}
        className="md:hidden p-2 -ml-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        aria-label="Otwórz menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Wyszukiwarka szablonów — tylko na zakładce "Dokumentacja" (/history) */}
      {isDocumentationTab && (
        <div className="hidden sm:flex flex-1 justify-center px-2">
          <TemplateSearch />
        </div>
      )}

      {/* Niezalogowany */}
      {!loading && !user && (
        <div className="flex items-center gap-2 ml-auto">
          <IconBtn onClick={toggle} label="Przełącz motyw">
            {dark ? <SunIcon /> : <MoonIcon />}
          </IconBtn>
          <Link
            to="/login"
            className="text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 px-3 py-2 transition-colors"
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

      {/* Zalogowany */}
      {!loading && user && (
        <div className="flex items-center gap-2 ml-auto">
          <NotificationsBell user={user} />
          <IconBtn onClick={toggle} label="Przełącz motyw">
            {dark ? <SunIcon /> : <MoonIcon />}
          </IconBtn>
          <AccountMenu user={user} onLogout={handleLogout} />
        </div>
      )}
    </header>
  )
}

function MoonIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  )
}
