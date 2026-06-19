import { fillPdf } from './fillPdf'

export async function fillSeaWaybill(data) {
  const today = new Date().toLocaleDateString('pl-PL')

  const fields = [
    { x: 30,  y: 130, text: data.sender.name, size: 10 },
    { x: 30,  y: 142, text: data.sender.address },
    { x: 30,  y: 154, text: data.sender.country },

    { x: 300, y: 130, text: data.receiver.name, size: 10 },
    { x: 300, y: 142, text: data.receiver.address },
    { x: 300, y: 154, text: data.receiver.country },

    { x: 30,  y: 180, text: data.receiver.name },

    { x: 30,  y: 228, text: data.cargo.vessel || '' },
    { x: 130, y: 228, text: data.cargo.voyageNo || '' },
    { x: 230, y: 228, text: `${data.fromCity}, ${data.fromCountry}` },
    { x: 340, y: 228, text: `${data.toCity}, ${data.toCountry}` },
    { x: 430, y: 228, text: data.loadDate },

    { x: 30,  y: 283, text: data.cargo.containerNo || '' },
    { x: 120, y: 283, text: data.cargo.sealNo || '' },
    { x: 185, y: 283, text: data.cargo.containerType || '20GP' },
    { x: 250, y: 283, text: data.cargo.name },
    { x: 420, y: 283, text: data.cargo.weight ? `${data.cargo.weight}` : '' },
    { x: 460, y: 283, text: data.cargo.volume ? `${data.cargo.volume}` : '' },

    { x: 220, y: 510, text: today },
  ]

  await fillPdf('/templates/eu/sea/26_Sea_Waybill.pdf', fields, 'Sea_Waybill.pdf')
}
