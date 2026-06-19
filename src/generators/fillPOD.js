import { printDocument } from './printDocument'
import { PODTemplate } from './templates/PODTemplate'

export async function fillPOD(data) {
  await printDocument(PODTemplate, data, 'Protokol_Odbioru_POD.pdf')
}
