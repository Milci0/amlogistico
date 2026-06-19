import { fillPdf } from './fillPdf'

export async function fillCmr(data) {
  const fields = [
    { x: 35, y: 130, text: data.sender.name },
    { x: 35, y: 145, text: data.sender.address },
    { x: 35, y: 202, text: data.sender.country },
    { x: 305, y: 130, text: data.receiver.name },
    { x: 305, y: 145, text: data.receiver.address },
    { x: 305, y: 202, text: data.receiver.country },
    { x: 35, y: 310, text: `${data.fromCity}, ${data.fromCountry}` },
    { x: 35, y: 323, text: data.loadDate },
    { x: 220, y: 310, text: `${data.toCity}, ${data.toCountry}` },
    { x: 70, y: 400, text: data.cargo.packages ? String(data.cargo.packages) : '' },
    { x: 215, y: 400, text: data.cargo.name },
    { x: 370, y: 400, text: data.cargo.hsCode || '' },
    { x: 430, y: 400, text: data.cargo.weight ? String(data.cargo.weight) : '' },
    { x: 500, y: 400, text: data.cargo.volume ? String(data.cargo.volume) : '' },
    { x: 35, y: 520, text: data.cargo.notes || '' },
  ]

  await fillPdf('/templates/eu/land/01_CMR_List_Przewozowy.pdf', fields, 'CMR.pdf')
}
