import { fillPdf } from './fillPdf'

export async function fillPOD(data) {
  const fields = [
    { x: 420, y: 60, text: `POD/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}` },
    { x: 35, y: 100, text: `POD/${new Date().getFullYear()}/${Date.now().toString().slice(-4)}` },
    { x: 220, y: 100, text: new Date().toLocaleDateString('pl-PL') },
    { x: 35, y: 140, text: `${data.toCity}, ${data.toCountry}` },
    { x: 35, y: 152, text: data.receiver.address },
    { x: 305, y: 140, text: data.sender.name },
    { x: 35, y: 265, text: '1' },
    { x: 50, y: 265, text: data.cargo.name },
    { x: 320, y: 265, text: data.cargo.packages ? String(data.cargo.packages) : '' },
    { x: 370, y: 265, text: data.cargo.packages ? String(data.cargo.packages) : '' },
    { x: 415, y: 265, text: 'szt.' },
    { x: 35, y: 430, text: 'Towar przyjęto bez zastrzeżeń.' },
  ]

  await fillPdf('/templates/eu/land/10_Protokol_Odbioru_POD.pdf', fields, 'Protokol_Odbioru_POD.pdf')
}
