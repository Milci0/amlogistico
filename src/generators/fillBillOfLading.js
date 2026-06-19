import { generatePdf } from './generatePdf'
import { BillOfLadingTemplate } from './templates/BillOfLadingTemplate'

export async function fillBillOfLading(data) {
  await generatePdf(BillOfLadingTemplate, data, 'Bill_of_Lading.pdf')
}
