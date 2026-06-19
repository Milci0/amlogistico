import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { label: 'Jak to działa', href: '#how-it-works' },
  { label: 'Cennik', href: '#pricing' },
  { label: 'Kontakt', href: '#contact' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const isApp = location.pathname.startsWith('/app')

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 shrink-0">
            <span className="bg-blue-600 text-white rounded-lg w-8 h-8 flex items-center justify-center text-sm font-black">A</span>
            <span>Am<span className="text-blue-600">Logistico</span></span>
          </Link>

          {/* Desktop nav — tylko na landing */}
          {!isApp && (
            <nav className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Przyciski desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/app/dashboard"
              className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors px-3 py-2"
            >
              Zaloguj się
            </Link>
            <Link
              to="/app/dashboard"
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Zacznij bezpłatnie
            </Link>
          </div>

          {/* Hamburger mobile */}
          <button
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(prev => !prev)}
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2">
          {!isApp && (
            <nav className="flex flex-col gap-1 mb-3">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm text-gray-700 hover:text-blue-600 font-medium py-2 transition-colors"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            <Link
              to="/app/dashboard"
              className="text-sm font-medium text-center text-gray-700 border border-gray-300 rounded-lg py-2.5 hover:bg-gray-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Zaloguj się
            </Link>
            <Link
              to="/app/dashboard"
              className="text-sm font-semibold text-center bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Zacznij bezpłatnie
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
