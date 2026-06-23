import express from 'express'
import cookieParser from 'cookie-parser'
import authRouter from './routes/auth.js'
import newsRouter from './routes/news.js'

const app = express()

app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRouter)
app.use('/api/news', newsRouter)

// Globalny handler błędów — łapie wyjątki z async tras (Express 5 forwarduje je tu)
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[API error]', err)
  res.status(500).json({ error: 'Błąd serwera' })
})

// Lokalnie (poza Vercelem) startujemy zwykły serwer HTTP.
// Na Vercelu plik jest importowany jako funkcja serverless (export default app).
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`AmLogistico API → http://localhost:${PORT}`)
  })
}

export default app
