import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

/**
 * Wypełnia istniejący szablon PDF danymi i zwraca URL do pobrania.
 *
 * @param {string} templatePath  - ścieżka do pliku w public/, np. '/templates/eu/land/cmr.pdf'
 * @param {Array}  fields        - lista pól: [{ x, y, text, size?, color? }, ...]
 * @param {string} filename      - nazwa pliku do pobrania, np. 'CMR.pdf'
 */
export async function fillPdf(templatePath, fields, filename) {
  const response = await fetch(templatePath)
  if (!response.ok) throw new Error(`Nie znaleziono szablonu: ${templatePath}`)

  const templateBytes = await response.arrayBuffer()
  const pdfDoc = await PDFDocument.load(templateBytes)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

  const pages = pdfDoc.getPages()
  const page = pages[0]
  const { height } = page.getSize()

  for (const field of fields) {
    const { x, y, text, size = 9, color = rgb(0, 0, 0) } = field
    if (!text && text !== 0) continue
    // pdf-lib używa układu od dołu strony, dlatego odwracamy y
    page.drawText(String(text), {
      x,
      y: height - y,
      size,
      font,
      color,
    })
  }

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()

  setTimeout(() => URL.revokeObjectURL(url), 10000)
}
