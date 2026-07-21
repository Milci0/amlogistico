import { useCallback, useEffect, useState } from 'react'
import { listNotifications } from '../services/notificationsRepo'

// Hook powiadomień z serwera (dzwonek). Wzorzec jak useDocumentSetList:
// fetch z loading/error, refetch po zdarzeniu 'notifications:changed'. Dodatkowo
// odświeża po powrocie do karty (window 'focus') — serverless nie pushuje, więc
// nowe powiadomienia dociągamy przy okazji fokusu (bez pollingu w tle).
export function useNotifications() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [version, setVersion] = useState(0)

  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    const onChanged = () => setVersion((v) => v + 1)
    const onFocus = () => setVersion((v) => v + 1)
    window.addEventListener('notifications:changed', onChanged)
    window.addEventListener('focus', onFocus)
    return () => {
      window.removeEventListener('notifications:changed', onChanged)
      window.removeEventListener('focus', onFocus)
    }
  }, [])

  useEffect(() => {
    let active = true
    // Nie migamy spinnerem przy cichym refetchu (focus/event) — tylko przy pierwszym.
    listNotifications()
      .then((r) => { if (active) { setItems(r); setError(null) } })
      .catch((e) => { if (active) setError(e) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [version])

  const unreadCount = items.filter((n) => !n.readAt).length

  return { items, unreadCount, loading, error, refresh }
}
