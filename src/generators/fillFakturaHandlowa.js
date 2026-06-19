import { fillPdf } from './fillPdf'

export async function fillFakturaHandlowa(data) {
  const today = new Date().toLocaleDateString('pl-PL')
  const invoiceNo = `FH/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`

  const fields = [
    { x: 435, y: 57,  text: invoiceNo },

    { x: 30,  y: 110, text: data.sender.name, size: 10 },
    { x: 30,  y: 122, text: data.sender.address },
    { x: 30,  y: 134, text: data.sender.country },

    { x: 300, y: 110, text: data.receiver.name, size: 10 },
    { x: 300, y: 122, text: data.receiver.address },
    { x: 300, y: 134, text: data.receiver.country },

    { x: 435, y: 110, text: invoiceNo },

    { x: 30,  y: 152, text: `NIP: ${data.sender.vat || ''}` },
    { x: 300, y: 152, text: `NIP: ${data.receiver.vat || ''}` },
    { x: 435, y: 152, text: today },

    { x: 30,  y: 192, text: data.cargo.incoterms || 'DAP' },
    { x: 100, y: 192, text: data.toCity },
    { x: 240, y: 192, text: data.cargo.currency || 'EUR' },
    { x: 455, y: 192, text: data.fromCountry },

    { x: 20,  y: 258, text: '1' },
    { x: 45,  y: 258, text: data.cargo.name },
    { x: 220, y: 258, text: data.cargo.hsCode || '' },
    { x: 280, y: 258, text: data.fromCountry },
    { x: 325, y: 258, text: data.cargo.packages ? String(data.cargo.packages) : '1' },
    { x: 360, y: 258, text: 'szt.' },
    { x: 395, y: 258, text: data.cargo.value ? String(data.cargo.value) : '' },
    { x: 465, y: 258, text: data.cargo.value ? String(data.cargo.value) : '' },

    { x: 30,  y: 492, text: data.cargo.value ? `${data.cargo.value} ${data.cargo.currency || 'EUR'}` : '' },
    { x: 170, y: 492, text: '' },
    { x: 465, y: 492, text: data.cargo.value ? `${data.cargo.value} ${data.cargo.currency || 'EUR'}` : '' },

    { x: 50,  y: 538, text: data.sender.iban || '' },
    { x: 200, y: 538, text: data.sender.swift || '' },
    { x: 50,  y: 552, text: data.sender.bank || '' },

    { x: 30,  y: 577, text: data.sender.name },
    { x: 230, y: 577, text: today },
  ]

  await fillPdf('/templates/eu/common/03_Faktura_Handlowa.pdf', fields, 'Faktura_Handlowa.pdf')
}
