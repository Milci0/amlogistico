import { fillPdf } from './fillPdf'

export async function fillZlecenie(data) {
  const fields = [
    { x: 420, y: 60, text: `ZT/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}` },
    { x: 35, y: 110, text: `ZT/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}` },
    { x: 220, y: 110, text: new Date().toLocaleDateString('pl-PL') },
    { x: 35, y: 140, text: data.sender.name },
    { x: 35, y: 152, text: data.sender.address },
    { x: 35, y: 164, text: `NIP: ${data.sender.vat || ''}` },
    { x: 305, y: 140, text: data.receiver.name },
    { x: 305, y: 152, text: data.receiver.address },
    { x: 305, y: 164, text: `NIP: ${data.receiver.vat || ''}` },
    { x: 35, y: 300, text: `${data.fromCity}, ${data.fromCountry}` },
    { x: 300, y: 300, text: data.loadDate },
    { x: 35, y: 400, text: `${data.toCity}, ${data.toCountry}` },
    { x: 35, y: 510, text: data.cargo.name },
    { x: 200, y: 510, text: data.cargo.weight ? `${data.cargo.weight} kg` : '' },
    { x: 310, y: 510, text: data.cargo.volume ? `${data.cargo.volume} m³` : '' },
    { x: 410, y: 510, text: data.cargo.packages ? String(data.cargo.packages) : '' },
  ]

  await fillPdf('/templates/eu/land/09_Zlecenie_Transportowe.pdf', fields, 'Zlecenie_Transportowe.pdf')
}
