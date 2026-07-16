// ── Pobieranie pustych formularzy PDF ───────────────────────────────────────────
// Współdzielone przez BlankTemplatesPage (pierwsze pobranie) i HistoryPage
// (ponowne pobranie z historii dokumentów) — JEDNO miejsce z nazewnictwem plików.
//
// Preferowane źródło: generowanie przez ten sam silnik JSX co dokumenty wypełnione
// (generatePdf + pusty obiekt data) — patrz src/data/blankTemplateMap.js. Dla
// dokumentów bez jeszcze skonwertowanego szablonu — fallback na statyczny PDF
// z /public/templates (documentCatalog.js).

import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { generatePdf } from '../generators/generatePdf'
import { getBlankTemplate } from '../data/blankTemplateMap'
import { documentCatalog } from '../data/documentCatalog'

// Prefiks nazwy pliku dla pustych formularzy — odróżnia je od dokumentów
// wygenerowanych z danymi („Wypelniony_”, patrz src/generators/documents.js).
const BLANK_PREFIX = 'Pusty_'

export function blankFilename(namePl) {
  const safe = (namePl || 'Dokument').replace(/[\\/:*?"<>|]/g, '').trim()
  return `${BLANK_PREFIX}${safe}.pdf`
}

// Czy dla danego id z documentCatalog istnieje jakiekolwiek źródło pustego PDF-a
// (szablon JSX albo statyczny plik).
export function hasBlankSource(docKey) {
  return !!getBlankTemplate(docKey) || !!documentCatalog[docKey]?.path
}

async function fetchStaticBlob(docKey) {
  const path = documentCatalog[docKey]?.path
  if (!path) throw new Error(`Brak źródła dla dokumentu ${docKey}`)
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Nie udało się pobrać ${path} (${res.status})`)
  return res.blob()
}

// docKey = klucz z documentCatalog (np. "01_CMR"). Wymusza pobranie pliku pod
// przyjazną nazwą zamiast otwierania go w nowej karcie.
export async function downloadBlankDocument(docKey, namePl) {
  const filename = blankFilename(namePl)
  const tpl = getBlankTemplate(docKey)
  if (tpl) {
    await generatePdf(tpl.template, {}, filename)
    return
  }
  const path = documentCatalog[docKey]?.path
  if (!path) throw new Error(`Brak źródła dla dokumentu ${docKey}`)
  const a = document.createElement('a')
  a.href = path
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
}

// docs: [{ key, name }] — paczkuje wszystkie do jednego ZIP-a pod przyjaznymi nazwami.
export async function downloadBlankZip(docs, zipName) {
  const zip = new JSZip()
  await Promise.all(
    docs.map(async (doc) => {
      const filename = blankFilename(doc.name)
      const tpl = getBlankTemplate(doc.key)
      const blob = tpl
        ? await generatePdf(tpl.template, {}, filename, { download: false })
        : await fetchStaticBlob(doc.key)
      zip.file(filename, blob)
    })
  )
  const content = await zip.generateAsync({ type: 'blob' })
  saveAs(content, zipName)
}
