import { useState, useEffect, useMemo } from 'react'
import CountrySelect from '../components/ui/CountrySelect'
import AlertBox from '../components/ui/AlertBox'
import DocumentSelectList from '../components/documents/DocumentSelectList'
import CargoCategoryPicker from '../components/cargo/CargoCategoryPicker'
import { cargoLabel, engineCategoryFor } from '../data/cargoCategories'
import { getDocuments, getRouteLabel } from '../utils/documentEngine'
import { downloadBlankZip, hasBlankSource } from '../utils/blankDocuments'
import { completeSet } from '../services/documentSetsRepo'

// ── Opcje formularza ────────────────────────────────────────────────────────────

const TRANSPORT_MODES = [
  { id: 'road', label: 'Drogowy', sub: 'TIR, ciężarówka' },
  { id: 'sea', label: 'Morski', sub: 'Kontener FCL/LCL' },
]

const FLAG_OPTIONS = [
  { key: 'woodenPackaging', label: 'Drewniane opakowania (palety, skrzynie)' },
  { key: 'temporaryExport', label: 'Eksport tymczasowy (Karnet ATA)' },
  { key: 'transhipment', label: 'Przeładunek w porcie pośrednim' },
  { key: 'reExport', label: 'Re-eksport' },
]

// ── Ikony ───────────────────────────────────────────────────────────────────────

// Ikona środka transportu (kolor dziedziczy z przycisku przez currentColor)
function ModeIcon({ id }) {
  const paths = {
    road: (
      <>
        <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3h1.4a2 2 0 0 1 1.7.9l1.7 2.6a2 2 0 0 1 .3 1V17h-2" />
        <circle cx="7.5" cy="17.5" r="2.5" />
        <circle cx="17.5" cy="17.5" r="2.5" />
      </>
    ),
    sea: (
      <>
        <path d="M2 21c.6.5 1.2 1 2.5 1C7 22 7 20 9.5 20c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
        <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.2.5 4.3 1.62 6" />
        <path d="M12 10V2" />
        <path d="M12 2H9" />
      </>
    ),
  }
  return (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      {paths[id]}
    </svg>
  )
}

// ── Strona ──────────────────────────────────────────────────────────────────────

export default function BlankTemplatesPage() {
  const [origin, setOrigin] = useState('PL')
  const [destination, setDestination] = useState('US')
  const [mode, setMode] = useState('road')
  const [cargoCategory, setCargoCategory] = useState('')
  const [cargoSubcategory, setCargoSubcategory] = useState('')
  const [flags, setFlags] = useState({
    woodenPackaging: false,
    temporaryExport: false,
    transhipment: false,
    reExport: false,
  })
  const [zipState, setZipState] = useState('idle') // idle | loading | error
  const [result, setResult] = useState(null) // null = jeszcze nie wygenerowano
  const [selectedIds, setSelectedIds] = useState(new Set())

  // Kategoria dla silnika doboru; podkategoria z flagą ADR podnosi ją do dangerous_goods.
  const engineCategory = engineCategoryFor(cargoCategory, cargoSubcategory)

  // Po zmianie któregokolwiek pola chowamy poprzedni wynik — trzeba wygenerować ponownie.
  useEffect(() => {
    setResult(null)
    setZipState('idle')
    setSelectedIds(new Set())
  }, [origin, destination, mode, cargoCategory, cargoSubcategory, flags])

  // Dokumenty w kształcie DocumentSelectList — tylko te faktycznie do pobrania
  // (dostępne + mają źródło pustego PDF-a); „Wkrótce" nie ma już sensu przy
  // zaznaczaniu zbiorczym, więc niedostępne dokumenty tu nie trafiają.
  const selectListDocs = useMemo(() => {
    if (!result) return []
    const toDoc = (d, required) => ({ id: d.id, namePl: d.name_pl, nameEn: d.name_en, required })
    const req = result.required.filter(d => d.available && hasBlankSource(d.id)).map(d => toDoc(d, true))
    const cond = result.conditional.filter(d => d.available && hasBlankSource(d.id)).map(d => toDoc(d, false))
    return [...req, ...cond]
  }, [result])

  // Zapis do historii dokumentów — jeden wpis (kind:'blank') na każde kliknięcie
  // „Generuj dokumenty", ten sam mechanizm co completeSet w kroku 4 kreatora.
  // Best-effort: błąd zapisu (np. brak miejsca) nie może zablokować pokazania wyników.
  async function saveToHistory(res) {
    const downloadable = [...res.required, ...res.conditional].filter(d => d.available && hasBlankSource(d.id))
    if (downloadable.length === 0) return
    try {
      await completeSet({
        kind: 'blank',
        flowType: 'blank_templates',
        totalSteps: 1,
        formData: { origin, destination, mode, cargoCategory, cargoSubcategory, flags },
        engineResult: {
          docs: downloadable.map(d => ({
            key: d.id,
            name: d.name_pl,
            desc: d.name_en,
            icon: 'doc',
            required: res.required.some(r => r.id === d.id),
          })),
          warnings: res.warnings,
        },
        selectedDocs: downloadable.map(d => d.id),
        meta: {
          routeFrom: origin,
          routeTo: destination,
          transportMode: mode,
          cargoDescription: cargoLabel(cargoCategory, cargoSubcategory),
          transportDate: null,
        },
      })
    } catch (err) {
      console.error('Błąd zapisu pustych szablonów w historii:', err)
    }
  }

  function handleGenerate() {
    const res = getDocuments(origin, destination, mode, engineCategory, flags)
    setResult(res)
    // ETAP 3 — domyślnie zaznaczone: wszystkie dokumenty z required=true.
    const req = res.required.filter(d => d.available && hasBlankSource(d.id))
    setSelectedIds(new Set(req.map(d => d.id)))
    saveToHistory(res)
  }

  function toggleDoc(id) {
    setSelectedIds(s => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function downloadZip() {
    const docs = selectListDocs.filter(d => selectedIds.has(d.id))
    if (docs.length === 0) return
    setZipState('loading')
    try {
      await downloadBlankZip(
        docs.map(d => ({ key: d.id, name: d.namePl })),
        `dokumenty_${origin}_${destination}.zip`
      )
      setZipState('idle')
    } catch (err) {
      console.error(err)
      setZipState('error')
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dobór dokumentów transportowych</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Wskaż trasę, towar i warunki a system dobierze komplet pustych formularzy do pobrania.
        </p>
      </div>

      {/* ── Formularz doboru ──────────────────────────────────────── */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-6 bg-white dark:bg-slate-800 space-y-5">
        {/* Trasa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1">Kraj nadania</label>
            <CountrySelect value={origin} onChange={setOrigin} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1">Kraj przeznaczenia</label>
            <CountrySelect value={destination} onChange={setDestination} />
          </div>
        </div>

        {/* Środek transportu */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-slate-300 mb-2">Środek transportu</label>
          <div className="flex flex-wrap gap-2">
            {TRANSPORT_MODES.map(m => {
              const active = mode === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMode(m.id)}
                  title={m.sub}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                    ${active
                      ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'}`}
                >
                  <ModeIcon id={m.id} />
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Kategoria towaru */}
        <CargoCategoryPicker
          categoryId={cargoCategory}
          subcategoryId={cargoSubcategory}
          onChange={({ categoryId, subcategoryId }) => {
            setCargoCategory(categoryId)
            setCargoSubcategory(subcategoryId)
          }}
        />

        {/* Flagi / warunki dodatkowe */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-slate-300 mb-2">Warunki dodatkowe</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FLAG_OPTIONS.map(f => (
              <label
                key={f.key}
                className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-emerald-600 cursor-pointer shrink-0"
                  checked={flags[f.key]}
                  onChange={e => setFlags(prev => ({ ...prev, [f.key]: e.target.checked }))}
                />
                <span className="text-sm text-gray-700 dark:text-slate-300">{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Przycisk generowania */}
        <button
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Generuj dokumenty
        </button>
      </div>

      {/* ── Wyniki ────────────────────────────────────────────────── */}
      {result && (
      <>
      {/* Etykieta trasy */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">Charakter trasy</span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {getRouteLabel(origin, destination)}
        </span>
      </div>

      {/* Ostrzeżenia */}
      {result.warnings.length > 0 && (
        <div className="mb-6">
          <AlertBox type="warning" title="Zwróć uwagę">
            <ul className="list-disc pl-4 space-y-1 mt-1">
              {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
            </ul>
          </AlertBox>
        </div>
      )}

      {/* Lista dokumentów do zaznaczenia — wspólny komponent z krokiem 4/6 kreatora */}
      {selectListDocs.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-slate-500">Brak dokumentów dla tej konfiguracji.</p>
      ) : (
        <DocumentSelectList
          documents={selectListDocs}
          selectedIds={selectedIds}
          onToggle={toggleDoc}
          actionLabel={
            zipState === 'loading'
              ? 'Pakuję ZIP…'
              : `Pobierz zaznaczone (ZIP)${selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}`
          }
          onAction={downloadZip}
          disabled={zipState === 'loading'}
          actionLoading={zipState === 'loading'}
          errorMessage={
            selectedIds.size === 0
              ? 'Zaznacz co najmniej jeden dokument, aby pobrać pliki.'
              : zipState === 'error'
                ? 'Nie udało się spakować plików. Spróbuj ponownie.'
                : null
          }
        />
      )}
      </>
      )}
    </div>
  )
}
