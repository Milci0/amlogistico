import { printDocument } from './printDocument'
import { MultimodalTemplate } from './templates/MultimodalTemplate'

export async function fillMultimodal(data) {
  await printDocument(MultimodalTemplate, data, 'Multimodal_Transport_Document.pdf')
}
