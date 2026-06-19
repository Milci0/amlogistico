import { printDocument } from './printDocument'
import { ZlecenieTemplate } from './templates/ZlecenieTemplate'

export async function fillZlecenie(data) {
  await printDocument(ZlecenieTemplate, data, 'Zlecenie_Transportowe.pdf')
}
