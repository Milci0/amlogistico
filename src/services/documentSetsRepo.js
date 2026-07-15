// ── Warstwa repozytorium zestawów dokumentów (DocumentSet) ─────────────────────
//
// JEDYNE miejsce z serializacją / try-catch / dostępem do localStorage. Wymiana
// localStorage → REST API = zmiana wyłącznie tego pliku (sygnatury eksportów są
// kontraktem przyszłego API — patrz komentarze przy funkcjach).
//
// Założenie audytowe: PDF-ów NIE trzymamy. Trzymamy formData + engineResult i
// regenerujemy na żądanie. Każdy realnie wygenerowany komplet (completed) to
// OSOBNY, nieusuwalny-przez-edycję rekord: completeSet zawsze tworzy nowy id.
// Drafty MOGĄ być nadpisywane (saveDraft = upsert), bo nic nie zostało jeszcze
// wygenerowane.
//
// Kształt DocumentSet:
//   { id, userId, flowType, totalSteps, status:'draft'|'completed', derivedFromId,
//     createdAt, updatedAt, completedAt, lastStep, maxStepReached,
//     formData, engineResult, selectedDocs, meta }

import { getCurrentUserId } from './currentUser'

const NS = 'amlogistico:v1'

function storageKey(userId) {
  return `${NS}:${userId}:documentSets`
}

function genId() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `set-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function notifyChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('documentSets:changed'))
  }
}

function readAll() {
  try {
    const raw = localStorage.getItem(storageKey(getCurrentUserId()))
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    // Uszkodzony JSON nie może wywalić całej aplikacji — traktujemy jak brak danych.
    return []
  }
}

function isQuotaError(err) {
  return (
    err &&
    (err.name === 'QuotaExceededError' ||
      err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err.code === 22 ||
      err.code === 1014)
  )
}

// Rzucany przy braku miejsca — strony łapią i pokazują czytelny komunikat w AlertBox.
export class StorageQuotaError extends Error {
  constructor() {
    super(
      'Brak miejsca w pamięci przeglądarki. Usuń część zapisanych zestawów, aby zapisać nowy.'
    )
    this.name = 'StorageQuotaError'
  }
}

function writeAll(sets) {
  try {
    localStorage.setItem(storageKey(getCurrentUserId()), JSON.stringify(sets))
  } catch (err) {
    if (isQuotaError(err)) throw new StorageQuotaError()
    throw err
  }
  notifyChange()
}

// Uzupełnia brakujące pola wartościami domyślnymi. Wartości z `s` mają pierwszeństwo.
function normalize(s) {
  return {
    userId: getCurrentUserId(),
    flowType: 'have_transport',
    totalSteps: 4,
    derivedFromId: null,
    lastStep: 1,
    maxStepReached: 1,
    formData: null,
    engineResult: null,
    selectedDocs: [],
    meta: {},
    completedAt: null,
    ...s,
  }
}

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

// listSets({ status, search, type, flowType, sort }) -> DocumentSet[]
//   type = filtr po meta.transportMode ('road' | 'sea')
export function listSets({ status, search, type, flowType, sort } = {}) {
  let sets = readAll()
  if (status) sets = sets.filter((s) => s.status === status)
  if (flowType) sets = sets.filter((s) => s.flowType === flowType)
  if (type && type !== 'all') sets = sets.filter((s) => s.meta?.transportMode === type)
  const q = (search || '').trim().toLowerCase()
  if (q) sets = sets.filter((s) => matchesSearch(s, q))
  return sortSets(sets, sort)
}

// getSet(id) -> DocumentSet | null
export function getSet(id) {
  return readAll().find((s) => s.id === id) || null
}

// saveDraft(partial) -> DocumentSet   (upsert po id — drafty można nadpisywać)
export function saveDraft(partial) {
  const sets = readAll()
  const now = new Date().toISOString()

  if (partial.id) {
    const i = sets.findIndex((s) => s.id === partial.id)
    if (i !== -1) {
      const updated = { ...sets[i], ...partial, status: 'draft', updatedAt: now }
      sets[i] = updated
      writeAll(sets)
      return updated
    }
  }

  const created = normalize({
    ...partial,
    id: partial.id || genId(),
    status: 'draft',
    createdAt: now,
    updatedAt: now,
    completedAt: null,
  })
  sets.push(created)
  writeAll(sets)
  return created
}

// completeSet(partial) -> DocumentSet
//   ZAWSZE nowy rekord (nowy id) — nigdy nie nadpisuje istniejącego completed.
//   partial.sourceCompletedId (opcjonalny) → zapisywane jako derivedFromId.
export function completeSet(partial) {
  const sets = readAll()
  const now = new Date().toISOString()
  // Ignorujemy ewentualny przychodzący id — completed zawsze dostaje świeży.
  const { id: _ignored, sourceCompletedId, ...rest } = partial

  const created = normalize({
    ...rest,
    id: genId(),
    status: 'completed',
    derivedFromId: sourceCompletedId ?? rest.derivedFromId ?? null,
    createdAt: now,
    updatedAt: now,
    completedAt: now,
  })
  sets.push(created)
  writeAll(sets)
  return created
}

// deleteSet(id) -> void   (usuwa tylko ten wpis; nie rusza rekordów z derivedFromId)
export function deleteSet(id) {
  writeAll(readAll().filter((s) => s.id !== id))
}

// countByStatus() -> { draft, completed }
export function countByStatus() {
  const sets = readAll()
  return {
    draft: sets.filter((s) => s.status === 'draft').length,
    completed: sets.filter((s) => s.status === 'completed').length,
  }
}
