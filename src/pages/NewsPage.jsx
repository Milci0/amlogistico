import { useState, useEffect, useCallback, useMemo } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNews } from '../context/NewsContext'
import AlertBox from '../components/ui/AlertBox'
import StepTransition from '../components/StepTransition'

// Dane (artykuły + ticker) pochodzą z backendu /api/news — serwer agreguje RSS.
// Zdjęć nie pokazujemy (prawa autorskie) — karty mają placeholder z ikoną kategorii.

const SRC_COLOR = {
  freightwaves:  'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  loadstar:      'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  splash247:     'bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300',
  supplychain:   'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
  namiary:       'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-300',
  truckpl:       'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
  '40ton':       'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300',
  customstoday:  'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300',
  globaltrade:   'bg-lime-100 dark:bg-lime-900/40 text-lime-700 dark:text-lime-300',
  tradegov:      'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
}

const TRANSPORT_COLOR = {
  morski:  'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  drogowy: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  cla:     'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300',
}
const TRANSPORT_LABEL = { morski: 'Morski', drogowy: 'Drogowy', cla: 'Cła' }

const MAIN_TABS = [
  { id: 'all',    label: 'Wszystkie' },
  { id: 'polska', label: 'Polska' },
  { id: 'swiat',  label: 'Świat' },
  { id: 'alerty', label: 'Alerty', isAlert: true },
]

// ── Ikony (styl strokeWidth 1.5 jak w BlankTemplatesPage / Sidebar) ───────────

function IconSea({ cls = 'w-3.5 h-3.5' }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M2 21c.6.5 1.2 1 2.5 1C7 22 7 20 9.5 20c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1" />
      <path d="M19.38 20A11.6 11.6 0 0 0 21 14l-9-4-9 4c0 2.2.5 4.3 1.62 6" />
      <path d="M12 10V2" /><path d="M12 2H9" />
    </svg>
  )
}
function IconTruck({ cls = 'w-3.5 h-3.5' }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3h1.4a2 2 0 0 1 1.7.9l1.7 2.6a2 2 0 0 1 .3 1V17h-2" />
      <circle cx="7.5" cy="17.5" r="2.5" /><circle cx="17.5" cy="17.5" r="2.5" />
    </svg>
  )
}
function IconCustoms({ cls = 'w-3.5 h-3.5' }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="3" width="6" height="4" rx="1" />
      <path d="m9 14 2 2 4-4" />
    </svg>
  )
}
function IconAlert({ cls = 'w-3.5 h-3.5' }) {
  return (
    <svg className={cls} fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
      <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
}

const SUB_TABS = [
  { id: 'all',    label: 'Wszystkie',        Icon: null },
  { id: 'morski', label: 'Morski',           Icon: IconSea },
  { id: 'drogowy',label: 'Drogowy',          Icon: IconTruck },
  { id: 'cla',    label: 'Cła i regulacje',  Icon: IconCustoms },
  { id: 'alerty', label: 'Alerty',           Icon: IconAlert },
]

const CACHE_KEY        = 'am_news_api_v1'
const CACHE_TTL        = 10 * 60 * 1000
const DIESEL_CACHE_KEY = 'am_diesel_v1'
const ECB_CACHE_KEY    = 'am_ecb_v1'
const RATES_CACHE_TTL  = 6 * 60 * 60 * 1000 // 6h — pokrywa czas zycia cache backendu

function readRatesCache(key) {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    const { ts, data } = JSON.parse(raw)
    if (Date.now() - ts < RATES_CACHE_TTL) return data
  } catch {}
  return null
}

function writeRatesCache(key, data) {
  try { sessionStorage.setItem(key, JSON.stringify({ ts: Date.now(), data })) } catch {}
}

// ── Helpers ───────────────────────────────────────────────────────────────────

// "2026-06-22" → "22.06.2026" (format DD.MM.RRRR, jak w generatorze PDF)
function fmtIsoDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return y && m && d ? `${d}.${m}.${y}` : iso
}

function timeAgo(d) {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt)) return ''
  const h = Math.floor((Date.now() - dt) / 3_600_000)
  const hhmm = dt.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  if (h < 24) return `Dziś, ${hhmm}`
  if (h < 48) return 'Wczoraj'
  return dt.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short' })
}

// ── Ikony transportu (duże, do tła kart) ──────────────────────────────────────

function ShipIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M3 17s2.5 2 4.5 2 4.5-2 4.5-2 2.5 2 4.5 2 4.5-2 4.5-2M7 14l1.5-9h7L17 14M12 5V2m-3 3 3-3 3 3" />
    </svg>
  )
}
function TruckIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375A1.125 1.125 0 0 1 2.25 17.625V5.25A2.25 2.25 0 0 1 4.5 3h9.75A2.25 2.25 0 0 1 16.5 5.25v1.5m0 12a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.9 17.9 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H16.5m0 12V6.75" />
    </svg>
  )
}
function DocIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9ZM8.25 10.5h7.5m-7.5 3h7.5m-7.5 3h4.5" />
    </svg>
  )
}
function NewsIcon({ className }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={1.2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5" />
    </svg>
  )
}
function TransportIcon({ type, className }) {
  if (type === 'morski')  return <ShipIcon className={className} />
  if (type === 'drogowy') return <TruckIcon className={className} />
  if (type === 'cla')     return <DocIcon className={className} />
  return <NewsIcon className={className} />
}

// ── Ticker ────────────────────────────────────────────────────────────────────

function Ticker({ items }) {
  if (!items?.length) return null
  // Jedna „grupa" elementów. Renderujemy ją dwa razy obok siebie; obie przewijają się
  // o -100% własnej szerokości. `min-w-full` + `justify-around` gwarantują, że grupa
  // wypełnia cały pasek (brak pustej luki, gdy elementów jest mało) — seamless loop.
  const group = (hidden) => (
    <div className="ticker-group items-center h-8" aria-hidden={hidden || undefined}>
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-2 px-4 text-xs whitespace-nowrap">
          <span className="text-slate-400 dark:text-slate-500 font-medium">{it.label}</span>
          <span className="font-bold text-white dark:text-slate-900">{it.value}</span>
          {it.delta != null && (
            <span className={it.delta >= 0 ? 'text-emerald-400 dark:text-emerald-700' : 'text-red-400 dark:text-red-700'}>
              {it.delta >= 0 ? '▲' : '▼'} {Math.abs(it.delta).toFixed(1)}%
            </span>
          )}
          {/* separator " · " między elementami */}
          <span className="pl-4 text-slate-600 dark:text-slate-300">·</span>
        </span>
      ))}
    </div>
  )
  return (
    <div className="flex h-8 bg-slate-800 dark:bg-slate-100 shrink-0 overflow-hidden">
      <div className="flex items-center px-3 bg-emerald-600 shrink-0">
        <span className="text-[10px] font-black tracking-[0.18em] text-white uppercase">Fracht</span>
      </div>
      <div className="ticker-lane flex flex-1 overflow-hidden">
        {group(false)}
        {group(true)}
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCards() {
  return (
    <div className="p-4 md:p-5 animate-pulse">
      <div className="h-56 bg-slate-200 dark:bg-slate-700 rounded-xl mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden">
            <div className="h-44 bg-slate-200 dark:bg-slate-700" />
            <div className="p-4 space-y-2">
              <div className="flex gap-2">
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
                <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
              <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-full" />
              <div className="h-3.5 bg-slate-200 dark:bg-slate-700 rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Tag({ children, cls }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>
      {children}
    </span>
  )
}

// ── Placeholder kategorii ─────────────────────────────────────────────────────
// Świadomie NIE pokazujemy cudzych zdjęć z RSS (prawa autorskie/licencje agencji) —
// zamiast miniaturki renderujemy kolorowy placeholder z ikoną dopasowaną do kategorii.

const CATEGORY_PLACEHOLDER = {
  morski:  'bg-blue-900',
  drogowy: 'bg-green-900',
  cla:     'bg-yellow-900',
  alert:   'bg-red-900',
  default: 'bg-gray-800',
}

function NewsImage({ transport, isAlert, featured }) {
  const key = isAlert ? 'alert' : (CATEGORY_PLACEHOLDER[transport] ? transport : 'default')
  const bg = CATEGORY_PLACEHOLDER[key]
  const h = featured ? 'h-56 sm:h-72' : 'h-44'
  const iconCls = featured ? 'w-24 h-24 text-white/40' : 'w-12 h-12 text-white/40'
  return (
    <div className={`relative ${h} ${bg} flex items-center justify-center overflow-hidden`}>
      {isAlert
        ? <IconAlert cls={iconCls} />
        : <TransportIcon type={transport} className={iconCls} />}
    </div>
  )
}

// ── Karty ─────────────────────────────────────────────────────────────────────

function FeaturedCard({ a }) {
  const t = a.transport[0]
  return (
    <a href={a.link} target="_blank" rel="noopener noreferrer"
       className="group block rounded-xl overflow-hidden bg-slate-900 mb-4 hover:opacity-95 transition-opacity">
      <NewsImage transport={t} isAlert={a.isAlert} featured />
      <div className="px-5 pb-5 pt-3">
        <div className="flex flex-wrap gap-2 mb-3 items-center">
          {a.isAlert && <Tag cls="bg-red-500 text-white">Alert</Tag>}
          {t && <Tag cls={TRANSPORT_COLOR[t] || 'bg-slate-700 text-white'}>{TRANSPORT_LABEL[t]}</Tag>}
          {a.geo.includes('swiat')  && <Tag cls="bg-slate-700 text-slate-200">Świat</Tag>}
          {a.geo.includes('polska') && <Tag cls="bg-emerald-700 text-white">Polska</Tag>}
          <Tag cls={SRC_COLOR[a.sourceId] || 'bg-slate-700 text-slate-200'}>{a.sourceName}</Tag>
          <span className="text-slate-500 text-xs">· {timeAgo(a.pubDate)}</span>
        </div>
        <h2 className="text-white font-bold text-lg leading-snug mb-4 line-clamp-3 group-hover:text-emerald-300 transition-colors">
          {a.title}
        </h2>
        <span className="text-emerald-400 text-sm font-semibold">Czytaj więcej →</span>
      </div>
    </a>
  )
}

function ArticleCard({ a }) {
  const t = a.transport[0]
  return (
    <a href={a.link} target="_blank" rel="noopener noreferrer"
       className="group block bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all">
      <NewsImage transport={t} isAlert={a.isAlert} />
      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-2 items-center">
          {a.isAlert && <Tag cls="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">Alert</Tag>}
          {t && <Tag cls={TRANSPORT_COLOR[t] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}>{TRANSPORT_LABEL[t]}</Tag>}
          <Tag cls={SRC_COLOR[a.sourceId] || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}>{a.sourceName}</Tag>
          <span className="text-slate-400 dark:text-slate-500 text-xs ml-auto">{timeAgo(a.pubDate)}</span>
        </div>
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug line-clamp-3 mb-3 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
          {a.title}
        </h3>
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Czytaj więcej →</span>
      </div>
    </a>
  )
}

// ── Strona ────────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const [articles, setArticles] = useState([])
  const [ticker, setTicker]     = useState([])
  const [diesel, setDiesel]     = useState(() => readRatesCache(DIESEL_CACHE_KEY))
  const [ecb, setEcb]           = useState(() => readRatesCache(ECB_CACHE_KEY))
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [mainTab, setMainTab]   = useState('all')
  const [subTab, setSubTab]     = useState('all')
  const { markRead, notifyNewArticles } = useNews()

  const loadNews = useCallback(async (force = false) => {
    setLoading(true)
    setError(null)
    try {
      if (!force) {
        const cached = sessionStorage.getItem(CACHE_KEY)
        if (cached) {
          const { ts, data } = JSON.parse(cached)
          if (Date.now() - ts < CACHE_TTL) {
            setArticles(data.articles || [])
            setTicker(data.ticker || [])
            setLoading(false)
            return
          }
        }
      }
      // force → ?refresh=1 pomija 15-min cache serwera i czeka na świeże feedy
      const res = await fetch(force ? '/api/news?refresh=1' : '/api/news')
      if (!res.ok) throw new Error('bad status')
      const data = await res.json()
      setArticles(data.articles || [])
      setTicker(data.ticker || [])
      notifyNewArticles(data.articles?.[0]?.pubDate)
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }))
    } catch {
      setError('Nie udało się pobrać newsów. Sprawdź połączenie lub backend (/api/news).')
    } finally {
      setLoading(false)
    }
  }, [notifyNewArticles])

  useEffect(() => {
    markRead()
    loadNews()
  }, [])

  // Cena diesla EU (EC Oil Bulletin) — niezależnie od newsów; gdy niedostępna → element ukryty
  useEffect(() => {
    let alive = true
    fetch('/api/diesel-price')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (alive && d && d.value != null) {
          setDiesel(d)
          writeRatesCache(DIESEL_CACHE_KEY, d)
        }
      })
      .catch(() => {})
    return () => { alive = false }
  }, [])

  // Stopa EBC — pobierana przy mount; fetch z timeoutem 8 s
  useEffect(() => {
    let alive = true
    const fetchJson = async (url) => {
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 8000)
      try {
        const r = await fetch(url, { signal: ctrl.signal })
        return r.ok ? await r.json() : null
      } catch (e) {
        console.error('Błąd pobierania', url, e)
        return null
      } finally {
        clearTimeout(timer)
      }
    }
    fetchJson('/api/ecb-rate').then(e => {
      if (alive && e && e.value != null) {
        setEcb(e)
        writeRatesCache(ECB_CACHE_KEY, e)
      }
    })
    return () => { alive = false }
  }, [])

  // Konwertery walut (z /api/news) + diesel / stopa EBC jako dodatkowe elementy paska
  const tickerItems = useMemo(() => {
    const num = v => v.toFixed(2).replace('.', ',') // 1.73 → "1,73"
    const extra = []
    if (diesel) extra.push({ label: 'Diesel EU:',  value: `${num(diesel.value)} ${diesel.unit} (${fmtIsoDate(diesel.date)})` })
    if (ecb)    extra.push({ label: 'Stopa EBC:',   value: `${num(ecb.value)}% (${fmtIsoDate(ecb.date)})` })
    return [...ticker, ...extra]
  }, [ticker, diesel, ecb])

  const filtered = articles.filter(a => {
    if (mainTab === 'alerty' || subTab === 'alerty') return a.isAlert
    const geoOk = mainTab === 'all' || a.geo.includes(mainTab)
    const tOk   = subTab  === 'all' || a.transport.includes(subTab)
    return geoOk && tOk
  })

  const alertCount = articles.filter(a => a.isAlert).length
  const featured   = filtered[0]
  const rest       = filtered.slice(1)
  const mainLabel  = MAIN_TABS.find(t => t.id === mainTab)?.label
  const subLabel   = SUB_TABS.find(t => t.id === subTab)?.label

  return (
    <div className="h-full flex flex-col rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
      <style>{`
        @keyframes ticker-scroll { from { transform: translateX(0) } to { transform: translateX(-100%) } }
        .ticker-group {
          display: flex;
          flex: none;
          min-width: 100%;
          justify-content: space-around;
          animation: ticker-scroll 60s linear infinite;
          will-change: transform;
        }
        /* pauza obu kopii naraz, gdy kursor jest nad paskiem (inaczej rozjechałyby się) */
        .ticker-lane:hover .ticker-group { animation-play-state: paused; }
      `}</style>

      <Helmet>
        <title>Newsy | AMLogistico</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-700 shrink-0">
        <h1 className="text-base font-bold text-slate-900 dark:text-white">Newsy transportowe</h1>
        <div className="flex items-center gap-3">
          {/* „Na żywo" tylko gdy ticker ma realne dane na żywo (kursy NBP / diesel) */}
          {tickerItems.length > 0 && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-orange-500">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Na żywo
            </span>
          )}
          <button
            onClick={() => { sessionStorage.removeItem(CACHE_KEY); loadNews(true) }}
            disabled={loading}
            className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-md px-2.5 py-1 transition-colors disabled:opacity-40"
          >
            Odśwież
          </button>
        </div>
      </div>

      <Ticker items={tickerItems} />

      {/* Main tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 px-2 shrink-0 bg-white dark:bg-slate-800">
        {MAIN_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setMainTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              mainTab === tab.id
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
            {tab.isAlert && alertCount > 0 && (
              <span className="text-[10px] bg-red-500 text-white font-bold rounded-full px-1.5 py-0.5 leading-none">
                {alertCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Sub tabs */}
      <div className="flex gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 overflow-x-auto shrink-0">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              subTab === tab.id
                ? 'bg-slate-800 dark:bg-slate-600 text-white'
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {tab.Icon && <tab.Icon />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Breadcrumb */}
      <div className="px-5 pt-2 pb-1 text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
        {mainLabel} · {subLabel}
        {!loading && articles.length > 0 && (
          <span className="ml-1.5 text-slate-300 dark:text-slate-600">({filtered.length})</span>
        )}
      </div>

      {/* Lista */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading && <SkeletonCards />}

        {error && !loading && (
          <div className="flex flex-col items-center gap-4 py-16 text-center px-4">
            <span className="text-4xl">📡</span>
            <p className="text-slate-500 dark:text-slate-400 text-sm">{error}</p>
            <button
              onClick={() => loadNews(true)}
              className="px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {!loading && !error && (
          <StepTransition stepKey={`${mainTab}:${subTab}`} slide={false}>
            {filtered.length === 0 ? (
              <div className="p-4 md:p-5">
                <AlertBox type="info" title="Brak artykułów dla wybranego filtra">
                  Wybierz inną zakładkę lub kliknij „Odśwież".
                </AlertBox>
              </div>
            ) : featured && (
              <div className="p-4 md:p-5">
                <FeaturedCard a={featured} />
                {rest.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {rest.map((a, i) => (
                      <ArticleCard key={`${a.sourceId}-${a.link}-${i}`} a={a} />
                    ))}
                  </div>
                )}
              </div>
            )}
          </StepTransition>
        )}
      </div>

      {/* Stopka — nota prawna */}
      <div className="shrink-0 border-t border-slate-200 dark:border-slate-700 px-5 py-2.5 bg-slate-50 dark:bg-slate-900">
        <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 text-center">
          Artykuły są własnością ich wydawców. AMLogistico wyświetla wyłącznie nagłówki i linki
          do oryginalnych źródeł RSS.
        </p>
        {diesel && (
          <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 text-center mt-1">
            Cena diesla: „Weekly Oil Bulletin" © European Commission, licencja{' '}
            <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener"
               className="underline hover:text-slate-600 dark:hover:text-slate-300">CC BY 4.0</a>
          </p>
        )}
        {ecb && (
          <p className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500 text-center mt-1">
            Stopa EBC: © European Central Bank (CC BY 4.0)
          </p>
        )}
      </div>
    </div>
  )
}
