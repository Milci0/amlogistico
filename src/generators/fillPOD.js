import { fillPdf } from './fillPdf'

export async function fillPOD(data) {
  const today = new Date().toLocaleDateString('pl-PL')
  const docNo = `POD/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`

  const fields = [
    { x: 420, y: 60,  text: docNo },

    { x: 30,  y: 98,  text: 'Nr protokołu:' },
    { x: 30,  y: 110, text: docNo, size: 10 },
    { x: 220, y: 98,  text: 'Data i godzina dostawy:' },
    { x: 220, y: 110, text: today, size: 10 },

    { x: 30,  y: 145, text: 'Adres dostawy:' },
    { x: 30,  y: 158, text: `${data.toCity}, ${data.toCountry}`, size: 10 },
    { x: 30,  y: 170, text: data.receiver.address },

    { x: 300, y: 145, text: 'Przewoźnik:' },
    { x: 300, y: 158, text: data.sender.name, size: 10 },

    { x: 30,  y: 265, text: '1' },
    { x: 50,  y: 265, text: data.cargo.name },
    { x: 320, y: 265, text: data.cargo.packages ? String(data.cargo.packages) : '' },
    { x: 370, y: 265, text: data.cargo.packages ? String(data.cargo.packages) : '' },
    { x: 415, y: 265, text: 'szt.' },

    { x: 30,  y: 460, text: 'Towar przyjęto bez zastrzeżeń.' },
  ]

  await fillPdf('/templates/eu/land/10_Protokol_Odbioru_POD.pdf', fields, 'Protokol_Odbioru_POD.pdf')
}
