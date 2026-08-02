import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Modal z dowolną treścią (children) — uzupełnienie ConfirmDialog, który jest
// dialogiem 2-przyciskowym bez miejsca na formularz.
//
// Renderowany przez createPortal do document.body: każda strona siedzi w AppShell
// wewnątrz <StepTransition>, a element z `transform` tworzy blok zawierający, przez
// co `position: fixed` przyczepiłoby się do strony zamiast do okna (ten sam powód,
// dla którego portal ma UnsavedChangesGuard).

export default function Modal({ title, onClose, children, maxWidth = 'max-w-xl' }) {
  const { t } = useTranslation()
  // Escape zamyka; blokada scrolla tła, żeby przewijała się karta, nie strona pod nią.
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

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`w-full ${maxWidth} max-h-[90vh] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-xl`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between gap-4 px-5 py-4 border-b border-gray-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('actions.close')}
            className="shrink-0 p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
