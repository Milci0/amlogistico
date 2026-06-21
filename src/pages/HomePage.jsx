import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { HOME_STATS } from '../data/mockData'

export default function HomePage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  function handleStart() {
    if (user) {
      navigate('/app/new-document')
    } else {
      // Niezalogowany → logowanie, z powrotem do generowania po zalogowaniu
      navigate('/login', { state: { from: { pathname: '/app/new-document' } } })
    }
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center text-center py-10">
      <div className="max-w-xl">
        <p className="text-sm text-slate-500 mb-4">Platforma spedycyjna</p>

        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 leading-tight">
          Zarządzaj transportem i dokumentami w jednym miejscu
        </h1>

        <p className="text-slate-500 mt-4 leading-relaxed">
          Wyceny frachtu, CMR, listy pakunkowe i faktury — generowane automatycznie.
        </p>

        <button
          onClick={handleStart}
          className="mt-7 px-6 py-2.5 rounded-lg border border-slate-300 text-slate-800 font-medium hover:bg-slate-50 transition-colors"
        >
          Rozpocznij
        </button>

        {!user && (
          <p className="text-xs text-slate-400 mt-3">
            Zaloguj się, aby uzyskać dostęp do generowania dokumentów.
          </p>
        )}

        {/* Statystyki */}
        <div className="grid grid-cols-3 gap-4 mt-10">
          {HOME_STATS.map(stat => (
            <div
              key={stat.label}
              className="bg-white border border-slate-200 rounded-xl py-6 px-3"
            >
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Strzałka w dół */}
      <button
        className="mt-12 w-11 h-11 flex items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors"
        aria-label="Przewiń w dół"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </button>
    </div>
  )
}
