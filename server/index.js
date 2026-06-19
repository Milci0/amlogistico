const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')

dotenv.config()

const documentsRouter = require('./routes/documents')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/documents', documentsRouter)

app.listen(PORT, () => {
  console.log(`AmLogistico server running on http://localhost:${PORT}`)
})
