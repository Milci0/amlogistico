import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const CDN_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'

const DOC_WIDTH = 794

function loadHtml2Pdf() {
  if (window.html2pdf) return Promise.resolve(window.html2pdf)
  return new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = CDN_URL
    s.onload = () => resolve(window.html2pdf)
    s.onerror = () => reject(new Error('Nie można załadować html2pdf.js z CDN'))
    document.head.appendChild(s)
  })
}

export function preloadHtml2Pdf() {
  loadHtml2Pdf().catch(() => {})
}

function isMobileSafari() {
  const ua = navigator.userAgent
  const iOS =
    /iP(ad|hone|od)/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const webkit = /WebKit/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
  return iOS && webkit
}

export async function generatePdf(TemplateComponent, data, filename) {
  const html2pdf = await loadHtml2Pdf()

  // Synchronicznie renderuje szablon do stringa HTML — eliminuje asynchroniczne
  // problemy createRoot i zależność od czasu renderowania React.
  const html = renderToStaticMarkup(createElement(TemplateComponent, { data }))

  const container = document.createElement('div')
  container.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    `width:${DOC_WIDTH}px`,
    'background:white',
    'z-index:-9999',
    'pointer-events:none',
  ].join(';')
  container.innerHTML = html
  document.body.appendChild(container)

  // Resetuj scroll do (0,0) — element fixed jest wtedy jednocześnie w (0,0)
  // viewportu i (0,0) dokumentu, więc html2canvas z scrollX:0/scrollY:0
  // zawsze trafi w dokładnie ten sam obszar niezależnie od urządzenia.
  // Modal przykrywa stronę, więc użytkownik nie widzi skoku scrolla.
  const savedX = window.scrollX
  const savedY = window.scrollY
  window.scrollTo(0, 0)

  try {
    if (document.fonts?.ready) await document.fonts.ready
    await new Promise(r => setTimeout(r, 200))

    const el = container.firstElementChild

    const worker = html2pdf()
      .set({
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: DOC_WIDTH,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(el)

    if (isMobileSafari()) {
      const blobUrl = await worker.output('bloburl')
      const win = window.open(blobUrl, '_blank')
      if (!win) await worker.save()
    } else {
      await worker.save()
    }
  } finally {
    if (container.parentNode) document.body.removeChild(container)
    window.scrollTo(savedX, savedY)
  }
}
