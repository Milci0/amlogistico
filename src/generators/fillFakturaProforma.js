import { fillPdf } from './fillPdf'

export async function fillFakturaProforma(data) {
  const today = new Date().toLocaleDateString('pl-PL')
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pl-PL')
  const proformaNo = `PF/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`

  const fields = [
    { x: 435, y: 62,  text: proformaNo },
    { x: 435, y: 82,  text: today },
    { x: 435, y: 102, text: validUntil },

    { x: 30,  y: 190, text: data.sender.name, size: 10 },
    { x: 30,  y: 202, text: data.sender.address },
    { x: 30,  y: 214, text: data.sender.country },

    { x: 300, y: 190, text: data.receiver.name, size: 10 },
    { x: 300, y: 202, text: data.receiver.address },
    { x: 300, y: 214, text: data.receiver.country },

    { x: 30,  y: 228, text: `NIP: ${data.sender.vat || ''}` },
    { x: 300, y: 228, text: `NIP: ${data.receiver.vat || ''}` },

    { x: 30,  y: 250, text: data.fromCountry },
    { x: 300, y: 250, text: data.toCountry },

    { x: 30,  y: 278, text: data.cargo.incoterms || 'DAP' },
    { x: 120, y: 278, text: data.toCity },
    { x: 230, y: 278, text: data.cargo.currency || 'EUR' },
    { x: 320, y: 278, text: data.fromCountry },

    { x: 20,  y: 320, text: '1' },
    { x: 45,  y: 320, text: data.cargo.name },
    { x: 220, y: 320, text: data.cargo.hsCode || '' },
    { x: 280, y: 320, text: data.cargo.packages ? String(data.cargo.packages) : '1' },
    { x: 325, y: 320, text: 'szt.' },
    { x: 380, y: 320, text: data.cargo.value ? String(data.cargo.value) : '' },
    { x: 450, y: 320, text: data.cargo.value ? String(data.cargo.value) : '' },

    { x: 30,  y: 492, text: data.cargo.value ? `${data.cargo.value} ${data.cargo.currency || 'EUR'}` : '' },
    { x: 465, y: 492, text: data.cargo.value ? `${data.cargo.value} ${data.cargo.currency || 'EUR'}` : '' },

    { x: 30,  y: 560, text: data.sender.name },
    { x: 230, y: 560, text: today },
  ]

  await fillPdf('/templates/eu/common/04_Faktura_Proforma.pdf', fields, 'Faktura_Proforma.pdf')
}
