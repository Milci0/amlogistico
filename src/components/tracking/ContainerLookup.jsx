import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { findCarrierByName, resolveHomeUrl } from '../../data/containerPrefixes'
import { analyzeContainerNumber } from '../../utils/containerNumber'
import { getShipsgoStatus, lookupContainer } from '../../services/shipsgoRepo'
import AlertBox from '../ui/AlertBox'
import ContainerTrackerBlock from './ContainerTrackerBlock'
import ShipsGoLookupResult from './ShipsGoLookupResult'

// Numer wpisany przez użytkownika żyje WYŁĄCZNIE w tym stanie komponentu — nic
// tu nie trafia do localStorage ani console.log (dane handlowe klienta).
// WYJĄTEK: gdy ShipsGo jest włączone (SHIPSGO_ENABLED + user na allowlist),
// numer JEST wysyłany do naszego backendu (patrz lookupContainer) — to jego
// cel, backend woła realne ShipsGo Ocean API. Ciemny pomarańcz w tej zakładce
// celowo — „Śledzenie ładunku" wisi pod „Trasy handlowe" w menu, pokrewny
// akcent co TradeRoutesPage (/routes), ale wyraźnie ciemniejszy (patrz
// TrackingPage.jsx, komentarz przy TAB_ACCENT).
export default function ContainerLookup() {
  const { t } = useTranslation('pages')
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [shipsgoAvailable, setShipsgoAvailable] = useState(false)
  const [lookup, setLookup] = useState({ status: 'idle', data: null, cached: false, error: null })

  useEffect(() => {
    let active = true
    getShipsgoStatus().then((enabled) => { if (active) setShipsgoAvailable(enabled) })
    return () => { active = false }
  }, [])

  async function handleSubmit(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) {
      setResult(null)
      setLookup({ status: 'idle', data: null, cached: false, error: null })
      return
    }

    // Brak cyfr w znormalizowanym wejściu → to nie próba numeru kontenera
    // (każdy poprawny numer ma 7 cyfr), tylko prawdopodobnie nazwa przewoźnika
    // ("CMA CGM", "cmacgm", "maersk"...).
    const normalizedForDigitCheck = trimmed.toUpperCase().replace(/[\s-]/g, '')
    const looksLikeContainerNumber = /\d/.test(normalizedForDigitCheck)

    if (!looksLikeContainerNumber) {
      const carrier = findCarrierByName(trimmed)
      if (carrier) {
        setResult({ mode: 'nameSearch', carrier })
        setLookup({ status: 'idle', data: null, cached: false, error: null })
        return
      }
    }

    setResult({ mode: 'containerNumber', containerNo: trimmed })

    // Realne wyszukiwanie w ShipsGo — WYŁĄCZNIE na ten świadomy klik „Sprawdź",
    // nigdy przy samym wpisywaniu (koszt kredytu przy pierwszym sprawdzeniu
    // danego kontenera). Tylko gdy nasza WŁASNA walidacja cyfry kontrolnej
    // wypadła pozytywnie (valid===true) — przy błędnej cyfrze kontrolnej numer
    // prawdopodobnie ma literówkę (patrz checkDigitWarning niżej), więc nie
    // warto wydawać na niego jednego z dwóch testowych kredytów.
    const analysis = analyzeContainerNumber(trimmed)
    if (shipsgoAvailable && analysis.valid === true) {
      await runLookup(analysis.normalized)
    } else {
      setLookup({ status: 'idle', data: null, cached: false, error: null })
    }
  }

  // Ponowne sprawdzenie TEGO SAMEGO numeru nie tworzy nowego śledzenia i nie
  // kosztuje kredytu (backend trzyma trwały rejestr per kontener), więc przy
  // stanie „w przetwarzaniu" user może bezpiecznie kliknąć „Sprawdź ponownie".
  async function runLookup(normalized) {
    setLookup({ status: 'loading', data: null, cached: false, error: null })
    try {
      const res = await lookupContainer(normalized)
      if (res.status === 'ready' && res.shipsgo) {
        setLookup({ status: 'done', data: res.shipsgo, cached: false, error: null, containerNo: normalized })
      } else if (res.status === 'failed') {
        setLookup({ status: 'failed', data: null, cached: false, error: null, containerNo: normalized })
      } else {
        setLookup({ status: 'pending', data: null, cached: false, error: null, containerNo: normalized })
      }
    } catch (err) {
      setLookup({ status: 'error', data: null, cached: false, error: err, containerNo: normalized })
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mb-5">
        <div className="flex items-center gap-2 px-3 py-2.5 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg flex-1">
          <Search className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" strokeWidth={2} />
          <input
            type="text"
            className="bg-transparent text-sm font-mono tracking-wider outline-none flex-1 text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500"
            placeholder={t('tracking.container.inputPlaceholder')}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
        <button
          type="submit"
          disabled={lookup.status === 'loading'}
          className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-orange-700 hover:bg-orange-800 disabled:opacity-60 text-white transition-colors shrink-0 flex items-center justify-center gap-2"
        >
          {lookup.status === 'loading' && <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />}
          {t('tracking.container.checkButton')}
        </button>
      </form>

      {result?.mode === 'containerNumber' && (
        <div className="space-y-5">
          {lookup.status === 'done' && lookup.data && (
            <ShipsGoLookupResult data={lookup.data} cached={lookup.cached} />
          )}
          {lookup.status === 'pending' && (
            <AlertBox type="info">
              <div>
                <p>{t('tracking.container.shipsgo.pending')}</p>
                <button
                  type="button"
                  onClick={() => runLookup(lookup.containerNo)}
                  className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-orange-800 dark:text-orange-300 hover:underline"
                >
                  <RefreshCw className="w-3.5 h-3.5" strokeWidth={1.75} />
                  {t('tracking.container.shipsgo.checkAgain')}
                </button>
              </div>
            </AlertBox>
          )}
          {lookup.status === 'failed' && (
            <AlertBox type="warning">{t('tracking.container.shipsgo.failed')}</AlertBox>
          )}
          {lookup.status === 'error' && (
            <AlertBox type="warning">
              {lookup.error?.status === 429
                ? t('tracking.container.shipsgo.rateLimited', {
                    minutes: Math.ceil((lookup.error?.data?.retryAfter || 60) / 60),
                  })
                : lookup.error?.message || t('tracking.container.shipsgo.genericError')}
            </AlertBox>
          )}

          <ContainerTrackerBlock containerNo={result.containerNo} accent="orange" />
        </div>
      )}

      {result?.mode === 'nameSearch' && (
        <div className="space-y-4">
          <AlertBox type="info">{t('tracking.container.nameSearchNote')}</AlertBox>
          <a
            href={resolveHomeUrl(result.carrier)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 p-4 rounded-xl border border-orange-200 dark:border-orange-900 bg-white dark:bg-slate-800 hover:border-orange-600 dark:hover:border-orange-700 transition-colors group"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {t('tracking.container.directLinkLabel', { carrier: result.carrier.name })}
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-400 font-medium mt-0.5">
                {t('tracking.container.directLinkBadge')}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-orange-600 shrink-0" strokeWidth={1.75} />
          </a>
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-slate-500 mt-6">
        {t('tracking.container.footerNote')}
      </p>
    </div>
  )
}
