import { printDocument } from './printDocument'
import { BillOfLadingTemplate } from './templates/BillOfLadingTemplate'

export async function fillBillOfLading(data) {
  await printDocument(BillOfLadingTemplate, data, 'Bill_of_Lading.pdf')
}
