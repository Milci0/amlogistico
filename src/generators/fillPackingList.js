import { printDocument } from './printDocument'
import { PackingListTemplate } from './templates/PackingListTemplate'

export async function fillPackingList(data) {
  await printDocument(PackingListTemplate, data, 'Packing_List.pdf')
}
