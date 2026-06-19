import { fillPdf } from './fillPdf'

/**
 * Wypełnia formularz Packing List danymi z wizarda i pobiera PDF.
 * Współrzędne do skalibrowania po wgraniu pliku do public/templates/eu/common/
 */
export async function fillPackingList(data) {
  const fields = [
    { x: 35, y: 110, text: data.sender.name },
    { x: 35, y: 122, text: data.sender.address },
    { x: 305, y: 110, text: data.receiver.name },
    { x: 305, y: 122, text: data.receiver.address },
    { x: 35, y: 180, text: data.fromCountry },
    { x: 305, y: 180, text: data.toCountry },
    { x: 35, y: 232, text: data.cargo.name },
    { x: 260, y: 232, text: data.cargo.hsCode || '' },
    { x: 310, y: 232, text: data.cargo.packages ? String(data.cargo.packages) : '' },
    { x: 370, y: 232, text: data.cargo.weight ? String(data.cargo.weight) : '' },
    { x: 450, y: 232, text: data.cargo.volume ? String(data.cargo.volume) : '' },
    { x: 400, y: 80, text: new Date().toLocaleDateString('pl-PL') },
  ]

  await fillPdf('/templates/eu/common/02_Packing_List.pdf', fields, 'Packing_List.pdf')
}
