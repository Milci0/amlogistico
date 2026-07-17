import { useState, useEffect, useMemo } from 'react'
import { Package, UtensilsCrossed, FlaskConical, PawPrint, Boxes, Info } from 'lucide-react'
import CountrySelect from '../components/ui/CountrySelect'
import AlertBox from '../components/ui/AlertBox'
import DocumentSelectList from '../components/documents/DocumentSelectList'
import { getDocuments, getRouteLabel } from '../utils/documentEngine'
import { downloadBlankZip, hasBlankSource } from '../utils/blankDocuments'
import { completeSet } from '../services/documentSetsRepo'

// ── Opcje formularza ────────────────────────────────────────────────────────────

const TRANSPORT_MODES = [
  { id: 'road', label: 'Drogowy', sub: 'TIR, ciężarówka' },
  { id: 'sea', label: 'Morski', sub: 'Kontener FCL/LCL' },
]

// Ten sam widget co „Rodzaj ładunku” w kroku 2 kreatora (DocumentWizard.jsx) —
// spójny wygląd i słownictwo w całej aplikacji.
const CARGO_TYPES = [
  {
    id: 'general',
    label: 'Ogólny',
    icon: Package,
    hint: 'Ładunek standardowy — zwykle wystarczą podstawowe dokumenty transportowe (CMR/B&L, faktura, packing list). Brak dodatkowych certyfikatów.',
  },
  {
    id: 'food',
    label: 'Żywność',
    icon: UtensilsCrossed,
    hint: 'Może być wymagane świadectwo fitosanitarne (towary roślinne) lub certyfikat zdrowia / HACCP — zależnie od towaru i kraju docelowego.',
  },
  {
    id: 'chemicals',
    label: 'Chemia / ADR',
    icon: FlaskConical,
    hint: 'Wymagana karta charakterystyki substancji niebezpiecznej (MSDS/SDS) oraz dokumenty ADR — instrukcja pisemna, zaświadczenie ADR kierowcy.',
  },
  {
    id: 'animal',
    label: 'Pochodzenia zwierzęcego',
    icon: PawPrint,
    hint: 'Wymagane świadectwo weterynaryjne (health certificate) oraz zgłoszenie w systemie TRACES przy imporcie/eksporcie z/do UE.',
  },
  {
    id: 'other',
    label: 'Inne',
    icon: Boxes,
    hint: 'Rodzaj dodatkowych dokumentów zależy od konkretnego towaru — warto skonsultować się z agencją celną.',
  },
]

// Mapowanie prostego wyboru użytkownika na szczegółową kategorię silnika doboru
// dokumentów (documentEngine.js) — ten sam widget co w kreatorze ma tylko 5 opcji,
// więc część rozróżnień silnika (np. halal/kosher/elektronika/leki) nie jest tu
// osiągalna z UI; wybieramy najbliższy odpowiednik.
const CARGO_TYPE_TO_ENGINE_CATEGORY = {
  general: 'general',
  food: 'food_plant',
  chemicals: 'dangerous_goods',
  animal: 'food_animal',
  other: 'general',
}

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
  const [cargoType, setCargoType] = useState('general')
  const [flags, setFlags] = useState({
    woodenPackaging: false,
    temporaryExport: false,
    transhipment: false,
    reExport: false,
  })
  const [zipState, setZipState] = useState('idle') // idle | loading | error
  const [result, setResult] = useState(null) // null = jeszcze nie wygenerowano
  const [selectedIds, setSelectedIds] = useState(new Set())

  const cargoCategory = CARGO_TYPE_TO_ENGINE_CATEGORY[cargoType]
  const selectedCargoType = CARGO_TYPES.find(ct => ct.id === cargoType)

  // Po zmianie któregokolwiek pola chowamy poprzedni wynik — trzeba wygenerować ponownie.
  useEffect(() => {
    setResult(null)
    setZipState('idle')
    setSelectedIds(new Set())
  }, [origin, destination, mode, cargoType, flags])

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
        formData: { origin, destination, mode, cargoType, flags },
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
          cargoDescription: selectedCargoType?.label || cargoType,
          transportDate: null,
        },
      })
    } catch (err) {
      console.error('Błąd zapisu pustych szablonów w historii:', err)
    }
  }

  function handleGenerate() {
    const res = getDocuments(origin, destination, mode, cargoCategory, flags)
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
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                >
                  <ModeIcon id={m.id} />
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Rodzaj ładunku */}
        <div>
          <label className="block text-sm text-gray-700 mb-2">Rodzaj ładunku</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {CARGO_TYPES.map(ct => {
              const Icon = ct.icon
              const active = cargoType === ct.id
              return (
                <button
                  key={ct.id}
                  type="button"
                  onClick={() => setCargoType(ct.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 border-2 rounded-xl text-center transition-all
                    ${active ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
                >
                  <Icon className={active ? 'w-5 h-5 text-emerald-500' : 'w-5 h-5 text-gray-400'} strokeWidth={1.5} />
                  <span className={`text-xs font-medium ${active ? 'text-emerald-700' : 'text-gray-700'}`}>{ct.label}</span>
                </button>
              )
            })}
          </div>
          {selectedCargoType && (
            <div className="mt-3 flex items-start gap-2 px-3.5 py-3 bg-emerald-50 border border-emerald-100 rounded-lg">
              <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={1.5} />
              <p className="text-xs text-emerald-700">{selectedCargoType.hint}</p>
            </div>
          )}
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
                  className="w-4 h-4 accent-emerald-600 cursor-pointer shrink-0"
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
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">Charakter trasy</span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
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
        <p className="text-sm text-gray-400">Brak dokumentów dla tej konfiguracji.</p>
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
