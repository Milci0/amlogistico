import { Helmet } from 'react-helmet-async'
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { setPendingIncoterm } from '../services/pendingIncoterm'

const DATA = {
  EXW: {
    name: 'Ex Works',
    full: 'Odbiór towaru z magazynu sprzedającego',
    type: 'land',
    sp: 4, bp: 96,
    pt: 'Ryzyko przechodzi w momencie udostępnienia towaru w miejscu sprzedającego',
    sl: ['Udostępnienie towaru w magazynie', 'Pakowanie towaru'],
    bl: ['Załadunek towaru', 'Odprawa eksportowa', 'Transport do portu/granicy', 'Fracht główny', 'Ubezpieczenie', 'Odprawa importowa i cło', 'Dostawa do miejsca docelowego'],
    warn: { type: 'warn', text: 'EXW nakłada na kupującego maksymalne ryzyko, w tym odprawę eksportową, którą trudno przeprowadzić bez obecności w kraju sprzedającego. W praktyce często zastępowane przez FCA.' },
    modes: ['Drogowy', 'Morski', 'Lotniczy', 'Kolejowy'],
  },
  FCA: {
    name: 'Free Carrier',
    full: 'Dostarczenie towaru do wskazanego przewoźnika',
    type: 'land',
    sp: 28, bp: 72,
    pt: 'Ryzyko przechodzi po wydaniu towaru przewoźnikowi kupującego w uzgodnionym miejscu',
    sl: ['Opakowanie i oznakowanie', 'Odprawa eksportowa', 'Załadunek (jeśli miejsce u sprzedającego)', 'Dostarczenie do przewoźnika'],
    bl: ['Fracht główny', 'Ubezpieczenie cargo', 'Odprawa importowa i cło', 'Dostawa końcowa'],
    warn: { type: 'info', text: 'FCA to rekomendowany zamiennik FOB przy transporcie kontenerowym, ryzyko przechodzi w uzgodnionym miejscu, zanim towar trafi na statek.' },
    modes: ['Drogowy', 'Morski', 'Lotniczy', 'Kolejowy'],
  },
  CPT: {
    name: 'Carriage Paid To',
    full: 'Fracht opłacony do miejsca docelowego',
    type: 'land',
    sp: 45, bp: 55,
    pt: 'Ryzyko przechodzi po wydaniu towaru przewoźnikowi, mimo że sprzedający płaci za fracht',
    sl: ['Opakowanie i odprawa eksportowa', 'Opłacenie frachtu do miejsca docelowego', 'Dostarczenie do przewoźnika'],
    bl: ['Ubezpieczenie cargo (opcjonalne)', 'Odprawa importowa i cło', 'Ryzyko od momentu wydania przewoźnikowi'],
    warn: { type: 'warn', text: 'Przy CPT sprzedający płaci za transport, ale ryzyko przechodzi wcześniej, już przy wydaniu przewoźnikowi. Kupujący ponosi ryzyko w trakcie transportu, za który nie płaci.' },
    modes: ['Drogowy', 'Morski', 'Lotniczy'],
  },
  CIP: {
    name: 'Carriage & Insurance Paid',
    full: 'Fracht i ubezpieczenie opłacone do miejsca docelowego',
    type: 'land',
    sp: 70, bp: 30,
    pt: 'Ryzyko przechodzi po wydaniu towaru przewoźnikowi, sprzedający ubezpiecza transport na pełną wartość',
    sl: ['Opakowanie i odprawa eksportowa', 'Opłacenie frachtu', 'Ubezpieczenie cargo (min. 110% wartości)', 'Dostarczenie do przewoźnika'],
    bl: ['Odprawa importowa i cło', 'Rozładunek w miejscu docelowym'],
    warn: { type: 'info', text: 'CIP wymaga ubezpieczenia na poziomie Institute Cargo Clauses (A), najszersza ochrona. Różni go od CIF, który wymaga tylko klauzuli (C).' },
    modes: ['Drogowy', 'Morski', 'Lotniczy'],
  },
  DAP: {
    name: 'Delivered at Place',
    full: 'Dostawa do uzgodnionego miejsca',
    type: 'land',
    sp: 82, bp: 18,
    pt: 'Ryzyko przechodzi po dostarczeniu towaru do uzgodnionego miejsca, przed rozładunkiem',
    sl: ['Cały transport do miejsca docelowego', 'Odprawa eksportowa', 'Ubezpieczenie (zalecane)', 'Opłaty za tranzyt'],
    bl: ['Rozładunek towaru', 'Odprawa importowa i cło', 'Podatki i opłaty celne'],
    warn: { type: 'warn', text: 'Sprzedający nie odpowiada za rozładunek, jeśli miejsce dostawy nie umożliwia rozładunku przez sprzedającego, rozważ DPU.' },
    modes: ['Drogowy', 'Morski', 'Lotniczy'],
  },
  DPU: {
    name: 'Delivered at Place Unloaded',
    full: 'Dostawa z rozładunkiem w uzgodnionym miejscu',
    type: 'land',
    sp: 90, bp: 10,
    pt: 'Ryzyko przechodzi dopiero po rozładunku towaru w miejscu docelowym',
    sl: ['Cały transport', 'Odprawa eksportowa', 'Rozładunek w miejscu docelowym', 'Ubezpieczenie'],
    bl: ['Odprawa importowa i cło', 'Podatki i opłaty'],
    warn: { type: 'info', text: 'DPU to jedyny Incoterm gdzie sprzedający odpowiada za rozładunek. Wcześniej nazywany DAT, zmieniony w Incoterms 2020.' },
    modes: ['Drogowy', 'Morski', 'Lotniczy'],
  },
  DDP: {
    name: 'Delivered Duty Paid',
    full: 'Dostawa z opłaconym cłem',
    type: 'land',
    sp: 97, bp: 3,
    pt: 'Ryzyko przechodzi dopiero po dostarczeniu do miejsca docelowego z opłaconym cłem i podatkami',
    sl: ['Cały transport', 'Odprawa eksportowa i importowa', 'Opłacenie ceł i podatków VAT', 'Ubezpieczenie'],
    bl: ['Przyjęcie towaru w miejscu docelowym'],
    warn: { type: 'warn', text: 'DDP wymaga posiadania numeru VAT i EORI w kraju importu. Problematyczny dla sprzedających spoza UE, niezalecany bez znajomości lokalnych przepisów.' },
    modes: ['Drogowy', 'Morski', 'Lotniczy'],
  },
  FAS: {
    name: 'Free Alongside Ship',
    full: 'Dostarczenie wzdłuż burty statku',
    type: 'sea',
    sp: 22, bp: 78,
    pt: 'Ryzyko przechodzi gdy towar znajdzie się wzdłuż burty statku w porcie załadunku',
    sl: ['Odprawa eksportowa', 'Dostarczenie do portu', 'Umieszczenie wzdłuż burty statku'],
    bl: ['Załadunek na statek', 'Fracht morski', 'Ubezpieczenie', 'Odprawa importowa i cło'],
    warn: { type: 'warn', text: 'FAS stosowany przy ładunkach masowych (zboże, ruda, węgiel). Przy kontenerach praktycznie nieużywany, lepszy FCA.' },
    modes: ['Morski', 'Śródlądowy'],
  },
  FOB: {
    name: 'Free On Board',
    full: 'Dostarczenie na pokład statku',
    type: 'sea',
    sp: 35, bp: 65,
    pt: 'Ryzyko przechodzi po załadowaniu towaru na pokład statku w porcie załadunku',
    sl: ['Odprawa eksportowa', 'Dostarczenie do portu', 'Załadunek na statek'],
    bl: ['Fracht morski', 'Ubezpieczenie cargo', 'Odprawa importowa i cło', 'Dostawa do miejsca docelowego'],
    warn: { type: 'warn', text: 'FOB stosowany wyłącznie dla transportu morskiego. Przy kontenerach zalecany FCA, lepiej oddaje rzeczywistość załadunku w terminalu.' },
    modes: ['Morski', 'Śródlądowy'],
  },
  CFR: {
    name: 'Cost and Freight',
    full: 'Koszt i fracht do portu docelowego',
    type: 'sea',
    sp: 50, bp: 50,
    pt: 'Ryzyko przechodzi po załadowaniu na statek, sprzedający płaci za fracht, ale nie za ubezpieczenie',
    sl: ['Odprawa eksportowa', 'Załadunek na statek', 'Opłacenie frachtu do portu docelowego'],
    bl: ['Ubezpieczenie cargo (własny koszt)', 'Odprawa importowa i cło', 'Ryzyko od momentu załadunku'],
    warn: { type: 'warn', text: 'Sprzedający płaci za fracht, ale ryzyko przechodzi już przy załadunku. Kupujący ponosi ryzyko przez cały rejs, mimo że nie kontroluje wyboru armatora.' },
    modes: ['Morski', 'Śródlądowy'],
  },
  CIF: {
    name: 'Cost, Insurance & Freight',
    full: 'Koszt, ubezpieczenie i fracht do portu docelowego',
    type: 'sea',
    sp: 58, bp: 42,
    pt: 'Ryzyko przechodzi po załadowaniu na statek, sprzedający opłaca fracht i minimalne ubezpieczenie',
    sl: ['Odprawa eksportowa', 'Załadunek na statek', 'Fracht do portu docelowego', 'Ubezpieczenie (min. klauzula C)'],
    bl: ['Rozładunek w porcie docelowym', 'Odprawa importowa i cło', 'Ryzyko od momentu załadunku'],
    warn: { type: 'warn', text: 'CIF wymaga jedynie minimalnego ubezpieczenia (klauzula C). Dla cennych towarów rozważ CIP, który wymaga pełniejszej ochrony (klauzula A).' },
    modes: ['Morski', 'Śródlądowy'],
  },
}

const LIST = Object.entries(DATA).map(([code, d]) => ({ code, ...d }))

function barStyle(pct) {
  if (pct >= 90) return { color: '#D85A30', label: 'Maks.' }
  if (pct >= 80) return { color: '#D85A30', label: 'B. wys.' }
  if (pct >= 60) return { color: '#EF9F27', label: 'Wysokie' }
  if (pct >= 45) return { color: '#EF9F27', label: 'Średnie' }
  if (pct >= 20) return { color: '#639922', label: 'Niskie' }
  return { color: '#1D9E75', label: 'Min.' }
}

function MiniBar({ pct, label }) {
  const s = barStyle(pct)
  return (
    <div className="mb-1 last:mb-0">
      <div className="flex justify-between text-[10px] mb-0.5">
        <span className="text-slate-500">{label}</span>
        <span className="font-semibold" style={{ color: s.color }}>{s.label}</span>
      </div>
      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: s.color }} />
      </div>
    </div>
  )
}

function IconCheck({ color }) {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" fill="none" stroke={color} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function IconPin() {
  return (
    <svg className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function DetailPanel({ code, onClose }) {
  const d = DATA[code]
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (ref.current) {
      setTimeout(() => ref.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50)
    }
  }, [code])

  // /incoterms jest za RequireAuth — user jest tu zawsze zalogowany, więc od razu
  // na wybór ścieżki (jak „Rozpocznij" na stronie głównej dla zalogowanego usera).
  function handleUseInOrder() {
    setPendingIncoterm(code)
    navigate('/wybor-sciezki')
  }

  const { dark } = useTheme()
  const sellerDominant = d.sp >= d.bp
  // W ciemnym motywie te same barwy (bursztynowa/zielona) w bardziej nasyconej,
  // ciemniejszej wersji — jasne pastele z jasnego motywu ginęły na granatowym tle.
  const AMBER = dark ? { bg: '#7C4A0A', color: '#FDE9C8' } : { bg: '#FAEEDA', color: '#633806' }
  const TEAL  = dark ? { bg: '#0F6B54', color: '#D3FBEE' } : { bg: '#E1F5EE', color: '#085041' }
  const sSide = sellerDominant ? AMBER : TEAL
  const bSide = sellerDominant ? TEAL : AMBER

  return (
    <div
      ref={ref}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 mb-4"
    >
      {/* Nagłówek */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{code}</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{d.full}</div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${
            d.type === 'land'
              ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
          }`}>
            {d.type === 'land' ? 'Lądowy i lotniczy' : 'Morski'}
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
            aria-label="Zamknij"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* CTA: użyj w nowym zleceniu */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-2.5 rounded-lg bg-emerald-50/60 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30">
        <p className="text-xs text-slate-600 dark:text-slate-300">
          Chcesz zastosować <span className="font-semibold text-slate-800 dark:text-white">{code}</span> w nowym zleceniu?
        </p>
        <button
          onClick={handleUseInOrder}
          className="px-3.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm whitespace-nowrap"
        >
          Użyj w nowym zleceniu
        </button>
      </div>

      <div className="h-px bg-slate-100 dark:bg-slate-700 mb-4" />

      {/* Pasek ryzyka */}
      <div className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-2">
        Punkt przeniesienia ryzyka
      </div>
      <div className="flex h-8 rounded-lg overflow-hidden mb-3">
        <div
          className="flex items-center justify-center text-xs font-semibold transition-all"
          style={{ width: `${d.sp}%`, background: sSide.bg, color: sSide.color }}
        >
          {d.sp > 15 ? 'Sprzedający' : 'Sp.'}
        </div>
        <div
          className="flex items-center justify-center text-xs font-semibold transition-all"
          style={{ width: `${d.bp}%`, background: bSide.bg, color: bSide.color }}
        >
          {d.bp > 15 ? 'Kupujący' : 'Kup.'}
        </div>
      </div>
      <div className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300 mb-5">
        <IconPin />
        <span>{d.pt}</span>
      </div>

      {/* Obowiązki */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide mb-2">
            Sprzedający odpowiada za
          </div>
          <div className="space-y-1.5">
            {d.sl.map(t => (
              <div key={t} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <IconCheck color="#1D9E75" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide mb-2">
            Kupujący odpowiada za
          </div>
          <div className="space-y-1.5">
            {d.bl.map(t => (
              <div key={t} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                <IconCheck color="#D85A30" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ostrzeżenie / info */}
      {d.warn && (
        <div className={`flex items-start gap-3 p-3 rounded-r-lg text-sm leading-relaxed mb-4 border-l-[3px] ${
          d.warn.type === 'info'
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-slate-600 dark:text-slate-300'
            : 'bg-amber-50 dark:bg-amber-900/20 border-amber-400 text-slate-600 dark:text-slate-300'
        }`}>
          <svg className={`w-4 h-4 flex-shrink-0 mt-0.5 ${d.warn.type === 'info' ? 'text-emerald-500' : 'text-amber-400'}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {d.warn.type === 'info'
              ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            }
          </svg>
          <span>{d.warn.text}</span>
        </div>
      )}

      {/* Chipy trybów transportu */}
      <div className="flex flex-wrap gap-2">
        {d.modes.map(m => (
          <span key={m} className="text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
            {m}
          </span>
        ))}
      </div>
    </div>
  )
}

const FILTERS = [
  { id: 'all', label: 'Wszystkie' },
  { id: 'sea', label: 'Morski' },
  { id: 'land', label: 'Lądowy i lotniczy' },
]

export default function IncotermsPage() {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const visible = filter === 'all' ? LIST : LIST.filter(i => i.type === filter)

  function handleSelect(code) {
    setSelected(prev => prev === code ? null : code)
  }

  function handleFilter(id) {
    setFilter(id)
    setSelected(null)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Helmet>
        <title>Incoterms 2020: przewodnik | AMLogistico</title>
        <meta name="description" content="Kompletny przewodnik po Incoterms 2020. Sprawdź podział kosztów i ryzyka dla EXW, FCA, FOB, CIF, DAP, DDP i pozostałych warunków dostawy." />
      </Helmet>
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Incoterms 2020</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Kliknij kartę, aby zobaczyć szczegóły, podział ryzyka i odpowiedzialności między sprzedającym a kupującym.
        </p>
      </div>

      {/* Filtry */}
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => handleFilter(f.id)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-all ${
              filter === f.id
                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-400 dark:border-emerald-600 font-medium'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600 hover:border-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-400'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Siatka kart */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 mb-3">
        {visible.map(item => (
          <button
            key={item.code}
            onClick={() => handleSelect(item.code)}
            className={`text-left bg-white dark:bg-slate-800 border rounded-xl p-3.5 transition-all cursor-pointer ${
              selected === item.code
                ? 'border-emerald-500 dark:border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm ring-1 ring-emerald-400'
                : 'border-slate-200 dark:border-slate-700 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className={`text-lg font-bold ${selected === item.code ? 'text-emerald-800 dark:text-emerald-300' : 'text-slate-900 dark:text-white'}`}>
                {item.code}
              </span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                item.type === 'land'
                  ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  : 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
              }`}>
                {item.type === 'land' ? 'Ląd./lot.' : 'Morski'}
              </span>
            </div>
            <p className={`text-[11px] mb-3 leading-snug ${selected === item.code ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
              {item.name}
            </p>
            <MiniBar pct={item.sp} label="Sprzedający" />
            <MiniBar pct={item.bp} label="Kupujący" />
          </button>
        ))}
      </div>

      {/* Panel szczegółów */}
      {selected && DATA[selected] && (
        <DetailPanel key={selected} code={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
