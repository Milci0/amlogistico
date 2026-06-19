const { selectDocuments } = require('../logic/selectDocuments')
const { generateCMR } = require('../generators/cmr')
const { generatePackingList } = require('../generators/packingList')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const fs = require('fs')

const TMP_DIR = path.join(__dirname, '..', 'tmp')
if (!fs.existsSync(TMP_DIR)) fs.mkdirSync(TMP_DIR, { recursive: true })

const GENERATORS = {
  cmr: generateCMR,
  packing_list: generatePackingList,
}

async function generate(req, res) {
  const { transport, fromCountry, fromCity, toCountry, toCity, loadDate, cargo, sender, receiver } = req.body

  if (!transport || !fromCountry || !toCountry || !cargo || !sender || !receiver) {
    return res.status(400).json({ error: 'Brakujące dane formularza' })
  }

  const { docs, outsideEU } = selectDocuments(transport, fromCountry, toCountry)

  const formData = { transport, fromCountry, fromCity, toCountry, toCity, loadDate, cargo, sender, receiver }

  const results = []

  for (const doc of docs) {
    const generator = GENERATORS[doc.code]
    if (!generator) {
      results.push({ ...doc, url: null, status: 'unsupported' })
      continue
    }

    try {
      const pdfBuffer = await generator(formData)
      const filename = `${doc.code}_${uuidv4()}.pdf`
      const filepath = path.join(TMP_DIR, filename)
      fs.writeFileSync(filepath, pdfBuffer)
      results.push({ ...doc, url: `/api/documents/download/${filename}`, status: 'ready' })
    } catch (err) {
      console.error(`Błąd generowania ${doc.code}:`, err.message)
      results.push({ ...doc, url: null, status: 'error' })
    }
  }

  res.json({ outsideEU, documents: results })
}

function download(req, res) {
  const { filename } = req.params
  if (filename.includes('..') || filename.includes('/')) {
    return res.status(400).json({ error: 'Nieprawidłowa nazwa pliku' })
  }
  const filepath = path.join(TMP_DIR, filename)
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'Plik nie istnieje lub wygasł' })
  }
  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
  fs.createReadStream(filepath).pipe(res)
}

module.exports = { generate, download }
