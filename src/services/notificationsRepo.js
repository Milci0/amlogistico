// ── Warstwa repozytorium powiadomień (Notification) ────────────────────────────
//
// JEDYNE miejsce z dostępem do /api/notifications. Wzorzec 1:1 z documentSetsRepo:
// woła api.* (cookie leci automatycznie), funkcje async, po każdej mutacji emituje
// 'notifications:changed' — dzwonek nasłuchuje i się odświeża.
//
// Cały stan powiadomień jest własnością konta i leży w bazie. Frontend niczego tu
// nie decyduje i nic nie zapisuje w localStorage: czyta listę i woła endpointy akcji.

import { api } from '../lib/api'

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('notifications:changed'))
  }
}

// refreshNotifications() -> void
//   Wymusza ponowne pobranie listy bez własnej mutacji. Woła to ProfilePage po
//   zapisie danych firmy: GET uruchamia synchronizację po stronie serwera, więc
//   aktywna zachęta zamyka się od razu, bez przeładowania strony.
export function refreshNotifications() {
  notifyChange()
}

// listNotifications() -> Promise<{ items, unreadCount }>
//   Zawartość dzwonka: nieprzeczytane I przeczytane, oba źródła, najnowsze pierwsze.
//   Dzwonek jest jedyną historią powiadomień, osobnej podstrony nie ma.
export async function listNotifications() {
  const { notifications, unreadCount } = await api.get('/notifications')
  const items = Array.isArray(notifications) ? notifications : []
  return { items, unreadCount: unreadCount ?? items.filter((n) => !n.readAt).length }
}

// markRead(id) -> Promise<void>   (klik w powiadomienie)
export async function markRead(id) {
  await api.patch(`/notifications/${id}/read`)
  notifyChange()
}

// markReadByObject(kind, objectId) -> Promise<number>   (ile oznaczono)
//   Zamyka powiadomienia dotyczące konkretnego obiektu, gdy użytkownik i tak
//   właśnie na niego patrzy. Woła to widok kontenera przy wejściu w szczegóły,
//   niezależnie od tego, czy przyszedł z dzwonka, czy z listy. Cichy przy błędzie:
//   to efekt uboczny nawigacji, a nie akcja, o której trzeba meldować.
export async function markReadByObject(kind, objectId) {
  try {
    const { count } = await api.post('/notifications/read-by-object', { kind, objectId })
    if (count > 0) notifyChange()
    return count ?? 0
  } catch {
    return 0
  }
}

// markAllRead() -> Promise<number>  (ile oznaczono)
export async function markAllRead() {
  const { count } = await api.post('/notifications/read-all')
  notifyChange()
  return count ?? 0
}

// deleteNotification(id) -> Promise<void>   („X" na pojedynczym powiadomieniu)
//   Kasuje rekord NA STAŁE. Dla zachęty „Uzupełnij dane firmy" serwer zapisuje przy
//   okazji 7-dniowe odroczenie na koncie, więc nie wraca od razu po skasowaniu.
export async function deleteNotification(id) {
  await api.del(`/notifications/${id}`)
  notifyChange()
}

// sendNotification(payload) -> Promise<{ ok, count }>   (tylko admin)
// payload: { target:'user'|'all', email?, type, title, body, ctaLabel?, ctaUrl? }
export async function sendNotification(payload) {
  const res = await api.post('/notifications', payload)
  notifyChange()
  return res
}
