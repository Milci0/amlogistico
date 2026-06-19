const PDFDocument = require('pdfkit')

const FIELD_GRAY = '#f5f5f5'
const BORDER = '#cccccc'
const TEXT_DARK = '#1a1a1a'
const TEXT_GRAY = '#666666'
const LABEL_SIZE = 7
const VALUE_SIZE = 9

function drawBox(doc, x, y, w, h, { label, value, labelColor = TEXT_GRAY } = {}) {
  doc.rect(x, y, w, h).stroke(BORDER)
  if (label) {
    doc.fontSize(LABEL_SIZE).fillColor(labelColor).text(label, x + 3, y + 3, { width: w - 6 })
  }
  if (value) {
    doc.fontSize(VALUE_SIZE).fillColor(TEXT_DARK).text(value, x + 3, y + 14, { width: w - 6 })
  }
}

function generateCMR(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 20 })
    const chunks = []

    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const pageW = 555
    const startX = 20
    let y = 20

    // ── Nagłówek ──────────────────────────────────────────────────────────────
    doc.rect(startX, y, pageW, 28).fillAndStroke('#1e3a5f', '#1e3a5f')
    doc.fontSize(14).fillColor('white').text('CMR', startX + 8, y + 7)
    doc.fontSize(8).fillColor('white')
      .text('Międzynarodowy List Przewozowy / International Consignment Note', startX + 50, y + 4)
      .text('Convention relative au contrat de transport international de marchandises par route', startX + 50, y + 14)
    y += 32

    // ── Wiersz 1: Nadawca (pole 1) + Odbiorca (pole 2) ───────────────────────
    const colW = pageW / 2
    const rowH = 55

    drawBox(doc, startX, y, colW, rowH, {
      label: '1. Nadawca (nazwa, adres, kraj) / Sender',
      value: `${data.sender.name}\n${data.sender.address}\n${data.sender.country}`,
    })
    drawBox(doc, startX + colW, y, colW, rowH, {
      label: '2. Odbiorca (nazwa, adres, kraj) / Consignee',
      value: `${data.receiver.name}\n${data.receiver.address}\n${data.receiver.country}`,
    })
    y += rowH

    // ── Wiersz 2: Miejsce dostawy (pole 3) + Data załadunku (pole 4) ─────────
    drawBox(doc, startX, y, colW, 36, {
      label: '3. Miejsce dostawy / Place of Delivery',
      value: `${data.toCity}, ${data.toCountry}`,
    })
    drawBox(doc, startX + colW, y, colW, 36, {
      label: '4. Miejsce i data załadunku / Place and Date of Taking Over',
      value: `${data.fromCity}, ${data.fromCountry}   Data: ${data.loadDate || '—'}`,
    })
    y += 36

    // ── Wiersz 3: Dokumenty załączone (pole 5) ────────────────────────────────
    drawBox(doc, startX, y, pageW, 24, {
      label: '5. Dokumenty załączone / Documents Attached',
      value: 'Faktura handlowa / Commercial Invoice',
    })
    y += 24

    // ── Wiersz 4: Znaki i numery (pole 6) / Liczba opakowań (pole 7) / Rodzaj (pole 8) ──
    const thirdW = pageW / 3
    drawBox(doc, startX, y, thirdW, 32, { label: '6. Znaki i numery / Marks & Numbers', value: '—' })
    drawBox(doc, startX + thirdW, y, thirdW, 32, { label: '7. Liczba opakowań / Number of Packages', value: String(data.cargo.packages || '—') })
    drawBox(doc, startX + thirdW * 2, y, thirdW, 32, { label: '8. Rodzaj opakowania / Method of Packing', value: 'Palety / Pallets' })
    y += 32

    // ── Wiersz 5: Nazwa towaru (pole 9) + Kod HS (pole 10) ───────────────────
    drawBox(doc, startX, y, pageW * 0.6, 32, {
      label: '9. Nazwa towaru / Nature of Goods',
      value: data.cargo.name || '—',
    })
    drawBox(doc, startX + pageW * 0.6, y, pageW * 0.4, 32, {
      label: '10. Kod celny / Statistical Number (HS/CN)',
      value: data.cargo.hsCode || '—',
    })
    y += 32

    // ── Wiersz 6: Waga (pole 11) + Objętość (pole 12) ────────────────────────
    drawBox(doc, startX, y, pageW / 2, 32, {
      label: '11. Waga brutto (kg) / Gross Weight',
      value: data.cargo.weight ? `${data.cargo.weight} kg` : '—',
    })
    drawBox(doc, startX + pageW / 2, y, pageW / 2, 32, {
      label: '12. Objętość (m³) / Volume',
      value: data.cargo.volume ? `${data.cargo.volume} m³` : '—',
    })
    y += 32

    // ── Wiersz 7: Instrukcje nadawcy (pole 13) ────────────────────────────────
    drawBox(doc, startX, y, pageW, 36, {
      label: '13. Instrukcje nadawcy / Sender\'s Instructions',
      value: data.cargo.notes || '—',
    })
    y += 36

    // ── Wiersz 8: Przewoźnik (pole 16) ───────────────────────────────────────
    drawBox(doc, startX, y, pageW, 36, {
      label: '16. Przewoźnik (nazwa, adres, kraj) / Carrier',
      value: '—',
    })
    y += 36

    // ── Wiersz 9: Wystawiono (pole 21) ───────────────────────────────────────
    drawBox(doc, startX, y, pageW / 2, 32, {
      label: '21. Wystawiono w / Place of Issue',
      value: `${data.fromCity}, ${data.fromCountry}`,
    })
    drawBox(doc, startX + pageW / 2, y, pageW / 2, 32, {
      label: 'Data wystawienia / Date of Issue',
      value: new Date().toLocaleDateString('pl-PL'),
    })
    y += 32

    // ── Wiersz 10: Podpisy (pola 22-24) ──────────────────────────────────────
    const sigW = pageW / 3
    const sigH = 50
    drawBox(doc, startX, y, sigW, sigH, { label: '22. Podpis nadawcy / Sender\'s Signature' })
    drawBox(doc, startX + sigW, y, sigW, sigH, { label: '23. Podpis przewoźnika / Carrier\'s Signature' })
    drawBox(doc, startX + sigW * 2, y, sigW, sigH, { label: '24. Podpis odbiorcy / Receiver\'s Signature' })
    y += sigH

    // ── Stopka ────────────────────────────────────────────────────────────────
    doc.fontSize(6).fillColor(TEXT_GRAY)
      .text('Wygenerowano przez AmLogistico | amlogistico.pl', startX, y + 6, { align: 'center', width: pageW })

    doc.end()
  })
}

module.exports = { generateCMR }
