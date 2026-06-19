import { fillPdf } from './fillPdf'

export async function fillFakturaHandlowa(data) {
  const fields = [
    { x: 35, y: 110, text: data.sender.name },
    { x: 35, y: 122, text: data.sender.address },
    { x: 305, y: 110, text: data.receiver.name },
    { x: 305, y: 122, text: data.receiver.address },
    { x: 35, y: 152, text: `NIP: ${data.sender.vat || ''}` },
    { x: 305, y: 152, text: `NIP: ${data.receiver.vat || ''}` },
    { x: 35, y: 192, text: data.cargo.incoterms || 'DAP' },
    { x: 100, y: 192, text: data.toCity },
    { x: 240, y: 192, text: data.cargo.currency || 'EUR' },
    { x: 35, y: 260, text: data.cargo.name },
    { x: 280, y: 260, text: data.cargo.hsCode || '' },
    { x: 340, y: 260, text: data.fromCountry },
    { x: 390, y: 260, text: data.cargo.packages ? String(data.cargo.packages) : '' },
    { x: 430, y: 260, text: data.cargo.value ? String(data.cargo.value) : '' },
    { x: 35, y: 500, text: data.cargo.value ? `${data.cargo.value} ${data.cargo.currency || 'EUR'}` : '' },
    { x: 35, y: 560, text: data.sender.name },
    { x: 230, y: 560, text: new Date().toLocaleDateString('pl-PL') },
  ]

  await fillPdf('/templates/eu/common/03_Faktura_Handlowa.pdf', fields, 'Faktura_Handlowa.pdf')
}
