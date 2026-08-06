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

// Wszystkie trzy funkcje niżej zwracają ten sam kształt:
//   { success, status, shipsgo, createdAt, lastPolledAt }
// gdzie `status` to:
//   'ready'   — `shipsgo` niesie dane do wyświetlenia
//   'pending' — śledzenie istnieje w ShipsGo, ale dane jeszcze się nie pojawiły;
//               wróć później, kolejne sprawdzenie TEGO SAMEGO numeru nie kosztuje
//   'failed'  — ShipsGo trwale odrzuciło ten numer (nie ponawiamy automatycznie)

// enableTracking(documentSetId)
//   Może kosztować kredyt, ale TYLKO gdy tego kontenera nie ma jeszcze we
//   wspólnym rejestrze (np. sprawdzonego wcześniej wyszukiwarką). Wołaj
//   WYŁĄCZNIE na świadomy klik użytkownika, nigdy automatycznie.
export async function enableTracking(documentSetId) {
  return api.post(`/shipsgo-tracking/${documentSetId}/enable`)
}

// refreshTracking(documentSetId)
//   NIE kosztuje kredytu i nigdy nie tworzy nowego śledzenia — jeśli kontener
//   nie jest jeszcze śledzony, backend zwraca 400 zamiast płatnie go zakładać.
export async function refreshTracking(documentSetId) {
  return api.get(`/shipsgo-tracking/${documentSetId}/refresh`)
}

// lookupContainer(containerNumber)
//   Wolne wyszukiwanie w zakładce „Numer kontenera" — DOWOLNY numer, nie musi
//   pochodzić z Twojego zestawu dokumentów. Kosztuje kredyt tylko przy PIERWSZYM
//   sprawdzeniu danego kontenera (trwały rejestr w bazie, wspólny dla wszystkich
//   userów i obu ścieżek w aplikacji). Wołaj WYŁĄCZNIE na świadomy klik
//   „Sprawdź". Rzuca ApiError (429/400/403/502/503) — wywołujący łapie
//   i pokazuje komunikat z err.message.
export async function lookupContainer(containerNumber) {
  return api.post('/shipsgo-tracking/lookup', { containerNumber })
}
