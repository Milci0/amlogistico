// ── Klient frontendowy dla /api/shipsgo-tracking ────────────────────────────
//
// Token ShipsGo NIGDY nie trafia tutaj — zostaje na backendzie (patrz
// api/_lib/shipsgo.js). Ten plik tylko woła nasze 3 endpointy.
// Numer kontenera NIGDY nie jest logowany ani przekazywany w żądaniu —
// backend bierze go sam z zapisanego zestawu (patrz api/_routes/shipsgoTracking.js).

import { api } from '../lib/api'

// getShipsgoStatus() -> Promise<boolean>
//   Czy integracja jest włączona (SHIPSGO_ENABLED + token ustawione na backendzie).
//   Bez auth, bezpieczne do wywołania zawsze — steruje WYŁĄCZNIE widocznością
//   przycisku „Włącz śledzenie" we froncie.
export async function getShipsgoStatus() {
  try {
    const { enabled } = await api.get('/shipsgo-tracking/status')
    return !!enabled
  } catch {
    return false
  }
}

// enableTracking(documentSetId) -> Promise<{ success, alreadyEnabled, shipsgo }>
//   KOSZTUJE KREDYT po stronie ShipsGo (poza duplikatem) — wołaj WYŁĄCZNIE
//   na świadomy klik użytkownika, nigdy automatycznie.
export async function enableTracking(documentSetId) {
  return api.post(`/shipsgo-tracking/${documentSetId}/enable`)
}

// refreshTracking(documentSetId) -> Promise<{ success, fresh, shipsgo }>
//   NIE kosztuje kredytu. `fresh:false` = backend oddał cache bez odpytywania
//   ShipsGo (ich dane i tak nie zdążyły się zmienić — patrz CHECKED_AT_FRESH_MS).
export async function refreshTracking(documentSetId) {
  return api.get(`/shipsgo-tracking/${documentSetId}/refresh`)
}
