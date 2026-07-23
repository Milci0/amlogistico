import { useState } from 'react'
import { Sparkles, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react'
import AlertBox from '../ui/AlertBox'
import { api, ApiError } from '../../lib/api'

// Wyszukiwarka kodu celnego oparta o Claude API (krok 2 kreatora). UZUPEŁNIENIE
// dropdownu 262 podkategorii — user sięga tu, gdy nie znajduje swojego towaru na liście.
// To NIE jest czat: każde „Znajdź kod" to niezależne, jednorazowe zapytanie.
//
// Props:
//  - fromCountry / toCountry — kody ISO-2 z kroku 1 (trasa)
//  - onUseCode(code) — wstawia wybrany kod do pola „Kod celny (HS/CN)" i zwija panel

export default function HsCodeFinder({ fromCountry, toCountry, onUseCode }) {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [destVerified, setDestVerified] = useState(false) // checkbox „Zweryfikowałem…"

  const canSearch = description.trim().length >= 3 && !loading

  async function handleSearch() {
    if (!canSearch) return
    setLoading(true)
    setError('')
    setResult(null)
    setDestVerified(false)
    try {
      const data = await api.post('/hs-code/suggest', {
        description: description.trim(),
        countryFrom: fromCountry || '',
        countryTo: toCountry || '',
      })
      setResult(data)
    } catch (e) {
      if (e instanceof ApiError) {
        setError(e.data?.error || 'Nie udało się wyszukać kodu.')
      } else {
        setError('Nie udało się wyszukać kodu.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Log wyboru — od razu po kliknięciu „Użyj" (do oceny skuteczności wyszukiwarki).
  // Fire-and-forget: nie blokuje wstawienia kodu, błąd logu ignorujemy.
  function logChoice(code, source, verified) {
    if (!result) return
    const suggestedCodes =
      source === 'destination'
        ? [result.destination?.code].filter(Boolean)
        : (result.suggestions || []).map((s) => s.code)
    api
      .post('/hs-code/log-choice', {
        description: description.trim(),
        countryFrom: fromCountry || '',
        countryTo: toCountry || '',
        chosenCode: code,
        source,
        verified,
        suggestedCodes,
      })
      .catch(() => {})
  }

  function useCode(code, source = 'classify', verified) {
    logChoice(code, source, verified)
    onUseCode?.(code)
    setOpen(false)
  }

  // ── Stan zwinięty ──────────────────────────────────────────────────────────────
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-900/20 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors text-left"
      >
        <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={1.75} />
        <span className="flex-1 text-sm text-emerald-800 dark:text-emerald-300">
          Nie znajdujesz swojego towaru? Opisz go, a znajdziemy kod celny
        </span>
        <ChevronRight className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={2} />
      </button>
    )
  }

  // ── Stan rozwinięty ─────────────────────────────────────────────────────────────
  const routeLabel = `${fromCountry || '—'} → ${toCountry || '—'}`

  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-900/20 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={1.75} />
        <span className="text-sm font-medium text-gray-800 dark:text-slate-100">Wyszukiwarka kodu celnego</span>
        <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-800/60 text-emerald-700 dark:text-emerald-300">
          {routeLabel}
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="ml-auto text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300"
          aria-label="Zwiń wyszukiwarkę"
        >
          <ChevronDown className="w-4 h-4" strokeWidth={2} />
        </button>
      </div>

      <textarea
        rows={2}
        maxLength={200}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="np. sproszkowany detergent do prania w kapsułkach, 40 sztuk"
        className="w-full resize-none border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-emerald-400 dark:focus:border-emerald-500"
      />

      <div className="flex items-center justify-between mt-1.5">
        <span className="text-xs text-gray-400 dark:text-slate-500">{description.length}/200</span>
        <button
          type="button"
          onClick={handleSearch}
          disabled={!canSearch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors"
        >
          {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
          {loading ? 'Szukam...' : 'Znajdź kod'}
        </button>
      </div>

      {error && (
        <div className="mt-3">
          <AlertBox type="error">{error}</AlertBox>
        </div>
      )}

      {result && <Results result={result} destVerified={destVerified} setDestVerified={setDestVerified} onUse={useCode} />}
    </div>
  )
}

function Results({ result, destVerified, setDestVerified, onUse }) {
  const { suggestions = [], destination, destinationReason, toEU, hs6, destinationCountry } = result
  const hasSuggestions = suggestions.length > 0

  return (
    <div className="mt-4 space-y-3">
      {hasSuggestions ? (
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div
              key={s.code + i}
              className={`flex items-start gap-3 p-3 rounded-lg border ${
                i === 0
                  ? 'border-emerald-400 dark:border-emerald-500 bg-white dark:bg-slate-800'
                  : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-semibold text-gray-800 dark:text-slate-100">{s.code}</p>
                {s.description && (
                  <p className="text-xs text-gray-600 dark:text-slate-300 mt-0.5">{s.description}</p>
                )}
                {s.reasoning && (
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 italic">{s.reasoning}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => onUse(s.code)}
                className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium border border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-colors"
              >
                Użyj
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Nie znaleziono dopasowania. Doprecyzuj opis towaru i spróbuj ponownie.
        </p>
      )}

      {/* Notka pod wynikami */}
      {hasSuggestions && (
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Kod sugerowany, zweryfikuj go przed kontynuacją.
          {!toEU && (
            <>
              {' '}
              Kod obowiązuje w dokumentach eksportowych UE. Odprawa importowa w kraju docelowym
              wymaga osobnego kodu z tamtejszej taryfy.
            </>
          )}
        </p>
      )}

      {/* Sekcja kodu kraju docelowego */}
      {destination ? (
        <DestinationSection
          destination={destination}
          verified={destVerified}
          setVerified={setDestVerified}
          onUse={onUse}
        />
      ) : (
        !toEU &&
        destinationReason && (
          <div className="pt-2 border-t border-emerald-100 dark:border-emerald-800/60">
            <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mb-1">
              Kod dla odprawy importowej{destinationCountry ? ` w ${destinationCountry}` : ''}
            </p>
            {hs6 && (
              <p className="font-mono text-sm text-gray-700 dark:text-slate-200 mb-1">
                HS-6: {hs6}
              </p>
            )}
            <p className="text-xs text-gray-500 dark:text-slate-400">
              Kod krajowy (pełne rozszerzenie taryfy) uzupełnia agent celny w kraju importu.
            </p>
          </div>
        )
      )}
    </div>
  )
}

function DestinationSection({ destination, verified, setVerified, onUse }) {
  const { code, description, sourceUrl, systemName, countryName } = destination
  const isVerified = destination.verified

  return (
    <div
      className={`pt-3 mt-1 rounded-lg border p-3 ${
        isVerified
          ? 'border-emerald-300 dark:border-emerald-600 bg-white dark:bg-slate-800'
          : 'border-amber-300 dark:border-amber-600 bg-amber-50/70 dark:bg-amber-900/20'
      }`}
    >
      <p className="text-sm font-medium text-gray-800 dark:text-slate-100 mb-1.5">
        Kod dla odprawy importowej{countryName ? ` w ${countryName}` : ''}
      </p>

      <p className="font-mono text-sm font-semibold text-gray-800 dark:text-slate-100">{code}</p>
      {description && <p className="text-xs text-gray-600 dark:text-slate-300 mt-0.5">{description}</p>}

      {isVerified ? (
        <div className="mt-2 space-y-1">
          <p className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
            Zweryfikowano w {systemName || 'oficjalnej taryfie'}
          </p>
          {sourceUrl && (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <ExternalLink className="w-3.5 h-3.5" strokeWidth={2} />
              Zobacz źródło
            </a>
          )}
        </div>
      ) : (
        <p className="mt-2 text-xs text-amber-700 dark:text-amber-300">
          Sugestia AI, niezweryfikowana. Potwierdź kod u agenta celnego w kraju docelowym przed użyciem.
        </p>
      )}

      {/* Checkbox wymagany w OBU przypadkach przed „Użyj". */}
      <label className="flex items-start gap-2 mt-3 cursor-pointer">
        <input
          type="checkbox"
          checked={verified}
          onChange={(e) => setVerified(e.target.checked)}
          className="mt-0.5 w-4 h-4 rounded border-gray-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-400"
        />
        <span className="text-xs text-gray-700 dark:text-slate-300">
          Zweryfikowałem ten kod w taryfie kraju docelowego
        </span>
      </label>

      <div className="mt-2">
        <button
          type="button"
          onClick={() => onUse(code, 'destination', isVerified)}
          disabled={!verified}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors
            border-emerald-500 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/30
            disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-400
            disabled:hover:bg-gray-100 dark:disabled:border-slate-700 dark:disabled:bg-slate-800 dark:disabled:text-slate-500 dark:disabled:hover:bg-slate-800"
        >
          Użyj
        </button>
      </div>
    </div>
  )
}
