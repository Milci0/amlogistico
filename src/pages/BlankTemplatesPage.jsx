import { useState, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import CountrySelect from '../components/ui/CountrySelect'
import AlertBox from '../components/ui/AlertBox'
import DocumentSelectList from '../components/documents/DocumentSelectList'
import CargoCategoryPicker from '../components/cargo/CargoCategoryPicker'
import MultimodalContractPicker from '../components/MultimodalContractPicker'
import { cargoLabel, engineCategoryFor } from '../data/cargoCategories'
import { documentCatalog } from '../data/documentCatalog'
import { getDocuments, getRouteLabel } from '../utils/documentEngine'
import { downloadBlankZip, hasBlankSource } from '../utils/blankDocuments'
import { completeSet } from '../services/documentSetsRepo'
import { translateEngineWarning } from '../utils/translateEngineWarning'

// ── Opcje formularza ────────────────────────────────────────────────────────────

// Identyfikatory (nie etykiety) — etykiety idą z tłumaczeń.
// Pięć gałęzi, które zna documentEngine.js. Do 2026-08-03 strona oferowała tylko
// road i sea, przez co reguły kolejowe i lotnicze silnika były nieosiągalne
// z interfejsu w ogóle — mimo że istniały i były pokryte katalogiem.
const TRANSPORT_MODE_IDS = ['road', 'sea', 'air', 'rail', 'multimodal']
const FLAG_KEYS = ['woodenPackaging', 'temporaryExport', 'transhipment', 'reExport']

// „Osobne umowy na odcinki" (patrz MultimodalContractPicker) — ta strona nie
// zbiera realnych etapów trasy (celowo, to formularz do pustych szablonów,
// nie kreator), więc zamiast pytać O KTÓRE środki transportu chodzi, prosimy
// silnik o dokument podstawowy WSZYSTKICH czterech gałęzi naraz. User i tak
// odznacza w liście poniżej to, czego nie potrzebuje — ta sama logika co
// reszta tej strony (szeroki zestaw + checkboxy, nie zgadywanie).
const MULTIMODAL_SEPARATE_LEGS = ['road', 'sea', 'rail', 'air']

// ── Ikony ───────────────────────────────────────────────────────────────────────

// Ikona środka transportu. Ta strona konsekwentnie trzyma się inline SVG
// (jak FreightRates/TradeRoutesPage), więc nie sięgamy tu po lucide-react.
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
      <>
        <path d="M17.8 19.2 16 11l3.5-3.5a2.1 2.1 0 0 0-3-3L13 8 4.8 6.2a.5.5 0 0 0-.5.8l3.9 4.2-2.2 2.2-1.9-.4a.5.5 0 0 0-.5.8L5 16l1.2 1.4a.5.5 0 0 0 .8-.1l-.4-1.9 2.2-2.2 4.2 3.9a.5.5 0 0 0 .8-.5Z" />
      </>
    ),
    rail: (
      <>
        <rect x="5" y="3" width="14" height="13" rx="2" />
        <path d="M9 16 7 21" />
        <path d="M15 16l2 5" />
        <path d="M5 10h14" />
        <path d="M8 6.5h.01" />
        <path d="M16 6.5h.01" />
      </>
    ),
    multimodal: (
      <>
        <circle cx="6" cy="19" r="3" />
        <path d="M9 19h5a3 3 0 0 0 3-3V8a3 3 0 0 1 3-3" />
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

// ── Strona ──────────────────────────────────────────────────────────────────────

export default function BlankTemplatesPage() {
  const { t, i18n } = useTranslation('pages')
  const [origin, setOrigin] = useState('PL')
  const [destination, setDestination] = useState('US')
  const [mode, setMode] = useState('road')
  const [contractType, setContractType] = useState('')
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
  }, [origin, destination, mode, contractType, cargoCategory, cargoSubcategory, flags])

  // Zmiana gałęzi transportu czyści wybór struktury umowy — ten sam powód co
  // w kreatorze (initMultimodal w wizardState.js): przy powrocie na
  // Multimodalny user musi wybrać świadomie, nie dziedziczy starego wyboru.
  useEffect(() => {
    if (mode !== 'multimodal') setContractType('')
  }, [mode])

  // Dokumenty w kształcie DocumentSelectList — tylko te faktycznie do pobrania
  // (dostępne + mają źródło pustego PDF-a); „Wkrótce" nie ma już sensu przy
  // zaznaczaniu zbiorczym, więc niedostępne dokumenty tu nie trafiają.
  const selectListDocs = useMemo(() => {
    if (!result) return []
    const toDoc = (d, section) => ({
      id: d.id,
      namePl: d.name_pl,
      nameEn: d.name_en,
      required: section === 'required',
      section,
      outputMode: d.outputMode,
      authority: documentCatalog[d.id]?.authority || null,
    })
    const pick = (list, section) =>
      list.filter(d => d.available && hasBlankSource(d.id)).map(d => toDoc(d, section))
    // Ta strona z definicji serwuje puste formularze, więc `blanks` z silnika
    // trafiają do sekcji „Do wypełnienia ręcznie" razem z resztą — istotne jest
    // to, KTO je wystawia, a nie że są puste.
    return [
      ...pick(result.required, 'required'),
      ...pick(result.conditional, 'optional'),
      ...pick(result.blanks, 'manual'),
    ]
  }, [result])

  // Zapis do historii dokumentów — jeden wpis (kind:'blank') na każde kliknięcie
  // „Generuj dokumenty", ten sam mechanizm co completeSet w kroku 4 kreatora.
  // Best-effort: błąd zapisu (np. brak miejsca) nie może zablokować pokazania wyników.
  async function saveToHistory(res) {
    const downloadable = [...res.required, ...res.conditional, ...res.blanks]
      .filter(d => d.available && hasBlankSource(d.id))
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

  // Blokuje „Generuj", dopóki user przy Multimodalnym świadomie nie wybierze
  // struktury umowy — ten sam powód co walidacja Kroku 1 w kreatorze
  // (flowSteps.js): bez tego silnik cicho spadłby na 'single' (sam MTD).
  const needsContractType = mode === 'multimodal' && !contractType

  function handleGenerate() {
    if (needsContractType) return
    // includeMetadata: ta strona potrzebuje `blanks` i `outputMode`, żeby pokazać
    // KTO wystawia dokument. Ostrzeżenia są wtedy obiektami z kodem — tłumaczy je
    // ta sama funkcja co dotąd (przyjmuje oba kształty).
    // `cargoCategoryId` obok kategorii silnika: dwanaście z dziewiętnastu kategorii
    // mapuje się na `general`, więc reguł akcyzowych, CBAM i EUDR nie da się z niej
    // odróżnić. Kreator przekazuje to samo w buildEngineFlags — obie ścieżki muszą
    // liczyć identycznie (pilnuje tego „audyt flag" w documentEngine.matrix.test.js).
    // multimodalContractType/multimodalLegs: ta sama umowa co Krok 1 kreatora
    // (patrz buildEngineFlags w documentGeneration.js). Przy 'separate' dajemy
    // WSZYSTKIE cztery gałęzie naraz (patrz komentarz przy MULTIMODAL_SEPARATE_LEGS)
    // — user odznacza zbędne w liście dokumentów poniżej.
    const engineFlags = {
      ...flags,
      cargoCategoryId: cargoCategory,
      multimodalContractType: mode === 'multimodal' ? (contractType || null) : null,
      multimodalLegs: mode === 'multimodal' && contractType === 'separate' ? MULTIMODAL_SEPARATE_LEGS : [],
    }
    const res = getDocuments(origin, destination, mode, engineCategory, engineFlags, { includeMetadata: true })
    setResult(res)
    // ETAP 3 — domyślnie zaznaczone: wszystkie dokumenty z required=true.
    // Domyślnie zaznaczone tylko wymagane — sekcja „Do wypełnienia ręcznie" bywa
    // na trasach poza UE dłuższa niż dwie pozostałe razem wzięte.
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
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t('blankTemplates.title')}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {t('blankTemplates.subtitle')}
        </p>
      </div>

      {/* ── Formularz doboru ──────────────────────────────────────── */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-6 bg-white dark:bg-slate-800 space-y-5">
        {/* Trasa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1">{t('blankTemplates.origin')}</label>
            <CountrySelect value={origin} onChange={setOrigin} />
          </div>
          <div>
            <label className="block text-sm text-gray-700 dark:text-slate-300 mb-1">{t('blankTemplates.destination')}</label>
            <CountrySelect value={destination} onChange={setDestination} />
          </div>
        </div>

        {/* Środek transportu */}
        <div>
          <label className="block text-sm text-gray-700 dark:text-slate-300 mb-2">{t('blankTemplates.transportMode')}</label>
          <div className="flex flex-wrap gap-2">
            {TRANSPORT_MODE_IDS.map(id => {
              const active = mode === id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMode(id)}
                  title={t(`blankTemplates.modes.${id}.sub`)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                    ${active
                      ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'}`}
                >
                  <ModeIcon id={id} />
                  {t(`blankTemplates.modes.${id}.label`)}
                </button>
              )
            })}
          </div>
        </div>

        {/* Struktura umowy przy Multimodalnym — ten sam komponent i te same
            teksty co Krok 1 kreatora (route.multimodalStructure.* w
            wizard.json). Bez podglądu dokumentów per etap i bez edytora
            etapów — ta strona nie zbiera realnej trasy multimodalnej. */}
        <MultimodalContractPicker
          visible={mode === 'multimodal'}
          contractType={contractType}
          onChange={setContractType}
        />

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
          <label className="block text-sm text-gray-700 dark:text-slate-300 mb-2">{t('blankTemplates.extraConditions')}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {FLAG_KEYS.map(key => (
              <label
                key={key}
                className="flex items-center gap-3 p-3 border border-gray-200 dark:border-slate-700 rounded-lg cursor-pointer bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-emerald-600 cursor-pointer shrink-0"
                  checked={flags[key]}
                  onChange={e => setFlags(prev => ({ ...prev, [key]: e.target.checked }))}
                />
                <span className="text-sm text-gray-700 dark:text-slate-300">{t(`blankTemplates.flags.${key}`)}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Przycisk generowania */}
        <div>
          <button
            onClick={handleGenerate}
            disabled={needsContractType}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {t('blankTemplates.generate')}
          </button>
          {needsContractType && (
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-2 text-center">
              {t('blankTemplates.needsContractType')}
            </p>
          )}
        </div>
      </div>

      {/* ── Wyniki ────────────────────────────────────────────────── */}
      {result && (
      <>
      {/* Etykieta trasy */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500">{t('blankTemplates.routeCharacter')}</span>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          {t(`routeLabel.${getRouteLabel(origin, destination)}`, { defaultValue: getRouteLabel(origin, destination) })}
        </span>
      </div>

      {/* Ostrzeżenia */}
      {result.warnings.length > 0 && (
        <div className="mb-6">
          <AlertBox type="warning" title={t('blankTemplates.warningsTitle')}>
            <ul className="list-disc pl-4 space-y-1 mt-1">
              {result.warnings.map((w, i) => <li key={i}>{translateEngineWarning(w, i18n.language)}</li>)}
            </ul>
          </AlertBox>
        </div>
      )}

      {/* Lista dokumentów do zaznaczenia — wspólny komponent z krokiem 4/6 kreatora */}
      {selectListDocs.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-slate-500">{t('blankTemplates.noDocuments')}</p>
      ) : (
        <DocumentSelectList
          documents={selectListDocs}
          selectedIds={selectedIds}
          onToggle={toggleDoc}
          actionLabel={
            zipState === 'loading'
              ? t('blankTemplates.zipping')
              : selectedIds.size > 0
                ? t('blankTemplates.downloadZipCount', { count: selectedIds.size })
                : t('blankTemplates.downloadZip')
          }
          onAction={downloadZip}
          disabled={zipState === 'loading'}
          actionLoading={zipState === 'loading'}
          errorMessage={
            selectedIds.size === 0
              ? t('blankTemplates.selectAtLeastOne')
              : zipState === 'error'
                ? t('blankTemplates.zipError')
                : null
          }
        />
      )}
      </>
      )}
    </div>
  )
}
