import { createContext, useContext, useState, useEffect } from 'react'

const NewsCtx = createContext({ hasUnread: false, markRead: () => {}, notifyNewArticles: () => {} })

const LS_SEEN   = 'news_last_seen'
const LS_LATEST = 'news_latest_date'
const LS_CHECK  = 'news_check_ts'
const CHECK_INTERVAL = 60 * 60 * 1000 // sprawdź max raz na godzinę

export function NewsProvider({ children }) {
  const [hasUnread, setHasUnread] = useState(() => {
    const seen   = localStorage.getItem(LS_SEEN)
    const latest = localStorage.getItem(LS_LATEST)
    if (!seen) return true // pierwsza wizyta — kropka domyślnie
    if (!latest) return false
    return new Date(latest) > new Date(seen)
  })

  useEffect(() => {
    // Background check: jeden fetch do Truck.pl max raz na godzinę
    const lastCheck = localStorage.getItem(LS_CHECK)
    if (lastCheck && Date.now() - parseInt(lastCheck, 10) < CHECK_INTERVAL) return

    ;(async () => {
      try {
        const res = await fetch('/api/news')
        if (!res.ok) return
        const json = await res.json()
        const latest = json.articles?.[0]?.pubDate
        if (!latest) return
        localStorage.setItem(LS_CHECK, Date.now().toString())
        const latestDate = new Date(latest)
        const seen = localStorage.getItem(LS_SEEN)
        if (!seen || latestDate > new Date(seen)) {
          localStorage.setItem(LS_LATEST, latest)
          setHasUnread(true)
        }
      } catch {}
    })()
  }, [])

  function markRead() {
    localStorage.setItem(LS_SEEN, new Date().toISOString())
    setHasUnread(false)
  }

  function notifyNewArticles(latestDate) {
    if (latestDate) localStorage.setItem(LS_LATEST, latestDate)
  }

  return (
    <NewsCtx.Provider value={{ hasUnread, markRead, notifyNewArticles }}>
      {children}
    </NewsCtx.Provider>
  )
}

export const useNews = () => useContext(NewsCtx)
