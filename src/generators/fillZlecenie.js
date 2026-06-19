import { fillPdf } from './fillPdf'

export async function fillZlecenie(data) {
  const today = new Date().toLocaleDateString('pl-PL')
  const docNo = `ZT/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`

  const fields = [
    { x: 420, y: 60,  text: docNo },

    { x: 30,  y: 98,  text: 'Nr zlecenia:' },
    { x: 30,  y: 110, text: docNo, size: 10 },
    { x: 220, y: 98,  text: 'Data zlecenia:' },
    { x: 220, y: 110, text: today, size: 10 },

    { x: 30,  y: 145, text: 'Zleceniodawca:' },
    { x: 30,  y: 158, text: data.sender.name, size: 10 },
    { x: 30,  y: 170, text: data.sender.address },
    { x: 30,  y: 182, text: `NIP: ${data.sender.vat || ''}` },

    { x: 300, y: 145, text: 'Przewoźnik:' },
    { x: 300, y: 158, text: data.receiver.name, size: 10 },
    { x: 300, y: 170, text: data.receiver.address },
    { x: 300, y: 182, text: `NIP: ${data.receiver.vat || ''}` },

    { x: 30,  y: 330, text: `${data.fromCity}, ${data.fromCountry}` },
    { x: 300, y: 330, text: data.loadDate },

    { x: 30,  y: 420, text: `${data.toCity}, ${data.toCountry}` },

    { x: 30,  y: 510, text: data.cargo.name, size: 10 },
    { x: 200, y: 510, text: data.cargo.weight ? `${data.cargo.weight} kg` : '' },
    { x: 310, y: 510, text: data.cargo.volume ? `${data.cargo.volume} m³` : '' },
    { x: 410, y: 510, text: data.cargo.packages ? String(data.cargo.packages) : '' },

    { x: 30,  y: 635, text: data.cargo.notes || '' },
  ]

  await fillPdf('/templates/eu/land/09_Zlecenie_Transportowe.pdf', fields, 'Zlecenie_Transportowe.pdf')
}
