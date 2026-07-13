import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, UtensilsCrossed, FlaskConical, PawPrint, Boxes, Info, ShieldCheck, ArrowRight } from 'lucide-react'
import { COUNTRIES } from '../../data/mockData'
import CountrySelect from '../ui/CountrySelect'
import CitySelect from '../ui/CitySelect'
import { preloadHtml2Pdf } from '../../generators/generatePdf'
import { getDocsList, generateDocument } from '../../generators/documents'

const STEPS = ['Trasa', 'Towar', 'Strony', 'Dokumenty']
const CURRENCIES = ['EUR', 'PLN', 'USD', 'GBP', 'CHF']
const CONTAINER_TYPES = ['', '20ft', '40ft', '40ft HC', 'LCL']
const VEHICLE_TYPES = ['Plandeka', 'Chłodnia', 'Mroźnia']
const EU_CODES = ['PL','DE','FR','NL','BE','CZ','SK','AT','IT','ES','PT','SE','DK','FI','HU','RO','BG','HR','GR','EE','LV','LT']

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

const INCOTERMS = [
  { code: 'EXW', label: 'Ex Works', desc: 'Sprzedający udostępnia towar w swoim zakładzie — kupujący organizuje cały transport i ponosi ryzyko od tego momentu.' },
  { code: 'FCA', label: 'Free Carrier', desc: 'Sprzedający dostarcza towar do przewoźnika wskazanego przez kupującego — ryzyko przechodzi po załadunku.' },
  { code: 'FAS', label: 'Free Alongside Ship', desc: 'Sprzedający dostarcza towar wzdłuż burty statku w porcie załadunku. Tylko transport morski.' },
  { code: 'FOB', label: 'Free On Board', desc: 'Sprzedający dostarcza towar na pokład statku — ryzyko przechodzi po przejściu burty statku. Tylko transport morski.' },
  { code: 'CFR', label: 'Cost and Freight', desc: 'Sprzedający opłaca fracht do portu przeznaczenia — ryzyko przechodzi już po załadunku na statek. Tylko transport morski.' },
  { code: 'CIF', label: 'Cost, Insurance and Freight', desc: 'Jak CFR, dodatkowo sprzedający opłaca ubezpieczenie towaru. Tylko transport morski.' },
  { code: 'CPT', label: 'Carriage Paid To', desc: 'Sprzedający opłaca przewóz do miejsca przeznaczenia — ryzyko przechodzi po przekazaniu towaru pierwszemu przewoźnikowi.' },
  { code: 'CIP', label: 'Carriage and Insurance Paid To', desc: 'Jak CPT, dodatkowo sprzedający opłaca ubezpieczenie towaru na czas całego transportu.' },
  { code: 'DAP', label: 'Delivered At Place', desc: 'Sprzedający dostarcza towar gotowy do rozładunku w uzgodnionym miejscu przeznaczenia.' },
  { code: 'DPU', label: 'Delivered at Place Unloaded', desc: 'Jak DAP, ale sprzedający odpowiada również za rozładunek towaru w miejscu przeznaczenia.' },
  { code: 'DDP', label: 'Delivered Duty Paid', desc: 'Sprzedający dostarcza towar odprawiony celnie, z opłaconym cłem i podatkami, gotowy do rozładunku.' },
]

const cls = {
  input: 'w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors',
}

function StepBar({ current }) {
  return (
    <div className="grid grid-cols-4 border border-gray-200 rounded-xl overflow-hidden mb-6 bg-white">
      {STEPS.map((name, i) => {
        const num = i + 1
        const done = num < current
        const active = num === current
        return (
          <div
            key={name}
            className={`flex items-center justify-center sm:justify-start gap-2 px-1.5 sm:px-4 py-3${i < STEPS.length - 1 ? ' border-r border-gray-200' : ''}`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
              ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-white border border-gray-300 text-gray-400'}`}>
              {done ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : num}
            </div>
            <span className={`hidden sm:inline text-sm font-medium ${active ? 'text-gray-900' : done ? 'text-gray-700' : 'text-gray-400'}`}>
              {name}
            </span>
          </div>
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

function DocIcon({ type }) {
  if (type === 'list') return (
    <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h10" />
    </svg>
  )
  if (type === 'clipboard') return (
    <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  )
  if (type === 'sign') return (
    <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536M9 11l6-6 3 3-9 9H9v-3z" />
    </svg>
  )
  return (
    <svg className="w-5 h-5 text-blue-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-sm text-gray-600 font-medium border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 transition-colors mb-6"
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
      className="mt-6 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
    >
      {label}
    </button>
  )
}

// ── Step 1: Trasa ──────────────────────────────────────────────────────────────

function Step1({ data, setData, onNext }) {
  const canNext = data.transport && data.fromCountry && data.fromCity && data.toCountry && data.toCity && data.loadDate

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
              <svg className={`w-7 h-7 ${active ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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
              <svg className={`w-7 h-7 ${active ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
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
                ${active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
            >
              {svg(active)}
              <div>
                <p className={`text-sm font-semibold ${active ? 'text-blue-700' : 'text-gray-800'}`}>{label}</p>
                <p className={`text-xs mt-0.5 ${active ? 'text-blue-400' : 'text-gray-400'}`}>{sub}</p>
              </div>
            </button>
          )
        })}
      </div>

      <label className="flex items-start gap-3 p-3.5 mb-5 border border-gray-200 rounded-xl cursor-pointer bg-white hover:bg-gray-50 transition-colors">
        <input
          type="checkbox"
          className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer flex-shrink-0"
          checked={!!data.multimodal}
          onChange={e => setData(d => ({ ...d, multimodal: e.target.checked }))}
        />
        <div>
          <p className="text-sm font-medium text-gray-800">Transport multimodalny</p>
          <p className="text-xs text-gray-400 mt-0.5">Towar jedzie kilkoma środkami transportu (np. ciężarówka + statek). Generuje dodatkowy dokument MTD.</p>
        </div>
      </label>

      <div className="mb-5">
        <SectionLabel>Skąd</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Kraj">
            <CountrySelect value={data.fromCountry} onChange={v => setData(d => ({ ...d, fromCountry: v }))} />
          </Field>
          <Field label="Miasto / port">
            <CitySelect country={data.fromCountry} value={data.fromCity} onChange={v => setData(d => ({ ...d, fromCity: v }))} placeholder="np. Warszawa" />
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
            <CitySelect country={data.toCountry} value={data.toCity} onChange={v => setData(d => ({ ...d, toCity: v }))} placeholder="np. Berlin" />
          </Field>
        </div>
      </div>

      <Field label="Data załadunku">
        <input type="date" className={cls.input} value={data.loadDate} onChange={e => setData(d => ({ ...d, loadDate: e.target.value }))} />
      </Field>

      <NextButton onClick={onNext} disabled={!canNext} />
    </div>
  )
}

// ── Step 2: Towar ──────────────────────────────────────────────────────────────

function Step2({ data, setData, road, setRoad, sea, setSea, terms, setTerms, transport, onNext, onBack }) {
  const needsTemp = road.vehicleType === 'Chłodnia' || road.vehicleType === 'Mroźnia'
  const canNext = !!data.cargoName.trim()
  const selectedCargoType = CARGO_TYPES.find(ct => ct.id === data.cargoType)
  const selectedIncoterm = INCOTERMS.find(it => it.code === terms.incoterms)

  return (
    <div>
      <BackButton onClick={onBack} />
      <SectionLabel>Opis towaru</SectionLabel>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Field label="Nazwa towaru">
          <input className={cls.input} placeholder="np. części elektroniczne" value={data.cargoName} onChange={e => setData(d => ({ ...d, cargoName: e.target.value }))} />
        </Field>
        <Field label="Kod celny (HS/CN)" hint="8-cyfrowy kod CN towaru">
          <input className={cls.input} placeholder="np. 8542.31" value={data.hsCode} onChange={e => setData(d => ({ ...d, hsCode: e.target.value }))} />
        </Field>
      </div>

      <div className="mb-4">
        <p className="block text-sm text-gray-700 mb-2">Rodzaj ładunku</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {CARGO_TYPES.map(ct => {
            const Icon = ct.icon
            const active = data.cargoType === ct.id
            return (
              <button
                key={ct.id}
                type="button"
                onClick={() => setData(d => ({ ...d, cargoType: d.cargoType === ct.id ? '' : ct.id }))}
                className={`flex flex-col items-center gap-1.5 p-3 border-2 rounded-xl text-center transition-all
                  ${active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}`}
              >
                <Icon className={active ? 'w-5 h-5 text-blue-500' : 'w-5 h-5 text-gray-400'} strokeWidth={1.5} />
                <span className={`text-xs font-medium ${active ? 'text-blue-700' : 'text-gray-700'}`}>{ct.label}</span>
              </button>
            )
          })}
        </div>
        {selectedCargoType && (
          <div className="mt-3 flex items-start gap-2 px-3.5 py-3 bg-blue-50 border border-blue-100 rounded-lg">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" strokeWidth={1.5} />
            <p className="text-xs text-blue-700">{selectedCargoType.hint}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        <Field label="Waga brutto (kg)">
          <input type="number" className={cls.input} placeholder="1500" value={data.weight} onChange={e => setData(d => ({ ...d, weight: e.target.value }))} />
        </Field>
        <Field label="Waga netto (kg)">
          <input type="number" className={cls.input} placeholder="1400" value={data.weightNet} onChange={e => setData(d => ({ ...d, weightNet: e.target.value }))} />
        </Field>
        <Field label="Objętość (m³)">
          <input type="number" className={cls.input} placeholder="6.5" value={data.volume} onChange={e => setData(d => ({ ...d, volume: e.target.value }))} />
        </Field>
        <Field label="Liczba paczek">
          <input type="number" className={cls.input} placeholder="24" value={data.packages} onChange={e => setData(d => ({ ...d, packages: e.target.value }))} />
        </Field>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <Field label="Wartość towaru">
          <input type="number" className={cls.input} placeholder="15000" value={data.value} onChange={e => setData(d => ({ ...d, value: e.target.value }))} />
        </Field>
        <Field label="Waluta">
          <select className={cls.input} value={data.currency} onChange={e => setData(d => ({ ...d, currency: e.target.value }))}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <div className="mb-6">
        <Field label="Uwagi / instrukcje">
          <textarea
            className={`${cls.input} resize-none`}
            rows={3}
            placeholder="np. towar kruchy, trzymać w pozycji pionowej"
            value={data.notes}
            onChange={e => setData(d => ({ ...d, notes: e.target.value }))}
          />
        </Field>
      </div>

      {/* ── Warunki przewozu (oba typy) ─────────────────────────── */}
      <div className="border border-gray-200 rounded-xl p-5 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Warunki przewozu</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Koszt frachtu">
            <input type="number" className={cls.input} placeholder="850" value={terms.freightPrice} onChange={e => setTerms(t => ({ ...t, freightPrice: e.target.value }))} />
          </Field>
          <Field label="Waluta frachtu">
            <select className={cls.input} value={terms.freightCurrency} onChange={e => setTerms(t => ({ ...t, freightCurrency: e.target.value }))}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Termin płatności (dni)">
            <input type="number" className={cls.input} placeholder="30" value={terms.paymentDays} onChange={e => setTerms(t => ({ ...t, paymentDays: e.target.value }))} />
          </Field>
        </div>
      </div>

      {/* ── Sekcja: Transport Drogowy ────────────────────────────── */}
      {transport === 'road' && (
        <div className="border border-gray-200 rounded-xl p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Pojazd i warunki drogowe</p>

          <div className="mb-4">
            <p className="block text-sm text-gray-700 mb-2">Typ pojazdu</p>
            <div className="flex flex-wrap gap-2">
              {VEHICLE_TYPES.map(vt => (
                <button
                  key={vt}
                  type="button"
                  onClick={() => setRoad(r => ({ ...r, vehicleType: r.vehicleType === vt ? '' : vt }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                    ${road.vehicleType === vt
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                >
                  {vt}
                </button>
              ))}
            </div>
          </div>

          {needsTemp && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Field label="Temperatura od (°C)">
                <input type="number" className={cls.input} placeholder="-18" value={road.tempFrom} onChange={e => setRoad(r => ({ ...r, tempFrom: e.target.value }))} />
              </Field>
              <Field label="Temperatura do (°C)">
                <input type="number" className={cls.input} placeholder="-15" value={road.tempTo} onChange={e => setRoad(r => ({ ...r, tempTo: e.target.value }))} />
              </Field>
            </div>
          )}

          <div className="mb-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400"
                checked={road.adr}
                onChange={e => setRoad(r => ({ ...r, adr: e.target.checked, adrClass: e.target.checked ? r.adrClass : '' }))}
              />
              <span className="text-sm text-gray-700">ADR — towary niebezpieczne</span>
            </label>
          </div>

          {road.adr && (
            <div className="mb-4">
              <Field label="Klasa ADR / Numer UN">
                <input className={cls.input} placeholder="np. Klasa 3 / UN 1203" value={road.adrClass} onChange={e => setRoad(r => ({ ...r, adrClass: e.target.value }))} />
              </Field>
            </div>
          )}

          <Field label="Nr rejestracyjny pojazdu (opcjonalne)">
            <input className={cls.input} placeholder="np. WA 12345" value={road.vehicleReg} onChange={e => setRoad(r => ({ ...r, vehicleReg: e.target.value }))} />
          </Field>
        </div>
      )}

      {/* ── Sekcja: Transport Morski ─────────────────────────────── */}
      {transport === 'sea' && (
        <div className="border border-gray-200 rounded-xl p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">Szczegóły kontenera i rejsu</p>
          <p className="text-xs text-gray-400 mb-4">Pola opcjonalne — dane nadawane przez armatora. Możesz uzupełnić je później.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Field label="Typ kontenera">
              <select className={cls.input} value={sea.containerType} onChange={e => setSea(s => ({ ...s, containerType: e.target.value }))}>
                {CONTAINER_TYPES.map(ct => <option key={ct} value={ct}>{ct || '— wybierz —'}</option>)}
              </select>
            </Field>
            <Field label="Numer kontenera (Container No.)">
              <input className={cls.input} placeholder="np. MSCU1234567" value={sea.containerNo} onChange={e => setSea(s => ({ ...s, containerNo: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Field label="Numer plomby (Seal No.)">
              <input className={cls.input} placeholder="np. 123456" value={sea.sealNo} onChange={e => setSea(s => ({ ...s, sealNo: e.target.value }))} />
            </Field>
            <Field label="Znaki i numery (Marks & Nos)">
              <input className={cls.input} placeholder="np. ABC/001-024" value={sea.marksNos} onChange={e => setSea(s => ({ ...s, marksNos: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Field label="Statek (Vessel)">
              <input className={cls.input} placeholder="np. MSC ANNA" value={sea.vessel} onChange={e => setSea(s => ({ ...s, vessel: e.target.value }))} />
            </Field>
            <Field label="Nr rejsu (Voyage No.)">
              <input className={cls.input} placeholder="np. 241N" value={sea.voyageNo} onChange={e => setSea(s => ({ ...s, voyageNo: e.target.value }))} />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <Field label="Numer rezerwacji (Booking No.)">
              <input className={cls.input} placeholder="np. MSC-BKG-2024-001" value={sea.bookingNo} onChange={e => setSea(s => ({ ...s, bookingNo: e.target.value }))} />
            </Field>
            <Field label="Bandera (Flag)">
              <input className={cls.input} placeholder="np. Panama" value={sea.flag} onChange={e => setSea(s => ({ ...s, flag: e.target.value }))} />
            </Field>
          </div>

          <div className="mb-4">
            <Field label="ETA — planowana data przybycia">
              <input type="date" className={cls.input} value={sea.eta} onChange={e => setSea(s => ({ ...s, eta: e.target.value }))} />
            </Field>
          </div>

          <div>
            <p className="block text-sm text-gray-700 mb-2">Warunki frachtu</p>
            <div className="flex gap-3">
              {['Prepaid', 'Collect'].map(ft => (
                <button
                  key={ft}
                  type="button"
                  onClick={() => setSea(s => ({ ...s, freightTerms: ft }))}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                    ${sea.freightTerms === ft
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
                >
                  {ft}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Incoterms — na końcu, wymaga już pełnego obrazu przesyłki ───── */}
      <div className="border border-gray-200 rounded-xl p-5 mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Incoterms</p>
        <p className="text-xs text-gray-400 mb-4">Reguła handlowa określająca podział kosztów i ryzyka między nadawcą a odbiorcą</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {INCOTERMS.map(it => {
            const active = terms.incoterms === it.code
            return (
              <button
                key={it.code}
                type="button"
                onClick={() => setTerms(t => ({ ...t, incoterms: t.incoterms === it.code ? '' : it.code }))}
                className={`px-3 py-2.5 rounded-lg text-sm font-semibold border transition-colors
                  ${active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}
              >
                {it.code}
              </button>
            )
          })}
        </div>
        {selectedIncoterm && (
          <div className="mt-3 flex items-start gap-2 px-3.5 py-3 bg-blue-50 border border-blue-100 rounded-lg">
            <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" strokeWidth={1.5} />
            <div>
              <p className="text-xs font-semibold text-blue-700 mb-0.5">{selectedIncoterm.code} — {selectedIncoterm.label}</p>
              <p className="text-xs text-blue-700">{selectedIncoterm.desc}</p>
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
    <div className="border border-gray-200 rounded-xl p-5 mb-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">{title}</p>
      {subtitle && <p className="text-xs text-gray-400 mb-4">{subtitle}</p>}
      {!subtitle && <div className="mb-4" />}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <Field label="Nazwa firmy">
          <input className={cls.input} placeholder="np. ABC Sp. z o.o." value={data.name} onChange={e => upd('name', e.target.value)} />
        </Field>
        <Field label="NIP / VAT lub Tax ID" hint="Krajowy numer identyfikacji podatkowej">
          <input className={cls.input} placeholder="np. PL1234567890" value={data.vat} onChange={e => upd('vat', e.target.value)} />
        </Field>
      </div>
      <div className="mb-3">
        <Field label="Adres">
          <input
            className={cls.input}
            placeholder="ul. Przykładowa 1, 00-001 Warszawa"
            value={data.address}
            onChange={e => upd('address', e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Osoba kontaktowa">
          <input className={cls.input} placeholder="Jan Kowalski" value={data.contact} onChange={e => upd('contact', e.target.value)} />
        </Field>
        <Field label="Telefon">
          <input className={cls.input} placeholder="+48 500 000 000" value={data.phone} onChange={e => upd('phone', e.target.value)} />
        </Field>
      </div>
      {showBank && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">Dane bankowe</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <Field label="IBAN">
              <input className={cls.input} placeholder="PL61 1090 1014 0000 0712 1981 2874" value={data.iban} onChange={e => upd('iban', e.target.value)} />
            </Field>
            <Field label="BIC / SWIFT">
              <input className={cls.input} placeholder="WBKPPLPP" value={data.swift} onChange={e => upd('swift', e.target.value)} />
            </Field>
          </div>
          <Field label="Nazwa banku">
            <input className={cls.input} placeholder="np. Santander Bank Polska" value={data.bank} onChange={e => upd('bank', e.target.value)} />
          </Field>
        </div>
      )}
    </div>
  )
}

function Step3({ data, setData, onNext, onBack }) {
  const canNext = !!(data.sender.name.trim() && data.receiver.name.trim() && data.carrier.name.trim())
  return (
    <div>
      <BackButton onClick={onBack} />
      <PartySection
        title="Nadawca"
        data={data.sender}
        onChange={s => setData(d => ({ ...d, sender: s }))}
        showBank
      />
      <PartySection
        title="Odbiorca"
        data={data.receiver}
        onChange={r => setData(d => ({ ...d, receiver: r }))}
      />
      <PartySection
        title="Przewoźnik"
        subtitle="Wymagane — pojawia się w CMR, Zleceniu Transportowym i POD"
        data={data.carrier}
        onChange={c => setData(d => ({ ...d, carrier: c }))}
      />
      <NextButton onClick={onNext} disabled={!canNext} />
    </div>
  )
}

// ── Step 4: Dokumenty ──────────────────────────────────────────────────────────

function DocStatusBadge({ status }) {
  if (status === 'loading') {
    return (
      <svg className="w-4 h-4 animate-spin text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
    )
  }
  if (status === 'done') {
    return (
      <span className="shrink-0 flex items-center gap-1 text-xs font-medium text-green-600">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        Gotowe
      </span>
    )
  }
  if (status === 'error') {
    return (
      <span className="shrink-0 flex items-center gap-1 text-xs font-medium text-red-600">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
        Błąd
      </span>
    )
  }
  return null
}

function DocCard({ doc, checked, locked, status, onToggle }) {
  return (
    <div
      onClick={locked ? undefined : onToggle}
      className={`flex items-center gap-3 px-4 py-3.5 border rounded-xl transition-colors
        ${checked ? 'border-blue-200 bg-blue-50/50' : 'border-gray-200 bg-white'}
        ${locked ? '' : 'cursor-pointer hover:border-blue-300'}`}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={locked}
        readOnly={locked}
        onChange={locked ? undefined : onToggle}
        onClick={e => e.stopPropagation()}
        className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-400 shrink-0 disabled:opacity-70"
      />
      <DocIcon type={doc.icon} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
          {locked && (
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
              Wymagany
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-0.5">{doc.desc}</p>
      </div>
      <DocStatusBadge status={status} />
    </div>
  )
}

function Step4({ routeData, cargoData, partiesData, roadData, seaData, termsData, onBack }) {
  const fromCountry = COUNTRIES.find(c => c.code === routeData.fromCountry)
  const toCountry = COUNTRIES.find(c => c.code === routeData.toCountry)
  const bothEU = !!(fromCountry && toCountry && EU_CODES.includes(fromCountry.code) && EU_CODES.includes(toCountry.code))
  const docsList = getDocsList(routeData.transport, bothEU, routeData.multimodal)

  const [statuses, setStatuses] = useState(() =>
    Object.fromEntries(docsList.map(d => [d.key, 'idle']))
  )
  const [selected, setSelected] = useState(() =>
    Object.fromEntries(docsList.map(d => [d.key, !!d.required]))
  )

  const isAnyLoading = Object.values(statuses).some(s => s === 'loading')
  const doneCount = Object.values(statuses).filter(s => s === 'done').length
  const selectedDocs = docsList.filter(d => selected[d.key])

  const summary = [
    ['Typ transportu', routeData.transport === 'road' ? 'Drogowy (TIR)' : 'Morski (Kontener)'],
    ['Trasa', fromCountry && toCountry ? `${fromCountry.name} → ${toCountry.name}` : '—'],
    ['Towar', cargoData.cargoName || '—'],
    ['Waga', cargoData.weight ? `${cargoData.weight} kg` : '—'],
    ['Wartość', cargoData.value ? `${cargoData.value} ${cargoData.currency}` : '—'],
    ...(termsData.incoterms ? [['Incoterms', termsData.incoterms]] : []),
    ['Cel. wymagana odprawa', fromCountry && toCountry ? (bothEU ? 'Nie — ruch wewnątrz UE' : 'Tak') : '—'],
    ...(partiesData.sender.name ? [['Nadawca', partiesData.sender.name]] : []),
    ...(partiesData.receiver.name ? [['Odbiorca', partiesData.receiver.name]] : []),
    ...(partiesData.carrier.name ? [['Przewoźnik', partiesData.carrier.name]] : []),
  ]

  const formData = {
    transport: routeData.transport,
    multimodal: routeData.multimodal,
    fromCountry: routeData.fromCountry,
    fromCity: routeData.fromCity,
    toCountry: routeData.toCountry,
    toCity: routeData.toCity,
    loadDate: routeData.loadDate,
    cargo: {
      name: cargoData.cargoName,
      hsCode: cargoData.hsCode,
      cargoType: cargoData.cargoType,
      weight: cargoData.weight,
      weightNet: cargoData.weightNet,
      volume: cargoData.volume,
      packages: cargoData.packages,
      value: cargoData.value,
      currency: cargoData.currency,
      notes: cargoData.notes,
      incoterms: termsData.incoterms,
      // Sea container fields — used by BillOfLading, SeaWaybill
      containerType: seaData.containerType,
      containerNo: seaData.containerNo,
      sealNo: seaData.sealNo,
      marksNos: seaData.marksNos,
      vessel: seaData.vessel,
      voyageNo: seaData.voyageNo,
    },
    sender: { ...partiesData.sender, country: routeData.fromCountry },
    receiver: { ...partiesData.receiver, country: routeData.toCountry },
    // carrier — single source of truth for CMR / Zlecenie / POD
    carrier: {
      name: partiesData.carrier.name,
      address: partiesData.carrier.address,
      vatNumber: partiesData.carrier.vat,
      contact: partiesData.carrier.contact,
      phone: partiesData.carrier.phone,
    },
    carrierLegs: {
      preCarriage:  { name: '', address: '', vatNumber: '' },
      mainCarriage: { name: partiesData.carrier.name, address: partiesData.carrier.address, vatNumber: partiesData.carrier.vat },
      onCarriage:   { name: '', address: '', vatNumber: '' },
    },
    // Road-specific vehicle data — used by CMR, Zlecenie
    vehicle: {
      type: roadData.vehicleType,
      tempFrom: roadData.tempFrom,
      tempTo: roadData.tempTo,
      adr: roadData.adr,
      adrClass: roadData.adrClass,
      reg: roadData.vehicleReg,
    },
    // Sea-specific shipping details — used by BillOfLading, SeaWaybill
    sea: {
      bookingNo: seaData.bookingNo,
      freightTerms: seaData.freightTerms,
      eta: seaData.eta,
      flag: seaData.flag,
    },
    // Payment / freight terms — used by Zlecenie, invoices
    terms: {
      freightPrice: termsData.freightPrice,
      freightCurrency: termsData.freightCurrency,
      paymentDays: termsData.paymentDays,
    },
  }

  if (import.meta.env.DEV) {
    const c = formData.carrier
    console.log('[carrier sanity] CMR / Zlecenie / POD używają: carrier =', c)
  }

  function toggleDoc(key) {
    setSelected(s => ({ ...s, [key]: !s[key] }))
  }

  async function generateBatch(docs) {
    for (const doc of docs) {
      setStatuses(s => ({ ...s, [doc.key]: 'loading' }))
      try {
        await generateDocument(doc, formData)
        setStatuses(s => ({ ...s, [doc.key]: 'done' }))
      } catch (err) {
        console.error(err)
        setStatuses(s => ({ ...s, [doc.key]: 'error' }))
      }
    }
  }

  const requiredDocs = docsList.filter(d => d.required)
  const optionalDocs = docsList.filter(d => !d.required)

  return (
    <div>
      <BackButton onClick={onBack} />

      <div className="border border-gray-200 rounded-xl overflow-hidden mb-6">
        <div className="px-5 py-3 bg-white border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Podsumowanie zlecenia</p>
        </div>
        {summary.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-b-0 bg-white">
            <span className="text-sm text-gray-500">{label}</span>
            <span className={`text-sm font-medium ${label === 'Cel. wymagana odprawa' && bothEU ? 'text-green-600' : 'text-gray-900'}`}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <Link
        to="/insurance"
        className="flex items-center gap-4 p-5 mb-6 rounded-xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 hover:border-emerald-300 transition-colors group"
      >
        <div className="shrink-0 w-11 h-11 rounded-full bg-emerald-100 flex items-center justify-center">
          <ShieldCheck className="w-5 h-5 text-emerald-600" strokeWidth={1.75} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-900">Ubezpiecz swoją przesyłkę</p>
          <p className="text-xs text-emerald-700 mt-0.5">Chroń towar na czas transportu przed uszkodzeniem, kradzieżą i zagubieniem.</p>
        </div>
        <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
      </Link>

      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Dokumenty</SectionLabel>
        {doneCount > 0 && (
          <span className="text-xs text-green-600 font-medium">{doneCount}/{selectedDocs.length} wygenerowano</span>
        )}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Wymagane</p>
      <div className="space-y-2 mb-4">
        {requiredDocs.map(doc => (
          <DocCard key={doc.key} doc={doc} checked locked status={statuses[doc.key]} />
        ))}
      </div>

      {optionalDocs.length > 0 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Opcjonalne</p>
          <div className="space-y-2 mb-6">
            {optionalDocs.map(doc => (
              <DocCard
                key={doc.key}
                doc={doc}
                checked={!!selected[doc.key]}
                status={statuses[doc.key]}
                onToggle={() => toggleDoc(doc.key)}
              />
            ))}
          </div>
        </>
      )}
      {optionalDocs.length === 0 && <div className="mb-6" />}

      <button
        onClick={() => generateBatch(selectedDocs)}
        disabled={isAnyLoading || selectedDocs.length === 0}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
      >
        {isAnyLoading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        )}
        Generuj dokumenty
      </button>
    </div>
  )
}

// ── Root component ─────────────────────────────────────────────────────────────

const initRoute  = { transport: 'road', fromCountry: 'PL', fromCity: '', toCountry: 'DE', toCity: '', loadDate: '', multimodal: false }
const initCargo  = { cargoName: '', hsCode: '', cargoType: '', weight: '', weightNet: '', volume: '', packages: '', value: '', currency: 'EUR', notes: '' }
const initParty  = { name: '', vat: '', address: '', contact: '', phone: '', iban: '', swift: '', bank: '' }
const initRoad   = { vehicleType: '', tempFrom: '', tempTo: '', adr: false, adrClass: '', vehicleReg: '' }
const initSea    = { containerType: '', containerNo: '', sealNo: '', marksNos: '', vessel: '', voyageNo: '', bookingNo: '', freightTerms: 'Prepaid', eta: '', flag: '' }
const initTerms  = { incoterms: '', freightPrice: '', freightCurrency: 'EUR', paymentDays: '' }

export default function DocumentWizard() {
  const [step, setStep]       = useState(1)
  const [route, setRoute]     = useState(initRoute)
  const [cargo, setCargo]     = useState(initCargo)
  const [parties, setParties] = useState({ sender: { ...initParty }, receiver: { ...initParty }, carrier: { ...initParty } })
  const [road, setRoad]       = useState(initRoad)
  const [sea, setSea]         = useState(initSea)
  const [terms, setTerms]     = useState(initTerms)

  useEffect(() => { preloadHtml2Pdf() }, [])

  const next = () => setStep(s => Math.min(s + 1, 4))
  const back = () => setStep(s => Math.max(s - 1, 1))

  return (
    <div>
      <StepBar current={step} />
      {step === 1 && <Step1 data={route} setData={setRoute} onNext={next} />}
      {step === 2 && (
        <Step2
          data={cargo} setData={setCargo}
          road={road} setRoad={setRoad}
          sea={sea} setSea={setSea}
          terms={terms} setTerms={setTerms}
          transport={route.transport}
          onNext={next} onBack={back}
        />
      )}
      {step === 3 && <Step3 data={parties} setData={setParties} onNext={next} onBack={back} />}
      {step === 4 && (
        <Step4
          routeData={route}
          cargoData={cargo}
          partiesData={parties}
          roadData={road}
          seaData={sea}
          termsData={terms}
          onBack={back}
        />
      )}
    </div>
  )
}
