import { useState, useEffect } from 'react'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import CountrySelect from '../components/ui/CountrySelect'
import AlertBox from '../components/ui/AlertBox'
import { getDocuments, getRouteLabel } from '../utils/documentEngine'

// ── Opcje formularza ────────────────────────────────────────────────────────────

const TRANSPORT_MODES = [
  { id: 'road', label: 'Drogowy', sub: 'TIR, ciężarówka' },
  { id: 'sea', label: 'Morski', sub: 'Kontener FCL/LCL' },
  { id: 'air', label: 'Lotniczy', sub: 'AWB' },
  { id: 'rail', label: 'Kolejowy', sub: 'CIM' },
  { id: 'multimodal', label: 'Multimodalny', sub: 'Kilka środków' },
]

// value = klucz silnika (ang.), label = polska nazwa
const CARGO_CATEGORIES = [
  { value: 'general', label: 'Towar ogólny' },
  { value: 'food_animal', label: 'Żywność pochodzenia zwierzęcego' },
  { value: 'food_plant', label: 'Żywność pochodzenia roślinnego' },
  { value: 'dangerous_goods', label: 'Towary niebezpieczne (ADR/IMDG)' },
  { value: 'medicines', label: 'Leki / farmaceutyki' },
  { value: 'electronics', label: 'Elektronika' },
  { value: 'live_animals', label: 'Żywe zwierzęta' },
  { value: 'organic', label: 'Żywność ekologiczna (organic)' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
  { value: 'chemicals', label: 'Chemikalia' },
  { value: 'weapons_dual_use', label: 'Broń / produkty podwójnego zastosowania' },
]

const FLAG_OPTIONS = [
  { key: 'woodenPackaging', label: 'Drewniane opakowania (palety, skrzynie)' },
  { key: 'temporaryExport', label: 'Eksport tymczasowy (Karnet ATA)' },
  { key: 'transhipment', label: 'Przeładunek w porcie pośrednim' },
  { key: 'reExport', label: 'Re-eksport' },
]

const cls = {
  input: 'w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors',
}

// ── Ikony ───────────────────────────────────────────────────────────────────────

function PdfIcon() {
  return (
    <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function DownloadIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

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
    air: (
      <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
    ),
    rail: (
      <>
        <rect width="16" height="16" x="4" y="3" rx="2" />
        <path d="M4 11h16" />
        <path d="M12 3v8" />
        <path d="m8 19-2 3" />
        <path d="m18 22-2-3" />
        <path d="M8 15h.01" />
        <path d="M16 15h.01" />
      </>
    ),
    multimodal: (
      <>
        <circle cx="6" cy="19" r="3" />
        <path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15" />
        <circle cx="18" cy="5" r="3" />
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

// Wymusza pobranie pliku zamiast otwierania go w nowej karcie.
function downloadFile(path) {
  const a = document.createElement('a')
  a.href = path
  a.download = path.split('/').pop() // oryginalna nazwa pliku PDF
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// ── Wiersz dokumentu ──────────────────────────────────────────────────────────

function DocRow({ doc }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl bg-white">
      <PdfIcon />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">{doc.name_pl}</p>
        {doc.name_en && doc.name_en !== doc.name_pl && (
          <p className="text-xs text-gray-400 mt-0.5">{doc.name_en}</p>
        )}
      </div>
      {doc.available ? (
        <button
          onClick={() => downloadFile(doc.path)}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
        >
          <DownloadIcon />
          Pobierz
        </button>
      ) : (
        <button
          disabled
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed"
        >
          Wkrótce
        </button>
      )}
    </div>
  )
}

// ── Strona ──────────────────────────────────────────────────────────────────────

export default function BlankTemplatesPage() {
  const [origin, setOrigin] = useState('PL')
  const [destination, setDestination] = useState('US')
  const [mode, setMode] = useState('road')
  const [cargoCategory, setCargoCategory] = useState('general')
  const [transitNonEU, setTransitNonEU] = useState(false)
  const [flags, setFlags] = useState({
    woodenPackaging: false,
    temporaryExport: false,
    transhipment: false,
    reExport: false,
  })
  const [zipState, setZipState] = useState('idle') // idle | loading | error
  const [result, setResult] = useState(null) // null = jeszcze nie wygenerowano

  // Po zmianie któregokolwiek pola chowamy poprzedni wynik — trzeba wygenerować ponownie.
  useEffect(() => {
    setResult(null)
    setZipState('idle')
  }, [origin, destination, mode, cargoCategory, flags, transitNonEU])

  function handleGenerate() {
    setResult(getDocuments(origin, destination, mode, cargoCategory, { ...flags, transitNonEU }))
  }

  const downloadableRequired = result
    ? result.required.filter(d => d.available && d.path)
    : []

  async function downloadZip() {
    if (downloadableRequired.length === 0) return
    setZipState('loading')
    try {
      const zip = new JSZip()
      await Promise.all(
        downloadableRequired.map(async doc => {
          const res = await fetch(doc.path)
          if (!res.ok) throw new Error(`Nie udało się pobrać ${doc.path} (${res.status})`)
          const blob = await res.blob()
          // nazwa wewnątrz ZIP = oryginalna nazwa pliku PDF
          const filename = doc.path.split('/').pop()
          zip.file(filename, blob)
        }),
      )
      const content = await zip.generateAsync({ type: 'blob' })
      saveAs(content, `dokumenty_${origin}_${destination}.zip`)
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
      <div className="border border-gray-200 rounded-xl p-5 mb-6 bg-white space-y-5">
        {/* Trasa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Kraj nadania</label>
            <CountrySelect value={origin} onChange={setOrigin} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Kraj przeznaczenia</label>
            <CountrySelect value={destination} onChange={setDestination} />
          </div>
        </div>

        {/* Tranzyt przez kraje spoza UE — tylko transport drogowy */}
        {mode === 'road' && (
          <div>
            <label className="block text-sm text-gray-700 mb-2">
              Czy transport przejeżdża przez kraje spoza UE?
            </label>
            <div className="flex gap-2">
              {[
                { val: true, label: 'TAK' },
                { val: false, label: 'NIE' },
              ].map(opt => {
                const active = transitNonEU === opt.val
                return (
                  <button
                    key={opt.label}
                    type="button"
                    onClick={() => setTransitNonEU(opt.val)}
                    className={`px-5 py-2 rounded-lg text-sm font-medium border transition-colors
                      ${active
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Przejazd przez np. Ukrainę, Serbię, Turcję wymaga Karnetu TIR i deklaracji tranzytowej.
            </p>
          </div>
        )}

        {/* Środek transportu */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">Środek transportu</label>
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
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                >
                  <ModeIcon id={m.id} />
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Kategoria towaru */}
        <div>
          <label className="block text-sm text-gray-700 mb-1">Kategoria towaru</label>
          <select
            className={cls.input}
            value={cargoCategory}
            onChange={e => setCargoCategory(e.target.value)}
          >
            {CARGO_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* Flagi / warunki dodatkowe */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">Warunki dodatkowe</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FLAG_OPTIONS.map(f => (
              <label
                key={f.key}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer bg-white hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-blue-600 cursor-pointer shrink-0"
                  checked={flags[f.key]}
                  onChange={e => setFlags(prev => ({ ...prev, [f.key]: e.target.checked }))}
                />
                <span className="text-sm text-gray-700">{f.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Przycisk generowania */}
        <button
          onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
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
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Charakter trasy</span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
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

      {/* Wymagane */}
      <div className="border-l-4 border-red-400 pl-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
            Wymagane ({result.required.length})
          </span>
        </div>

        {result.required.length === 0 ? (
          <p className="text-sm text-gray-400">Brak dokumentów wymaganych dla tej konfiguracji.</p>
        ) : (
          <>
            <div className="space-y-2">
              {result.required.map(doc => <DocRow key={doc.id} doc={doc} />)}
            </div>

            <button
              onClick={downloadZip}
              disabled={zipState === 'loading' || downloadableRequired.length === 0}
              className="mt-3 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
            >
              {zipState === 'loading' ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Pakuję ZIP…
                </>
              ) : (
                <>
                  <DownloadIcon />
                  Pobierz wszystkie jako ZIP ({downloadableRequired.length})
                </>
              )}
            </button>
            {zipState === 'error' && (
              <p className="text-xs text-red-600 mt-2">Nie udało się spakować plików. Spróbuj ponownie.</p>
            )}
          </>
        )}
      </div>

      {/* Warunkowe */}
      {result.conditional.length > 0 && (
        <div className="border-l-4 border-amber-400 pl-4 mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 block mb-3">
            Warunkowe ({result.conditional.length})
          </span>
          <div className="space-y-2">
            {result.conditional.map(doc => <DocRow key={doc.id} doc={doc} />)}
          </div>
        </div>
      )}
      </>
      )}
    </div>
  )
}
