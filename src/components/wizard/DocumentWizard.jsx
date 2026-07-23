import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Info, ShieldCheck, ArrowRight, Truck, Ship, CheckCircle2, AlertTriangle } from 'lucide-react'
import { COUNTRIES } from '../../data/mockData'
import CountrySelect from '../ui/CountrySelect'
import CitySelect from '../ui/CitySelect'
import AlertBox from '../ui/AlertBox'
import { preloadHtml2Pdf } from '../../generators/generatePdf'
import { useAuth } from '../../auth/AuthContext'
import { useWizard } from './WizardContext'
import {
  getDocsForSnapshot,
  computeBothEU,
  generateDocuments,
} from '../../services/documentGeneration'
import DocumentSelectList from '../documents/DocumentSelectList'
import CargoCategoryPicker from '../cargo/CargoCategoryPicker'
import HsCodeFinder from '../cargo/HsCodeFinder'
import StepTransition from '../StepTransition'

const CURRENCIES = ['EUR', 'PLN', 'USD', 'GBP', 'CHF']
const CONTAINER_TYPES = ['', '20ft', '40ft', '40ft HC', 'LCL']
const VEHICLE_TYPES = ['Plandeka', 'Chłodnia', 'Mroźnia']

const INCOTERMS = [
  { code: 'EXW', label: 'Ex Works', desc: 'Sprzedający udostępnia towar w swoim zakładzie, kupujący organizuje cały transport i ponosi ryzyko od tego momentu.' },
  { code: 'FCA', label: 'Free Carrier', desc: 'Sprzedający dostarcza towar do przewoźnika wskazanego przez kupującego, ryzyko przechodzi po załadunku.' },
  { code: 'FAS', label: 'Free Alongside Ship', desc: 'Sprzedający dostarcza towar wzdłuż burty statku w porcie załadunku. Tylko transport morski.' },
  { code: 'FOB', label: 'Free On Board', desc: 'Sprzedający dostarcza towar na pokład statku, ryzyko przechodzi po przejściu burty statku. Tylko transport morski.' },
  { code: 'CFR', label: 'Cost and Freight', desc: 'Sprzedający opłaca fracht do portu przeznaczenia, ryzyko przechodzi już po załadunku na statek. Tylko transport morski.' },
  { code: 'CIF', label: 'Cost, Insurance and Freight', desc: 'Jak CFR, dodatkowo sprzedający opłaca ubezpieczenie towaru. Tylko transport morski.' },
  { code: 'CPT', label: 'Carriage Paid To', desc: 'Sprzedający opłaca przewóz do miejsca przeznaczenia, ryzyko przechodzi po przekazaniu towaru pierwszemu przewoźnikowi.' },
  { code: 'CIP', label: 'Carriage and Insurance Paid To', desc: 'Jak CPT, dodatkowo sprzedający opłaca ubezpieczenie towaru na czas całego transportu.' },
  { code: 'DAP', label: 'Delivered At Place', desc: 'Sprzedający dostarcza towar gotowy do rozładunku w uzgodnionym miejscu przeznaczenia.' },
  { code: 'DPU', label: 'Delivered at Place Unloaded', desc: 'Jak DAP, ale sprzedający odpowiada również za rozładunek towaru w miejscu przeznaczenia.' },
  { code: 'DDP', label: 'Delivered Duty Paid', desc: 'Sprzedający dostarcza towar odprawiony celnie, z opłaconym cłem i podatkami, gotowy do rozładunku.' },
]

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
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-slate-300 font-medium border border-gray-200 dark:border-slate-700 rounded-lg px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors mb-6"
    >
      ← Wróć
    </button>
  )
}

function NextButton({ onClick, disabled, label = 'Dalej →' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-100 dark:disabled:bg-slate-700 disabled:text-gray-400 dark:disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
    >
      {label}
    </button>
  )
}

// ── Step 1: Trasa ──────────────────────────────────────────────────────────────

function Step1({ data, setData, onNext, canNext }) {
  return (
    <div>
      <SectionLabel>Typ transportu</SectionLabel>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {[
          {
            id: 'road',
            label: 'Drogowy',
            sub: 'TIR, ciężarówka',
            svg: (active) => (
              <svg className={`w-7 h-7 ${active ? 'text-emerald-500' : 'text-gray-400 dark:text-slate-500'}`} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3h1.4a2 2 0 0 1 1.7.9l1.7 2.6a2 2 0 0 1 .3 1V17h-2" />
                <circle cx="7.5" cy="17.5" r="2.5" />
                <circle cx="17.5" cy="17.5" r="2.5" />
              </svg>
            ),
          },
          {
            id: 'sea',
            label: 'Morski',
            sub: 'Kontener FCL/LCL',
            svg: (active) => (
              <svg className={`w-7 h-7 ${active ? 'text-emerald-500' : 'text-gray-400 dark:text-slate-500'}`} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M2 21c.6.5 1.2 1 2.5 1C7 22 7 20 9.5 20c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
                <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.2.5 4.3 1.62 6" />
                <path d="M12 10V2" />
                <path d="M12 2H9" />
              </svg>
            ),
          },
        ].map(({ id, label, sub, svg }) => {
          const active = data.transport === id
          return (
            <button
              key={id}
              onClick={() => setData(d => ({ ...d, transport: id }))}
              className={`flex items-center gap-3 p-4 border-2 rounded-xl text-left transition-all
                ${active ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-gray-300 dark:hover:border-slate-600'}`}
            >
              {svg(active)}
              <div>
                <p className={`text-sm font-semibold ${active ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-800 dark:text-slate-200'}`}>{label}</p>
                <p className={`text-xs mt-0.5 ${active ? 'text-emerald-400' : 'text-gray-400 dark:text-slate-500'}`}>{sub}</p>
              </div>
            </button>
          )
        })}
      </div>

      <label className="flex items-start gap-3 p-3.5 mb-5 border border-gray-200 dark:border-slate-700 rounded-xl cursor-pointer bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors">
        <input
          type="checkbox"
          className="mt-0.5 w-4 h-4 accent-emerald-600 cursor-pointer flex-shrink-0"
          checked={!!data.multimodal}
          onChange={e => setData(d => ({ ...d, multimodal: e.target.checked }))}
        />
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-slate-200">Transport multimodalny</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Towar jedzie kilkoma środkami transportu (np. ciężarówka + statek). Generuje dodatkowy dokument MTD.</p>
        </div>
      </label>

      <div className="mb-5">
        <SectionLabel>Skąd</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Kraj">
            <CountrySelect value={data.fromCountry} onChange={v => setData(d => ({ ...d, fromCountry: v }))} />
          </Field>
          <Field label="Miasto / port">
            <CitySelect country={data.fromCountry} value={data.fromCity} onChange={v => setData(d => ({ ...d, fromCity: v }))} />
          </Field>
        </div>
      </div>

      <div className="mb-5">
        <SectionLabel>Dokąd</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Kraj">
            <CountrySelect value={data.toCountry} onChange={v => setData(d => ({ ...d, toCountry: v }))} />
          </Field>
          <Field label="Miasto / port">
            <CitySelect country={data.toCountry} value={data.toCity} onChange={v => setData(d => ({ ...d, toCity: v }))} />
          </Field>
        </div>
      </div>

      <Field label="Data załadunku">
        <input type="date" className={`${cls.input} cursor-pointer`} value={data.loadDate} onClick={openDatePicker} onChange={e => setData(d => ({ ...d, loadDate: e.target.value }))} />
      </Field>

      <NextButton onClick={onNext} disabled={!canNext} />
    </div>
  )
}

// ── Step 2: Towar ──────────────────────────────────────────────────────────────

function Step2({ data, setData, road, setRoad, sea, setSea, terms, setTerms, transport, fromCountry, toCountry, isAdmin, findMode, onNext, onBack, canNext }) {
  const needsTemp = road.vehicleType === 'Chłodnia' || road.vehicleType === 'Mroźnia'
  const selectedIncoterm = INCOTERMS.find(it => it.code === terms.incoterms)

  return (
    <div>
      <BackButton onClick={onBack} />
      <SectionLabel>Opis towaru</SectionLabel>

      {/* Kategoria → podkategoria → dopiero potem nazwa i kod HS. Kolejność ma
          znaczenie: wybór podkategorii podpowiada oba pola poniżej, więc muszą być
          wypełniane PO wyborze towaru (inaczej ręczny wpis wyglądał na nadpisany). */}
      <div className="mb-4">
        <CargoCategoryPicker
          categoryId={data.cargoCategory}
          subcategoryId={data.cargoSubcategory}
          onChange={({ categoryId, subcategoryId, subcategory }) =>
            setData(d => ({
              ...d,
              cargoCategory: categoryId,
              cargoSubcategory: subcategoryId,
              // Podpowiedź wchodzi tylko w puste pola — tego, co user wpisał
              // ręcznie, nie ruszamy.
              hsCode: subcategory && !d.hsCode.trim() ? subcategory.hsCode : d.hsCode,
              cargoName: subcategory && !d.cargoName.trim() ? subcategory.name : d.cargoName,
            }))
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
        <Field label="Nazwa towaru">
          <input className={cls.input} value={data.cargoName} onChange={e => setData(d => ({ ...d, cargoName: e.target.value }))} />
        </Field>
        <Field label="Kod celny (HS/CN)">
          <input className={cls.input} value={data.hsCode} onChange={e => setData(d => ({ ...d, hsCode: e.target.value }))} />
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Field label="Waga brutto (kg)">
          <input type="number" className={cls.input} value={data.weight} onChange={e => setData(d => ({ ...d, weight: e.target.value }))} />
        </Field>
        <Field label="Waga netto (kg)">
          <input type="number" className={cls.input} value={data.weightNet} onChange={e => setData(d => ({ ...d, weightNet: e.target.value }))} />
        </Field>
        <Field label="Objętość (m³)">
          <input type="number" className={cls.input} value={data.volume} onChange={e => setData(d => ({ ...d, volume: e.target.value }))} />
        </Field>
        <Field label="Liczba paczek">
          <input type="number" className={cls.input} value={data.packages} onChange={e => setData(d => ({ ...d, packages: e.target.value }))} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Field label="Wartość towaru">
          <input type="number" className={cls.input} value={data.value} onChange={e => setData(d => ({ ...d, value: e.target.value }))} />
        </Field>
        <Field label="Waluta">
          <select className={cls.input} value={data.currency} onChange={e => setData(d => ({ ...d, currency: e.target.value }))}>
            <option value="">-</option>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <div className="mb-6">
        <Field label="Uwagi / instrukcje">
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
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-4">Warunki przewozu</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Koszt frachtu">
              <input type="number" className={cls.input} value={terms.freightPrice} onChange={e => setTerms(t => ({ ...t, freightPrice: e.target.value }))} />
            </Field>
            <Field label="Waluta frachtu">
              <select className={cls.input} value={terms.freightCurrency} onChange={e => setTerms(t => ({ ...t, freightCurrency: e.target.value }))}>
                <option value="">-</option>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Termin płatności (dni)">
              <input type="number" className={cls.input} value={terms.paymentDays} onChange={e => setTerms(t => ({ ...t, paymentDays: e.target.value }))} />
            </Field>
          </div>
        </div>
      )}

      {/* ── Sekcja: Transport Drogowy ────────────────────────────── */}
      {transport === 'road' && (
        <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-4">Pojazd i warunki drogowe</p>

          <div className="mb-4">
            <p className="block text-sm text-gray-700 dark:text-slate-300 mb-2">Typ pojazdu</p>
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
                  {vt}
                </button>
              ))}
            </div>
          </div>

          {needsTemp && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field label="Temperatura od (°C)">
                <input type="number" className={cls.input} value={road.tempFrom} onChange={e => setRoad(r => ({ ...r, tempFrom: e.target.value }))} />
              </Field>
              <Field label="Temperatura do (°C)">
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
              <span className="text-sm text-gray-700 dark:text-slate-300">ADR (towary niebezpieczne)</span>
            </label>
          </div>

          {road.adr && (
            <div className="mb-4">
              <Field label="Klasa ADR / Numer UN">
                <input className={cls.input} value={road.adrClass} onChange={e => setRoad(r => ({ ...r, adrClass: e.target.value }))} />
              </Field>
            </div>
          )}

          <Field label="Nr rejestracyjny pojazdu (opcjonalne)">
            <input className={cls.input} value={road.vehicleReg} onChange={e => setRoad(r => ({ ...r, vehicleReg: e.target.value }))} />
          </Field>
        </div>
      )}

      {/* ── Sekcja: Transport Morski (szczegóły nieznane przy szukaniu transportu) ── */}
      {!findMode && transport === 'sea' && (
        <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-4">Szczegóły kontenera i rejsu</p>
          <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Pola opcjonalne, dane nadawane przez armatora. Możesz uzupełnić je później.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Field label="Typ kontenera">
              <select className={cls.input} value={sea.containerType} onChange={e => setSea(s => ({ ...s, containerType: e.target.value }))}>
                {CONTAINER_TYPES.map(ct => <option key={ct} value={ct}>{ct || 'wybierz'}</option>)}
              </select>
            </Field>
            <Field label="Numer kontenera (Container No.)">
              <input className={cls.input} value={sea.containerNo} onChange={e => setSea(s => ({ ...s, containerNo: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Field label="Numer plomby (Seal No.)">
              <input className={cls.input} value={sea.sealNo} onChange={e => setSea(s => ({ ...s, sealNo: e.target.value }))} />
            </Field>
            <Field label="Znaki i numery (Marks & Nos)">
              <input className={cls.input} value={sea.marksNos} onChange={e => setSea(s => ({ ...s, marksNos: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Field label="Statek (Vessel)">
              <input className={cls.input} value={sea.vessel} onChange={e => setSea(s => ({ ...s, vessel: e.target.value }))} />
            </Field>
            <Field label="Nr rejsu (Voyage No.)">
              <input className={cls.input} value={sea.voyageNo} onChange={e => setSea(s => ({ ...s, voyageNo: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Field label="Numer rezerwacji (Booking No.)">
              <input className={cls.input} value={sea.bookingNo} onChange={e => setSea(s => ({ ...s, bookingNo: e.target.value }))} />
            </Field>
            <Field label="Bandera (Flag)">
              <input className={cls.input} value={sea.flag} onChange={e => setSea(s => ({ ...s, flag: e.target.value }))} />
            </Field>
          </div>

          <div className="mb-4">
            <Field label="ETA (planowana data przybycia)">
              <input type="date" className={`${cls.input} cursor-pointer`} value={sea.eta} onClick={openDatePicker} onChange={e => setSea(s => ({ ...s, eta: e.target.value }))} />
            </Field>
          </div>

          <div>
            <p className="block text-sm text-gray-700 dark:text-slate-300 mb-2">Warunki frachtu</p>
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

      {/* ── Incoterms — na końcu, wymaga już pełnego obrazu przesyłki ───── */}
      <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1">Incoterms</p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">Reguła handlowa określająca podział kosztów i ryzyka między nadawcą a odbiorcą</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {INCOTERMS.map(it => {
            const active = terms.incoterms === it.code
            return (
              <button
                key={it.code}
                type="button"
                onClick={() => setTerms(t => ({ ...t, incoterms: t.incoterms === it.code ? '' : it.code }))}
                className={`px-3 py-2.5 rounded-lg text-sm font-semibold border transition-colors
                  ${active ? 'border-emerald-500 dark:border-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'}`}
              >
                {it.code}
              </button>
            )
          })}
        </div>
        {selectedIncoterm && (
          <div className="mt-3 flex items-start gap-2 px-3.5 py-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-lg">
            <Info className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-0.5">{selectedIncoterm.code}: {selectedIncoterm.label}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">{selectedIncoterm.desc}</p>
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
  const upd = (key, val) => onChange({ ...data, [key]: val })
  return (
    <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-5 mb-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <Field label="Nazwa firmy">
          <input className={cls.input} value={data.name} onChange={e => upd('name', e.target.value)} />
        </Field>
        <Field label="NIP / VAT lub Tax ID">
          <input className={cls.input} value={data.vat} onChange={e => upd('vat', e.target.value)} />
        </Field>
      </div>
      <div className="mb-3">
        <Field label="Adres">
          <input
            className={cls.input}
            value={data.address}
            onChange={e => upd('address', e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Osoba kontaktowa">
          <input className={cls.input} value={data.contact} onChange={e => upd('contact', e.target.value)} />
        </Field>
        <Field label="Telefon">
          <input className={cls.input} value={data.phone} onChange={e => upd('phone', e.target.value)} />
        </Field>
      </div>
      {showBank && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-slate-500 mb-3">Dane bankowe</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <Field label="IBAN">
              <input className={cls.input} value={data.iban} onChange={e => upd('iban', e.target.value)} />
            </Field>
            <Field label="BIC / SWIFT">
              <input className={cls.input} value={data.swift} onChange={e => upd('swift', e.target.value)} />
            </Field>
          </div>
          <Field label="Nazwa banku">
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
          Wstaw moje dane firmy
        </button>
      )}
      {!profileReady && user && (
        <p className="mb-3 text-xs text-gray-400 dark:text-slate-500">
          Wypełniaj to szybciej:{' '}
          <Link to="/profile?tab=firma" className="text-emerald-600 hover:underline">
            uzupełnij dane firmy w profilu
          </Link>
          .
        </p>
      )}

      <PartySection
        title="Nadawca"
        data={data.sender}
        onChange={s => setData(d => ({ ...d, sender: s }))}
        showBank
      />
      {autofilled && (
        <p className="-mt-2 mb-4 text-xs text-gray-400 dark:text-slate-500">
          Wypełnione danymi z Twojego profilu. Możesz je zmienić.
          {user?.profileCompleted !== true && (
            <>
              {' '}
              <Link to="/profile?tab=firma" className="text-emerald-600 hover:underline">
                Uzupełnij resztę danych firmy
              </Link>
              , żeby następnym razem wstawiły się w całości.
            </>
          )}
        </p>
      )}
      <PartySection
        title="Odbiorca"
        data={data.receiver}
        onChange={r => setData(d => ({ ...d, receiver: r }))}
      />
      {/* Przewoźnik nieznany, dopóki użytkownik szuka transportu (ścieżka B). */}
      {!findMode && (
        <PartySection
          title="Przewoźnik"
          subtitle="Wymagane. Pojawia się w CMR, Zleceniu Transportowym i POD"
          data={data.carrier}
          onChange={c => setData(d => ({ ...d, carrier: c }))}
        />
      )}
      <NextButton onClick={onNext} disabled={!canNext} />
    </div>
  )
}

// ── Kroki ścieżki B (placeholder) — Spedytorzy / Wycena ─────────────────────────
// Zawartość dojdzie w osobnym zakresie. Na razie tylko nagłówek + informacja i
// nawigacja (Dalej zawsze aktywny). Zero pól i zero zapisu do formData.

function ForwardersStep({ onNext, onBack }) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <SectionLabel>Spedytorzy</SectionLabel>
      <p className="text-sm text-gray-400 dark:text-slate-400">Ten krok będzie dostępny wkrótce.</p>
      <NextButton onClick={onNext} />
    </div>
  )
}

function QuoteStep({ onNext, onBack }) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <SectionLabel>Wycena</SectionLabel>
      <p className="text-sm text-gray-400 dark:text-slate-400">Ten krok będzie dostępny wkrótce.</p>
      <NextButton onClick={onNext} />
    </div>
  )
}

// ── Step 4: Dokumenty ──────────────────────────────────────────────────────────

// Jedna funkcja formatująca wartości karty podsumowania: puste pole pokazuje
// „Nie podano" (jasnoszary) zamiast myślnika. Używana we wszystkich komórkach.
function formatSummaryValue(v) {
  if (v == null || String(v).trim() === '' || String(v).trim() === '-') {
    return <span className="text-gray-300 dark:text-slate-600">Nie podano</span>
  }
  return v
}

function Step4({ onBack }) {
  const wiz = useWizard()
  const { snapshot, mode, originalEngineResult, flow } = wiz

  const docsList = useMemo(() => getDocsForSnapshot(snapshot), [snapshot])
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
      .catch((err) => setSaveError(err.message || 'Nie udało się zapisać zestawu w historii.'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isAnyLoading = Object.values(statuses).some(s => s === 'loading')
  const doneCount = Object.values(statuses).filter(s => s === 'done').length
  const selectedDocs = docsList.filter(d => selected.has(d.key))

  // ETAP 5 — w trybie edit sygnalizujemy, że dobór dokumentów zmienił się względem
  // oryginału (engine liczony NA NOWO z aktualnego formData, nie z zapisanego).
  const docsChanged = useMemo(() => {
    if (mode !== 'edit' || !originalEngineResult?.docs) return false
    const sig = (arr) => arr.map(d => `${d.key}:${d.required ? 1 : 0}`).sort().join(',')
    return sig(docsList) !== sig(originalEngineResult.docs)
  }, [mode, originalEngineResult, docsList])

  // „Kompletne" = wszystkie kroki poza „Dokumenty" przechodzą walidację ścieżki
  // (ta sama reguła co przyciski „Dalej"/StepBar — nie wymyślamy nowej walidacji).
  const isComplete = flow.steps.filter(s => s.key !== 'docs').every(s => s.validate(snapshot))

  const routeReady = !!(fromCountry && toCountry)
  const TransportIcon = snapshot.route.transport === 'road' ? Truck : Ship
  const weightVal = snapshot.cargo.weight ? `${snapshot.cargo.weight} kg` : ''
  const valueVal = snapshot.cargo.value ? `${snapshot.cargo.value} ${snapshot.cargo.currency}` : ''

  const summary = [
    {
      label: 'Typ transportu',
      value: snapshot.route.transport === 'road' ? 'Drogowy (TIR)' : 'Morski (Kontener)',
      icon: <TransportIcon className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" strokeWidth={1.75} />,
    },
    {
      label: 'Trasa',
      value: routeReady ? `${fromCountry.name} → ${toCountry.name}` : '',
      icon: routeReady ? <ArrowRight className="w-4 h-4 text-gray-400 dark:text-slate-500 shrink-0" strokeWidth={1.75} /> : null,
    },
    { label: 'Towar', value: snapshot.cargo.cargoName || '' },
    {
      label: 'Odprawa celna',
      value: routeReady ? (bothEU ? 'Nie (ruch wewnątrz UE)' : 'Tak') : '',
      icon: routeReady
        ? bothEU
          ? <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" strokeWidth={1.75} />
          : <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" strokeWidth={1.75} />
        : null,
      tone: routeReady ? (bothEU ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-400') : undefined,
    },
    // Waga i Wartość: jedna komórka gdy oba puste, w przeciwnym razie dwie osobne.
    ...(!weightVal && !valueVal
      ? [{ label: 'Waga / Wartość', value: '' }]
      : [{ label: 'Waga', value: weightVal }, { label: 'Wartość', value: valueVal }]),
    { label: 'Incoterms', value: snapshot.terms.incoterms || '' },
    { label: 'Nadawca', value: snapshot.parties.sender.name || '' },
    { label: 'Odbiorca', value: snapshot.parties.receiver.name || '' },
    ...(snapshot.parties.carrier.name
      ? [{ label: 'Przewoźnik', value: snapshot.parties.carrier.name }]
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
      setStatuses(s => ({ ...s, [k]: st }))
    )
    if (failed.length > 0) return

    let saved
    try {
      saved = await wiz.recordGenerated(keys)
    } catch (err) {
      setSaveError(err.message || 'Nie udało się zapisać zestawu w historii.')
      return
    }

    wiz.allowNextNavigation()
    wiz.markSaved()
    setSavedSetId(saved.id)
  }

  const generateLabel = mode === 'edit' ? 'Pobierz jako nowy dokument' : 'Pobierz wybrane dokumenty'
  const selectListDocs = docsList.map(d => ({
    id: d.key,
    namePl: d.name,
    description: d.desc,
    required: d.required,
  }))
  const selectionError = selectedDocs.length === 0
    ? 'Zaznacz co najmniej jeden dokument, aby pobrać pliki.'
    : null

  return (
    <div>
      <BackButton onClick={onBack} />

      {docsChanged && (
        <div className="mb-4">
          <AlertBox type="warning" title="Zmienił się zestaw dokumentów">
            Po Twoich zmianach lista wymaganych/opcjonalnych dokumentów różni się od pierwotnej.
            Sprawdź zaznaczenia przed wygenerowaniem.
          </AlertBox>
        </div>
      )}

      {saveError && (
        <div className="mb-4">
          <AlertBox type="error" title="Nie udało się zapisać">{saveError}</AlertBox>
        </div>
      )}

      {savedSetId && (
        <div className="mb-4">
          <AlertBox type="success" title="Zapisano w historii">
            Zestaw dokumentów został zapisany.{' '}
            <Link to="/history" className="font-medium underline">Przejdź do historii dokumentów</Link>.
          </AlertBox>
        </div>
      )}

      <div className="border border-gray-200 dark:border-slate-700 rounded-2xl overflow-hidden mb-6 bg-white dark:bg-slate-800">
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-gray-100 dark:border-slate-700">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-slate-500">Podsumowanie zlecenia</p>
          {isComplete ? (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-full px-2.5 py-1">
              <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={2} />
              Kompletne
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 border border-amber-100 dark:border-amber-800 rounded-full px-2.5 py-1">
              <AlertTriangle className="w-3.5 h-3.5" strokeWidth={2} />
              Niekompletne
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
                  <span className="min-w-0">{formatSummaryValue(cell.value)}</span>
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
          <p className="text-sm font-medium text-emerald-900 dark:text-emerald-200">Ubezpiecz swoją przesyłkę</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">Chroń towar na czas transportu przed uszkodzeniem, kradzieżą i zagubieniem.</p>
        </div>
        <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>

      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Dokumenty</SectionLabel>
        {doneCount > 0 && (
          <span className="text-xs text-green-600 font-medium">{doneCount}/{selectedDocs.length} wygenerowano</span>
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
        loadingLabel="Pobieranie..."
      />
    </div>
  )
}

// ── Root component ─────────────────────────────────────────────────────────────
// Stan trzyma WizardProvider (WizardContext). Ten komponent tylko mapuje kontekst
// na istniejące Stepy i renderuje właściwy krok wg definicji ścieżki (flowSteps).

export default function DocumentWizard() {
  const wiz = useWizard()
  const { user } = useAuth()
  const { snapshot, currentStep, maxStepReached, flow, mode, next, prev, goToStep } = wiz

  const setRoute   = (u) => wiz.setStepData('route', u)
  const setCargo   = (u) => wiz.setStepData('cargo', u)
  const setParties = (u) => wiz.setStepData('parties', u)
  const setRoad    = (u) => wiz.setStepData('road', u)
  const setSea     = (u) => wiz.setStepData('sea', u)
  const setTerms   = (u) => wiz.setStepData('terms', u)

  const canNext = wiz.validateStep(currentStep)
  const stepLabels = flow.steps.map(s => s.label)
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
          <Step1 data={snapshot.route} setData={setRoute} onNext={next} canNext={canNext} />
        )}
        {stepKey === 'cargo' && (
          <Step2
            data={snapshot.cargo} setData={setCargo}
            road={snapshot.road} setRoad={setRoad}
            sea={snapshot.sea} setSea={setSea}
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
        {stepKey === 'quote' && <QuoteStep onNext={next} onBack={prev} />}
        {stepKey === 'docs' && <Step4 onBack={prev} />}
      </StepTransition>
    </div>
  )
}
