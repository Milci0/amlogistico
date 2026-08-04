import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ExternalLink } from 'lucide-react'
import { findCarrierByName, resolveHomeUrl } from '../../data/containerPrefixes'
import AlertBox from '../ui/AlertBox'
import ContainerTrackerBlock from './ContainerTrackerBlock'

// Numer wpisany przez użytkownika żyje WYŁĄCZNIE w tym stanie komponentu — nic
// tu nie trafia do localStorage, bazy ani console.log (dane handlowe klienta).
export default function ContainerLookup() {
  const { t } = useTranslation('pages')
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) {
      setResult(null)
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
        return
      }
    }

    setResult({ mode: 'containerNumber', containerNo: trimmed })
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
          className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shrink-0"
        >
          {t('tracking.container.checkButton')}
        </button>
      </form>

      {result?.mode === 'containerNumber' && <ContainerTrackerBlock containerNo={result.containerNo} />}

      {result?.mode === 'nameSearch' && (
        <div className="space-y-4">
          <AlertBox type="info">{t('tracking.container.nameSearchNote')}</AlertBox>
          <a
            href={resolveHomeUrl(result.carrier)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors group"
          >
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">
                {t('tracking.container.directLinkLabel', { carrier: result.carrier.name })}
              </p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                {t('tracking.container.directLinkBadge')}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 dark:text-slate-500 group-hover:text-emerald-500 shrink-0" strokeWidth={1.75} />
          </a>
        </div>
      )}

      <p className="text-xs text-gray-400 dark:text-slate-500 mt-6">
        {t('tracking.container.footerNote')}
      </p>
    </div>
  )
}
