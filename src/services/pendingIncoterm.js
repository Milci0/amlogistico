// Jednorazowy „bilet" niosący wybrany Incoterm ze strony /incoterms do świeżo
// otwieranego kreatora (przycisk „Użyj w nowym zleceniu" → /wybor-sciezki →
// /new-document?path=...). sessionStorage, bo wartość ma żyć tylko do najbliższego
// utworzenia kreatora w tej karcie, nie między sesjami.
const KEY = 'amlogistico:v1:pendingIncoterm'

export function setPendingIncoterm(code) {
  try {
    sessionStorage.setItem(KEY, code)
  } catch {
    /* best-effort */
  }
}

export function peekPendingIncoterm() {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function clearPendingIncoterm() {
  try {
    sessionStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
