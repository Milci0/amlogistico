import { printDocument } from './printDocument'
import { CmrTemplate } from './templates/CmrTemplate'

export async function fillCmr(data) {
  await printDocument(CmrTemplate, data, 'CMR.pdf')
}
