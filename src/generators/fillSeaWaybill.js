import { generatePdf } from './generatePdf'
import { SeaWaybillTemplate } from './templates/SeaWaybillTemplate'

export async function fillSeaWaybill(data) {
  await generatePdf(SeaWaybillTemplate, data, 'Sea_Waybill.pdf')
}
