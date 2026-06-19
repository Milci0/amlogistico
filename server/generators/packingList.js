const PDFDocument = require('pdfkit')

const BORDER = '#cccccc'
const TEXT_DARK = '#1a1a1a'
const TEXT_GRAY = '#666666'

function generatePackingList(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 40 })
    const chunks = []

    doc.on('data', chunk => chunks.push(chunk))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const pageW = 515

    // Nagłówek
    doc.rect(40, 40, pageW, 32).fillAndStroke('#1e3a5f', '#1e3a5f')
    doc.fontSize(14).fillColor('white').text('PACKING LIST', 48, 49)
    doc.fontSize(8).fillColor('white').text(`Data / Date: ${new Date().toLocaleDateString('pl-PL')}`, 350, 52)
    let y = 82

    // Dane nadawcy i odbiorcy
    const halfW = pageW / 2 - 5
    doc.rect(40, y, halfW, 80).stroke(BORDER)
    doc.fontSize(7).fillColor(TEXT_GRAY).text('NADAWCA / EXPORTER', 45, y + 5)
    doc.fontSize(9).fillColor(TEXT_DARK)
      .text(data.sender.name, 45, y + 16)
      .text(data.sender.address || '', 45, y + 28)
      .text(`VAT: ${data.sender.vat || '—'}`, 45, y + 40)

    doc.rect(40 + halfW + 10, y, halfW, 80).stroke(BORDER)
    doc.fontSize(7).fillColor(TEXT_GRAY).text('ODBIORCA / CONSIGNEE', 55 + halfW, y + 5)
    doc.fontSize(9).fillColor(TEXT_DARK)
      .text(data.receiver.name, 55 + halfW, y + 16)
      .text(data.receiver.address || '', 55 + halfW, y + 28)
      .text(`VAT: ${data.receiver.vat || '—'}`, 55 + halfW, y + 40)
    y += 90

    // Trasa
    doc.fontSize(8).fillColor(TEXT_GRAY).text('TRASA / ROUTE:', 40, y)
    doc.fontSize(9).fillColor(TEXT_DARK).text(`${data.fromCountry} → ${data.toCountry}`, 120, y)
    y += 20

    // Tabela towarów
    const cols = [200, 60, 60, 70, 70, 55]
    const headers = ['Opis towaru / Description', 'Ilość / Qty', 'Waga netto', 'Waga brutto', 'Objętość', 'Wartość']
    let x = 40

    doc.rect(40, y, pageW, 18).fillAndStroke('#e8edf5', BORDER)
    headers.forEach((h, i) => {
      doc.fontSize(7).fillColor(TEXT_DARK).text(h, x + 3, y + 5, { width: cols[i] - 6 })
      x += cols[i]
    })
    y += 18

    x = 40
    const rowH = 22
    doc.rect(40, y, pageW, rowH).stroke(BORDER)
    const rowData = [
      data.cargo.name || '—',
      String(data.cargo.packages || '—'),
      data.cargo.weight ? `${data.cargo.weight} kg` : '—',
      data.cargo.weight ? `${data.cargo.weight} kg` : '—',
      data.cargo.volume ? `${data.cargo.volume} m³` : '—',
      data.cargo.value ? `${data.cargo.value} ${data.cargo.currency}` : '—',
    ]
    rowData.forEach((val, i) => {
      doc.fontSize(8).fillColor(TEXT_DARK).text(val, x + 3, y + 7, { width: cols[i] - 6 })
      x += cols[i]
    })
    y += rowH + 10

    // Podsumowanie
    doc.rect(40, y, pageW, 28).stroke(BORDER)
    doc.fontSize(7).fillColor(TEXT_GRAY).text('PODSUMOWANIE / SUMMARY', 45, y + 4)
    doc.fontSize(8).fillColor(TEXT_DARK)
      .text(`Łączna liczba paczek: ${data.cargo.packages || '—'}`, 45, y + 14)
      .text(`Łączna waga: ${data.cargo.weight ? data.cargo.weight + ' kg' : '—'}`, 200, y + 14)
      .text(`Łączna objętość: ${data.cargo.volume ? data.cargo.volume + ' m³' : '—'}`, 350, y + 14)
    y += 40

    // Podpis
    doc.rect(40, y, pageW / 2, 50).stroke(BORDER)
    doc.fontSize(7).fillColor(TEXT_GRAY).text('Podpis i pieczęć nadawcy / Sender\'s Signature & Stamp', 45, y + 5)

    doc.fontSize(6).fillColor(TEXT_GRAY)
      .text('Wygenerowano przez AmLogistico | amlogistico.pl', 40, y + 60, { align: 'center', width: pageW })

    doc.end()
  })
}

module.exports = { generatePackingList }
