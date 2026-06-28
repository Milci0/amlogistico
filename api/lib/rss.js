// Lekka biblioteka do agregacji newsów po stronie serwera.
// Parser RSS 2.0 / Atom oparty na regexach (bez zależności — unikamy tarcia
// z firmowym proxy npm). Wystarczający dla feedów WordPress i Google News.

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'

// ── HTTP z timeoutem i nagłówkiem przeglądarki ────────────────────────────────

export async function fetchText(url, { timeout = 9000, headers = {} } = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const res = await fetch(url, {
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'User-Agent': UA, 'Accept-Language': 'pl,en;q=0.8', ...headers },
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// ── Limiter współbieżności ────────────────────────────────────────────────────

export async function mapLimit(items, limit, fn) {
  const out = new Array(items.length)
  let i = 0
  async function worker() {
    while (i < items.length) {
      const idx = i++
      out[idx] = await fn(items[idx], idx)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
  return out
}

// ── Pomocnicze: encje, CDATA, tagi ────────────────────────────────────────────

function decodeEntities(s = '') {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#x([0-9a-fA-F]+);/gi, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#([0-9]+);/g, (_, dec) => String.fromCharCode(Number(dec)))
    .replace(/&amp;/g, '&')
    .trim()
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${name}>`, 'i'))
  return m ? decodeEntities(m[1]) : ''
}

function attr(block, regex) {
  const m = block.match(regex)
  return m ? m[1] : ''
}

// ── Parser feedu ──────────────────────────────────────────────────────────────

export function parseFeed(xml) {
  if (!xml) return []
  const items = []
  const isAtom = /<entry[\s>]/i.test(xml) && !/<item[\s>]/i.test(xml)
  const blocks = isAtom
    ? xml.split(/<entry[\s>]/i).slice(1).map(b => '<entry ' + b.split(/<\/entry>/i)[0])
    : xml.split(/<item[\s>]/i).slice(1).map(b => '<item ' + b.split(/<\/item>/i)[0])

  for (const block of blocks) {
    const title = tag(block, 'title')
    let link
    if (isAtom) {
      link = attr(block, /<link[^>]+href=["']([^"']+)["']/i) || tag(block, 'id')
    } else {
      link = tag(block, 'link') || attr(block, /<link[^>]+href=["']([^"']+)["']/i)
    }
    const pubDate = tag(block, 'pubDate') || tag(block, 'published') || tag(block, 'updated') || tag(block, 'dc:date')
    const description = tag(block, 'description') || tag(block, 'summary')
    if (title && link) items.push({ title, link: link.trim(), pubDate, description })
  }
  return items
}
