import { useState, useCallback } from 'react'
import i18n from '../i18n'

import { api } from '../lib/api'

// ── Pobieranie orientacyjnych stawek frachtowych ──────────────────────────────
//
// Wspólny hook dla zakładki „Trasy handlowe" i ewentualnych innych miejsc.
// Freightos wołamy WYŁĄCZNIE przez nasz backend (/api/freight) — klucz API nigdy
// nie trafia do przeglądarki.
//
//   const { loading, result, searched, search, reset } = useFreightRates()
//   search({ origin, destination, loadtype, weight, quantity })
//
// result === null       → przed pierwszym wyszukaniem
// result === { success, source, cached, rates, error } → po odpowiedzi

export default function useFreightRates() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [searched, setSearched] = useState(false)

  const search = useCallback(async (params) => {
    if (!params?.origin || !params?.destination) return

    setLoading(true)
    setSearched(true)
    try {
      const data = await api.post('/freight/quotes', {
        origin:      params.origin,
        destination: params.destination,
        loadtype:    params.loadtype,
        weight:      params.weight,
        quantity:    params.quantity,
      })
      setResult(data)
    } catch (e) {
      // ApiError (400/500) albo brak połączenia — w obu wypadkach pokazujemy stan pusty.
      console.error('[useFreightRates] pobranie stawek nie powiodło się:', e)
      setResult({
        success: false,
        source: 'freightos',
        cached: false,
        rates: [],
        error: i18n.t('freightRatesFailed', { ns: 'errors' }),
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setSearched(false)
  }, [])

  return { loading, result, searched, search, reset }
}
