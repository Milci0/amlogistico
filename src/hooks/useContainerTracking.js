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

// Odświeżanie w tle na CAŁEJ aplikacji, niezależnie od otwartej zakładki.
// Montowane raz, w AppShell.
//
// Po co, skoro otwarty kontener ma własną pętlę: żeby kontener przestał wisieć
// na „Pobieramy dane" także wtedy, gdy użytkownik wypełnia kreator albo czyta
// Newsy. Zapytanie o listę uruchamia po stronie serwera to samo odświeżenie
// z ShipsGo co wejście na zakładkę (refreshStaleRows), a gdy rejs okaże się
// gotowy, powiadomienie ląduje w dzwonku od razu, nie o 5:00 rano.
//
// Nie dotyczy to kart zamkniętych. Bez wykupionego webhooka nie da się tego
// przeskoczyć i to świadome ograniczenie: dane rejsu są WSPÓLNE, więc każda
// osoba śledząca ten sam kontener odświeża go dla wszystkich pozostałych.
const BACKGROUND_AWAITING_MS = 60 * 1000
const BACKGROUND_IDLE_MS = 5 * 60 * 1000

export function useContainerBackgroundSync(enabled) {
  // Odstęp zależy od tego, czy cokolwiek czeka na dane armatora. Trzymany
  // w stanie, bo ma przełączyć timer, gdy ostatni kontener wyjdzie z oczekiwania.
  const [intervalMs, setIntervalMs] = useState(BACKGROUND_IDLE_MS)
  const awaitingRef = useRef(new Set())

  useEffect(() => {
    if (!enabled) return undefined

    let cancelled = false
    const tick = async () => {
      if (document.hidden) return
      try {
        const list = await listContainers()
        if (cancelled) return

        const awaiting = new Set(list.filter((c) => isPendingStatus(c.status)).map((c) => c.id))
        // Któryś kontener PRZESTAŁ czekać na dane, czyli serwer mógł właśnie
        // utworzyć powiadomienie „gotowy do śledzenia". Prosimy dzwonek
        // o odświeżenie tylko wtedy, zamiast przy każdym cyklu.
        const becameReady = [...awaitingRef.current].some((id) => !awaiting.has(id))
        awaitingRef.current = awaiting
        if (becameReady) window.dispatchEvent(new Event('notifications:changed'))

        setIntervalMs(awaiting.size > 0 ? BACKGROUND_AWAITING_MS : BACKGROUND_IDLE_MS)
      } catch {
        // Cisza celowa: użytkownik jest na zupełnie innej zakładce i nie prosił
        // o tę operację. Komunikat o błędzie byłby tu tylko hałasem.
      }
    }

    tick()
    const timer = setInterval(tick, intervalMs)
    document.addEventListener('visibilitychange', tick)
    return () => {
      cancelled = true
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [enabled, intervalMs])
}

// Automatyczne odświeżanie OTWARTEGO kontenera.
//
// Pyta NASZ endpoint, a ten sam dociąga świeże dane z ShipsGo, gdy minął odstęp
// (patrz refreshIfStale w api/_routes/tracking.js). Wcześniej ta pętla czytała
// wyłącznie z bazy i przez to nigdy niczego nie znajdowała: dane miał wpychać
// webhook, którego nie wykupiono, więc kontener wisiał na „Pobieramy dane".
//
// Nie ma już limitu 15 minut. Armator potrafi zwlekać godzinami, a przerwanie
// odpytywania zostawiało użytkownika przed ekranem, który nigdy się nie zmieni.
//
// Odświeżanie jest CICHE: żadnego spinnera ani migania co minutę. Zmienia się
// sama treść. Kółko pokazuje się wyłącznie po ręcznym kliknięciu „Odśwież".
const AWAITING_INTERVAL_MS = 60 * 1000
const ACTIVE_INTERVAL_MS = 5 * 60 * 1000

export function useContainerPolling(container, onUpdate) {
  const onUpdateRef = useRef(onUpdate)
  onUpdateRef.current = onUpdate

  const containerNumber = container?.containerNumber
  // `fetchState: 'failed'` znaczy, że rekord nigdy nie dostanie realnego statusu
  // z ShipsGo (patrz api/_lib/shipsgoSync.js), a rejs zakończony już się nie
  // zmieni. W obu przypadkach odpytywanie w kółko niczego by nie rozwiązało.
  const enabled = !!containerNumber && !container?.archived && container?.fetchState !== 'failed'
  // Czeka na dane armatora, więc zmiana może przyjść w każdej chwili. Rejs
  // w drodze aktualizuje się kilka razy dziennie, stąd znacznie rzadziej.
  const intervalMs = isPendingStatus(container?.status) ? AWAITING_INTERVAL_MS : ACTIVE_INTERVAL_MS

  useEffect(() => {
    if (!enabled) return undefined

    let cancelled = false
    const tick = async () => {
      // Karta w tle nie ma komu pokazać wyniku, a zapytania i tak by szły.
      if (document.hidden) return
      try {
        const fresh = await getContainer(containerNumber)
        if (!cancelled) onUpdateRef.current?.(fresh)
      } catch {
        // Cisza jest tu celowa: to odświeżanie w tle, a nie akcja użytkownika.
        // Błąd sieci nie powinien wyrzucać komunikatu na ekran, na którym user
        // czeka na dane. Kolejne wywołanie i tak spróbuje ponownie.
      }
    }

    const timer = setInterval(tick, intervalMs)
    // Powrót na kartę pokazuje aktualny stan od razu, a nie po pełnym odstępie.
    document.addEventListener('visibilitychange', tick)
    return () => {
      cancelled = true
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [enabled, containerNumber, intervalMs])
}
