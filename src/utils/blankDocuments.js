// ── Pobieranie pustych formularzy PDF ───────────────────────────────────────────
// Współdzielone przez BlankTemplatesPage (pierwsze pobranie) i HistoryPage
// (ponowne pobranie z historii dokumentów) — JEDNO miejsce z nazewnictwem plików.

import JSZip from 'jszip'
import { saveAs } from 'file-saver'

// Prefiks nazwy pliku dla pustych formularzy — odróżnia je od dokumentów
// wygenerowanych z danymi („Wypelniony_”, patrz src/generators/documents.js).
const BLANK_PREFIX = 'Pusty_'

export function blankFilename(namePl) {
  const safe = (namePl || 'Dokument').replace(/[\\/:*?"<>|]/g, '').trim()
  return `${BLANK_PREFIX}${safe}.pdf`
}

// Wymusza pobranie pliku pod przyjazną nazwą zamiast otwierania go w nowej karcie.
export function downloadBlankFile(path, namePl) {
  const a = document.createElement('a')
  a.href = path
  a.download = blankFilename(namePl)
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// docs: [{ path, name }] — paczkuje wszystkie do jednego ZIP-a pod przyjaznymi nazwami.
export async function downloadBlankZip(docs, zipName) {
  const zip = new JSZip()
  await Promise.all(
    docs.map(async (doc) => {
      const res = await fetch(doc.path)
      if (!res.ok) throw new Error(`Nie udało się pobrać ${doc.path} (${res.status})`)
      const blob = await res.blob()
      zip.file(blankFilename(doc.name), blob)
    })
  )
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, zipName)
}
