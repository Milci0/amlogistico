// ── Warstwa repozytorium powiadomień (Notification) ────────────────────────────
//
// JEDYNE miejsce z dostępem do /api/notifications. Wzorzec 1:1 z documentSetsRepo:
// woła api.* (cookie leci automatycznie), funkcje async, po każdej mutacji emituje
// 'notifications:changed' — listy/liczniki (dzwonek) nasłuchują i się odświeżają.

import { api } from '../lib/api'

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('notifications:changed'))
  }
}

// listNotifications() -> Promise<Notification[]>  (moje, najnowsze pierwsze)
export async function listNotifications() {
  const { notifications } = await api.get('/notifications')
  return Array.isArray(notifications) ? notifications : []
}

// markRead(id) -> Promise<void>
export async function markRead(id) {
  await api.patch(`/notifications/${id}/read`)
  notifyChange()
}

// markAllRead() -> Promise<number>  (ile oznaczono)
export async function markAllRead() {
  const { count } = await api.post('/notifications/read-all')
  notifyChange()
  return count ?? 0
}

// deleteNotification(id) -> Promise<void>
export async function deleteNotification(id) {
  try {
    await api.del(`/notifications/${id}`)
  } catch (err) {
    if (err?.status !== 404) throw err // 404 = już nie ma → traktujemy jak sukces
  }
  notifyChange()
}

// sendNotification(payload) -> Promise<{ ok, count }>   (tylko admin)
// payload: { target:'user'|'all', email?, type, title, body, ctaLabel?, ctaUrl? }
export async function sendNotification(payload) {
  const res = await api.post('/notifications', payload)
  notifyChange()
  return res
}
