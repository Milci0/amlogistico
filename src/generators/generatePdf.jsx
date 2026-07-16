import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const CDN_URL =
  'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js'
const DOC_WIDTH = 794

// Prefetch CDN script into browser cache — call at wizard mount so it's
// ready before user clicks "Generuj". Uses <link rel="prefetch"> which
// doesn't block and respects the browser cache for the iframe load later.
export function preloadHtml2Pdf() {
  if (document.querySelector(`link[href="${CDN_URL}"]`)) return
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = 'script'
  link.href = CDN_URL
  document.head.appendChild(link)
}

function isMobileSafari() {
  const ua = navigator.userAgent
  const iOS =
    /iP(ad|hone|od)/.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  return iOS && /WebKit/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua)
}

function triggerDownload(url, filename) {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// download:false zwraca sam blob bez uruchamiania pobierania w przeglądarce —
// używane przy pakowaniu wielu dokumentów do jednego ZIP-a (patrz blankDocuments.js).
export async function generatePdf(TemplateComponent, data, filename, { download = true } = {}) {
  // 1. Renderuj szablon do czystego HTML-a (synchronicznie, bez React DOM)
  const bodyHtml = renderToStaticMarkup(createElement(TemplateComponent, { data }))

  // 2. Pełny dokument HTML z dokładną szerokością A4 — izolowany od strony głównej
  const docHtml =
    `<!DOCTYPE html><html><head><meta charset="utf-8">` +
    `<style>*{box-sizing:border-box;margin:0;padding:0}` +
    `body{width:${DOC_WIDTH}px;background:#fff;font-family:Arial,Helvetica,sans-serif}</style>` +
    `</head><body>${bodyHtml}</body></html>`

  const blobUrl = URL.createObjectURL(
    new Blob([docHtml], { type: 'text/html;charset=utf-8' })
  )

  // 3. Ukryty iframe poza ekranem (nie visibility:hidden — fonty muszą się ładować)
  //    Viewport iframe = DOC_WIDTH, scroll zawsze (0,0) — zero interferencji ze stroną główną
  const iframe = document.createElement('iframe')
  iframe.style.cssText =
    `position:fixed;top:0;left:-${DOC_WIDTH + 20}px;` +
    `width:${DOC_WIDTH}px;height:1px;border:none;`
  document.body.appendChild(iframe)

  try {
    // 4. Załaduj dokument w iframe
    await new Promise((resolve, reject) => {
      iframe.onload = resolve
      iframe.onerror = () => reject(new Error('Błąd ładowania dokumentu'))
      iframe.src = blobUrl
    })

    const iframeDoc = iframe.contentDocument
    const iframeWin = iframe.contentWindow

    // 5. Załaduj html2pdf wewnątrz iframe (z cache CDN po preload)
    await new Promise((resolve, reject) => {
      const s = iframeDoc.createElement('script')
      s.src = CDN_URL
      s.onload = resolve
      s.onerror = () => reject(new Error('Nie można załadować html2pdf.js'))
      iframeDoc.head.appendChild(s)
    })

    // 6. Poczekaj na załadowanie fontów
    if (iframeDoc.fonts?.ready) await iframeDoc.fonts.ready
    await new Promise(r => setTimeout(r, 200))

    const el = iframeDoc.body.firstElementChild

    // 7. Ustaw wysokość iframe na pełną wysokość treści
    iframe.style.height = `${el.scrollHeight}px`
    await new Promise(r => setTimeout(r, 50))

    // 8. Generuj PDF wewnątrz iframe — scrollX/Y = 0, windowWidth = rzeczywisty viewport iframe
    const pdfBlob = await iframeWin.html2pdf()
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
      .output('blob')

    // 9. Pobierz w kontekście strony głównej
    if (download) {
      const pdfUrl = URL.createObjectURL(pdfBlob)
      if (isMobileSafari()) {
        const win = window.open(pdfUrl, '_blank')
        if (!win) triggerDownload(pdfUrl, filename)
      } else {
        triggerDownload(pdfUrl, filename)
      }
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 2000)
    }
    return pdfBlob
  } finally {
    if (iframe.parentNode) document.body.removeChild(iframe)
    URL.revokeObjectURL(blobUrl)
  }
}
