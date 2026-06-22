import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNews } from '../context/NewsContext'

const NEWS_SOURCES = [
  { name: 'Truck.pl',       url: 'https://www.truck.pl/feed/',         color: 'blue'   },
  { name: 'Logistyka.net',  url: 'https://logistyka.net.pl/feed/',     color: 'green'  },
  { name: 'FreightWaves',   url: 'https://www.freightwaves.com/news/feed', color: 'purple' },
]

const CACHE_KEY = 'amlogistico_news_cache_v2'
const CACHE_TTL = 15 * 60 * 1000
const ONE_YEAR_AGO = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)

function isRecent(item) {
  return new Date(item.pubDate) > ONE_YEAR_AGO
}

const BADGE = {
  blue:   'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  green:  'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  purple: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

function stripHtml(html) {
  return html?.replace(/<[^>]*>/g, '').replace(/&[a-zA-Z]+;/g, ' ').replace(/\s+/g, ' ').trim() || ''
}

function formatDate(str) {
  if (!str) return ''
  const d = new Date(str)
  return isNaN(d) ? '' : d.toLocaleDateString('pl-PL')
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 animate-pulse">
      <div className="flex gap-2 mb-3">
        <div className="h-5 w-20 bg-gray-200 dark:bg-slate-700 rounded-full" />
        <div className="h-5 w-24 bg-gray-200 dark:bg-slate-700 rounded-full" />
      </div>
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-2 w-full" />
      <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded mb-3 w-4/5" />
      <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded mb-1 w-full" />
      <div className="h-3 bg-gray-100 dark:bg-slate-700 rounded w-3/4" />
    </div>
  )
}

export default function NewsPage() {
  const [items, setItems]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)
  const { markRead, notifyNewArticles } = useNews()

  async function fetchNews() {
    setLoading(true)
    setError(null)
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        const { ts, data } = JSON.parse(cached)
        if (Date.now() - ts < CACHE_TTL) {
          setItems(data.filter(isRecent))
          setLoading(false)
          return
        }
      }

      const results = await Promise.all(
        NEWS_SOURCES.map(async source => {
          const res = await fetch(
            `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(source.url)}`
          )
          const json = await res.json()
          if (json.status !== 'ok') return []
          return json.items.map(item => ({
            title:       item.title,
            link:        item.link,
            pubDate:     item.pubDate,
            description: item.description,
            sourceName:  source.name,
            sourceColor: source.color,
          }))
        })
      )

      const merged = results.flat()
        .filter(item => new Date(item.pubDate) > ONE_YEAR_AGO)
        .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
      notifyNewArticles(merged[0]?.pubDate)
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: merged }))
      setItems(merged)
    } catch {
      setError('Nie udało się pobrać newsów. Sprawdź połączenie.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    markRead()
    fetchNews()
  }, [])

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Helmet>
        <title>Newsy | AMLogistico</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Newsy</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Aktualności z branży transportowej i spedycyjnej.
        </p>
      </div>

      {loading && (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">{error}</p>
          <button
            onClick={fetchNews}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            Spróbuj ponownie
          </button>
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-16">
          Brak dostępnych artykułów.
        </p>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="flex flex-col gap-3">
          {items.map((item, i) => (
            <article
              key={i}
              className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${BADGE[item.sourceColor]}`}>
                  {item.sourceName}
                </span>
                <span className="text-xs text-slate-400">{formatDate(item.pubDate)}</span>
              </div>

              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 leading-snug mb-1.5 transition-colors"
              >
                {item.title}
              </a>

              {item.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2 mb-3">
                  {stripHtml(item.description)}
                </p>
              )}

              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Czytaj więcej
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
