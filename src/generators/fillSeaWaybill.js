import { fillPdf } from './fillPdf'

export async function fillSeaWaybill(data) {
  const fields = [
    { x: 35, y: 130, text: data.sender.name },
    { x: 35, y: 142, text: data.sender.address },
    { x: 305, y: 130, text: data.receiver.name },
    { x: 305, y: 142, text: data.receiver.address },
    { x: 35, y: 175, text: data.receiver.name },
    { x: 35, y: 220, text: data.cargo.vessel || '' },
    { x: 130, y: 220, text: data.cargo.voyageNo || '' },
    { x: 230, y: 220, text: `${data.fromCity}, ${data.fromCountry}` },
    { x: 340, y: 220, text: `${data.toCity}, ${data.toCountry}` },
    { x: 430, y: 220, text: data.loadDate },
    { x: 70, y: 283, text: data.cargo.containerNo || '' },
    { x: 120, y: 283, text: data.cargo.sealNo || '' },
    { x: 185, y: 283, text: data.cargo.containerType || '20GP' },
    { x: 310, y: 283, text: data.cargo.name },
    { x: 430, y: 283, text: data.cargo.weight ? String(data.cargo.weight) : '' },
    { x: 470, y: 283, text: data.cargo.volume ? String(data.cargo.volume) : '' },
    { x: 220, y: 510, text: new Date().toLocaleDateString('pl-PL') },
  ]

  await fillPdf('/templates/eu/sea/26_Sea_Waybill.pdf', fields, 'Sea_Waybill.pdf')
}
