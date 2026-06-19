import { generatePdf } from './generatePdf'
import { MultimodalTemplate } from './templates/MultimodalTemplate'

export async function fillMultimodal(data) {
  await generatePdf(MultimodalTemplate, data, 'Multimodal_Transport_Document.pdf')
}
