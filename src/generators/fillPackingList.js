import { generatePdf } from './generatePdf'
import { PackingListTemplate } from './templates/PackingListTemplate'

export async function fillPackingList(data) {
  await generatePdf(PackingListTemplate, data, 'Packing_List.pdf')
}
