import { printDocument } from './printDocument'
import { FakturaProformaTemplate } from './templates/FakturaProformaTemplate'

export async function fillFakturaProforma(data) {
  await printDocument(FakturaProformaTemplate, data, 'Faktura_Proforma.pdf')
}
