import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Info, ShieldCheck, ArrowRight, Truck, Ship, Train, Plane, Route, Plus, X, CheckCircle2, AlertTriangle } from 'lucide-react'
import { COUNTRIES } from '../../data/mockData'
import CountrySelect from '../ui/CountrySelect'
import CitySelect from '../ui/CitySelect'
import AlertBox from '../ui/AlertBox'
import { preloadHtml2Pdf } from '../../generators/generatePdf'
import { useAuth } from '../../auth/AuthContext'
import { useWizard } from './WizardContext'
import {
  getDocsForSnapshot,
  getEngineResultForSnapshot,
  computeBothEU,
  generateDocuments,
} from '../../services/documentGeneration'
import { getDocuments, LAYERS } from '../../utils/documentEngine'
import ConfirmDialog from '../ui/ConfirmDialog'
import DocumentSelectList from '../documents/DocumentSelectList'
import CargoCategoryPicker from '../cargo/CargoCategoryPicker'
import CargoUnitField from '../cargo/CargoUnitField'
import HsCodeFinder from '../cargo/HsCodeFinder'
import StepTransition from '../StepTransition'
import MultimodalContractPicker from '../MultimodalContractPicker'
import { SLICE_INITIALIZERS, TRANSPORT_MODES, hasBranchData, initMultimodalLeg } from './wizardState'
import { toCatalogId } from '../../data/documentIdAliases'
import { translateEngineWarning } from '../../utils/translateEngineWarning'
import FreightRates from '../freight/FreightRates'
import useFreightRates from '../../hooks/useFreightRates'
import { findSeaPortCode } from '../../data/seaPorts'

const CURRENCIES = ['EUR', 'PLN', 'USD', 'GBP', 'CHF']
const CONTAINER_TYPES = ['', '20ft', '40ft', '40ft HC', 'LCL']
// UWAGA: te wartości lądują w formData i w szablonach PDF, więc pozostają
// literałami. Tłumaczona jest wyłącznie ETYKIETA przycisku.
const VEHICLE_TYPES = ['Plandeka', 'Chłodnia', 'Mroźnia']

// Kod Incoterm jest wartością zapisywaną w formData, więc zostaje literałem.
// Nazwa i opis idą z tłumaczeń (namespace `incoterms`, klucz `rules.<CODE>`).
const INCOTERM_CODES = ['EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP']

const cls = {
  input: 'w-full bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg px-3 py-2.5 text-sm text-gray-800 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-100 dark:focus:ring-emerald-900 transition-colors',
}

// Kliknięcie w dowolne miejsce pola daty otwiera natywny kalendarz (nie tylko
// ikonka). showPicker() jest wspierane w nowych przeglądarkach; starsze po prostu
// zachowują domyślne działanie (klik w ikonę).
const openDatePicker = (e) => {
  try { e.currentTarget.showPicker?.() } catch { /* brak wsparcia / brak gestu */ }
}

// Pasek kroków — dynamiczny (liczba kroków z definicji ścieżki) i klikalny do
// najdalej odwiedzonego kroku (w trybie edit odblokowany w całości).
function StepBar({ steps, current, maxReached, onStepClick }) {
  const total = steps.length
  return (
    <div
      className="grid gap-1 sm:gap-1.5 mb-6"
      style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
    >
      {steps.map((name, i) => {
        const num = i + 1
        const done = num < current
        const active = num === current
        const reachable = num <= maxReached
        return (
          <button
            key={name}
            type="button"
            disabled={!reachable}
            onClick={() => reachable && onStepClick(num)}
            className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1 sm:px-2 py-2.5 rounded-xl border-[1.5px] transition-colors
              ${active ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : done ? 'border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-800' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800'}
              ${reachable ? 'cursor-pointer hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20' : 'cursor-default'}`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0
              ${done ? 'bg-emerald-500 text-white' : active ? 'border-[1.5px] border-emerald-500 dark:border-emerald-400 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300' : 'bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-400 dark:text-slate-500'}`}>
              {done ? (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : num}
            </div>
            <span className={`hidden sm:inline text-[11px] md:text-xs font-medium leading-tight ${active ? 'text-emerald-800 dark:text-emerald-300' : done ? 'text-gray-900 dark:text-slate-200' : 'text-gray-400 dark:text-slate-500'}`}>
              {name}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function SectionLabel({ children }) {
  return <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-400 mb-3">{children}</p>
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 dark:text-slate-200 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

function BackButton({ onClick }) {
  const { t } = useTranslation('wizard')
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-300 font-medium border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors mb-6"
    >
      {t('nav.back')}
    </button>
  )
}

function NextButton({ onClick, disabled, label }) {
  const { t } = useTranslation('wizard')
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:text-gray-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
    >
      {label ?? t('nav.next')}
    </button>
  )
}

// ── Step 1: Trasa ──────────────────────────────────────────────────────────────

// Pięć gałęzi, które zna silnik doboru. Ikony z lucide-react (jest w repo).
const TRANSPORT_ICONS = { road: Truck, sea: Ship, rail: Train, air: Plane, multimodal: Route }

function TransportChip({ id, active, onSelect }) {
  const { t } = useTranslation('wizard')
  const Icon = TRANSPORT_ICONS[id]
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      aria-pressed={active}
      className={`flex flex-col items-center gap-2 p-3.5 border-2 rounded-xl text-center transition-all
        ${active
          ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'}`}
    >
      <Icon
        className={`w-6 h-6 shrink-0 ${active ? 'text-emerald-500' : 'text-gray-400 dark:text-slate-500'}`}
        strokeWidth={1.5}
      />
      <div className="min-w-0">
        <p className={`text-sm font-semibold leading-tight ${active ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-800 dark:text-slate-200'}`}>
          {t(`route.modes.${id}.label`)}
        </p>
        <p className={`text-[11px] mt-0.5 leading-tight ${active ? 'text-emerald-500 dark:text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}>
          {t(`route.modes.${id}.sub`)}
        </p>
      </div>
    </button>
  )
}

// Podgląd „Dokumenty przewozowe" pod pytaniem o strukturę umowy, WYŁĄCZNIE przy
// 'separate' — pokazuje dokument podstawowy KAŻDEJ gałęzi z legs[] (Krok 2),
// żeby user widział skutek wyboru natychmiast, nie dopiero w Kroku 4. Woła
// getDocuments() wprost, per gałąź — dokładnie ta sama reguła co silnik użyje
// finalnie, tylko bez wiedzy o cargoCategory (jeszcze nieznanej w Kroku 1) i bez
// flag zależnych od Kroku 2 (containerized/consolidated/groupConsignment), więc
// pokazujemy TYLKO dokument podstawowy (CMR/B-L/CIM.../AWB), nie komplet.
function MultimodalDocsPreview({ legs, fromCountry, toCountry }) {
  const { t, i18n } = useTranslation('wizard')
  const legModes = (legs || []).map(l => l.mode).filter(Boolean)

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1">
        {t('route.multimodalStructure.docsPreviewTitle')}
      </p>
      <p className="text-[11px] text-gray-400 dark:text-slate-500 mb-3">
        {t('route.multimodalStructure.docsPreviewHint')}
      </p>

      {legModes.length === 0 ? (
        <p className="text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-900 rounded-lg p-3">
          {t('route.multimodalStructure.docsPreviewEmpty')}
        </p>
      ) : (
        <ul className="space-y-1.5">
          {legModes.map((legMode, i) => {
            const result = getDocuments(fromCountry, toCountry, legMode, 'general', {}, { includeMetadata: true })
            const doc = result.required.find(d => d.layer === LAYERS.TRANSPORT)
            const docName = doc ? (i18n.language.startsWith('en') ? doc.name_en : doc.name_pl) : null
            return (
              <li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" strokeWidth={1.75} />
                {docName
                  ? t('route.multimodalStructure.docsPreviewItem', { doc: docName, leg: t(`route.multimodalStructure.legSuffix.${legMode}`) })
                  : t(`route.modes.${legMode}.label`)}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function Step1({ data, setData, multimodal, setMultimodal, onTransportChange, onNext, canNext }) {
  const { t } = useTranslation('wizard')
  const isMultimodal = data.transport === 'multimodal'
  const isSeparate = multimodal.contractType === 'separate'

  return (
    <div>
      <SectionLabel>{t('route.transportType')}</SectionLabel>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-6">
        {TRANSPORT_MODES.map(id => (
          <TransportChip key={id} id={id} active={data.transport === id} onSelect={onTransportChange} />
        ))}
      </div>

      {/* Pytanie „Jak zorganizowany jest przewóz?" — rozwija się pod kafelkami
          wyłącznie dla gałęzi Multimodalny. Żadna opcja nie jest zaznaczona
          domyślnie (patrz initMultimodal w wizardState.js) — walidacja w
          flowSteps.js blokuje „Dalej", dopóki user świadomie nie wybierze.
          Samo pytanie wydzielone do MultimodalContractPicker (współdzielone
          z BlankTemplatesPage.jsx) — podgląd dokumentów niżej zostaje TU,
          bo zależy od realnych legs+trasy, których „Puste szablony" nie mają. */}
      <MultimodalContractPicker
        visible={isMultimodal}
        contractType={multimodal.contractType}
        onChange={opt => setMultimodal(m => ({
          ...m,
          contractType: opt,
          // 'separate' → 'single': legs[] traci sens (jeden przewoźnik na
          // całość), więc czyścimy do świeżego stanu — user zaczyna od nowa,
          // jeśli kiedyś wróci do 'separate'.
          legs: opt === 'single' ? [initMultimodalLeg(1)] : m.legs,
        }))}
      />

      {/* Podgląd dokumentów — pod pytaniem, ta sama filozofia wcięcia (linia
          cieńsza i neutralna, nie kolorowa jak w pytaniu wyżej). */}
      <div className={`wizard-collapse mb-5 ${isMultimodal && isSeparate ? 'is-open' : ''}`} aria-hidden={!(isMultimodal && isSeparate)}>
        <div>
          <div className="pl-4 border-l border-gray-300 dark:border-slate-600">
            <MultimodalDocsPreview legs={multimodal.legs} fromCountry={data.fromCountry} toCountry={data.toCountry} />
          </div>
        </div>
      </div>

      <div className="mb-5">
        <SectionLabel>{t('route.from')}</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={t('route.country')}>
            <CountrySelect value={data.fromCountry} onChange={v => setData(d => ({ ...d, fromCountry: v }))} />
          </Field>
          <Field label={t('route.cityPort')}>
            <CitySelect country={data.fromCountry} value={data.fromCity} onChange={v => setData(d => ({ ...d, fromCity: v }))} />
          </Field>
        </div>
      </div>

      <div className="mb-5">
        <SectionLabel>{t('route.to')}</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label={t('route.country')}>
            <CountrySelect value={data.toCountry} onChange={v => setData(d => ({ ...d, toCountry: v }))} />
          </Field>
          <Field label={t('route.cityPort')}>
            <CitySelect country={data.toCountry} value={data.toCity} onChange={v => setData(d => ({ ...d, toCity: v }))} />
          </Field>
        </div>
      </div>

      <Field label={t('route.loadDate')}>
        <input type="date" className={`${cls.input} cursor-pointer`} value={data.loadDate} onClick={openDatePicker} onChange={e => setData(d => ({ ...d, loadDate: e.target.value }))} />
      </Field>

      <NextButton onClick={onNext} disabled={!canNext} />
    </div>
  )
}

// ── Step 2: Towar ──────────────────────────────────────────────────────────────

// ── Sekcje warunkowe gałęzi transportu ─────────────────────────────────────────
// Wydzielone z Step2, bo przy pięciu gałęziach ciało kroku „Towar" przestałoby
// się dać czytać. Każda operuje wyłącznie na swoim slajsie migawki.

function BranchSection({ title, hint, children }) {
  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1">{title}</p>
      {hint ? <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">{hint}</p> : <div className="mb-4" />}
      {children}
    </div>
  )
}

function CheckboxRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <input
        type="checkbox"
        className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 dark:bg-slate-700 text-emerald-600 focus:ring-emerald-400"
        checked={!!checked}
        onChange={e => onChange(e.target.checked)}
      />
      <span className="text-sm text-gray-700 dark:text-slate-300">{label}</span>
    </label>
  )
}

function RailSection({ rail, setRail }) {
  const { t } = useTranslation('wizard')
  const wagons = rail.wagonNumbers || []

  const setWagon = (i, value) =>
    setRail(r => ({ ...r, wagonNumbers: (r.wagonNumbers || []).map((w, idx) => (idx === i ? value : w)) }))
  const addWagon = () => setRail(r => ({ ...r, wagonNumbers: [...(r.wagonNumbers || []), ''] }))
  const removeWagon = (i) =>
    setRail(r => ({ ...r, wagonNumbers: (r.wagonNumbers || []).filter((_, idx) => idx !== i) }))

  return (
    <BranchSection title={t('cargo.rail.title')} hint={t('cargo.rail.hint')}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Field label={t('cargo.rail.stationFrom')}>
          <input className={cls.input} value={rail.stationFrom} onChange={e => setRail(r => ({ ...r, stationFrom: e.target.value }))} />
        </Field>
        <Field label={t('cargo.rail.stationTo')}>
          <input className={cls.input} value={rail.stationTo} onChange={e => setRail(r => ({ ...r, stationTo: e.target.value }))} />
        </Field>
      </div>

      <div className="mb-4">
        <CheckboxRow
          label={t('cargo.rail.groupConsignment')}
          checked={rail.groupConsignment}
          onChange={v => setRail(r => ({ ...r, groupConsignment: v }))}
        />
      </div>

      <p className="block text-sm text-gray-700 dark:text-slate-300 mb-2">{t('cargo.rail.wagonNumbers')}</p>
      {wagons.length === 0 && (
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-2">{t('cargo.rail.noWagons')}</p>
      )}
      <div className="space-y-2 mb-3">
        {wagons.map((wagon, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={cls.input}
              value={wagon}
              placeholder={t('cargo.rail.wagonPlaceholder')}
              onChange={e => setWagon(i, e.target.value)}
            />
            <button
              type="button"
              onClick={() => removeWagon(i)}
              aria-label={t('cargo.rail.removeWagon')}
              className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addWagon}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg px-3 py-2 transition-colors"
      >
        <Plus className="w-4 h-4" />
        {t('cargo.rail.addWagon')}
      </button>
    </BranchSection>
  )
}

function AirSection({ air, setAir }) {
  const { t } = useTranslation('wizard')
  return (
    <BranchSection title={t('cargo.air.title')} hint={t('cargo.air.hint')}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Field label={t('cargo.air.airportFrom')}>
          <input
            className={cls.input}
            value={air.airportFrom}
            maxLength={3}
            placeholder={t('cargo.air.iataPlaceholder')}
            onChange={e => setAir(a => ({ ...a, airportFrom: e.target.value.toUpperCase() }))}
          />
        </Field>
        <Field label={t('cargo.air.airportTo')}>
          <input
            className={cls.input}
            value={air.airportTo}
            maxLength={3}
            placeholder={t('cargo.air.iataPlaceholder')}
            onChange={e => setAir(a => ({ ...a, airportTo: e.target.value.toUpperCase() }))}
          />
        </Field>
      </div>

      <div className="mb-4">
        <Field label={t('cargo.air.chargeableWeight')}>
          <input
            type="number"
            className={cls.input}
            value={air.chargeableWeightKg}
            onChange={e => setAir(a => ({ ...a, chargeableWeightKg: e.target.value }))}
          />
        </Field>
      </div>

      <div className="space-y-3">
        <CheckboxRow
          label={t('cargo.air.consolidated')}
          checked={air.consolidated}
          onChange={v => setAir(a => ({ ...a, consolidated: v }))}
        />
        <CheckboxRow
          label={t('cargo.air.knownConsignor')}
          checked={air.knownConsignor}
          onChange={v => setAir(a => ({ ...a, knownConsignor: v }))}
        />
      </div>
    </BranchSection>
  )
}

// Etapy trasy multimodalnej. Kolejność w tablicy jest znacząca: zasila
// data.carrierLegs.{preCarriage,mainCarriage,onCarriage} w szablonie MTD
// (odwzorowanie opisane w services/documentGeneration.js).
function MultimodalSection({ multimodal, setMultimodal }) {
  const { t } = useTranslation('wizard')
  const legs = multimodal.legs || []
  // Wiąże blokadę „Dalej" z wyborem z Kroku 1 („Osobne umowy na odcinki") —
  // bez tego user widziałby wyłącznie wyszarzony przycisk, nie skąd wymóg.
  // Znika, jak tylko choć jedna gałąź ma wybrany `mode` (ta sama reguła co
  // validateCargo w flowSteps.js).
  const needsLegMode = multimodal.contractType === 'separate' && !legs.some(l => l.mode)

  const updateLeg = (i, patch) =>
    setMultimodal(m => ({
      ...m,
      legs: (m.legs || []).map((leg, idx) => (idx === i ? { ...leg, ...patch } : leg)),
    }))
  const addLeg = () =>
    setMultimodal(m => ({ ...m, legs: [...(m.legs || []), initMultimodalLeg((m.legs || []).length + 1)] }))
  const removeLeg = (i) =>
    setMultimodal(m => ({
      ...m,
      legs: (m.legs || []).filter((_, idx) => idx !== i).map((leg, idx) => ({ ...leg, order: idx + 1 })),
    }))

  return (
    <BranchSection title={t('cargo.multimodal.title')} hint={t('cargo.multimodal.hint')}>
      {needsLegMode && (
        <div className="mb-4">
          <AlertBox type="warning">{t('cargo.multimodal.needsLegMode')}</AlertBox>
        </div>
      )}
      <div className="space-y-4 mb-3">
        {legs.map((leg, i) => (
          <div key={i} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                {t('cargo.multimodal.leg', { order: leg.order ?? i + 1 })}
              </p>
              {legs.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeLeg(i)}
                  aria-label={t('cargo.multimodal.removeLeg')}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <Field label={t('cargo.multimodal.mode')}>
                <select className={cls.input} value={leg.mode} onChange={e => updateLeg(i, { mode: e.target.value })}>
                  <option value="">{t('cargo.multimodal.chooseMode')}</option>
                  {['road', 'sea', 'rail', 'air'].map(m => (
                    <option key={m} value={m}>{t(`route.modes.${m}.label`)}</option>
                  ))}
                </select>
              </Field>
              <Field label={t('cargo.multimodal.carrier')}>
                <input className={cls.input} value={leg.carrier} onChange={e => updateLeg(i, { carrier: e.target.value })} />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label={t('cargo.multimodal.from')}>
                <input className={cls.input} value={leg.from} onChange={e => updateLeg(i, { from: e.target.value })} />
              </Field>
              <Field label={t('cargo.multimodal.to')}>
                <input className={cls.input} value={leg.to} onChange={e => updateLeg(i, { to: e.target.value })} />
              </Field>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={addLeg}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg px-3 py-2 transition-colors"
      >
        <Plus className="w-4 h-4" />
        {t('cargo.multimodal.addLeg')}
      </button>
    </BranchSection>
  )
}

function Step2({ data, setData, road, setRoad, sea, setSea, rail, setRail, air, setAir, multimodal, setMultimodal, terms, setTerms, transport, fromCountry, toCountry, isAdmin, findMode, onNext, onBack, canNext }) {
  const { t } = useTranslation('wizard')
  const { t: ti } = useTranslation('incoterms')
  const { t: tc } = useTranslation('cargo')
  const needsTemp = road.vehicleType === 'Chłodnia' || road.vehicleType === 'Mroźnia'
  const selectedIncoterm = INCOTERM_CODES.includes(terms.incoterms) ? terms.incoterms : null

  return (
    <div>
      <BackButton onClick={onBack} />
      <SectionLabel>{t('cargo.sectionTitle')}</SectionLabel>

      {/* Kategoria → podkategoria → dopiero potem nazwa i kod HS. Kolejność ma
          znaczenie: wybór podkategorii podpowiada oba pola poniżej, więc muszą być
          wypełniane PO wyborze towaru (inaczej ręczny wpis wyglądał na nadpisany). */}
      <div className="mb-4">
        <CargoCategoryPicker
          categoryId={data.cargoCategory}
          subcategoryId={data.cargoSubcategory}
          onChange={({ categoryId, subcategoryId, subcategory }) =>
            setData(d => {
              // Podpowiedź odpala się przy FAKTYCZNEJ zmianie podkategorii (inne id
              // niż poprzednio) — ponowne kliknięcie tej samej podkategorii nie
              // nadpisuje pól. Ale przy realnej zmianie nadpisuje ZAWSZE, nawet gdy
              // pola nie są puste: ręczna wartość opisywała POPRZEDNI towar i po
              // zmianie na inny przestaje być prawdziwa — trzymanie jej byłoby
              // gorsze niż nadpisanie. Nazwa idzie przez ten sam klucz i18n co
              // dropdown (SubcategorySelect.nameOf), żeby auto-fill szedł w
              // aktualnym języku UI, nie w polskim z danych źródłowych.
              const changed = subcategoryId !== d.cargoSubcategory
              return {
                ...d,
                cargoCategory: categoryId,
                cargoSubcategory: subcategoryId,
                hsCode: subcategory && changed ? subcategory.hsCode : d.hsCode,
                cargoName: subcategory && changed
                  ? tc(`subcategories.${subcategory.id}`, { defaultValue: subcategory.name })
                  : d.cargoName,
              }
            })
          }
        />
      </div>

      {/* Wyszukiwarka kodu celnego AI — uzupełnienie dropdownu podkategorii, gdy user
          nie znajduje towaru na liście. Wstawia kod do pola „Kod celny" po „Użyj".
          WIDOCZNA TYLKO DLA ADMINA (funkcja w fazie testów, koszt API). */}
      {isAdmin && (
        <div className="mb-4">
          <HsCodeFinder
            fromCountry={fromCountry}
            toCountry={toCountry}
            onUseCode={code => setData(d => ({ ...d, hsCode: code }))}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Field label={t('cargo.name')}>
          <input className={cls.input} value={data.cargoName} onChange={e => setData(d => ({ ...d, cargoName: e.target.value }))} />
        </Field>
        <Field label={t('cargo.hsCode')}>
          <input className={cls.input} value={data.hsCode} onChange={e => setData(d => ({ ...d, hsCode: e.target.value }))} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <Field label={t('cargo.grossWeight')}>
          <input type="number" className={cls.input} value={data.weight} onChange={e => setData(d => ({ ...d, weight: e.target.value }))} />
        </Field>
        <Field label={t('cargo.netWeight')}>
          <input type="number" className={cls.input} value={data.weightNet} onChange={e => setData(d => ({ ...d, weightNet: e.target.value }))} />
        </Field>
        <Field label={t('cargo.volume')}>
          <input type="number" className={cls.input} value={data.volume} onChange={e => setData(d => ({ ...d, volume: e.target.value }))} />
        </Field>
      </div>

      <div className="mb-4">
        <CargoUnitField
          packageType={data.packageType}
          packages={data.packages}
          onChange={({ packageType, packages }) => setData(d => ({ ...d, packageType, packages }))}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Field label={t('cargo.value')}>
          <input type="number" className={cls.input} value={data.value} onChange={e => setData(d => ({ ...d, value: e.target.value }))} />
        </Field>
        <Field label={t('cargo.currency')}>
          <select className={cls.input} value={data.currency} onChange={e => setData(d => ({ ...d, currency: e.target.value }))}>
            <option value="">-</option>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <div className="mb-6">
        <Field label={t('cargo.notes')}>
          <textarea
            className={`${cls.input} resize-none`}
            rows={3}
            value={data.notes}
            onChange={e => setData(d => ({ ...d, notes: e.target.value }))}
          />
        </Field>
      </div>

      {/* ── Warunki przewozu (oba typy; nieznane przy szukaniu transportu) ── */}
      {!findMode && (
        <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-4">{t('cargo.terms.title')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label={t('cargo.terms.freightPrice')}>
              <input type="number" className={cls.input} value={terms.freightPrice} onChange={e => setTerms(t => ({ ...t, freightPrice: e.target.value }))} />
            </Field>
            <Field label={t('cargo.terms.freightCurrency')}>
              <select className={cls.input} value={terms.freightCurrency} onChange={e => setTerms(t => ({ ...t, freightCurrency: e.target.value }))}>
                <option value="">-</option>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label={t('cargo.terms.paymentDays')}>
              <input type="number" className={cls.input} value={terms.paymentDays} onChange={e => setTerms(t => ({ ...t, paymentDays: e.target.value }))} />
            </Field>
          </div>
        </div>
      )}

      {/* ── Sekcja: Transport Drogowy ────────────────────────────── */}
      {transport === 'road' && (
        <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-4">{t('cargo.road.title')}</p>

          <div className="mb-4">
            <p className="block text-sm text-gray-700 dark:text-slate-300 mb-2">{t('cargo.road.vehicleType')}</p>
            <div className="flex flex-wrap gap-2">
              {VEHICLE_TYPES.map(vt => (
                <button
                  key={vt}
                  type="button"
                  onClick={() => setRoad(r => ({ ...r, vehicleType: r.vehicleType === vt ? '' : vt }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                    ${road.vehicleType === vt
                      ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'}`}
                >
                  {t(`cargo.road.types.${vt}`)}
                </button>
              ))}
            </div>
          </div>

          {needsTemp && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field label={t('cargo.road.tempFrom')}>
                <input type="number" className={cls.input} value={road.tempFrom} onChange={e => setRoad(r => ({ ...r, tempFrom: e.target.value }))} />
              </Field>
              <Field label={t('cargo.road.tempTo')}>
                <input type="number" className={cls.input} value={road.tempTo} onChange={e => setRoad(r => ({ ...r, tempTo: e.target.value }))} />
              </Field>
            </div>
          )}

          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 dark:border-slate-600 dark:bg-slate-700 text-emerald-600 focus:ring-emerald-400"
                checked={road.adr}
                onChange={e => setRoad(r => ({ ...r, adr: e.target.checked, adrClass: e.target.checked ? r.adrClass : '' }))}
              />
              <span className="text-sm text-gray-700 dark:text-slate-300">{t('cargo.road.adr')}</span>
            </label>
          </div>

          {road.adr && (
            <div className="mb-4">
              <Field label={t('cargo.road.adrClass')}>
                <input className={cls.input} value={road.adrClass} onChange={e => setRoad(r => ({ ...r, adrClass: e.target.value }))} />
              </Field>
            </div>
          )}

          <Field label={t('cargo.road.vehicleReg')}>
            <input className={cls.input} value={road.vehicleReg} onChange={e => setRoad(r => ({ ...r, vehicleReg: e.target.value }))} />
          </Field>
        </div>
      )}

      {/* ── Sekcja: Transport Morski (szczegóły nieznane przy szukaniu transportu) ── */}
      {!findMode && transport === 'sea' && (
        <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-4">{t('cargo.sea.title')}</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">{t('cargo.sea.hint')}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Field label={t('cargo.sea.containerType')}>
              <select className={cls.input} value={sea.containerType} onChange={e => setSea(s => ({ ...s, containerType: e.target.value }))}>
                {CONTAINER_TYPES.map(ct => <option key={ct} value={ct}>{ct || t('cargo.sea.choose')}</option>)}
              </select>
            </Field>
            <Field label={t('cargo.sea.containerNo')}>
              <input className={cls.input} value={sea.containerNo} onChange={e => setSea(s => ({ ...s, containerNo: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Field label={t('cargo.sea.sealNo')}>
              <input className={cls.input} value={sea.sealNo} onChange={e => setSea(s => ({ ...s, sealNo: e.target.value }))} />
            </Field>
            <Field label={t('cargo.sea.marksNos')}>
              <input className={cls.input} value={sea.marksNos} onChange={e => setSea(s => ({ ...s, marksNos: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Field label={t('cargo.sea.vessel')}>
              <input className={cls.input} value={sea.vessel} onChange={e => setSea(s => ({ ...s, vessel: e.target.value }))} />
            </Field>
            <Field label={t('cargo.sea.voyageNo')}>
              <input className={cls.input} value={sea.voyageNo} onChange={e => setSea(s => ({ ...s, voyageNo: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Field label={t('cargo.sea.bookingNo')}>
              <input className={cls.input} value={sea.bookingNo} onChange={e => setSea(s => ({ ...s, bookingNo: e.target.value }))} />
            </Field>
            <Field label={t('cargo.sea.flag')}>
              <input className={cls.input} value={sea.flag} onChange={e => setSea(s => ({ ...s, flag: e.target.value }))} />
            </Field>
          </div>

          <div className="mb-4">
            <Field label={t('cargo.sea.eta')}>
              <input type="date" className={`${cls.input} cursor-pointer`} value={sea.eta} onClick={openDatePicker} onChange={e => setSea(s => ({ ...s, eta: e.target.value }))} />
            </Field>
          </div>

          <div>
            <p className="block text-sm text-gray-700 dark:text-slate-300 mb-2">{t('cargo.sea.freightTerms')}</p>
            <div className="flex gap-3">
              {['Prepaid', 'Collect'].map(ft => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setSea(s => ({ ...s, freightTerms: ft }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                    ${sea.freightTerms === ft
                      ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                      : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'}`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Sekcja: Transport Kolejowy ───────────────────────────── */}
      {transport === 'rail' && (
        <RailSection rail={rail} setRail={setRail} />
      )}

      {/* ── Sekcja: Transport Lotniczy ───────────────────────────── */}
      {transport === 'air' && (
        <AirSection air={air} setAir={setAir} />
      )}

      {/* ── Sekcja: Etapy przewozu multimodalnego ────────────────── */}
      {transport === 'multimodal' && (
        <MultimodalSection multimodal={multimodal} setMultimodal={setMultimodal} />
      )}

      {/* ── Incoterms — na końcu, wymaga już pełnego obrazu przesyłki ───── */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1">{t('cargo.incoterms.title')}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">{t('cargo.incoterms.hint')}</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {INCOTERM_CODES.map(code => {
            const active = terms.incoterms === code
            return (
              <button
                key={code}
                type="button"
                onClick={() => setTerms(prev => ({ ...prev, incoterms: prev.incoterms === code ? '' : code }))}
                className={`px-3 py-2.5 rounded-lg text-sm font-semibold border transition-colors
                  ${active ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'}`}
              >
                {code}
              </button>
            )
          })}
        </div>
        {selectedIncoterm && (
          <div className="mt-3 flex items-start gap-2 px-3.5 py-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-lg">
            <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-0.5">{selectedIncoterm}: {ti(`rules.${selectedIncoterm}.name`)}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">{ti(`rules.${selectedIncoterm}.shortDesc`)}</p>
            </div>
          </div>
        )}
      </div>

      <NextButton onClick={onNext} disabled={!canNext} />
    </div>
  )
}

// ── Step 3: Strony ─────────────────────────────────────────────────────────────

function PartySection({ title, subtitle, data, onChange, showBank = false }) {
  const { t } = useTranslation('wizard')
  const upd = (key, val) => onChange({ ...data, [key]: val })
  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <Field label={t('parties.companyName')}>
          <input className={cls.input} value={data.name} onChange={e => upd('name', e.target.value)} />
        </Field>
        <Field label={t('parties.vat')}>
          <input className={cls.input} value={data.vat} onChange={e => upd('vat', e.target.value)} />
        </Field>
      </div>
      <div className="mb-3">
        <Field label={t('parties.address')}>
          <input
            className={cls.input}
            value={data.address}
            onChange={e => upd('address', e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label={t('parties.contactPerson')}>
          <input className={cls.input} value={data.contact} onChange={e => upd('contact', e.target.value)} />
        </Field>
        <Field label={t('parties.phone')}>
          <input className={cls.input} value={data.phone} onChange={e => upd('phone', e.target.value)} />
        </Field>
      </div>
      {showBank && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">{t('parties.bankDetails')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <Field label={t('parties.iban')}>
              <input className={cls.input} value={data.iban} onChange={e => upd('iban', e.target.value)} />
            </Field>
            <Field label={t('parties.swift')}>
              <input className={cls.input} value={data.swift} onChange={e => upd('swift', e.target.value)} />
            </Field>
          </div>
          <Field label={t('parties.bankName')}>
            <input className={cls.input} value={data.bank} onChange={e => upd('bank', e.target.value)} />
          </Field>
        </div>
      )}
    </div>
  )
}

// Składa dane profilu firmy w kształt sekcji „Nadawca" (jeden wiersz adresu).
// Uzupełniamy CZĘŚCIOWO — puste pola profilu po prostu nie trafiają do patcha,
// więc nie kasują tego, co user zdążył wpisać ręcznie.
function profileToSenderPatch(user) {
  const line2 = [user.postalCode, user.city].filter(Boolean).join(' ')
  const address = [user.address, line2, user.country].filter(Boolean).join(', ')
  const patch = {}
  if (user.companyName) patch.name = user.companyName
  if (user.vatNumber) patch.vat = user.vatNumber
  if (address) patch.address = address
  return patch
}

// Pola profilu, które potrafimy przenieść do sekcji „Nadawca".
// Wystarczy JEDNO wypełnione (np. sama nazwa firmy), żeby auto-uzupełnianie działało —
// nie wymagamy kompletnego profilu (`profileCompleted`), bo ten jest `true` dopiero
// przy pełnym adresie i blokował podpowiadanie częściowych danych.
const SENDER_SOURCE_FIELDS = ['companyName', 'vatNumber', 'address', 'city', 'postalCode', 'country']

function hasCompanyDataToFill(user) {
  return SENDER_SOURCE_FIELDS.some((f) => String(user?.[f] ?? '').trim() !== '')
}

function isSenderEmpty(sender) {
  return !['name', 'vat', 'address', 'contact', 'phone'].some(k => (sender[k] || '').trim())
}

function Step3({ data, setData, findMode, mode, user, onNext, onBack, canNext }) {
  const { t } = useTranslation('wizard')
  const profileReady = hasCompanyDataToFill(user)
  const [autofilled, setAutofilled] = useState(false)

  // Auto-fill „Nadawca" z profilu — TYLKO świeży kreator (create), gdy w profilu jest
  // cokolwiek do wstawienia (choćby sama nazwa firmy) i sekcja Nadawca jest całkowicie
  // pusta. NIGDY w resume/edit (nie nadpisujemy migawki).
  useEffect(() => {
    if (mode !== 'create' || !profileReady || !isSenderEmpty(data.sender)) return
    setData(d => ({ ...d, sender: { ...d.sender, ...profileToSenderPatch(user) } }))
    setAutofilled(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function fillFromProfile() {
    setData(d => ({ ...d, sender: { ...d.sender, ...profileToSenderPatch(user) } }))
  }

  return (
    <div>
      <BackButton onClick={onBack} />

      {profileReady && (
        <button
          type="button"
          onClick={fillFromProfile}
          className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-lg px-3 py-2 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 4v16m8-8H4" />
          </svg>
          {t('parties.fillFromProfile')}
        </button>
      )}
      {!profileReady && user && (
        <p className="mb-3 text-xs text-gray-400 dark:text-slate-500">
          {t('parties.fillFasterPrefix')}{' '}
          <Link to="/profile?tab=firma" className="text-emerald-600 hover:underline">
            {t('parties.fillFasterLink')}
          </Link>
          .
        </p>
      )}

      <PartySection
        title={t('parties.sender')}
        data={data.sender}
        onChange={s => setData(d => ({ ...d, sender: s }))}
        showBank
      />
      {autofilled && (
        <p className="-mt-2 mb-4 text-xs text-gray-400 dark:text-slate-500">
          {t('parties.autofilled')}
          {user?.profileCompleted !== true && (
            <>
              {' '}
              <Link to="/profile?tab=firma" className="text-emerald-600 hover:underline">
                {t('parties.autofilledCompleteLink')}
              </Link>
              {t('parties.autofilledCompleteSuffix')}
            </>
          )}
        </p>
      )}
      <PartySection
        title={t('parties.receiver')}
        data={data.receiver}
        onChange={r => setData(d => ({ ...d, receiver: r }))}
      />
      {/* Przewoźnik nieznany, dopóki użytkownik szuka transportu (ścieżka B). */}
      {!findMode && (
        <PartySection
          title={t('parties.carrier')}
          subtitle={t('parties.carrierSubtitle')}
          data={data.carrier}
          onChange={c => setData(d => ({ ...d, carrier: c }))}
        />
      )}
      <NextButton onClick={onNext} disabled={!canNext} />
    </div>
  )
}

// ── Krok Spedytorzy (placeholder) — ścieżka B ───────────────────────────────────
// Freightos nie zwraca listy spedytorów, więc ten krok zostaje pusty (poza zakresem
// wyceny frachtu). Zero pól i zero zapisu do formData.

function ForwardersStep({ onNext, onBack }) {
  const { t } = useTranslation('wizard')
  return (
    <div>
      <BackButton onClick={onBack} />
      <SectionLabel>{t('forwarders.title')}</SectionLabel>
      <p className="text-sm text-gray-400 dark:text-slate-400">{t('forwarders.comingSoon')}</p>
      <NextButton onClick={onNext} />
    </div>
  )
}

// Wyłącznie informacyjny: nic nie zapisuje do snapshotu (route czytany tylko do
// odczytu portu/trybu transportu). Fracht morski (lub multimodalny) — automatyczne
// wyszukanie stawek Freightos przy wejściu w krok, gdy oba miasta z Kroku 1 dają
// się rozpoznać jako port. Fracht drogowy — Freightos go nie obejmuje, informacja +
// link do „Trasy handlowe". „Dalej" zawsze aktywne, niezależnie od wyniku.
function QuoteStep({ route, onNext, onBack }) {
  const { t } = useTranslation('wizard')
  const { loading, result, searched, search } = useFreightRates()
  const isSea = route.transport === 'sea' || route.multimodal

  const originCode = isSea ? findSeaPortCode(route.fromCity, route.fromCountry) : null
  const destCode = isSea ? findSeaPortCode(route.toCity, route.toCountry) : null
  const portsResolved = !!(originCode && destCode)

  useEffect(() => {
    if (portsResolved) {
      search({ origin: originCode, destination: destCode, loadtype: 'container20', weight: 15000, quantity: 1 })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div>
      <BackButton onClick={onBack} />
      <SectionLabel>{t('quote.title')}</SectionLabel>

      {isSea ? (
        portsResolved ? (
          <div className="mb-6">
            <FreightRates
              result={result}
              loading={loading}
              searched={searched}
              routeLabel={`${route.fromCity} - ${route.toCity}`}
              cargoLabel={t('quote.cargoLabel')}
              compact
            />
          </div>
        ) : (
          <div className="mb-6">
            <AlertBox type="warning">{t('quote.portNotRecognised')}</AlertBox>
          </div>
        )
      ) : (
        <div className="mb-6">
          <AlertBox type="info">{t('quote.roadSoon')}</AlertBox>
        </div>
      )}

      <NextButton onClick={onNext} />
    </div>
  )
}

// ── Step 4: Dokumenty ──────────────────────────────────────────────────────────

// Jedna funkcja formatująca wartości karty podsumowania: puste pole pokazuje
// „Nie podano" (jasnoszary) zamiast myślnika. Używana we wszystkich komórkach.
function formatSummaryValue(v, notProvidedLabel) {
  if (v == null || String(v).trim() === '' || String(v).trim() === '-') {
    return <span className="text-gray-300 dark:text-slate-600">{notProvidedLabel}</span>
  }
  return v
}

// Ostrzeżenia silnika doboru — do tej pory widoczne wyłącznie w „Pustych
// szablonach". Po unifikacji kreator liczy ten sam wynik, więc pokazuje je też
// tutaj. Kolejność: najpierw krytyczne (sankcje, licencje przed wysyłką).
const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 }
const SEVERITY_BOX = { critical: 'error', warning: 'warning', info: 'info' }

function EngineWarnings({ warnings }) {
  const { t } = useTranslation('wizard')
  const { i18n } = useTranslation()
  if (!warnings || warnings.length === 0) return null

  const sorted = [...warnings].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 1) - (SEVERITY_ORDER[b.severity] ?? 1)
  )
  const worst = sorted[0]?.severity || 'warning'

  return (
    <div className="mb-6">
      <AlertBox type={SEVERITY_BOX[worst] || 'warning'} title={t('docs.warningsTitle')}>
        <ul className="list-disc pl-4 space-y-1 mt-1">
          {sorted.map((w, i) => (
            <li key={w.code || i}>{translateEngineWarning(w, i18n.language)}</li>
          ))}
        </ul>
      </AlertBox>
    </div>
  )
}

function Step4({ onBack }) {
  const { t } = useTranslation('wizard')
  const { t: tc } = useTranslation('common')
  const { t: tCountry } = useTranslation('countries')
  const wiz = useWizard()
  const { snapshot, mode, originalEngineResult, flow } = wiz
  const { user } = useAuth()

  const docsList = useMemo(() => getDocsForSnapshot(snapshot), [snapshot])
  const engineWarnings = useMemo(() => getEngineResultForSnapshot(snapshot).warnings, [snapshot])
  const bothEU = computeBothEU(snapshot.route)
  const fromCountry = COUNTRIES.find(c => c.code === snapshot.route.fromCountry)
  const toCountry = COUNTRIES.find(c => c.code === snapshot.route.toCountry)

  const [statuses, setStatuses] = useState(() =>
    Object.fromEntries(docsList.map(d => [d.key, 'idle']))
  )
  // ETAP 4 — checkbox dokumentu wymaganego jest odznaczalny; required tylko
  // steruje domyślnym zaznaczeniem i badge'em, nie blokuje interakcji.
  const [selected, setSelected] = useState(() =>
    new Set(docsList.filter(d => d.required).map(d => d.key))
  )
  const [saveError, setSaveError] = useState(null)
  const [savedSetId, setSavedSetId] = useState(null)

  // Zapis do historii NATYCHMIAST przy wejściu na ten krok — nie dopiero po
  // kliknięciu „Pobierz". Komplet zapisujemy z domyślnym zaznaczeniem (wymagane),
  // a każde kolejne „Pobierz" aktualizuje TEN SAM rekord realnie pobranym kompletem
  // (recordGenerated). W trybie edit pomijamy TYLKO pierwsze wejście bez zmian
  // (edit startuje już na tym kroku — auto-zapis od razu utworzyłby zbędną kopię,
  // mimo że user niczego jeszcze nie zmienił). Gdy user wróci do wcześniejszego
  // kroku, coś zmieni (isDirty=true) i przejdzie do „Dokumenty" ponownie — Step4
  // montuje się na nowo (render wg klucza kroku), efekt odpala się od nowa i
  // auto-zapisuje jako nowy wpis w historii (a kolejne przejścia aktualizują TEN
  // SAM rekord, bo activeRecordIdRef w WizardProvider przeżywa całą sesję).
  const autoSavedRef = useRef(false)
  useEffect(() => {
    if (autoSavedRef.current) return
    if (mode === 'edit' && !wiz.isDirty) return
    autoSavedRef.current = true
    wiz.recordGenerated(Array.from(selected))
      .then((saved) => setSavedSetId(saved.id))
      .catch((err) => setSaveError(err.message || t('docs.saveFailed')))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isAnyLoading = Object.values(statuses).some(s => s === 'loading')
  const doneCount = Object.values(statuses).filter(s => s === 'done').length
  const selectedDocs = docsList.filter(d => selected.has(d.key))

  // ETAP 5 — w trybie edit sygnalizujemy, że dobór dokumentów zmienił się względem
  // oryginału (engine liczony NA NOWO z aktualnego formData, nie z zapisanego).
  //
  // ALIAS ID: `originalEngineResult` pochodzi z bazy i przy zestawach sprzed
  // unifikacji ma stare klucze rejestru kreatora ('cmr'), a `docsList` liczy się
  // na nowo i ma identyfikatory katalogu ('01_CMR'). Bez przemapowania KAŻDA
  // edycja starego zestawu pokazywałaby fałszywy alarm „dobór się zmienił".
  const docsChanged = useMemo(() => {
    if (mode !== 'edit' || !originalEngineResult?.docs) return false
    const sig = (arr) =>
      arr.map(d => `${toCatalogId(d.key)}:${d.required ? 1 : 0}`).sort().join(',')
    return sig(docsList) !== sig(originalEngineResult.docs)
  }, [mode, originalEngineResult, docsList])

  // „Kompletne" = wszystkie kroki poza „Dokumenty" przechodzą walidację ścieżki
  // (ta sama reguła co przyciski „Dalej"/StepBar — nie wymyślamy nowej walidacji).
  const isComplete = flow.steps.filter(s => s.key !== 'docs').every(s => s.validate(snapshot))

  const routeReady = !!(fromCountry && toCountry)
  const TransportIcon = TRANSPORT_ICONS[snapshot.route.transport] || Truck
  const weightVal = snapshot.cargo.weight ? `${snapshot.cargo.weight} kg` : ''
  const valueVal = snapshot.cargo.value ? `${snapshot.cargo.value} ${snapshot.cargo.currency}` : ''

  const summary = [
    {
      label: t('docs.fields.transportType'),
      value: t(`docs.values.${snapshot.route.transport}`, { defaultValue: snapshot.route.transport }),
      icon: <TransportIcon className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" strokeWidth={1.75} />,
    },
    {
      label: t('docs.fields.route'),
      value: routeReady
        ? `${tCountry(fromCountry.code, { defaultValue: fromCountry.name })} → ${tCountry(toCountry.code, { defaultValue: toCountry.name })}`
        : '',
      icon: routeReady ? <ArrowRight className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" strokeWidth={1.75} /> : null,
    },
    { label: t('docs.fields.cargo'), value: snapshot.cargo.cargoName || '' },
    {
      label: t('docs.fields.customs'),
      value: routeReady ? (bothEU ? t('docs.values.customsNo') : t('docs.values.customsYes')) : '',
      icon: routeReady
        ? bothEU
          ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={1.75} />
          : <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={1.75} />
        : null,
      tone: routeReady ? (bothEU ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-400') : undefined,
    },
    // Waga i Wartość: jedna komórka gdy oba puste, w przeciwnym razie dwie osobne.
    ...(!weightVal && !valueVal
      ? [{ label: t('docs.fields.weightValue'), value: '' }]
      : [{ label: t('docs.fields.weight'), value: weightVal }, { label: t('docs.fields.value'), value: valueVal }]),
    { label: t('docs.fields.incoterms'), value: snapshot.terms.incoterms || '' },
    { label: t('docs.fields.sender'), value: snapshot.parties.sender.name || '' },
    { label: t('docs.fields.receiver'), value: snapshot.parties.receiver.name || '' },
    ...(snapshot.parties.carrier.name
      ? [{ label: t('docs.fields.carrier'), value: snapshot.parties.carrier.name }]
      : []),
  ]

  function toggleDoc(key) {
    setSelected(s => {
      const next = new Set(s)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  // Zapis do historii następuje TU, dopiero po udanym wygenerowaniu PDF-ów:
  // recordGenerated tworzy/aktualizuje rekord 'completed' z realnie wybranym
  // kompletem. Kreator nie zapisuje nic automatycznie wcześniej.
  async function handleGenerate() {
    setSaveError(null)
    const keys = selectedDocs.map(d => d.key)
    const { failed } = await generateDocuments(snapshot, keys, (k, st) =>
      setStatuses(s => ({ ...s, [k]: st })), user?.preferredLanguage
    )
    if (failed.length > 0) return

    let saved
    try {
      saved = await wiz.recordGenerated(keys)
    } catch (err) {
      setSaveError(err.message || t('docs.saveFailed'))
      return
    }

    wiz.allowNextNavigation()
    wiz.markSaved()
    setSavedSetId(saved.id)
  }

  const generateLabel = mode === 'edit' ? t('docs.downloadAsNew') : t('docs.downloadSelected')
  const selectListDocs = docsList.map(d => ({
    id: d.key,
    namePl: d.name,
    description: d.desc,
    required: d.required,
    section: d.section,
    outputMode: d.outputMode,
    authority: d.authority,
  }))
  const selectionError = selectedDocs.length === 0
    ? t('docs.selectAtLeastOne')
    : null

  return (
    <div>
      <BackButton onClick={onBack} />

      {docsChanged && (
        <div className="mb-4">
          <AlertBox type="warning" title={t('docs.docsChangedTitle')}>
            {t('docs.docsChangedBody')}
          </AlertBox>
        </div>
      )}

      {saveError && (
        <div className="mb-4">
          <AlertBox type="error" title={t('docs.saveErrorTitle')}>{saveError}</AlertBox>
        </div>
      )}

      {savedSetId && (
        <div className="mb-4">
          <AlertBox type="success" title={t('docs.savedTitle')}>
            {t('docs.savedBody')}{' '}
            <Link to="/history" className="font-medium underline">{t('docs.savedLink')}</Link>.
          </AlertBox>
        </div>
      )}

      <div className="border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden mb-6 bg-white dark:bg-slate-800">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-100 dark:border-slate-700">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">{t('docs.summary')}</p>
          {isComplete ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-full px-2.5 py-1">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
              {t('docs.complete')}
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 rounded-full px-2.5 py-1">
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
              {t('docs.incomplete')}
            </span>
          )}
        </div>
        {/* gap-px na szarym tle rysuje cienkie separatory między wierszami i kolumnami;
            krawędzie karty zamyka border — ostatni wiersz nie ma dolnej linii. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100 dark:bg-slate-700">
          {summary.map((cell, i) => {
            const spanFull = summary.length % 2 === 1 && i === summary.length - 1
            return (
              <div key={cell.label} className={`bg-white dark:bg-slate-800 px-5 py-3 ${spanFull ? 'md:col-span-2' : ''}`}>
                <p className="text-xs text-gray-400 dark:text-slate-500 mb-0.5">{cell.label}</p>
                <div className={`flex items-center gap-1.5 text-sm font-medium ${cell.tone || 'text-gray-900 dark:text-slate-100'}`}>
                  {cell.icon}
                  <span className="min-w-0">{formatSummaryValue(cell.value, tc('states.notProvided'))}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Link
        to="/insurance"
        className="flex items-center gap-4 p-5 mb-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/30 dark:to-teal-900/30 hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors group"
      >
        <div className="shrink-0 w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-emerald-600" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">{t('docs.insuranceTitle')}</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">{t('docs.insuranceBody')}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>

      <EngineWarnings warnings={engineWarnings} />

      <div className="flex items-center justify-between mb-3">
        <SectionLabel>{t('docs.documents')}</SectionLabel>
        {doneCount > 0 && (
          <span className="text-xs text-green-600 font-medium">
            {t('docs.generatedCount', { done: doneCount, total: selectedDocs.length })}
          </span>
        )}
      </div>

      <DocumentSelectList
        documents={selectListDocs}
        selectedIds={selected}
        onToggle={toggleDoc}
        actionLabel={generateLabel}
        onAction={handleGenerate}
        disabled={isAnyLoading}
        errorMessage={selectionError}
        statusFor={(id) => statuses[id]}
        actionLoading={isAnyLoading}
        loadingLabel={t('docs.downloading')}
      />
    </div>
  )
}

// ── Root component ─────────────────────────────────────────────────────────────
// Stan trzyma WizardProvider (WizardContext). Ten komponent tylko mapuje kontekst
// na istniejące Stepy i renderuje właściwy krok wg definicji ścieżki (flowSteps).

export default function DocumentWizard() {
  const { t } = useTranslation('wizard')
  const wiz = useWizard()
  const { user } = useAuth()
  const { snapshot, currentStep, maxStepReached, flow, mode, next, prev, goToStep } = wiz

  const setRoute      = (u) => wiz.setStepData('route', u)
  const setCargo      = (u) => wiz.setStepData('cargo', u)
  const setParties    = (u) => wiz.setStepData('parties', u)
  const setRoad       = (u) => wiz.setStepData('road', u)
  const setSea        = (u) => wiz.setStepData('sea', u)
  const setRail       = (u) => wiz.setStepData('rail', u)
  const setAir        = (u) => wiz.setStepData('air', u)
  const setMultimodal = (u) => wiz.setStepData('multimodal', u)
  const setTerms      = (u) => wiz.setStepData('terms', u)

  // ── Przełączenie gałęzi transportu ──────────────────────────────────────────
  // Slajs poprzedniej gałęzi jest czyszczony, żeby w migawce audytowej nie został
  // np. numer kontenera przy przesyłce, która ostatecznie jedzie koleją. Gdy user
  // zdążył coś w nim wpisać, najpierw pytamy — ciche skasowanie danych byłoby
  // najgorszym możliwym zachowaniem.
  const [pendingTransport, setPendingTransport] = useState(null)

  function applyTransportChange(nextMode) {
    const current = snapshot.route.transport
    const resetSlice = SLICE_INITIALIZERS[current]
    if (resetSlice && current !== nextMode) wiz.setStepData(current, resetSlice())
    setRoute(r => ({
      ...r,
      transport: nextMode,
      // Bez osobnego checkboxa flaga multimodal jest 1:1 pochodną karty
      // transportu — silnik doboru dokumentów widzi ją stąd.
      multimodal: nextMode === 'multimodal',
    }))
    setPendingTransport(null)
  }

  function requestTransportChange(nextMode) {
    const current = snapshot.route.transport
    if (nextMode === current) return
    if (hasBranchData(current, snapshot[current])) {
      setPendingTransport(nextMode)
      return
    }
    applyTransportChange(nextMode)
  }

  const canNext = wiz.validateStep(currentStep)
  const stepLabels = flow.steps.map(s => t(s.labelKey))
  // Render sterowany rejestrem flow (klucz kroku), nie numerem — dzięki temu ta
  // sama sekwencja obsługuje 4 kroki ścieżki A i 6 kroków ścieżki B.
  const stepKey = flow.steps[currentStep - 1]?.key
  // Ścieżka B („Szukam transportu"): użytkownik nie zna jeszcze warunków przewozu,
  // szczegółów kontenera/rejsu ani przewoźnika — te sekcje chowamy.
  const findMode = flow.flowType === 'find_transport'

  useEffect(() => { preloadHtml2Pdf() }, [])

  // Po przejściu na kolejny/poprzedni krok — przewiń do góry najbliższego
  // scrollowalnego przodka (w AppShell to <main class="overflow-y-auto">),
  // żeby nie zostawać w miejscu przewinięcia z poprzedniego, dłuższego kroku.
  const wrapperRef = useRef(null)
  useEffect(() => {
    const scrollParent = wrapperRef.current?.closest('.overflow-y-auto')
    if (scrollParent) scrollParent.scrollTop = 0
    else window.scrollTo(0, 0)
  }, [currentStep])

  return (
    <div ref={wrapperRef}>
      <StepBar steps={stepLabels} current={currentStep} maxReached={maxStepReached} onStepClick={goToStep} />
      <StepTransition stepKey={currentStep}>
        {stepKey === 'route' && (
          <Step1
            data={snapshot.route}
            setData={setRoute}
            multimodal={snapshot.multimodal}
            setMultimodal={setMultimodal}
            onTransportChange={requestTransportChange}
            onNext={next}
            canNext={canNext}
          />
        )}
        {stepKey === 'cargo' && (
          <Step2
            data={snapshot.cargo} setData={setCargo}
            road={snapshot.road} setRoad={setRoad}
            sea={snapshot.sea} setSea={setSea}
            rail={snapshot.rail} setRail={setRail}
            air={snapshot.air} setAir={setAir}
            multimodal={snapshot.multimodal} setMultimodal={setMultimodal}
            terms={snapshot.terms} setTerms={setTerms}
            transport={snapshot.route.transport}
            fromCountry={snapshot.route.fromCountry}
            toCountry={snapshot.route.toCountry}
            isAdmin={!!user?.isAdmin}
            findMode={findMode}
            onNext={next} onBack={prev} canNext={canNext}
          />
        )}
        {stepKey === 'parties' && (
          <Step3 data={snapshot.parties} setData={setParties} findMode={findMode} mode={mode} user={user} onNext={next} onBack={prev} canNext={canNext} />
        )}
        {stepKey === 'forwarders' && <ForwardersStep onNext={next} onBack={prev} />}
        {stepKey === 'quote' && <QuoteStep route={snapshot.route} onNext={next} onBack={prev} />}
        {stepKey === 'docs' && <Step4 onBack={prev} />}
      </StepTransition>

      <ConfirmDialog
        open={!!pendingTransport}
        title={t('route.switchTitle')}
        description={
          pendingTransport
            ? t('route.switchBody', {
                from: t(`route.modes.${snapshot.route.transport}.label`),
                to: t(`route.modes.${pendingTransport}.label`),
              })
            : ''
        }
        confirmLabel={t('route.switchConfirm')}
        destructive
        onConfirm={() => applyTransportChange(pendingTransport)}
        onCancel={() => setPendingTransport(null)}
      />
    </div>
  )
}
