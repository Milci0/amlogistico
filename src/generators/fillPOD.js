import { generatePdf } from './generatePdf'
import { PODTemplate } from './templates/PODTemplate'

export async function fillPOD(data) {
  await generatePdf(PODTemplate, data, 'Protokol_Odbioru_POD.pdf')
}
