import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNews } from '../context/NewsContext'

// ── Sources ───────────────────────────────────────────────────────────────────

const RSS = [
  { id: 'freightwaves', name: 'FreightWaves', url: 'https://www.freightwaves.com/news/feed',         geo: ['swiat'], transport: ['morski'] },
  { id: 'loadstar',     name: 'The Loadstar', url: 'https://theloadstar.com/feed/',                  geo: ['swiat'], transport: ['morski'] },
  { id: 'splash247',    name: 'Splash247',    url: 'https://splash247.com/feed/',                    geo: ['swiat'], transport: ['morski'] },
  { id: 'joc',          name: 'JOC',          url: 'https://www.joc.com/rss/all',                    geo: ['swiat'], transport: ['morski'] },
  { id: 'transinfo',    name: 'Trans.info',   url: 'https://trans.info/pl/feed/',                    geo: ['polska', 'swiat'], transport: ['drogowy'] },
  { id: 'truckpl',      name: 'Truck.pl',     url: 'https://www.truck.pl/feed/',                     geo: ['polska'], transport: ['drogowy'] },
  { id: 'eurologistics',name: 'Eurologistics',url: 'https://eurologistics.pl/feed/',                 geo: ['polska'], transport: [] },
  { id: 'reuters',      name: 'Reuters',      url: 'https://feeds.reuters.com/reuters/businessNews', geo: ['swiat'], transport: ['cla'] },
  { id: 'customstoday', name: 'Customs Today',url: 'https://customstoday.com.pk/feed/',              geo: ['swiat'], transport: ['cla'] },
]

const SRC_COLOR = {
  freightwaves:  'bg-purple-100 text-purple-700',
  loadstar:      'bg-blue-100 text-blue-700',
  splash247:     'bg-teal-100 text-teal-700',
  joc:           'bg-indigo-100 text-indigo-700',
  transinfo:     'bg-amber-100 text-amber-700',
  truckpl:       'bg-orange-100 text-orange-700',
  eurologistics: 'bg-emerald-100 text-emerald-700',
  reuters:       'bg-red-100 text-red-700',
  customstoday:  'bg-yellow-100 text-yellow-800',
}

const TRANSPORT_COLOR = {
  morski:  'bg-blue-100 text-blue-700',
  drogowy: 'bg-amber-100 text-amber-700',
  cla:     'bg-violet-100 text-violet-700',
}

const TRANSPORT_LABEL = { morski: 'Morski', drogowy: 'Drogowy', cla: 'Cła' }

const ALERT_KW = [
  'strike', 'strajk', 'disruption', 'shortage', 'crisis', 'attack', 'blockade',
  'closure', 'sanction', 'embargo', 'ban ', 'conflict', 'war ',
  'ograniczen', 'opóźni', 'zakaz', 'sankcj', 'kryzys', 'blokad', 'awaria', 'wypadek',
]

const MOCK_TICKER = [
  { label: 'WCI Shanghai→Rotterdam', value: '$3 240', delta: +3.2 },
  { label: 'WCI LA→Rotterdam',       value: '$2 186', delta: -1.1 },
  { label: 'BDI',                    value: '1 847 pkt', delta: +2.4 },
  { label: 'SCFI',                   value: '1 623 pkt', delta: +1.8 },
  { label: 'Diesel EU',              value: '€1.48/l',   delta: -0.5 },
]

const MAIN_TABS = [
  { id: 'all',    label: 'Wszystkie' },
  { id: 'polska', label: 'Polska' },
  { id: 'swiat',  label: 'Świat' },
  { id: 'alerty', label: 'Alerty', isAlert: true },
]

// SVG icons for sub-tabs — same stroke style as BlankTemplatesPage / Sidebar
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

const CACHE_KEY = 'am_news_v3'
const CACHE_TTL = 15 * 60 * 1000
const ONE_YEAR  = new Date(Date.now() - 365 * 24 * 3_600_000)
const RSS_API   = 'https://api.rss2json.com/v1/api.json?rss_url='

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripHtml(h = '') {
  return h.replace(/<[^>]*>/g, '').replace(/&[a-zA-Z#0-9]+;/g, ' ').replace(/\s+/g, ' ').trim()
}

function timeAgo(d) {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt)) return ''
  const h = Math.floor((Date.now() - dt) / 3_600_000)
  const hhmm = dt.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })
  if (h < 24)  return `Dziś, ${hhmm}`
  if (h < 48)  return 'Wczoraj'
  return dt.toLocaleDateString('pl-PL', { day: '2-digit', month: 'short' })
}

function detectAlert(title = '', desc = '') {
  const text = `${title} ${desc}`.toLowerCase()
  return ALERT_KW.some(kw => text.includes(kw))
}

async function loadRates() {
  try {
    const [r1, r2] = await Promise.all([
      fetch('https://api.nbp.pl/api/exchangerates/rates/a/eur/?format=json').then(r => r.json()),
      fetch('https://api.nbp.pl/api/exchangerates/rates/a/usd/?format=json').then(r => r.json()),
    ])
    const eurPln = r1.rates[0].mid
    const usdPln = r2.rates[0].mid
    return { eurPln, usdPln, eurUsd: +(eurPln / usdPln).toFixed(4) }
  } catch { return null }
}

// ── Transport icons ───────────────────────────────────────────────────────────

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

function Ticker({ rates }) {
  const items = [
    ...MOCK_TICKER,
    rates ? { label: 'EUR/PLN', value: rates.eurPln?.toFixed(4) } : null,
    rates ? { label: 'USD/PLN', value: rates.usdPln?.toFixed(4) } : null,
  ].filter(Boolean)

  const track = (
    <span className="inline-flex items-stretch h-8">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-2 px-4 border-r border-slate-600/40 text-xs whitespace-nowrap">
          <span className="text-slate-400 font-medium">{it.label}</span>
          <span className="font-bold text-white">{it.value}</span>
          {it.delta != null && (
            <span className={it.delta >= 0 ? 'text-emerald-400' : 'text-red-400'}>
              {it.delta >= 0 ? '▲' : '▼'} {Math.abs(it.delta).toFixed(1)}%
            </span>
          )}
        </span>
      ))}
    </span>
  )

  return (
    <div className="flex h-8 bg-slate-800 shrink-0 overflow-hidden">
      <div className="flex items-center px-3 bg-emerald-600 shrink-0">
        <span className="text-[10px] font-black tracking-[0.18em] text-white uppercase">Fracht</span>
      </div>
      <div className="overflow-hidden flex-1">
        <div className="ticker-track inline-flex">
          {track}{track}
        </div>
      </div>
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function SkeletonCards() {
  return (
    <div className="p-4 md:p-5 animate-pulse">
      <div className="h-56 bg-slate-200 rounded-xl mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="bg-slate-100 rounded-xl overflow-hidden">
            <div className="h-28 bg-slate-200" />
            <div className="p-4 space-y-2">
              <div className="flex gap-2">
                <div className="h-4 w-16 bg-slate-200 rounded-full" />
                <div className="h-4 w-20 bg-slate-200 rounded-full" />
              </div>
              <div className="h-3.5 bg-slate-200 rounded w-full" />
              <div className="h-3.5 bg-slate-200 rounded w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tag ───────────────────────────────────────────────────────────────────────

function Tag({ children, cls }) {
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>
      {children}
    </span>
  )
}

// ── Featured card ─────────────────────────────────────────────────────────────

const FEATURED_BG = {
  morski:  'from-blue-950 via-slate-900 to-slate-900',
  drogowy: 'from-amber-950 via-slate-900 to-slate-900',
  cla:     'from-violet-950 via-slate-900 to-slate-900',
}

function FeaturedCard({ a }) {
  const t = a.transport[0]
  const [imgOk, setImgOk] = useState(!!a.thumbnail)
  return (
    <a href={a.link} target="_blank" rel="noopener noreferrer"
       className="group block rounded-xl overflow-hidden bg-slate-900 mb-4 hover:opacity-95 transition-opacity">
      <div className={`relative h-48 sm:h-56 ${!imgOk ? `bg-gradient-to-br ${FEATURED_BG[t] || 'from-slate-800 to-slate-900'}` : 'bg-slate-900'} flex items-center justify-center overflow-hidden`}>
        {imgOk ? (
          <img
            src={a.thumbnail}
            alt=""
            onError={() => setImgOk(false)}
            className="absolute inset-0 w-full h-full object-cover opacity-80"
          />
        ) : (
          <TransportIcon type={t} className="w-24 h-24 text-white opacity-10" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
      </div>
      <div className="px-5 pb-5 pt-3">
        <div className="flex flex-wrap gap-2 mb-3 items-center">
          {a.isAlert && <Tag cls="bg-red-500 text-white">Alert</Tag>}
          {t && <Tag cls={TRANSPORT_COLOR[t] || 'bg-slate-700 text-white'}>{TRANSPORT_LABEL[t]}</Tag>}
          {a.geo.includes('swiat')  && <Tag cls="bg-slate-700 text-slate-200">Świat</Tag>}
          {a.geo.includes('polska') && <Tag cls="bg-emerald-700 text-white">Polska</Tag>}
          <Tag cls={SRC_COLOR[a.sourceId] || 'bg-slate-700 text-slate-200'}>{a.sourceName}</Tag>
          <span className="text-slate-500 text-xs">· {timeAgo(a.pubDate)}</span>
        </div>
        <h2 className="text-white font-bold text-lg leading-snug mb-2 line-clamp-3 group-hover:text-emerald-300 transition-colors">
          {a.title}
        </h2>
        {a.description && (
          <p className="text-slate-400 text-sm leading-relaxed line-clamp-2 mb-4">
            {stripHtml(a.description)}
          </p>
        )}
        <span className="text-emerald-400 text-sm font-semibold">Czytaj więcej →</span>
      </div>
    </a>
  )
}

// ── Article card ──────────────────────────────────────────────────────────────

const CARD_BG = {
  morski:  'from-blue-900 to-slate-800',
  drogowy: 'from-amber-900 to-slate-800',
  cla:     'from-violet-900 to-slate-800',
}

function ArticleCard({ a }) {
  const t = a.transport[0]
  const [imgOk, setImgOk] = useState(!!a.thumbnail)
  return (
    <a href={a.link} target="_blank" rel="noopener noreferrer"
       className="group block bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-md hover:border-slate-300 transition-all">
      <div className={`relative h-28 ${!imgOk ? `bg-gradient-to-br ${CARD_BG[t] || 'from-slate-700 to-slate-800'}` : 'bg-slate-100'} flex items-center justify-center overflow-hidden`}>
        {imgOk ? (
          <img
            src={a.thumbnail}
            alt=""
            onError={() => setImgOk(false)}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <TransportIcon type={t} className="w-10 h-10 text-white opacity-20" />
        )}
      </div>
      <div className="p-4">
        <div className="flex flex-wrap gap-1.5 mb-2 items-center">
          {a.isAlert && <Tag cls="bg-red-100 text-red-700">Alert</Tag>}
          {t && <Tag cls={TRANSPORT_COLOR[t] || 'bg-slate-100 text-slate-600'}>{TRANSPORT_LABEL[t]}</Tag>}
          <Tag cls={SRC_COLOR[a.sourceId] || 'bg-slate-100 text-slate-600'}>{a.sourceName}</Tag>
          <span className="text-slate-400 text-xs ml-auto">{timeAgo(a.pubDate)}</span>
        </div>
        <h3 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-3 mb-3 group-hover:text-emerald-700 transition-colors">
          {a.title}
        </h3>
        <span className="text-xs font-semibold text-emerald-600">Czytaj więcej →</span>
      </div>
    </a>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function NewsPage() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [rates, setRates]       = useState(null)
  const [mainTab, setMainTab]   = useState('all')
  const [subTab, setSubTab]     = useState('all')
  const { markRead, notifyNewArticles } = useNews()

  const loadNews = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        const { ts, data } = JSON.parse(cached)
        if (Date.now() - ts < CACHE_TTL) {
          setArticles(data)
          setLoading(false)
          return
        }
      }

      const results = await Promise.allSettled(
        RSS.map(async src => {
          const res  = await fetch(`${RSS_API}${encodeURIComponent(src.url)}`)
          const json = await res.json()
          if (json.status !== 'ok') return []
          return json.items
            .filter(it => new Date(it.pubDate) > ONE_YEAR)
            .map(it => ({
              title:       it.title || '',
              link:        it.link  || '#',
              pubDate:     it.pubDate,
              description: it.description || '',
              thumbnail:   it.thumbnail || it.enclosure?.link || '',
              geo:         [...src.geo],
              transport:   [...src.transport],
              isAlert:     detectAlert(it.title, it.description),
              sourceId:    src.id,
              sourceName:  src.name,
            }))
        })
      )

      const merged = results
        .filter(r => r.status === 'fulfilled')
        .flatMap(r => r.value)
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))

      notifyNewArticles(merged[0]?.pubDate)
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: merged }))
      setArticles(merged)
    } catch {
      setError('Nie udało się pobrać newsów. Sprawdź połączenie.')
    } finally {
      setLoading(false)
    }
  }, [notifyNewArticles])

  useEffect(() => {
    markRead()
    loadNews()
    loadRates().then(setRates)
  }, [])

  const filtered = articles.filter(a => {
    if (mainTab === 'alerty' || subTab === 'alerty') return a.isAlert
    const geoOk = mainTab === 'all' || a.geo.includes(mainTab)
    const tOk   = subTab  === 'all' || a.transport.includes(subTab)
    return geoOk && tOk
  })

  const alertCount = articles.filter(a => a.isAlert).length
  const featured   = filtered[0]
  const rest       = filtered.slice(1)

  const mainLabel = MAIN_TABS.find(t => t.id === mainTab)?.label
  const subLabel  = SUB_TABS.find(t => t.id === subTab)?.label

  return (
    <div className="h-full flex flex-col rounded-xl bg-white border border-slate-200 shadow-sm overflow-hidden">
      <style>{`
        @keyframes ticker-scroll {
          0%   { transform: translateX(0) }
          100% { transform: translateX(-50%) }
        }
        .ticker-track {
          animation: ticker-scroll 55s linear infinite;
          will-change: transform;
        }
        .ticker-track:hover { animation-play-state: paused }
      `}</style>

      <Helmet>
        <title>Newsy | AMLogistico</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 shrink-0">
        <h1 className="text-base font-bold text-slate-900">Newsy transportowe</h1>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-medium text-orange-500">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            Na żywo
          </span>
          <button
            onClick={() => { sessionStorage.removeItem(CACHE_KEY); loadNews() }}
            disabled={loading}
            className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-md px-2.5 py-1 transition-colors disabled:opacity-40"
          >
            Odśwież
          </button>
        </div>
      </div>

      {/* Ticker */}
      <Ticker rates={rates} />

      {/* Main tabs */}
      <div className="flex border-b border-slate-200 px-2 shrink-0 bg-white">
        {MAIN_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setMainTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              mainTab === tab.id
                ? 'border-emerald-500 text-emerald-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
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
      <div className="flex gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200 overflow-x-auto shrink-0">
        {SUB_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              subTab === tab.id
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.Icon && <tab.Icon />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Breadcrumb */}
      <div className="px-5 pt-2 pb-1 text-[11px] text-slate-400 shrink-0">
        {mainLabel} · {subLabel}
        {!loading && articles.length > 0 && (
          <span className="ml-1.5 text-slate-300">({filtered.length})</span>
        )}
      </div>

      {/* Scrollable articles */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading && <SkeletonCards />}

        {error && !loading && (
          <div className="flex flex-col items-center gap-4 py-16 text-center px-4">
            <span className="text-4xl">📡</span>
            <p className="text-slate-500 text-sm">{error}</p>
            <button
              onClick={loadNews}
              className="px-4 py-2 text-sm font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Spróbuj ponownie
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-16 text-center px-4">
            <span className="text-4xl">📰</span>
            <p className="text-slate-700 text-sm font-medium">Brak artykułów w tej kategorii</p>
            <p className="text-slate-400 text-xs">Zmień filtry lub kliknij Odśwież</p>
          </div>
        )}

        {!loading && !error && featured && (
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
      </div>
    </div>
  )
}
