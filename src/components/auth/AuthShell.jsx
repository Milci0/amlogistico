import { Link } from 'react-router-dom'

// Wspólny wygląd stron logowania/rejestracji — jasne tło, wyśrodkowana karta, logo
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-dvh bg-gradient-to-b from-slate-50 to-emerald-50 dark:from-slate-950 dark:to-slate-900 flex flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="flex items-center gap-2 font-bold text-2xl text-gray-900 dark:text-white mb-6">
        <span className="bg-emerald-500 text-white rounded-lg w-9 h-9 flex items-center justify-center text-base font-black">A</span>
        <span>AM<span className="text-emerald-600">Logistico</span></span>
      </Link>

      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-7 sm:p-8">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>

      {footer && <div className="text-sm text-gray-600 dark:text-slate-400 mt-6">{footer}</div>}
    </div>
  )
}

// Współdzielony styl pól (spójny z wizardem) — eksport, by oba formularze go używały
export const inputCls =
  'w-full border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-colors'

export const labelCls = 'block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5'

export const submitCls =
  'w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 transition-colors'
