import { fillPdf } from './fillPdf'

/**
 * Wypełnia formularz Packing List danymi z wizarda i pobiera PDF.
 * Współrzędne do skalibrowania po wgraniu pliku do public/templates/eu/common/
 */
export async function fillPackingList(data) {
  const fields = [
    // Nadawca
    { x: 30,  y: 100, text: data.sender.name },
    { x: 30,  y: 112, text: data.sender.address },
    { x: 30,  y: 124, text: `VAT: ${data.sender.vat || ''}` },

    // Odbiorca
    { x: 300, y: 100, text: data.receiver.name },
    { x: 300, y: 112, text: data.receiver.address },
    { x: 300, y: 124, text: `VAT: ${data.receiver.vat || ''}` },

    // Trasa
    { x: 30,  y: 170, text: `${data.fromCountry} → ${data.toCountry}` },

    // Opis towaru
    { x: 30,  y: 240, text: data.cargo.name },
    { x: 220, y: 240, text: data.cargo.packages ? String(data.cargo.packages) : '' },
    { x: 290, y: 240, text: data.cargo.weight ? `${data.cargo.weight} kg` : '' },
    { x: 370, y: 240, text: data.cargo.volume ? `${data.cargo.volume} m³` : '' },
    { x: 440, y: 240, text: data.cargo.value ? `${data.cargo.value} ${data.cargo.currency}` : '' },

    // Data
    { x: 400, y: 80,  text: new Date().toLocaleDateString('pl-PL') },
  ]

  await fillPdf('/templates/eu/common/02_Packing_List.pdf', fields, 'Packing_List.pdf')
}
