import { createRoot } from 'react-dom/client'
import { createElement } from 'react'

const CDN_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'

// Szerokość szablonów (px) — odpowiada szerokości strony A4 w 96 dpi.
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

// Wywołaj wcześnie (np. przy montażu wizardu), żeby biblioteka była gotowa
// zanim użytkownik kliknie — skraca okno async i pomaga pobieraniu na iOS.
export function preloadHtml2Pdf() {
  loadHtml2Pdf().catch(() => {})
}

// Czy urządzenie prawdopodobnie blokuje programowe pobieranie po await (iOS Safari)
function isMobileSafari() {
  const ua = navigator.userAgent
  const iOS = /iP(ad|hone|od)/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  const webkit = /WebKit/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
  return iOS && webkit
}

export async function generatePdf(TemplateComponent, data, filename) {
  const html2pdf = await loadHtml2Pdf()

  // Render w (0,0) za wszystkimi elementami — html2canvas poprawnie uchwyci
  const container = document.createElement('div')
  container.style.cssText =
    `position:fixed;top:0;left:0;width:${DOC_WIDTH}px;background:white;z-index:-9999;pointer-events:none;`
  document.body.appendChild(container)

  const root = createRoot(container)

  try {
    root.render(createElement(TemplateComponent, { data }))

    // Poczekaj aż fonty się załadują i layout się ułoży — inaczej na wolniejszych
    // urządzeniach html2canvas łapie render przed ułożeniem treści.
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready
    }
    await new Promise(r => setTimeout(r, 300))

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
          // Wymuś obliczenie CSS layoutu dla szerokości 794px (fix mobile) —
          // ale nie nadpisuj width/height, żeby html2canvas mierzył element sam.
          windowWidth: DOC_WIDTH,
          scrollX: 0,
          scrollY: 0,
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(el)

    if (isMobileSafari()) {
      // iOS Safari blokuje pobranie pliku po await — otwórz PDF w nowej karcie,
      // skąd użytkownik może go zapisać/udostępnić.
      const blobUrl = await worker.output('bloburl')
      const win = window.open(blobUrl, '_blank')
      if (!win) {
        // Popup zablokowany — spróbuj jednak standardowego zapisu.
        await worker.save()
      }
    } else {
      await worker.save()
    }
  } finally {
    root.unmount()
    if (container.parentNode) document.body.removeChild(container)
  }
}
