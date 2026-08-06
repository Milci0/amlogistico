// ── Klient frontendowy dla /api/tracking ────────────────────────────────────
//
// Token ShipsGo NIGDY nie trafia tutaj — zostaje na backendzie (patrz
// api/_lib/shipsgo.js). Ten plik woła wyłącznie NASZE endpointy.
//
// Podział kosztowy, ważny przy czytaniu tego pliku:
//   addContainer   – JEDYNA funkcja, która może zużyć kredyt ShipsGo, i tylko
//                    przy pierwszym sprawdzeniu danego rejsu. Wołaj wyłącznie
//                    na świadomy klik „Sprawdź".
//   listContainers – czyta z naszej bazy, zero kontaktu z ShipsGo
//   getContainer   – jak wyżej; to jest endpoint, który odpytuje polling
//   refreshContainer – GET do ShipsGo, BEZ kredytu, cooldown 5 minut na rejs
//   removeContainer  – ukrywa wpis u nas, NIE usuwa śledzenia w ShipsGo

import { api } from '../lib/api'

// addContainer(containerNumber, { carrier, startNewVoyage })
//   Zwraca { success, container, archived?, created? }:
//     archived:true – numer należy do ZAKOŃCZONEGO rejsu; dane są archiwalne,
//                     nowe śledzenie NIE powstało (wymaga startNewVoyage:true)
//     created:true  – powstało nowe śledzenie w ShipsGo (zużyty kredyt)
//   Rzuca ApiError (400/402/403/429/503) — wywołujący pokazuje err.message.
export async function addContainer(containerNumber, options = {}) {
  const body = { containerNumber }
  if (options.carrier) body.carrier = options.carrier
  if (options.startNewVoyage) body.startNewVoyage = true
  return api.post('/tracking/containers', body)
}

export async function listContainers() {
  const { containers } = await api.get('/tracking/containers')
  return containers || []
}

export async function getContainer(containerNumber) {
  const { container } = await api.get(`/tracking/containers/${encodeURIComponent(containerNumber)}`)
  return container
}

export async function refreshContainer(containerNumber) {
  const { container } = await api.post(`/tracking/containers/${encodeURIComponent(containerNumber)}/refresh`)
  return container
}

export async function removeContainer(containerNumber) {
  return api.del(`/tracking/containers/${encodeURIComponent(containerNumber)}`)
}

// Lista przewoźników do ręcznego wskazania w stanie „Bez śledzenia".
export async function listCarriers() {
  const { carriers } = await api.get('/tracking/carriers')
  return carriers || []
}
