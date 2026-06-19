import { printDocument } from './printDocument'
import { SeaWaybillTemplate } from './templates/SeaWaybillTemplate'

export async function fillSeaWaybill(data) {
  await printDocument(SeaWaybillTemplate, data, 'Sea_Waybill.pdf')
}
