import { PDFDocument, rgb, StandardFonts } from 'pdf-lib'

async function loadTemplate(templatePath) {
  const response = await fetch(templatePath)
  if (!response.ok) throw new Error(`Nie znaleziono szablonu: ${templatePath}`)
  const bytes = await response.arrayBuffer()
  const pdfDoc = await PDFDocument.load(bytes)
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const page = pdfDoc.getPages()[0]
  const { width, height } = page.getSize()
  return { pdfDoc, font, page, width, height }
}

function download(pdfDoc, filename) {
  pdfDoc.save().then(bytes => {
    const blob = new Blob([bytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    setTimeout(() => URL.revokeObjectURL(url), 10000)
  })
}

/**
 * Rysuje siatkę co 50pt na szablonie PDF.
 * Otwórz wynikowy plik, żeby odczytać dokładne współrzędne każdego pola.
 */
export async function generateGrid(templatePath) {
  const { pdfDoc, font, page, width, height } = await loadTemplate(templatePath)

  const lineColor = rgb(0.85, 0.1, 0.1)
  const labelColor = rgb(0.7, 0, 0)
  const step = 50

  // Linie poziome — stałe y od góry
  for (let y = 0; y <= height; y += step) {
    const pdfY = height - y
    page.drawLine({
      start: { x: 0, y: pdfY },
      end: { x: width, y: pdfY },
      thickness: 0.4,
      color: lineColor,
      opacity: 0.45,
    })
    // Etykieta y po lewej
    page.drawText(String(y), {
      x: 2, y: pdfY + 2,
      size: 5, font, color: labelColor,
    })
  }

  // Linie pionowe — stałe x od lewej
  for (let x = step; x < width; x += step) {
    page.drawLine({
      start: { x, y: 0 },
      end: { x, y: height },
      thickness: 0.4,
      color: lineColor,
      opacity: 0.45,
    })
    // Etykieta x na górze
    page.drawText(String(x), {
      x: x + 1, y: height - 9,
      size: 5, font, color: labelColor,
    })
  }

  const name = templatePath.split('/').pop()
  download(pdfDoc, `GRID_${name}`)
}

/**
 * Umieszcza celownik (krzyżyk) i tekst testowy na podanych współrzędnych.
 * y=0 to góra strony (ta sama konwencja co w fillPdf.js).
 */
export async function probePosition(templatePath, x, y, text = 'TEST', size = 9) {
  const { pdfDoc, font, page, height } = await loadTemplate(templatePath)

  const crossColor = rgb(1, 0, 0)
  const pdfY = height - y
  const arm = 8

  // Celownik — krzyżyk
  page.drawLine({ start: { x: x - arm, y: pdfY }, end: { x: x + arm, y: pdfY }, thickness: 0.8, color: crossColor })
  page.drawLine({ start: { x, y: pdfY - arm }, end: { x, y: pdfY + arm }, thickness: 0.8, color: crossColor })

  // Tekst testowy dokładnie w miejscu x, y
  page.drawText(text, { x, y: pdfY, size, font, color: rgb(0.8, 0, 0) })

  // Etykieta z współrzędnymi
  page.drawText(`(x=${x}, y=${y})`, {
    x: x + arm + 2, y: pdfY + 2,
    size: 6, font, color: crossColor,
  })

  const name = templatePath.split('/').pop()
  download(pdfDoc, `PROBE_${name}`)
}
