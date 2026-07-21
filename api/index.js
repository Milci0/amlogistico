import express from 'express'
import cookieParser from 'cookie-parser'
import authRouter from './_routes/auth.js'
import profileRouter from './_routes/profile.js'
import documentSetsRouter from './_routes/documentSets.js'
import notificationsRouter from './_routes/notifications.js'
import newsRouter from './_routes/news.js'
import dieselRouter from './_routes/diesel.js'
import ecbRouter from './_routes/ecb.js'

const app = express()

// Za proxy Vercela — ufamy pierwszemu hopowi, by rate-limit widział realne IP
// klienta (X-Forwarded-For), a nie jeden współdzielony adres proxy.
app.set('trust proxy', 1)

app.use(express.json())
app.use(cookieParser())

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRouter)
app.use('/api/profile', profileRouter)
app.use('/api/document-sets', documentSetsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/news', newsRouter)
app.use('/api/diesel-price', dieselRouter)
app.use('/api/ecb-rate', ecbRouter)

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
