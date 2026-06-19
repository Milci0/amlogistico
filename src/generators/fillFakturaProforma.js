import { fillPdf } from './fillPdf'

export async function fillFakturaProforma(data) {
  const fields = [
    { x: 410, y: 65, text: `PF/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}` },
    { x: 410, y: 85, text: new Date().toLocaleDateString('pl-PL') },
    { x: 410, y: 105, text: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL') },
    { x: 35, y: 185, text: data.sender.name },
    { x: 35, y: 197, text: data.sender.address },
    { x: 305, y: 185, text: data.receiver.name },
    { x: 305, y: 197, text: data.receiver.address },
    { x: 35, y: 228, text: `NIP: ${data.sender.vat || ''}` },
    { x: 305, y: 228, text: `NIP: ${data.receiver.vat || ''}` },
    { x: 35, y: 250, text: data.fromCountry },
    { x: 305, y: 250, text: data.toCountry },
    { x: 35, y: 278, text: data.cargo.incoterms || 'DAP' },
    { x: 120, y: 278, text: data.toCity },
    { x: 230, y: 278, text: data.cargo.currency || 'EUR' },
    { x: 35, y: 320, text: data.cargo.name },
    { x: 220, y: 320, text: data.cargo.hsCode || '' },
    { x: 310, y: 320, text: data.cargo.packages ? String(data.cargo.packages) : '' },
    { x: 380, y: 320, text: data.cargo.value ? String(data.cargo.value) : '' },
    { x: 35, y: 500, text: data.cargo.value ? `${data.cargo.value} ${data.cargo.currency || 'EUR'}` : '' },
  ]

  await fillPdf('/templates/eu/common/04_Faktura_Proforma.pdf', fields, 'Faktura_Proforma.pdf')
}
