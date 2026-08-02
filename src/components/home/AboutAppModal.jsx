import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Package, Route, ShieldCheck, FileText, Shield } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Panel „Dowiedz się więcej" — otwierany z HomePage obok „Rozpocznij".
// Modal na desktopie, pełny ekran na mobile; kroki jeden pod drugim, ujawniane
// przy scrollu wewnątrz panelu (nie karuzela). Renderowany przez createPortal
// do document.body z tego samego powodu co components/ui/Modal.jsx —
// HomePage siedzi w AppShell wewnątrz <StepTransition>, a element z `transform`
// tworzy blok zawierający, przez co `position: fixed` przyczepiłoby się do
// strony zamiast do okna.

// Teksty kroków siedzą w tłumaczeniach (namespace `pages`, klucz `about.steps.*`);
// tutaj zostaje tylko kolejność i ikony.
const ABOUT_STEPS = [
  { key: 'cargo', icon: Package },
  { key: 'route', icon: Route },
  { key: 'requirements', icon: ShieldCheck },
  { key: 'documents', icon: FileText },
  { key: 'protect', icon: Shield },
]

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

// Wiersz kroku — obserwowany osobno, żeby ujawniał się w momencie wejścia
// w widoczny obszar panelu podczas scrolla (nie wszystkie naraz przy otwarciu).
function StepRow({ step, index, isLast, observe }) {
  const { t } = useTranslation('pages')
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return observe(el, () => setVisible(true))
  }, [observe])

  const Icon = step.icon

  return (
    <div ref={ref} className={`about-modal-step flex gap-4 ${visible ? 'is-visible' : ''}`}>
      <div className="relative shrink-0 flex flex-col items-center">
        <div className="about-modal-step-icon w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
          <Icon className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
        </div>
        {!isLast && (
          <span className="w-px flex-1 mt-2 mb-1 bg-slate-200 dark:bg-slate-700" aria-hidden="true" />
        )}
      </div>
      <div className="about-modal-step-body flex-1 pb-8">
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {t('about.step', { number: index + 1 })}
        </span>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white mt-0.5">{t(`about.steps.${step.key}.title`)}</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t(`about.steps.${step.key}.desc`)}</p>
      </div>
    </div>
  )
}

export default function AboutAppModal({ onClose, onStart }) {
  const { t } = useTranslation('pages')
  const { t: tc } = useTranslation('common')
  const panelRef = useRef(null)
  const scrollRef = useRef(null)
  const closeButtonRef = useRef(null)
  const observerRef = useRef(null)
  const revealCallbacksRef = useRef(new Map())

  // Escape zamyka; blokada scrolla tła (ten sam wzorzec co ui/Modal.jsx).
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  // Focus trap: fokus startuje na przycisku zamknięcia, Tab/Shift+Tab krąży
  // wyłącznie po elementach wewnątrz panelu. W repo nie ma dotąd współdzielonej
  // implementacji (ui/Modal.jsx też jej nie ma) — lokalny, bez zależności.
  useEffect(() => {
    closeButtonRef.current?.focus()

    function onKeyDown(e) {
      if (e.key !== 'Tab' || !panelRef.current) return
      const items = Array.from(panelRef.current.querySelectorAll(FOCUSABLE_SELECTOR))
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  // Jeden IntersectionObserver dla wszystkich kroków, z rootem = scrollowalna
  // treść panelu (nie viewport) — reveal ma reagować na scroll WEWNĄTRZ modala.
  function observe(el, onVisible) {
    if (!observerRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              revealCallbacksRef.current.get(entry.target)?.()
              observerRef.current.unobserve(entry.target)
            }
          })
        },
        { root: scrollRef.current, threshold: 0.3, rootMargin: '0px 0px -10% 0px' },
      )
    }
    revealCallbacksRef.current.set(el, onVisible)
    observerRef.current.observe(el)
    return () => {
      revealCallbacksRef.current.delete(el)
      observerRef.current?.unobserve(el)
    }
  }

  useEffect(() => () => observerRef.current?.disconnect(), [])

  function handleStartClick() {
    onClose?.()
    onStart?.()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex sm:items-center sm:justify-center sm:p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={panelRef}
        className="w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-2xl flex flex-col bg-white dark:bg-slate-900 sm:rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="about-app-modal-title"
      >
        <div className="flex items-center justify-between gap-4 px-5 sm:px-6 py-4 border-b border-gray-200 dark:border-slate-700 shrink-0">
          <div>
            <h2 id="about-app-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
              {t('about.title')}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {t('about.subtitle')}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label={tc('actions.close')}
            className="shrink-0 p-2 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 sm:px-6 pt-6">
          {ABOUT_STEPS.map((step, i) => (
            <StepRow
              key={step.key}
              step={step}
              index={i}
              isLast={i === ABOUT_STEPS.length - 1}
              observe={observe}
            />
          ))}

          <div className="pb-6">
            <button
              type="button"
              onClick={handleStartClick}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors shadow-sm"
            >
              {t('home.start')}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}
