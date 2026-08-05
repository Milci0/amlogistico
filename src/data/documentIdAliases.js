// src/data/documentIdAliases.js
//
// Most miedzy DWIEMA przestrzeniami identyfikatorow dokumentow, ktore wspolistnieja
// w tabeli document_sets:
//
//   STARA  — klucze rejestru kreatora (src/generators/documents.js): 'cmr', 'bol', ...
//            Zapisane w `selected_docs` i `engine_result.docs[].key` KAZDEGO zestawu
//            utworzonego przed unifikacja silnika (2026-08-03).
//   NOWA   — identyfikatory katalogu (src/data/documentCatalog.js): '01_CMR', '05_BL', ...
//            Uzywane przez documentEngine.js, „Puste szablony" i wszystkie nowe zestawy.
//
// DLACZEGO TO JEST KRYTYCZNE: „Pobierz" w Historii filtruje liste dokumentow przez
// zapisane `selectedDocs`. Gdyby silnik zaczal zwracac '01_CMR', a w bazie leżałoby
// 'cmr', filtr dalby PUSTA liste — a `generateDocuments` zwraca wtedy { failed: [] },
// wiec interfejs pokazalby sukces i nie pobral ani jednego pliku. Blad po cichu,
// na wszystkich istniejacych zestawach naraz.
//
// Alias MUSI byc zastosowany wszedzie, gdzie zapisane id spotyka sie z wynikiem
// silnika. Trzy takie miejsca (potwierdzone na kodzie):
//   1. generateDocuments()          — filtr po `selectedDocs` (obsluguje HistoryPage
//                                     .handleDownload ORAZ .handleDownloadOne, do ktorego
//                                     prowadzi DocumentCard.handleDocDownload)
//   2. Step4.docsChanged            — porownanie sygnatury z `originalEngineResult`
//   3. WizardContext                — `selectedDocs` odziedziczone w trybie edit

// Klucz rejestru kreatora -> identyfikator katalogu. Dziewiec pozycji: tyle liczyl
// caly rejestr kreatora przed unifikacja.
const LEGACY_TO_CATALOG = {
  cmr: '01_CMR',
  bol: '05_BL',
  packing: '02_PackingList',
  faktura: '03_Invoice',
  proforma: '04_Proforma',
  zlecenie: '09_Zlecenie',
  pod: '10_POD',
  seawaybill: '26_SeaWaybill',
  multimodal: '28_MTD',
}

const CATALOG_TO_LEGACY = Object.fromEntries(
  Object.entries(LEGACY_TO_CATALOG).map(([legacy, catalog]) => [catalog, legacy])
)

export { LEGACY_TO_CATALOG, CATALOG_TO_LEGACY }

// Stary klucz -> identyfikator katalogu. Identyfikator katalogu i cokolwiek
// nieznanego przechodzi bez zmian (funkcja jest idempotentna).
export function toCatalogId(id) {
  if (typeof id !== 'string') return id
  return LEGACY_TO_CATALOG[id] || id
}

// Identyfikator katalogu -> stary klucz, albo null gdy dokument nie ma starego
// odpowiednika (111 ze 120 pozycji katalogu nigdy nie bylo w rejestrze kreatora).
export function toLegacyId(id) {
  if (typeof id !== 'string') return null
  return CATALOG_TO_LEGACY[id] || null
}

// Tablica identyfikatorow (np. selectedDocs z bazy) -> identyfikatory katalogu,
// bez duplikatow i bez wartosci pustych.
export function toCatalogIds(ids) {
  if (!Array.isArray(ids)) return []
  const out = []
  for (const id of ids) {
    const mapped = toCatalogId(id)
    if (mapped && !out.includes(mapped)) out.push(mapped)
  }
  return out
}

// Czy tablica identyfikatorow pochodzi jeszcze ze starej przestrzeni (do diagnostyki
// i raportu migracji — nie zmienia zachowania).
export function hasLegacyIds(ids) {
  return Array.isArray(ids) && ids.some((id) => typeof id === 'string' && !!LEGACY_TO_CATALOG[id])
}
