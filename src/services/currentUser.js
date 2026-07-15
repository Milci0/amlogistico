// Mostek userId między AuthContext (drzewo React) a warstwą repozytorium (zwykłe
// moduły). documentSetsRepo namespace'uje dane po userId, a nie może użyć hooka —
// dlatego AuthContext ustawia tu aktualne id, a repo je odczytuje.
//
// Brak zalogowanego użytkownika → 'local-user' (dane trzymane lokalnie do czasu
// wpięcia backendu). Zmiana userId emituje 'documentSets:changed', by listy i
// liczniki odświeżyły się na dane właściwego konta.

let currentUserId = 'local-user'

export function getCurrentUserId() {
  return currentUserId
}

export function setCurrentUserId(id) {
  const next = id || 'local-user'
  if (next === currentUserId) return
  currentUserId = next
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('documentSets:changed'))
  }
}
