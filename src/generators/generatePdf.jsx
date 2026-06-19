import { createRoot } from 'react-dom/client'
import { createElement } from 'react'

const CDN_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'

function loadHtml2Pdf() {
  if (window.html2pdf) return Promise.resolve(window.html2pdf)
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = CDN_URL
    s.onload = () => resolve(window.html2pdf)
    s.onerror = () => reject(new Error('Nie udało się załadować html2pdf.js'))
    document.head.appendChild(s)
  })
}

export async function generatePdf(TemplateComponent, data, filename) {
  const html2pdf = await loadHtml2Pdf()

  const container = document.createElement('div')
  container.style.cssText =
    'position:fixed;top:-9999px;left:-9999px;width:794px;background:white;'
  document.body.appendChild(container)

  const root = createRoot(container)
  root.render(createElement(TemplateComponent, { data }))

  await new Promise(r => setTimeout(r, 400))

  const el = container.firstElementChild

  await html2pdf()
    .set({
      margin: 0,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 794,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    })
    .from(el)
    .save()

  root.unmount()
  document.body.removeChild(container)
}
