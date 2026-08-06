import express from 'express'
import cookieParser from 'cookie-parser'
import authRouter from './_routes/auth.js'
import profileRouter from './_routes/profile.js'
import documentSetsRouter from './_routes/documentSets.js'
import notificationsRouter from './_routes/notifications.js'
import newsRouter from './_routes/news.js'
import dieselRouter from './_routes/diesel.js'
import ecbRouter from './_routes/ecb.js'
import cronRouter from './_routes/cron.js'
import hsCodeRouter from './_routes/hsCode.js'
import freightRouter from './_routes/freight.js'
import shipsgoTrackingRouter from './_routes/shipsgoTracking.js'
import trackingRouter from './_routes/tracking.js'

const app = express()

// Za proxy Vercela — ufamy pierwszemu hopowi, by rate-limit widział realne IP
// klienta (X-Forwarded-For), a nie jeden współdzielony adres proxy.
app.set('trust proxy', 1)

// `verify` zapisuje SUROWE bajty ciała żądania. Potrzebuje ich wyłącznie webhook
// ShipsGo (api/_routes/tracking.js): podpis HMAC liczy się z tego, co faktycznie
// przyszło, a ponowna serializacja sparsowanego JSON-a zmieniłaby kolejność kluczy
// i białe znaki, więc HMAC nigdy by się nie zgodził. Dla pozostałych tras to
// wyłącznie referencja do bufora, który i tak powstał podczas parsowania.
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf } }))
app.use(cookieParser())

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', authRouter)
app.use('/api/profile', profileRouter)
app.use('/api/document-sets', documentSetsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/news', newsRouter)
app.use('/api/diesel-price', dieselRouter)
app.use('/api/ecb-rate', ecbRouter)
app.use('/api/cron', cronRouter)
app.use('/api/hs-code', hsCodeRouter)
app.use('/api/freight', freightRouter)
app.use('/api/shipsgo-tracking', shipsgoTrackingRouter)
app.use('/api/tracking', trackingRouter)

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
