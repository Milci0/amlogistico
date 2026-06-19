import { fillPdf } from './fillPdf'

export async function fillBillOfLading(data) {
  const today = new Date().toLocaleDateString('pl-PL')
  const blNo = `BL/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`

  const fields = [
    { x: 430, y: 62,  text: blNo },

    { x: 30,  y: 145, text: data.sender.name, size: 10 },
    { x: 30,  y: 157, text: data.sender.address },
    { x: 30,  y: 169, text: data.sender.country },
    { x: 30,  y: 181, text: `VAT: ${data.sender.vat || ''}` },

    { x: 300, y: 145, text: data.receiver.name, size: 10 },
    { x: 300, y: 157, text: data.receiver.address },
    { x: 300, y: 169, text: data.receiver.country },
    { x: 300, y: 181, text: `VAT: ${data.receiver.vat || ''}` },

    { x: 30,  y: 230, text: data.receiver.name },

    { x: 30,  y: 290, text: data.cargo.vessel || '' },
    { x: 200, y: 290, text: data.cargo.voyageNo || '' },

    { x: 30,  y: 335, text: `${data.fromCity}, ${data.fromCountry}` },
    { x: 220, y: 335, text: `${data.toCity}, ${data.toCountry}` },

    { x: 30,  y: 365, text: data.loadDate },

    { x: 30,  y: 420, text: data.cargo.containerNo || '' },
    { x: 120, y: 420, text: data.cargo.sealNo || '' },
    { x: 185, y: 420, text: data.cargo.containerType || '20GP' },
    { x: 250, y: 420, text: data.cargo.name },
    { x: 430, y: 420, text: data.cargo.packages ? String(data.cargo.packages) : '' },
    { x: 460, y: 420, text: data.cargo.weight ? `${data.cargo.weight}` : '' },
    { x: 510, y: 420, text: data.cargo.volume ? `${data.cargo.volume}` : '' },

    { x: 415, y: 525, text: `${data.fromCity}` },
    { x: 415, y: 545, text: today },
  ]

  await fillPdf('/templates/eu/sea/05_Bill_of_Lading.pdf', fields, 'Bill_of_Lading.pdf')
}
