import { createRoot } from 'react-dom/client'
import { createElement } from 'react'

const printStyles = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  @page { size: A4; margin: 0; }
`

export async function printDocument(TemplateComponent, data, filename) {
  const container = document.createElement('div')
  container.style.cssText = 'position:fixed;top:-9999px;left:-9999px;width:794px;background:white;'
  document.body.appendChild(container)

  const root = createRoot(container)
  root.render(createElement(TemplateComponent, { data }))

  await new Promise(r => setTimeout(r, 200))

  const html = container.innerHTML

  const win = window.open('', '_blank')
  win.document.write(`<!DOCTYPE html><html><head>
    <meta charset="utf-8">
    <title>${filename}</title>
    <style>${printStyles}</style>
  </head><body>${html}</body></html>`)
  win.document.close()

  win.onload = () => {
    win.focus()
    win.print()
  }

  root.unmount()
  document.body.removeChild(container)
}
