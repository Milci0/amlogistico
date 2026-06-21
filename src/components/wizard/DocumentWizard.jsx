import { useState, useEffect } from 'react'
import { COUNTRIES } from '../../data/mockData'
import CountrySelect from '../ui/CountrySelect'
import { preloadHtml2Pdf } from '../../generators/generatePdf'
import { getDocsList, generateDocument } from '../../generators/documents'

const STEPS = ['Trasa', 'Towar', 'Strony', 'Dokumenty']
const CURRENCIES = ['EUR', 'PLN', 'USD', 'GBP', 'CHF']
const INCOTERMS_OPTIONS = ['', 'EXW', 'FCA', 'FAS', 'FOB', 'CFR', 'CIF', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP']
const CONTAINER_TYPES = ['', '20ft', '40ft', '40ft HC', 'LCL']
const VEHICLE_TYPES = ['Plandeka', 'Chłodnia', 'Mroźnia']
const EU_CODES = ['PL','DE','FR','NL','BE','CZ','SK','AT','IT','ES','PT','SE','DK','FI','HU','RO','BG','HR','GR','EE','LV','LT']

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

      <div className="mb-5">
        <SectionLabel>Skąd</SectionLabel>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Kraj">
            <CountrySelect value={data.fromCountry} onChange={v => setData(d => ({ ...d, fromCountry: v }))} />
          </Field>
          <Field label="Miasto / port">
            <input className={cls.input} placeholder="np. Warszawa" value={data.fromCity} onChange={e => setData(d => ({ ...d, fromCity: e.target.value }))} />
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
            <input className={cls.input} placeholder="np. Berlin" value={data.toCity} onChange={e => setData(d => ({ ...d, toCity: e.target.value }))} />
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

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <Field label="Waga (kg)">
          <input type="number" className={cls.input} placeholder="1500" value={data.weight} onChange={e => setData(d => ({ ...d, weight: e.target.value }))} />
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <Field label="Incoterms">
            <select className={cls.input} value={terms.incoterms} onChange={e => setTerms(t => ({ ...t, incoterms: e.target.value }))}>
              {INCOTERMS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt || '— wybierz —'}</option>)}
            </select>
          </Field>
          <Field label="Koszt frachtu">
            <input type="number" className={cls.input} placeholder="850" value={terms.freightPrice} onChange={e => setTerms(t => ({ ...t, freightPrice: e.target.value }))} />
          </Field>
          <Field label="Waluta frachtu">
            <select className={cls.input} value={terms.freightCurrency} onChange={e => setTerms(t => ({ ...t, freightCurrency: e.target.value }))}>
              {CURRENCIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

          <div className="mb-4">
            <Field label="Numer rezerwacji (Booking No.)">
              <input className={cls.input} placeholder="np. MSC-BKG-2024-001" value={sea.bookingNo} onChange={e => setSea(s => ({ ...s, bookingNo: e.target.value }))} />
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

      <NextButton onClick={onNext} disabled={!canNext} />
    </div>
  )
}

// ── Step 3: Strony ─────────────────────────────────────────────────────────────

function PartySection({ title, subtitle, data, onChange }) {
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
        <Field label="NIP / VAT">
          <input className={cls.input} placeholder="PL1234567890" value={data.vat} onChange={e => upd('vat', e.target.value)} />
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

function DocDownloadButton({ status, onClick }) {
  if (status === 'loading') {
    return (
      <button disabled className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-400 border border-gray-200 cursor-not-allowed">
        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
        Generuję…
      </button>
    )
  }
  if (status === 'done') {
    return (
      <button onClick={onClick} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
        Pobrano
      </button>
    )
  }
  if (status === 'error') {
    return (
      <button onClick={onClick} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Ponów
      </button>
    )
  }
  return (
    <button onClick={onClick} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Pobierz PDF
    </button>
  )
}

function Step4({ routeData, cargoData, partiesData, roadData, seaData, termsData, onBack }) {
  const fromCountry = COUNTRIES.find(c => c.code === routeData.fromCountry)
  const toCountry = COUNTRIES.find(c => c.code === routeData.toCountry)
  const bothEU = !!(fromCountry && toCountry && EU_CODES.includes(fromCountry.code) && EU_CODES.includes(toCountry.code))
  const docsList = getDocsList(routeData.transport, bothEU)

  const [statuses, setStatuses] = useState(() =>
    Object.fromEntries(docsList.map(d => [d.key, 'idle']))
  )

  const isAnyLoading = Object.values(statuses).some(s => s === 'loading')
  const doneCount = Object.values(statuses).filter(s => s === 'done').length

  const summary = [
    ['Typ transportu', routeData.transport === 'road' ? 'Drogowy (TIR)' : 'Morski (Kontener)'],
    ['Trasa', fromCountry && toCountry ? `${fromCountry.flag} ${fromCountry.name} → ${toCountry.flag} ${toCountry.name}` : '—'],
    ['Towar', cargoData.cargoName || '—'],
    ['Waga', cargoData.weight ? `${cargoData.weight} kg` : '—'],
    ['Wartość', cargoData.value ? `${cargoData.value} ${cargoData.currency}` : '—'],
    ['Cel. wymagana odprawa', fromCountry && toCountry ? (bothEU ? 'Nie — ruch wewnątrz UE' : 'Tak') : '—'],
    ...(termsData.incoterms ? [['Incoterms', termsData.incoterms]] : []),
    ...(partiesData.carrier.name ? [['Przewoźnik', partiesData.carrier.name]] : []),
  ]

  const formData = {
    transport: routeData.transport,
    fromCountry: routeData.fromCountry,
    fromCity: routeData.fromCity,
    toCountry: routeData.toCountry,
    toCity: routeData.toCity,
    loadDate: routeData.loadDate,
    cargo: {
      name: cargoData.cargoName,
      hsCode: cargoData.hsCode,
      weight: cargoData.weight,
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
      mainCarriage: { name: '', address: '', vatNumber: '' },
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

  async function downloadOne(doc) {
    setStatuses(s => ({ ...s, [doc.key]: 'loading' }))
    try {
      await generateDocument(doc, formData)
      setStatuses(s => ({ ...s, [doc.key]: 'done' }))
    } catch (err) {
      console.error(err)
      setStatuses(s => ({ ...s, [doc.key]: 'error' }))
    }
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
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Podsumowanie zlecenia</p>
        </div>
        {summary.map(([label, value]) => (
          <div key={label} className="flex items-center justify-between px-5 py-3 border-b border-gray-100 last:border-b-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className={`text-sm font-medium ${label === 'Cel. wymagana odprawa' && bothEU ? 'text-green-600' : 'text-gray-900'}`}>
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-3">
        <SectionLabel>Dokumenty</SectionLabel>
        {doneCount > 0 && (
          <span className="text-xs text-green-600 font-medium">{doneCount}/{docsList.length} pobrano</span>
        )}
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Wymagane</p>
      <div className="space-y-2 mb-4">
        {requiredDocs.map(doc => (
          <div key={doc.key} className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl bg-white">
            <DocIcon type={doc.icon} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{doc.desc}</p>
            </div>
            <DocDownloadButton status={statuses[doc.key]} onClick={() => downloadOne(doc)} />
          </div>
        ))}
      </div>

      {optionalDocs.length > 0 && (
        <>
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Opcjonalne</p>
          <div className="space-y-2 mb-6">
            {optionalDocs.map(doc => (
              <div key={doc.key} className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl bg-white">
                <DocIcon type={doc.icon} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{doc.desc}</p>
                </div>
                <DocDownloadButton status={statuses[doc.key]} onClick={() => downloadOne(doc)} />
              </div>
            ))}
          </div>
        </>
      )}
      {optionalDocs.length === 0 && <div className="mb-6" />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => generateBatch(requiredDocs)}
          disabled={isAnyLoading}
          className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
        >
          {isAnyLoading ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          Generuj wymagane
        </button>
        <button
          onClick={() => generateBatch(docsList)}
          disabled={isAnyLoading}
          className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-500 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Generuj wszystkie
        </button>
      </div>
    </div>
  )
}

// ── Root component ─────────────────────────────────────────────────────────────

const initRoute  = { transport: 'road', fromCountry: 'PL', fromCity: '', toCountry: 'DE', toCity: '', loadDate: '' }
const initCargo  = { cargoName: '', hsCode: '', weight: '', volume: '', packages: '', value: '', currency: 'EUR', notes: '' }
const initParty  = { name: '', vat: '', address: '', contact: '', phone: '' }
const initRoad   = { vehicleType: '', tempFrom: '', tempTo: '', adr: false, adrClass: '', vehicleReg: '' }
const initSea    = { containerType: '', containerNo: '', sealNo: '', marksNos: '', vessel: '', voyageNo: '', bookingNo: '', freightTerms: 'Prepaid' }
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
