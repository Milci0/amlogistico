import { generatePdf } from './generatePdf'
import { FakturaHandlowaTemplate } from './templates/FakturaHandlowaTemplate'

export async function fillFakturaHandlowa(data) {
  await generatePdf(FakturaHandlowaTemplate, data, 'Faktura_Handlowa.pdf')
}
