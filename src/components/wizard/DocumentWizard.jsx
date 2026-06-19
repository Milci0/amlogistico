import { useState } from 'react'
import { COUNTRIES } from '../../data/mockData'
import CountrySelect from '../ui/CountrySelect'

const STEPS = ['Trasa', 'Towar', 'Strony', 'Dokumenty']
const CURRENCIES = ['EUR', 'PLN', 'USD', 'GBP', 'CHF']
const EU_CODES = ['PL','DE','FR','NL','BE','CZ','SK','AT','IT','ES','PT','SE','DK','FI','HU','RO','BG','HR','GR','EE','LV','LT']

const DOCS_LIST = [
  { name: 'CMR — list przewozowy', desc: 'Podstawowy dokument każdego transportu drogowego', required: true, icon: 'doc' },
  { name: 'Packing List', desc: 'Szczegółowy wykaz zawartości przesyłki', required: true, icon: 'list' },
  { name: 'Faktura handlowa', desc: 'Dokument rozliczeniowy między sprzedającym a kupującym', required: true, icon: 'doc' },
  { name: 'Zlecenie transportowe', desc: 'Umowa między zleceniodawcą a przewoźnikiem', required: false, icon: 'clipboard' },
  { name: 'Protokół odbioru towaru', desc: 'Potwierdzenie dostarczenia przez odbiorcę', required: false, icon: 'sign' },
]

const cls = {
  input: 'w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-colors',
}

function StepBar({ current }) {
  return (
    <div className="grid grid-cols-4 border border-gray-200 rounded-xl overflow-hidden mb-6">
      {STEPS.map((name, i) => {
        const num = i + 1
        const done = num < current
        const active = num === current
        return (
          <div
            key={name}
            className={`flex items-center gap-2 px-4 py-3${i < STEPS.length - 1 ? ' border-r border-gray-200' : ''}`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0
              ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
              {done ? (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              ) : num}
            </div>
            <span className={`text-sm font-medium ${active ? 'text-gray-900' : done ? 'text-gray-700' : 'text-gray-400'}`}>
              {name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function SectionLabel({ children }) {
  return <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">{children}</p>
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm text-gray-700 mb-1">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
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
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          {
            id: 'road',
            label: 'Drogowy',
            sub: 'TIR, ciężarówka',
            svg: (active) => (
              <svg className={`w-7 h-7 ${active ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zm10 0a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M1 1h15v11H1zM16 5h4l3 3v8h-7V5z" />
              </svg>
            ),
          },
          {
            id: 'sea',
            label: 'Morski',
            sub: 'Kontener FCL/LCL',
            svg: (active) => (
              <svg className={`w-7 h-7 ${active ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 17l3-9h12l3 9M3 17l9 3 9-3M9 8V5h6v3" />
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
        <div className="grid grid-cols-2 gap-3">
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
        <div className="grid grid-cols-2 gap-3">
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

function Step2({ data, setData, onNext, onBack }) {
  const canNext = !!data.cargoName.trim()
  return (
    <div>
      <BackButton onClick={onBack} />
      <SectionLabel>Opis towaru</SectionLabel>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Nazwa towaru">
          <input className={cls.input} placeholder="np. części elektroniczne" value={data.cargoName} onChange={e => setData(d => ({ ...d, cargoName: e.target.value }))} />
        </Field>
        <Field label="Kod celny (HS/CN)" hint="8-cyfrowy kod CN towaru">
          <input className={cls.input} placeholder="np. 8542.31" value={data.hsCode} onChange={e => setData(d => ({ ...d, hsCode: e.target.value }))} />
        </Field>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
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

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Field label="Wartość towaru">
          <input type="number" className={cls.input} placeholder="15000" value={data.value} onChange={e => setData(d => ({ ...d, value: e.target.value }))} />
        </Field>
        <Field label="Waluta">
          <select className={cls.input} value={data.currency} onChange={e => setData(d => ({ ...d, currency: e.target.value }))}>
            {CURRENCIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Uwagi / instrukcje">
        <textarea
          className={`${cls.input} resize-none`}
          rows={3}
          placeholder="np. towar kruchy, trzymać w pozycji pionowej"
          value={data.notes}
          onChange={e => setData(d => ({ ...d, notes: e.target.value }))}
        />
      </Field>

      <NextButton onClick={onNext} disabled={!canNext} />
    </div>
  )
}

// ── Step 3: Strony ─────────────────────────────────────────────────────────────

function PartySection({ title, data, onChange }) {
  const upd = (key, val) => onChange({ ...data, [key]: val })
  return (
    <div className="border border-gray-200 rounded-xl p-5 mb-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">{title}</p>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <Field label="Nazwa firmy">
          <input className={cls.input} placeholder={title === 'Nadawca' ? 'np. ABC Sp. z o.o.' : 'np. Schmidt GmbH'} value={data.name} onChange={e => upd('name', e.target.value)} />
        </Field>
        <Field label="NIP / VAT">
          <input className={cls.input} placeholder={title === 'Nadawca' ? 'PL1234567890' : 'DE123456789'} value={data.vat} onChange={e => upd('vat', e.target.value)} />
        </Field>
      </div>
      <div className="mb-3">
        <Field label="Adres">
          <input
            className={cls.input}
            placeholder={title === 'Nadawca' ? 'ul. Przykładowa 1, 00-001 Warszawa' : 'Musterstraße 1, 10115 Berlin'}
            value={data.address}
            onChange={e => upd('address', e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Osoba kontaktowa">
          <input className={cls.input} placeholder={title === 'Nadawca' ? 'Jan Kowalski' : 'Hans Schmidt'} value={data.contact} onChange={e => upd('contact', e.target.value)} />
        </Field>
        <Field label="Telefon">
          <input className={cls.input} placeholder={title === 'Nadawca' ? '+48 500 000 000' : '+49 30 000 0000'} value={data.phone} onChange={e => upd('phone', e.target.value)} />
        </Field>
      </div>
    </div>
  )
}

function Step3({ data, setData, onNext, onBack }) {
  return (
    <div>
      <BackButton onClick={onBack} />
      <PartySection title="Nadawca" data={data.sender} onChange={s => setData(d => ({ ...d, sender: s }))} />
      <PartySection title="Odbiorca" data={data.receiver} onChange={r => setData(d => ({ ...d, receiver: r }))} />
      <NextButton onClick={onNext} />
    </div>
  )
}

// ── Step 4: Dokumenty ──────────────────────────────────────────────────────────

function Step4({ routeData, cargoData, onBack }) {
  const fromCountry = COUNTRIES.find(c => c.code === routeData.fromCountry)
  const toCountry = COUNTRIES.find(c => c.code === routeData.toCountry)
  const bothEU = fromCountry && toCountry && EU_CODES.includes(fromCountry.code) && EU_CODES.includes(toCountry.code)

  const summary = [
    ['Typ transportu', routeData.transport === 'road' ? 'Drogowy (TIR)' : 'Morski (Kontener)'],
    ['Trasa', fromCountry && toCountry ? `${fromCountry.flag} ${fromCountry.name} → ${toCountry.flag} ${toCountry.name}` : '—'],
    ['Towar', cargoData.cargoName || '—'],
    ['Waga', cargoData.weight ? `${cargoData.weight} kg` : '—'],
    ['Wartość', cargoData.value ? `${cargoData.value} ${cargoData.currency}` : '—'],
    ['Cel. wymagana odprawa', fromCountry && toCountry ? (bothEU ? 'Nie — ruch wewnątrz UE' : 'Tak') : '—'],
  ]

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

      <SectionLabel>Dokumenty do wygenerowania</SectionLabel>
      <div className="space-y-2 mb-6">
        {DOCS_LIST.map(doc => (
          <div key={doc.name} className="flex items-center gap-3 px-4 py-3.5 border border-gray-200 rounded-xl bg-white">
            <DocIcon type={doc.icon} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">{doc.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{doc.desc}</p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0
              ${doc.required ? 'bg-gray-100 text-gray-600' : 'bg-gray-50 text-gray-400 border border-gray-200'}`}>
              {doc.required ? 'wymagany' : 'opcjonalny'}
            </span>
          </div>
        ))}
      </div>

      <button className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Generuj dokumenty ↗
      </button>
    </div>
  )
}

// ── Root component ─────────────────────────────────────────────────────────────

const initRoute = { transport: 'road', fromCountry: 'PL', fromCity: '', toCountry: 'DE', toCity: '', loadDate: '' }
const initCargo = { cargoName: '', hsCode: '', weight: '', volume: '', packages: '', value: '', currency: 'EUR', notes: '' }
const initParty = { name: '', vat: '', address: '', contact: '', phone: '' }

export default function DocumentWizard() {
  const [step, setStep] = useState(1)
  const [route, setRoute] = useState(initRoute)
  const [cargo, setCargo] = useState(initCargo)
  const [parties, setParties] = useState({ sender: { ...initParty }, receiver: { ...initParty } })

  const next = () => setStep(s => Math.min(s + 1, 4))
  const back = () => setStep(s => Math.max(s - 1, 1))

  return (
    <div>
      <StepBar current={step} />
      {step === 1 && <Step1 data={route} setData={setRoute} onNext={next} />}
      {step === 2 && <Step2 data={cargo} setData={setCargo} onNext={next} onBack={back} />}
      {step === 3 && <Step3 data={parties} setData={setParties} onNext={next} onBack={back} />}
      {step === 4 && <Step4 routeData={route} cargoData={cargo} onBack={back} />}
    </div>
  )
}
