import { useCallback, useEffect, useState } from 'react'
import { deleteSet } from '../services/documentSetsRepo'

// Lekki hook wokół repozytorium zestawów. Nie trzyma danych — udostępnia `version`
// (bump przy każdej zmianie w localStorage) do wykorzystania w useMemo na stronach,
// oraz `remove`. Nasłuchuje 'documentSets:changed', więc liczniki i listy w różnych
// komponentach (np. Sidebar) aktualizują się na żywo po zapisie/usunięciu.
export default function useDocumentSets() {
  const [version, setVersion] = useState(0)
  const refresh = useCallback(() => setVersion((v) => v + 1), [])

  useEffect(() => {
    const handler = () => setVersion((v) => v + 1)
    window.addEventListener('documentSets:changed', handler)
    return () => window.removeEventListener('documentSets:changed', handler)
  }, [])

  const remove = useCallback((id) => {
    deleteSet(id)
    // notifyChange w repo wyemituje event → refresh nastąpi automatycznie.
  }, [])

  return { version, refresh, remove }
}
