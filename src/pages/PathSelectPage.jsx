import { Helmet } from 'react-helmet-async'
import { Link, useNavigate } from 'react-router-dom'
import { PackageCheck, Search, FileText, Truck, Calculator, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'

const STEPS_A = [
  { label: 'Dane przesyłki', icon: FileText },
  { label: 'Ubezpieczenie (opcjonalnie)', icon: ShieldCheck },
  { label: 'Generuj dokumenty', icon: PackageCheck },
]

const STEPS_B = [
  { label: 'Dane przesyłki', icon: FileText },
  { label: 'Dostępni spedytorzy', icon: Truck },
  { label: 'Wycena frachtu', icon: Calculator },
  { label: 'Ubezpieczenie (opcjonalnie)', icon: ShieldCheck },
  { label: 'Generuj dokumenty', icon: PackageCheck },
]

function PathCard({ icon: Icon, title, description, steps, path, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(path)}
      className="group text-left w-full h-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 sm:p-7 shadow-sm
        hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400
        transition-all duration-200 flex flex-col"
    >
      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0
        group-hover:scale-105 transition-transform duration-200">
        <Icon className="w-6 h-6" strokeWidth={1.8} />
      </div>

      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-4">{title}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">{description}</p>

      <ul className="mt-5 space-y-2.5 flex-1">
        {steps.map((step) => (
          <li key={step.label} className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300">
            <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0
              group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 transition-colors">
              <step.icon className="w-4 h-4" strokeWidth={1.8} />
            </span>
            {step.label}
          </li>
        ))}
      </ul>

      <span
        className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold
          group-hover:bg-emerald-700 transition-colors"
      >
        Wybierz
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" strokeWidth={2} />
      </span>
    </button>
  )
}

export default function PathSelectPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  function handleSelect(path) {
    // Nawigacja w tej samej karcie przeglądarki (bez otwierania nowej karty).
    navigate(`/new-document?path=${path}`)
  }

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <div className="min-h-dvh bg-amber-50 dark:bg-slate-950 flex flex-col items-center px-4 py-10 relative">
      <Helmet>
        <title>Jak chcesz zacząć? | AMLogistico</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Wróć */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={2} />
        Wróć
      </button>

      {/* Wyloguj / Wróć do strony głównej */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
        {user ? (
          <button
            onClick={handleLogout}
            className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Wyloguj
          </button>
        ) : (
          <Link
            to="/"
            className="text-xs sm:text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Wróć do strony głównej
          </Link>
        )}
      </div>

      <div className="w-full max-w-3xl flex flex-col items-center mt-6 sm:mt-10">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-xl sm:text-2xl text-gray-900 dark:text-white mb-8 sm:mb-10">
          <span className="bg-emerald-500 text-white rounded-lg w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-sm sm:text-base font-black">A</span>
          <span>AM<span className="text-emerald-600">Logistico</span></span>
        </Link>

        {/* Nagłówek */}
        <div className="text-center max-w-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Jak chcesz zacząć?
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2.5 text-sm sm:text-base leading-relaxed">
            Wybierz ścieżkę dopasowaną do Twojej sytuacji, obie prowadzą do kompletu dokumentów.
          </p>
        </div>

        {/* Karty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mt-8 sm:mt-10 w-full">
          <PathCard
            icon={PackageCheck}
            title="Mam już transport"
            description="Masz umówionego przewoźnika lub spedytora, potrzebujesz tylko dokumentów i opcjonalnie ubezpieczenia."
            steps={STEPS_A}
            path="A"
            onSelect={handleSelect}
          />
          <PathCard
            icon={Search}
            title="Szukam transportu"
            description="Pomożemy znaleźć spedytora, pokażemy wycenę i przygotujemy komplet dokumentów."
            steps={STEPS_B}
            path="B"
            onSelect={handleSelect}
          />
        </div>
      </div>
    </div>
  )
}
