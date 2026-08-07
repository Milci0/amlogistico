import { useCallback, useEffect, useRef, useState } from 'react'
import { listContainers, getContainer } from '../services/containerTrackingRepo'
import { isPendingStatus } from '../data/containerStatus'

// Lista „Twoje kontenery" — czyta WYŁĄCZNIE z naszej bazy (GET /api/tracking/containers).
// Zero zapytań do ShipsGo przy każdym wejściu na stronę.
export function useContainerList() {
  const [containers, setContainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const reload = useCallback(async () => {
    try {
      setError(null)
      setContainers(await listContainers())
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  // Pozwala podmienić jeden wiersz bez pełnego przeładowania listy (np. po
  // odświeżeniu szczegółów albo po dodaniu kontenera).
  const upsert = useCallback((item) => {
    if (!item) return
    setContainers((prev) => {
      const without = prev.filter((c) => c.containerNumber !== item.containerNumber)
      return [item, ...without]
    })
  }, [])

  const remove = useCallback((containerNumber) => {
    setContainers((prev) => prev.filter((c) => c.containerNumber !== containerNumber))
  }, [])

  return { containers, loading, error, reload, upsert, remove }
}

// Odpytywanie stanu przejściowego: dopóki status to NEW albo INPROGRESS, pytamy
// WŁASNY endpoint co 30 sekund, maksymalnie przez 15 minut. Potem przestajemy
// i pokazujemy przycisk ręcznego odświeżenia.
//
// To odpytywanie idzie do NASZEJ bazy, nie do ShipsGo. Aktualizacje trafiają do
// bazy webhookiem, więc polling tylko sprawdza, czy coś już przyszło.
const POLL_INTERVAL_MS = 30 * 1000
const POLL_MAX_MS = 15 * 60 * 1000

export function useContainerPolling(container, onUpdate) {
  const [exhausted, setExhausted] = useState(false)
  const startedAt = useRef(null)
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  const containerNumber = container?.containerNumber
  // `fetchState: 'failed'` znaczy, że rekord nigdy nie dostanie realnego
  // statusu z ShipsGo (patrz api/_lib/shipsgoSync.js) - odpytywanie w kółko
  // niczego by nie rozwiązało, tylko marnowało zapytania do naszego API.
  const shouldPoll = !!containerNumber && !container?.archived
    && container?.fetchState !== 'failed' && isPendingStatus(container?.status)

  useEffect(() => {
    if (!shouldPoll) {
      startedAt.current = null
      setExhausted(false)
      return undefined
    }

    // Licznik startuje przy WEJŚCIU w stan przejściowy, nie przy montażu
    // komponentu — dzięki temu przełączanie między kontenerami nie zeruje limitu
    // dla kontenera, który czeka od kwadransa.
    if (startedAt.current === null) startedAt.current = Date.now()

    let cancelled = false
    const timer = setInterval(async () => {
      if (Date.now() - startedAt.current >= POLL_MAX_MS) {
        setExhausted(true)
        clearInterval(timer)
        return
      }
      try {
        const fresh = await getContainer(containerNumber)
        if (!cancelled) onUpdateRef.current?.(fresh)
      } catch {
        // Cisza jest tu celowa: to odpytywanie w tle, a nie akcja użytkownika.
        // Błąd sieci nie powinien wyrzucać komunikatu na ekran, na którym user
        // czeka na dane. Przy trwałym problemie zadziała limit 15 minut.
      }
    }, POLL_INTERVAL_MS)

    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [shouldPoll, containerNumber])

  return { pollingExhausted: exhausted }
}
