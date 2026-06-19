import { fillPdf } from './fillPdf'

export async function fillBillOfLading(data) {
  const fields = [
    { x: 470, y: 65, text: `BL/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}` },
    { x: 35, y: 150, text: data.sender.name },
    { x: 35, y: 162, text: data.sender.address },
    { x: 305, y: 150, text: data.receiver.name },
    { x: 305, y: 162, text: data.receiver.address },
    { x: 35, y: 225, text: data.receiver.name },
    { x: 35, y: 270, text: data.cargo.vessel || '' },
    { x: 180, y: 270, text: data.cargo.voyageNo || '' },
    { x: 35, y: 310, text: `${data.fromCity}, ${data.fromCountry}` },
    { x: 220, y: 310, text: `${data.toCity}, ${data.toCountry}` },
    { x: 35, y: 345, text: data.loadDate },
    { x: 70, y: 430, text: data.cargo.containerNo || '' },
    { x: 160, y: 430, text: data.cargo.sealNo || '' },
    { x: 220, y: 430, text: data.cargo.containerType || '20GP' },
    { x: 300, y: 430, text: data.cargo.name },
    { x: 430, y: 430, text: data.cargo.packages ? String(data.cargo.packages) : '' },
    { x: 470, y: 430, text: data.cargo.weight ? String(data.cargo.weight) : '' },
    { x: 520, y: 430, text: data.cargo.volume ? String(data.cargo.volume) : '' },
  ]

  await fillPdf('/templates/eu/sea/05_Bill_of_Lading.pdf', fields, 'Bill_of_Lading.pdf')
}
