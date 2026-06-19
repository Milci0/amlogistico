import { generatePdf } from './generatePdf'
import { FakturaProformaTemplate } from './templates/FakturaProformaTemplate'

export async function fillFakturaProforma(data) {
  await generatePdf(FakturaProformaTemplate, data, 'Faktura_Proforma.pdf')
}
