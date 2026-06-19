import { generatePdf } from './generatePdf'
import { CmrTemplate } from './templates/CmrTemplate'

export async function fillCmr(data) {
  await generatePdf(CmrTemplate, data, 'CMR.pdf')
}
