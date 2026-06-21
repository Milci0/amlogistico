import { useState } from 'react'

const RISK = {
  min:   { label: 'Min.',   width: '10%',  color: 'bg-green-500' },
  low:   { label: 'Niskie', width: '30%',  color: 'bg-lime-400' },
  med:   { label: 'Śred.',  width: '50%',  color: 'bg-yellow-400' },
  high:  { label: 'Wys.',   width: '70%',  color: 'bg-orange-400' },
  vhigh: { label: 'B.wys.', width: '85%',  color: 'bg-orange-600' },
  max:   { label: 'Maks.',  width: '100%', color: 'bg-red-500' },
}

const INCOTERMS = [
  { code: 'EXW', name: 'Ex Works',                      type: 'land', buyer: 'max',   seller: 'min'   },
  { code: 'FCA', name: 'Free Carrier',                   type: 'land', buyer: 'high',  seller: 'low'   },
  { code: 'CPT', name: 'Carriage Paid To',               type: 'land', buyer: 'med',   seller: 'med'   },
  { code: 'CIP', name: 'Carriage & Insurance Paid',      type: 'land', buyer: 'low',   seller: 'high'  },
  { code: 'DAP', name: 'Delivered at Place',             type: 'land', buyer: 'low',   seller: 'vhigh' },
  { code: 'DPU', name: 'Delivered at Place Unloaded',   type: 'land', buyer: 'min',   seller: 'max'   },
  { code: 'DDP', name: 'Delivered Duty Paid',            type: 'land', buyer: 'min',   seller: 'max'   },
  { code: 'FAS', name: 'Free Alongside Ship',            type: 'sea',  buyer: 'high',  seller: 'low'   },
  { code: 'FOB', name: 'Free On Board',                  type: 'sea',  buyer: 'high',  seller: 'med'   },
  { code: 'CFR', name: 'Cost and Freight',               type: 'sea',  buyer: 'med',   seller: 'med'   },
  { code: 'CIF', name: 'Cost, Insurance & Freight',      type: 'sea',  buyer: 'med',   seller: 'high'  },
]

function RiskBar({ level, label }) {
  const r = RISK[level]
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 dark:text-slate-400 w-20 shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full ${r.color}`} style={{ width: r.width }} />
      </div>
      <span className="text-xs font-medium text-slate-600 dark:text-slate-300 w-10 text-right shrink-0">{r.label}</span>
    </div>
  )
}

function IncotermsCard({ item }) {
  const isLand = item.type === 'land'
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start justify-between gap-2 mb-1">
        <span className="text-xl font-bold text-slate-900 dark:text-white">{item.code}</span>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 mt-0.5
          ${isLand ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                   : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
          {isLand ? 'Ląd./lot.' : 'Morski'}
        </span>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-snug">{item.name}</p>
      <div className="space-y-2">
        <RiskBar level={item.buyer}  label="Kupujący" />
        <RiskBar level={item.seller} label="Sprzedający" />
      </div>
    </div>
  )
}

const FILTERS = [
  {
    id: 'all', label: 'Wszystkie',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6h16M4 10h16M4 14h10" /></svg>,
  },
  {
    id: 'sea', label: 'Morski',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2 21c.6.5 1.2 1 2.5 1C7 22 7 20 9.5 20c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.2.5 4.3 1.62 6M12 10V2M12 2H9" /></svg>,
  },
  {
    id: 'land', label: 'Lądowy i lotniczy',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3h1.4a2 2 0 0 1 1.7.9l1.7 2.6a2 2 0 0 1 .3 1V17h-2" /><circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" /></svg>,
  },
]

export default function IncotermsPage() {
  const [filter, setFilter] = useState('all')

  const visible = filter === 'all' ? INCOTERMS : INCOTERMS.filter(i => i.type === filter)

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Incoterms 2020</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Kliknij kartę, aby zobaczyć szczegóły, podział ryzyka i odpowiedzialności.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors
              ${filter === f.id
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-400'}`}
          >
            {f.icon}
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {visible.map(item => (
          <IncotermsCard key={item.code} item={item} />
        ))}
      </div>
    </div>
  )
}
