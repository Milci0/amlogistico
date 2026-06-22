import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { HOME_STATS } from '../data/mockData'

const ICON_SVG = {
  pin: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M12 2C8.686 2 6 4.686 6 8c0 4.5 6 12 6 12s6-7.5 6-12c0-3.314-2.686-6-6-6zm0 8a2 2 0 110-4 2 2 0 010 4z" />
    </svg>
  ),
  docs: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414A1 1 0 0120 8.414V17a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
    </svg>
  ),
  truck: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10h10zM13 8h4l3 4v4h-7V8z" />
    </svg>
  ),
  globe: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
        d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18" />
    </svg>
  ),
}

const ICON_COLORS = {
  teal:   'bg-teal-100   text-teal-600',
  blue:   'bg-blue-100   text-blue-600',
  orange: 'bg-orange-100 text-orange-600',
  red:    'bg-red-100    text-red-500',
}

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  function handleStart() {
    if (user) {
      navigate('/new-document')
    } else {
      navigate('/login', { state: { from: { pathname: '/new-document' } } })
    }
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center text-center py-12 px-4">
      <Helmet>
        <title>AMLogistico - generator dokumentów transportowych online</title>
        <meta name="description" content="Generuj CMR, Packing List, Fakturę handlową, Sea Waybill i inne dokumenty spedycyjne automatycznie. Wypełnij formularz i pobierz PDF w kilka sekund." />
      </Helmet>
      <div className="max-w-2xl w-full">

        {/* Nagłówek */}
        <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
          Zarządzaj transportem i dokumentami
          <br className="hidden sm:block" /> w jednym miejscu
        </h1>

        <p className="text-slate-500 dark:text-slate-400 mt-5 text-base leading-relaxed max-w-lg mx-auto">
          Wyceny frachtu, ubezpieczenia cargo, trasy handlowe, dokumentacja
          i faktury <span className="text-slate-700 dark:text-white font-semibold">wygenerowane automatycznie</span>
        </p>

        {/* Przyciski */}
        <div className="flex items-center justify-center gap-3 mt-8 flex-wrap">
          <button
            onClick={handleStart}
            className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            Rozpocznij
          </button>
          <button
            onClick={() => navigate('/incoterms')}
            className="px-6 py-2.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm"
          >
            Dowiedz się więcej
          </button>
        </div>

        {!user && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            Zaloguj się, aby uzyskać dostęp do generowania dokumentów.
          </p>
        )}

        {/* Karty statystyk */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-12">
          {HOME_STATS.map(stat => (
            <div
              key={stat.label}
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl py-6 px-4 flex flex-col items-center gap-3 shadow-sm"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${ICON_COLORS[stat.color]}`}>
                {ICON_SVG[stat.icon]}
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{stat.label}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}
