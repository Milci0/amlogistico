import { printDocument } from './printDocument'
import { FakturaHandlowaTemplate } from './templates/FakturaHandlowaTemplate'

export async function fillFakturaHandlowa(data) {
  await printDocument(FakturaHandlowaTemplate, data, 'Faktura_Handlowa.pdf')
}
