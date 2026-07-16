// ── Jednorazowa migracja starych zestawów z localStorage → backend ──────────────
//
// Przed wpięciem backendu zestawy leżały w localStorage pod kluczem
// `amlogistico:v1:${userId}:documentSets` (oraz `...:local-user:...` dla gościa).
// Po pierwszym udanym zalogowaniu przenosimy te dane na konto usera i czyścimy
// stary klucz. Flaga `amlogistico_migrated:${userId}` zapobiega powtórce.
//
// Uwaga: backend nadaje setom nowe id, więc stare powiązania derivedFromId (label
// „na podstawie zestawu z…") mogą nie rozwiązać się po migracji — to akceptowalna,
// jednorazowa degradacja samej etykiety (dane setów pozostają nienaruszone).

import { api } from '../lib/api'
import { TEMPLATE_VERSION } from '../config/templateVersion'

const NS = 'amlogistico:v1'
const migratedFlag = (userId) => `amlogistico_migrated:${userId}`

function readLocalSets(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Set z localStorage → ciało POST /document-sets (z domyślnymi wartościami).
function toBody(s) {
  return {
    status: s.status === 'completed' ? 'completed' : 'draft',
    kind: s.kind ?? null,
    flowType: s.flowType || 'have_transport',
    totalSteps: s.totalSteps ?? 4,
    templateVersion: s.templateVersion || TEMPLATE_VERSION,
    formData: s.formData ?? {},
    engineResult: s.engineResult ?? null,
    selectedDocs: s.selectedDocs ?? [],
    meta: s.meta ?? {},
    lastStep: s.lastStep ?? 1,
    maxStepReached: s.maxStepReached ?? 1,
    derivedFromId: s.derivedFromId ?? null,
  }
}

// Przenosi lokalne zestawy na konto usera. Bezpieczna do wielokrotnego wywołania:
// przy sukcesie ustawia flagę i kończy się natychmiast przy kolejnych wywołaniach.
export async function migrateLocalSetsToBackend(userId) {
  if (typeof window === 'undefined') return
  if (!userId || userId === 'local-user') return
  const flag = migratedFlag(userId)
  if (localStorage.getItem(flag)) return

  // Dane tego urządzenia: namespace usera + ewentualne dane gościa (local-user).
  const keys = [`${NS}:${userId}:documentSets`, `${NS}:local-user:documentSets`]
  const seen = new Set()
  const sets = []
  for (const k of keys) {
    for (const s of readLocalSets(k)) {
      if (!s) continue
      if (s.id) {
        if (seen.has(s.id)) continue
        seen.add(s.id)
      }
      sets.push(s)
    }
  }

  if (sets.length === 0) {
    localStorage.setItem(flag, '1') // nic do migracji — oznacz jako zrobione
    return
  }

  for (const s of sets) {
    try {
      await api.post('/document-sets', toBody(s))
    } catch (err) {
      // Nie ustawiamy flagi — przy następnym starcie spróbujemy ponownie.
      console.error('Migracja zestawu do backendu nie powiodła się:', err)
      return
    }
  }

  // Sukces: usuń stare klucze i oznacz konto jako zmigrowane.
  for (const k of keys) localStorage.removeItem(k)
  localStorage.setItem(flag, '1')
  window.dispatchEvent(new Event('documentSets:changed'))
}
