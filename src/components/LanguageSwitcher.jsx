import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import FlagGB from './flags/FlagGB'
import FlagPL from './flags/FlagPL'

// Nazwa języka zawsze w tym języku, którego dotyczy (tak robią wszystkie
// przełączniki, dzięki temu użytkownik rozpoznaje swój język niezależnie od
// tego, jaka wersja jest aktualnie włączona).
const LANGUAGES = [
  { code: 'en', label: 'English', short: 'EN', Flag: FlagGB },
  { code: 'pl', label: 'Polski', short: 'PL', Flag: FlagPL },
]

const flagFrame =
  'shrink-0 rounded-[2px] ring-1 ring-black/10 dark:ring-white/20 overflow-hidden'

export default function LanguageSwitcher({ className = '' }) {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const rootRef = useRef(null)
  const itemRefs = useRef([])

  const currentCode = LANGUAGES.some((l) => l.code === i18n.resolvedLanguage)
    ? i18n.resolvedLanguage
    : 'en'
  const current = LANGUAGES.find((l) => l.code === currentCode)

  // Zamknięcie po kliknięciu poza komponentem.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  // Po otwarciu fokus ląduje na aktualnie wybranym języku.
  useEffect(() => {
    if (!open) return
    const idx = LANGUAGES.findIndex((l) => l.code === currentCode)
    setActiveIndex(idx < 0 ? 0 : idx)
  }, [open, currentCode])

  useEffect(() => {
    if (open) itemRefs.current[activeIndex]?.focus()
  }, [open, activeIndex])

  function choose(code) {
    i18n.changeLanguage(code)
    setOpen(false)
  }

  function onTriggerKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setOpen(true)
    }
  }

  function onListKeyDown(e) {
    if (e.key === 'Escape') {
      e.preventDefault()
      setOpen(false)
      rootRef.current?.querySelector('button')?.focus()
      return
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % LANGUAGES.length)
      return
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 + LANGUAGES.length) % LANGUAGES.length)
      return
    }
    if (e.key === 'Home') {
      e.preventDefault()
      setActiveIndex(0)
      return
    }
    if (e.key === 'End') {
      e.preventDefault()
      setActiveIndex(LANGUAGES.length - 1)
    }
  }

  const CurrentFlag = current.Flag

  return (
    <div className={`relative ${className}`} ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        aria-label={t('language.switchLabel')}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1.5 h-9 pl-2 pr-1.5 rounded-full border border-slate-200 dark:border-slate-700
          text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700
          focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 transition-colors"
      >
        <span className={flagFrame}>
          <CurrentFlag />
        </span>
        <span className="text-xs font-semibold tracking-wide">{current.short}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t('language.switchLabel')}
          onKeyDown={onListKeyDown}
          className="absolute right-0 mt-2 w-44 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700
            rounded-xl shadow-lg py-1 z-50"
        >
          {LANGUAGES.map((lang, idx) => {
            const selected = lang.code === currentCode
            const Flag = lang.Flag
            return (
              <li key={lang.code} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  tabIndex={idx === activeIndex ? 0 : -1}
                  ref={(el) => { itemRefs.current[idx] = el }}
                  onClick={() => choose(lang.code)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 dark:text-slate-300
                    hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus-visible:bg-slate-50
                    dark:focus-visible:bg-slate-700 transition-colors"
                >
                  <span className={flagFrame}>
                    <Flag />
                  </span>
                  <span className={selected ? 'font-semibold text-slate-900 dark:text-white' : ''}>
                    {lang.label}
                  </span>
                  {selected && (
                    <svg
                      className="w-4 h-4 ml-auto text-emerald-600 dark:text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
