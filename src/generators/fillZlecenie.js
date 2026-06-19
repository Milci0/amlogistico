import { generatePdf } from './generatePdf'
import { ZlecenieTemplate } from './templates/ZlecenieTemplate'

export async function fillZlecenie(data) {
  await generatePdf(ZlecenieTemplate, data, 'Zlecenie_Transportowe.pdf')
}
