import { fillPdf } from './fillPdf'

export async function fillMultimodal(data) {
  const today = new Date().toLocaleDateString('pl-PL')
  const docNo = `MTD/${new Date().getFullYear()}/${String(Date.now()).slice(-4)}`

  const fields = [
    { x: 30,  y: 133, text: data.sender.name, size: 10 },
    { x: 30,  y: 145, text: data.sender.address },
    { x: 30,  y: 157, text: data.sender.country },

    { x: 300, y: 133, text: data.receiver.name, size: 10 },
    { x: 300, y: 145, text: data.receiver.address },
    { x: 300, y: 157, text: data.receiver.country },

    { x: 30,  y: 188, text: data.receiver.name },

    // Leg 1 — Pre-carriage (road)
    { x: 120, y: 242, text: 'Road' },
    { x: 210, y: 242, text: data.fromCity },
    { x: 290, y: 242, text: data.fromCity },
    { x: 370, y: 242, text: data.fromCity },
    { x: 480, y: 242, text: data.sender.name },

    // Leg 2 — Main carriage (sea)
    { x: 120, y: 272, text: 'Sea' },
    { x: 210, y: 272, text: `${data.fromCity}, ${data.fromCountry}` },
    { x: 290, y: 272, text: `${data.fromCity}, ${data.fromCountry}` },
    { x: 370, y: 272, text: `${data.toCity}, ${data.toCountry}` },
    { x: 430, y: 272, text: `${data.toCity}, ${data.toCountry}` },
    { x: 480, y: 272, text: data.cargo.carrier || '' },
    { x: 545, y: 272, text: data.loadDate },

    // Cargo
    { x: 20,  y: 348, text: '1' },
    { x: 45,  y: 348, text: data.cargo.name },
    { x: 235, y: 348, text: data.cargo.hsCode || '' },
    { x: 285, y: 348, text: data.cargo.packages ? String(data.cargo.packages) : '1' },
    { x: 330, y: 348, text: 'szt.' },
    { x: 370, y: 348, text: data.cargo.weight ? `${data.cargo.weight}` : '' },
    { x: 430, y: 348, text: data.cargo.value ? `${data.cargo.value} ${data.cargo.currency || 'EUR'}` : '' },

    { x: 30,  y: 482, text: 'Combined' },
    { x: 160, y: 482, text: docNo },
    { x: 320, y: 482, text: today },
    { x: 440, y: 482, text: data.fromCity },
  ]

  await fillPdf('/templates/eu/common/28_Multimodal_Transport_Document.pdf', fields, 'Multimodal_Transport_Document.pdf')
}
