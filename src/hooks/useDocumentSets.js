import { useCallback, useEffect, useState } from 'react'
import { deleteSet, listSets, countByStatus } from '../services/documentSetsRepo'

// Lekki hook wokół repozytorium zestawów. Udostępnia `version` (bump przy każdej
// zmianie danych) do wymuszania refetchu, oraz `remove`. Nasłuchuje
// 'documentSets:changed', więc liczniki i listy w różnych komponentach
// (np. Sidebar) aktualizują się po zapisie/usunięciu — także po zmianie usera.
export default function useDocumentSets() {
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    const handler = () => setVersion((v) => v + 1)
    window.addEventListener('documentSets:changed', handler)
    return () => window.removeEventListener('documentSets:changed', handler)
  }, [])

  // remove jest teraz async (fetch DELETE). Zwracamy Promise, by strona mogła
  // złapać błąd; notifyChange w repo i tak wyemituje event → refetch list.
  const remove = useCallback((id) => deleteSet(id), [])

  return { version, refresh, remove }
}

// Asynchroniczne pobranie listy setów z obsługą loading/error. Refetch przy
// zmianie parametrów oraz po każdym 'documentSets:changed' (przez `version`).
export function useDocumentSetList({ status, search, type, sort } = {}) {
  const { version } = useDocumentSets()
  const [sets, setSets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    listSets({ status, search, type, sort })
      .then((r) => { if (active) setSets(r) })
      .catch((e) => { if (active) { setError(e); setSets([]) } })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [version, status, search, type, sort])

  return { sets, loading, error }
}

// Licznik draftów do Sidebara (badge). 0 gdy błąd/ładowanie.
export function useDraftCount() {
  const { version } = useDocumentSets()
  const [count, setCount] = useState(0)

  useEffect(() => {
    let active = true
    countByStatus()
      .then((c) => { if (active) setCount(c.draft) })
      .catch(() => { if (active) setCount(0) })
    return () => { active = false }
  }, [version])

  return count
}
