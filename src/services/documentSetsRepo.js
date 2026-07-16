// ── Warstwa repozytorium zestawów dokumentów (DocumentSet) ─────────────────────
//
// JEDYNE miejsce z dostępem do API zestawów. Wcześniej trzymała dane w localStorage;
// od wpięcia backendu woła REST (/api/document-sets) — sygnatury eksportów zostały
// TE SAME (kontrakt), zmieniło się tylko wnętrze i to, że funkcje są teraz `async`.
//
// Założenie audytowe: PDF-ów NIE trzymamy. Trzymamy formData + engineResult i
// regenerujemy na żądanie. Każdy realnie wygenerowany komplet (completed) to
// OSOBNY, nieusuwalny-przez-edycję rekord: completeSet zawsze tworzy nowy id na
// backendzie (POST). Drafty MOGĄ być nadpisywane (saveDraft = upsert po id).
//
// Kształt DocumentSet (zwracany przez backend):
//   { id, userId, status:'draft'|'completed', kind, flowType, totalSteps,
//     derivedFromId, lastStep, maxStepReached, templateVersion,
//     formData, engineResult, selectedDocs, meta, completedAt, createdAt, updatedAt }

import { api } from '../lib/api'
import { TEMPLATE_VERSION } from '../config/templateVersion'

// Powiadomienie o zmianie danych — listy/liczniki w różnych komponentach nasłuchują
// i odświeżają się po zapisie/usunięciu (patrz useDocumentSets).
function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('documentSets:changed'))
  }
}

// Zachowana dla zgodności wstecznej (dawniej rzucana przy braku miejsca w localStorage).
// Backend nie ma limitu quota — klasa zostaje, by ewentualne importy nie padły.
export class StorageQuotaError extends Error {
  constructor() {
    super('Brak miejsca w pamięci.')
    this.name = 'StorageQuotaError'
  }
}

// Buduje ciało żądania wysyłane na backend z częściowego obiektu z UI.
// TEMPLATE_VERSION doklejamy przy KAŻDYM secie (wymóg backendu + audyt wersji).
function toBody(partial, status) {
  return {
    status,
    kind: partial.kind ?? null,
    flowType: partial.flowType || 'have_transport',
    totalSteps: partial.totalSteps ?? 4,
    templateVersion: TEMPLATE_VERSION,
    formData: partial.formData ?? {},
    engineResult: partial.engineResult ?? null,
    selectedDocs: partial.selectedDocs ?? [],
    meta: partial.meta ?? {},
    lastStep: partial.lastStep ?? 1,
    maxStepReached: partial.maxStepReached ?? 1,
    derivedFromId: partial.derivedFromId ?? null,
  }
}

// ── Filtrowanie / sortowanie po stronie klienta (na metadanych z listy) ──────────

function matchesSearch(set, q) {
  const m = set.meta || {}
  const haystack = [
    m.routeFrom,
    m.routeTo,
    `${m.routeFrom || ''}→${m.routeTo || ''}`,
    m.transportMode,
    m.cargoDescription,
    m.transportDate,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
  return haystack.includes(q)
}

function sortSets(sets, sort) {
  const out = [...sets]
  switch (sort) {
    case 'oldest':
      return out.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    case 'name-asc':
      return out.sort((a, b) =>
        (a.meta?.cargoDescription || '').localeCompare(b.meta?.cargoDescription || '')
      )
    case 'last-edited':
      return out.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    case 'newest':
    default:
      return out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }
}

// ── API repozytorium (sygnatury = kontrakt; teraz async) ─────────────────────────

// listSets({ status, search, type, flowType, sort }) -> Promise<DocumentSet[]>
//   Backend zwraca metadane setów usera (bez formData); filtr search/type/flowType
//   i sort robimy lokalnie na metadanych. type = filtr po meta.transportMode.
export async function listSets({ status, search, type, flowType, sort } = {}) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : ''
  const { sets } = await api.get(`/document-sets${qs}`)
  let out = Array.isArray(sets) ? sets : []
  if (flowType) out = out.filter((s) => s.flowType === flowType)
  if (type && type !== 'all') out = out.filter((s) => s.meta?.transportMode === type)
  const q = (search || '').trim().toLowerCase()
  if (q) out = out.filter((s) => matchesSearch(s, q))
  return sortSets(out, sort)
}

// getSet(id) -> Promise<DocumentSet | null>   (pełny set z formData)
export async function getSet(id) {
  try {
    const { set } = await api.get(`/document-sets/${id}`)
    return set
  } catch (err) {
    if (err?.status === 404) return null // nie istnieje / nie należy do usera
    throw err
  }
}

// saveDraft(partial) -> Promise<DocumentSet>   (upsert po id — drafty można nadpisywać)
export async function saveDraft(partial) {
  const body = toBody(partial, 'draft')
  let set
  if (partial.id) {
    try {
      const r = await api.patch(`/document-sets/${partial.id}`, body)
      set = r.set
    } catch (err) {
      // Draft zniknął (np. usunięty na innym urządzeniu) — zakładamy nowy.
      if (err?.status === 404) {
        const r = await api.post('/document-sets', body)
        set = r.set
      } else throw err
    }
  } else {
    const r = await api.post('/document-sets', body)
    set = r.set
  }
  notifyChange()
  return set
}

// completeSet(partial) -> Promise<DocumentSet>
//   ZAWSZE nowy rekord (POST) — nigdy nie nadpisuje istniejącego completed.
//   partial.sourceCompletedId (opcjonalny) → zapisywane jako derivedFromId.
export async function completeSet(partial) {
  // Ignorujemy ewentualny przychodzący id — completed zawsze dostaje świeży (backend).
  const { id: _ignored, sourceCompletedId, ...rest } = partial
  const body = toBody(rest, 'completed')
  body.derivedFromId = sourceCompletedId ?? rest.derivedFromId ?? null
  const { set } = await api.post('/document-sets', body)
  notifyChange()
  return set
}

// deleteSet(id) -> Promise<void>   (usuwa tylko ten wpis; nie rusza rekordów z derivedFromId)
export async function deleteSet(id) {
  try {
    await api.del(`/document-sets/${id}`)
  } catch (err) {
    if (err?.status !== 404) throw err // 404 = już nie ma → traktujemy jak sukces
  }
  notifyChange()
}

// countByStatus() -> Promise<{ draft, completed }>
export async function countByStatus() {
  const { sets } = await api.get('/document-sets')
  const list = Array.isArray(sets) ? sets : []
  return {
    draft: list.filter((s) => s.status === 'draft').length,
    completed: list.filter((s) => s.status === 'completed').length,
  }
}
