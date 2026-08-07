import { useCallback, useEffect, useState } from 'react'
import { listNotifications } from '../services/notificationsRepo'

// Zawartość dzwonka: nieprzeczytane I przeczytane, oba źródła w jednej liście.
// Dzwonek jest jedyną historią powiadomień, osobnej podstrony nie ma.
//
// TRZY stany, nie dwa: `loading` (jeszcze nic nie wiemy, nic nie renderujemy),
// lista niepusta, lista pusta. Błąd zapytania NIE jest sygnałem, że coś trzeba
// pokazać — przy błędzie lista zostaje pusta i dzwonek nie kłamie.
//
// Odświeżanie: zdarzenie 'notifications:changed' po każdej mutacji oraz powrót do
// karty ('focus') — serverless nie pushuje, więc świeże powiadomienia dociągamy
// przy okazji fokusu, bez pollingu w tle.
export function useNotifications() {
  const [version, setVersion] = useState(0)
  const [items, setItems] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1)
    window.addEventListener('notifications:changed', bump)
    window.addEventListener('focus', bump)
    return () => {
      window.removeEventListener('notifications:changed', bump)
      window.removeEventListener('focus', bump)
    }
  }, [])

  useEffect(() => {
    let active = true
    // Nie migamy spinnerem przy cichym refetchu (focus/event) — tylko przy pierwszym.
    listNotifications()
      .then((r) => {
        if (!active) return
        setItems(r.items)
        setUnreadCount(r.unreadCount)
        setError(null)
      })
      .catch((e) => {
        if (!active) return
        setError(e)
        setItems([])
        setUnreadCount(0)
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [version])

  const refresh = useCallback(() => {
    window.dispatchEvent(new Event('notifications:changed'))
  }, [])

  return { items, unreadCount, loading, error, refresh }
}
