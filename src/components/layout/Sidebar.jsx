import { NavLink, Link } from 'react-router-dom'
import { MENU_GROUPS, MENU_BOTTOM } from '../../data/mockData'
import { useNews } from '../../context/NewsContext'
import { useDraftCount } from '../../hooks/useDocumentSets'

const ICONS = {
  home: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1h3a1 1 0 001-1V10" />
    </svg>
  ),
  calculator: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 7h6m-6 4h.01M12 11h.01M15 11h.01M9 15h.01M12 15h.01M15 15h.01M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
    </svg>
  ),
  document: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  pencil: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  map: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
    </svg>
  ),
  globe: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
    </svg>
  ),
  cog: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  template: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2zM12 3v6h6" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 13h6M9 17h4" />
    </svg>
  ),
  forms: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  news: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
}

function Badge({ children }) {
  const isCore = children === 'Core'
  const isBeta = children === 'Beta'
  return (
    <span
      className={
        'ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full ' +
        (isCore
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
          : isBeta
            ? 'bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400')
      }
    >
      {children}
    </span>
  )
}

function MenuLink({ item, onClose, dot, collapsed }) {
  return (
    <NavLink
      to={item.path}
      onClick={onClose}
      end={item.path === '/'}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ' +
        (collapsed ? 'justify-center' : '') + ' ' +
        (isActive
          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100')
      }
    >
      {({ isActive }) => (
        <>
          <span className={'shrink-0 ' + (isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500')}>
            {ICONS[item.icon]}
          </span>
          {!collapsed && <span className="truncate">{item.label}</span>}
          {!collapsed && dot && <span className="ml-auto w-2 h-2 rounded-full bg-red-500 shrink-0" />}
          {!collapsed && item.badge && !dot && <Badge>{item.badge}</Badge>}
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ onClose, collapsed, onToggleCollapse }) {
  const { hasUnread } = useNews()
  const draftCount = useDraftCount()

  return (
    <aside className={'flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-200 ' + (collapsed ? 'w-[88px]' : 'w-64')}>

      {/* Logo */}
      <div className={'flex items-center py-4 ' + (collapsed ? 'justify-start pl-4 pr-2 gap-1' : 'justify-between px-5 gap-2')}>
        <Link to="/" className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-white text-lg min-w-0">
          <span className="bg-emerald-500 text-white rounded-lg w-8 h-8 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zM13 8h4l3 4v4h-7V8z" />
            </svg>
          </span>
          {!collapsed && <span className="truncate">AM<span className="text-emerald-600">Logistico</span></span>}
        </Link>

        <div className="flex items-center gap-1 shrink-0">
          {/* Rozwiń/zwiń — tylko desktop */}
          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title={collapsed ? 'Rozwiń menu' : 'Zwiń menu'}
              aria-label={collapsed ? 'Rozwiń menu' : 'Zwiń menu'}
              className="hidden md:flex items-center justify-center w-6 h-6 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="3" y="4" width="18" height="16" rx="2" strokeWidth={1.8} />
                {collapsed ? (
                  <>
                    <line x1="14" y1="4" x2="14" y2="20" strokeWidth={1.8} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M14 9L19 12L14 15" />
                  </>
                ) : (
                  <>
                    <line x1="10" y1="4" x2="10" y2="20" strokeWidth={1.8} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 9L5 12L10 15" />
                  </>
                )}
              </svg>
            </button>
          )}
          {/* Zamknięcie — tylko mobile */}
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 md:hidden">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Menu pogrupowane */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-6">
        {MENU_GROUPS.map(group => (
          <div key={group.title}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider uppercase text-slate-400 dark:text-slate-500">
                {group.title}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const isDrafts = item.path === '/wersje-robocze'
                const resolvedItem = isDrafts
                  ? { ...item, badge: draftCount > 0 ? String(draftCount) : undefined }
                  : item
                return (
                  <MenuLink key={item.path} item={resolvedItem} onClose={onClose} dot={item.path === '/news' && hasUnread} collapsed={collapsed} />
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Dół — Ustawienia / Profil */}
      <div className="px-3 py-3 border-t border-slate-200 dark:border-slate-700 space-y-0.5">
        {MENU_BOTTOM.map(item => (
          <MenuLink key={item.path} item={item} onClose={onClose} collapsed={collapsed} />
        ))}
      </div>
    </aside>
  )
}
