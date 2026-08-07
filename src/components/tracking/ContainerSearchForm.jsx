import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, Loader2 } from 'lucide-react'
import { validateContainerNumber } from '../../utils/containerNumber'

// Stany 1 i 2 makiety: pole numeru + przycisk „Sprawdź", pod polem podpowiedź
// albo komunikat błędu.
//
// Walidacja dzieje się TUTAJ, przed jakimkolwiek żądaniem. Każdy odrzucony numer
// to oszczędzony kredyt ShipsGo — dlatego przy błędzie funkcja onSubmit nawet
// nie jest wołana i w zakładce Network nie widać żadnego zapytania.
// `lastValidNumber` przychodzi z rodzica, a nie ze stanu tego komponentu.
// Powód: otwarcie kontenera i powrót do listy przemontowuje formularz, a wtedy
// stan wewnętrzny by zniknął i wyjątek z Etapu 2 („zmieniono tylko ostatni
// znak") byłby w praktyce nieosiągalny.
export default function ContainerSearchForm({ onSubmit, onRawInput, busy, lastValidNumber = '', onValidNumber }) {
  const { t } = useTranslation('pages')
  const [input, setInput] = useState('')
  const [error, setError] = useState(null)

  function handleChange(e) {
    setInput(e.target.value)
    if (error) setError(null)
  }

  function handleSubmit(e) {
    e.preventDefault()

    // Wejście bez ani jednej cyfry nie jest próbą numeru kontenera (każdy
    // poprawny ma siedem cyfr), tylko prawdopodobnie nazwą linii („CMA CGM",
    // „maersk"). Rozpoznaną nazwę obsługuje wywołujący, bez ruszania backendu.
    const raw = input.trim()
    if (raw && !/\d/.test(raw) && onRawInput?.(raw)) {
      setError(null)
      return
    }

    const result = validateContainerNumber(input, { lastValidNumber })

    if (!result.ok) {
      setError(result)
      return
    }

    setError(null)
    onValidNumber?.(result.normalized)
    onSubmit(result.normalized)
  }

  const errorMessage = error && buildErrorMessage(t, error)

  return (
    <form onSubmit={handleSubmit} className="mb-6" noValidate>
      <div className="flex flex-col sm:flex-row gap-2">
        <div
          className={`flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-700 border rounded-lg flex-1
            ${error ? 'border-red-400 dark:border-red-600' : 'border-gray-300 dark:border-slate-600'}`}
        >
          <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" strokeWidth={2} />
          <input
            type="text"
            className="bg-transparent text-sm font-mono tracking-wider outline-none flex-1 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
            placeholder={t('tracking.container.inputPlaceholder')}
            value={input}
            onChange={handleChange}
            autoComplete="off"
            spellCheck={false}
            aria-label={t('tracking.container.inputLabel')}
            aria-invalid={!!error}
            aria-describedby="container-search-hint"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-orange-700 hover:bg-orange-800 disabled:opacity-60 text-white transition-colors shrink-0 flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
        >
          {busy && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />}
          {t('tracking.container.checkButton')}
        </button>
      </div>

      <p
        id="container-search-hint"
        className={`text-xs mt-2 ${error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-slate-400'}`}
        role={error ? 'alert' : undefined}
      >
        {errorMessage || t('tracking.container.inputHint')}
      </p>
    </form>
  )
}

// Komunikaty muszą uczciwie odzwierciedlać to, co da się wyliczyć.
// Niezgodność sumy kontrolnej NIE wskazuje, która z pierwszych dziesięciu
// pozycji jest zła, więc w ogólnym przypadku nie podajemy „poprawnej cyfry".
// Wyjątek (expectedCheckDigit != null) obsługuje osobny klucz.
function buildErrorMessage(t, error) {
  if (error.code === 'format') return t('tracking.container.validation.format')
  if (error.code === 'checksum') {
    return error.expectedCheckDigit !== null
      ? t('tracking.container.validation.checksumHint', { digit: error.expectedCheckDigit })
      : t('tracking.container.validation.checksum')
  }
  return t('tracking.container.validation.empty')
}
