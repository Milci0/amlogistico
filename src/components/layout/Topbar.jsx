import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useNews } from '../../context/NewsContext'
import { shouldShowNudge, snoozeNudge } from '../../utils/profileNudge'
import { useNotifications } from '../../hooks/useNotifications'
import { markRead as markNotifRead, markAllRead, deleteNotification } from '../../services/notificationsRepo'
import TemplateSearch from './TemplateSearch'

// Typ powiadomienia z serwera → ikona + kolory kafelka.
const NOTIF_STYLE = {
  info:    { tile: 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300',
             path: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  success: { tile: 'bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-300',
             path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  warning: { tile: 'bg-amber-50 dark:bg-amber-900/40 text-amber-600 dark:text-amber-300',
             path: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
}

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
// Łączy trzy źródła: powiadomienia z serwera (useNotifications — wysyłane przez
// admina), nieprzeczytane newsy (NewsContext) oraz zachętę do uzupełnienia danych
// firmy (nudge). Reguły nudge'a w utils/profileNudge.js:
//   • znika na zawsze, gdy user ma ≥1 pole osobowe i ≥1 pole firmy,
//   • po odrzuceniu (X) uśpiony na 7 dni (per konto).
// Licznik = suma źródeł.
function NotificationsBell({ user }) {
  const { hasUnread, markRead } = useNews()
  const { items: notifs, unreadCount } = useNotifications()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useDismissable(open, setOpen, ref)

  // Bump po odrzuceniu → wymusza ponowne przeliczenie shouldShowNudge (czyta świeży
  // stan uśpienia z localStorage). Klucz uśpienia jest oparty na user.id (prop),
  // więc jest stabilny mimo hydratacji sesji.
  const [nudgeBump, setNudgeBump] = useState(0)
  const showNudge = useMemo(
    () => shouldShowNudge(user),
    // nudgeBump celowo w zależnościach — służy tylko do wymuszenia przeliczenia
    // po odrzuceniu (shouldShowNudge czyta stan uśpienia z localStorage).
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, nudgeBump]
  )
  const count = unreadCount + (hasUnread ? 1 : 0) + (showNudge ? 1 : 0)

  function dismissNudge(e) {
    e.stopPropagation()
    snoozeNudge(user?.id)
    setNudgeBump((n) => n + 1)
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

  // Klik w powiadomienie z serwera → oznacz przeczytane i (jeśli jest link) przejdź.
  function openNotif(n) {
    if (!n.readAt) markNotifRead(n.id).catch(() => {})
    if (n.ctaUrl) {
      setOpen(false)
      navigate(n.ctaUrl)
    }
  }

  function removeNotif(e, id) {
    e.stopPropagation()
    deleteNotification(id).catch(() => {})
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
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Powiadomienia</p>
            {count > 0 && (
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-0.5 rounded-full">
                {count} {count % 10 >= 5 || count % 10 === 0 || (count % 100 >= 11 && count % 100 <= 14) ? 'nowych' : 'nowe'}
              </span>
            )}
          </div>

          {notifs.length === 0 && !showNudge && !hasUnread && (
            <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <p className="text-sm text-slate-400 dark:text-slate-500">Brak nowych powiadomień</p>
            </div>
          )}

          <div className="p-2 space-y-2 max-h-[26rem] overflow-y-auto">
            {/* Powiadomienia z serwera (od admina) — na górze, najnowsze pierwsze */}
            {notifs.map((n) => {
              const s = NOTIF_STYLE[n.type] || NOTIF_STYLE.info
              const unread = !n.readAt
              return (
                <div
                  key={n.id}
                  onClick={() => openNotif(n)}
                  className={
                    'relative rounded-xl border p-3.5 transition-colors cursor-pointer ' +
                    (unread
                      ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                      : 'border-slate-100 dark:border-slate-700/60 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/60 dark:hover:bg-slate-700/40')
                  }
                >
                  <button
                    onClick={(e) => removeNotif(e, n.id)}
                    aria-label="Usuń"
                    className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-700/70 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <div className="flex items-start gap-3 pr-5">
                    <div className={'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ' + s.tile}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={s.path} />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {unread && <span className="shrink-0 w-2 h-2 rounded-full bg-emerald-500" />}
                        <p className={'text-sm truncate ' + (unread ? 'font-semibold text-slate-900 dark:text-white' : 'font-medium text-slate-600 dark:text-slate-300')}>
                          {n.title}
                        </p>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed whitespace-pre-line">{n.body}</p>
                      {n.ctaLabel && n.ctaUrl && (
                        <span className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg shadow-sm transition-colors">
                          {n.ctaLabel}
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {unreadCount > 0 && (
              <button
                onClick={() => markAllRead().catch(() => {})}
                className="w-full text-center text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                Oznacz wszystkie jako przeczytane
              </button>
            )}

            {showNudge && (
              <div className="relative rounded-xl border border-emerald-200/70 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-900/25 dark:to-slate-800 p-3.5">
                <button
                  onClick={dismissNudge}
                  aria-label="Odrzuć"
                  title="Przypomnij później"
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-white/70 dark:hover:bg-slate-700/70 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="flex items-start gap-3 pr-5">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-600/20">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3m6-14h1m-1 4h1m4-4h1m-1 4h1m-6 6h4v4H9v-4z" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Dokończ konfigurację firmy</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Dodaj dane firmy raz, a my uzupełnimy je automatycznie w każdym dokumencie
                      i zleceniu. Oszczędzasz czas przy każdej wysyłce.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3 pl-13">
                  <button
                    onClick={openNudge}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3.5 py-2 rounded-lg shadow-sm transition-colors"
                  >
                    Uzupełnij profil
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                  <button
                    onClick={dismissNudge}
                    className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 px-2 py-2 rounded-lg transition-colors"
                  >
                    Później
                  </button>
                </div>
              </div>
            )}

            {hasUnread && (
              <button
                onClick={openNews}
                className="w-full text-left flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
              >
                <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m0 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">Nowe artykuły w Newsach</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Najnowsze informacje z branży transportowej i celnej.
                  </p>
                </div>
              </button>
            )}
          </div>
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
