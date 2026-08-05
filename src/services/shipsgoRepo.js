// ── Klient frontendowy dla /api/shipsgo-tracking ────────────────────────────
//
// Token ShipsGo NIGDY nie trafia tutaj — zostaje na backendzie (patrz
// api/_lib/shipsgo.js). Ten plik tylko woła nasze 4 endpointy.
// Numer kontenera dla enable/refresh NIGDY nie jest logowany ani przekazywany
// w żądaniu — backend bierze go sam z zapisanego zestawu. Wyjątek: lookupContainer
// (wolne wyszukiwanie) celowo WYSYŁA numer wpisany przez usera — patrz jego opis niżej.

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

// lookupContainer(containerNumber) -> Promise<{ success, cached, pending?, shipsgo }>
//   Wolne wyszukiwanie w zakładce „Numer kontenera" — DOWOLNY numer, nie musi
//   pochodzić z Twojego zestawu dokumentów. KOSZTUJE KREDYT przy pierwszym
//   sprawdzeniu danego kontenera (backend cache'uje wynik per numer, kolejne
//   sprawdzenia tego samego numeru — także przez innych userów — są darmowe
//   przez godzinę). Wołaj WYŁĄCZNIE na świadomy klik „Sprawdź", nigdy
//   automatycznie przy wpisywaniu. Rzuca ApiError (429/400/403/502/503) —
//   wywołujący łapie i pokazuje komunikat z err.message.
export async function lookupContainer(containerNumber) {
  return api.post('/shipsgo-tracking/lookup', { containerNumber })
}
