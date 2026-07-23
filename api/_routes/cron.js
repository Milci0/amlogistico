// api/_routes/cron.js
// Endpoint(y) wywoływane przez Vercel Cron. Chronione sekretem — Vercel dołącza nagłówek
// `Authorization: Bearer <CRON_SECRET>` do żądań cron, gdy ustawiona jest zmienna
// środowiskowa CRON_SECRET. Nikt z zewnątrz bez sekretu nie odpali synchronizacji.
//
// Uwaga wydajnościowa: pełna synchronizacja ISZTAR (21+ stron × PL[+EN] + ~19k wierszy)
// trwa kilkadziesiąt sekund — dłużej niż domyślny limit funkcji serverless. Dlatego:
//   - cron leci PL-only (withEn=false), co połowi liczbę żądań i NIE kasuje opisów EN,
//   - w vercel.json ustawiamy podniesiony maxDuration dla funkcji api.
// Jeśli plan Vercel nie pozwala na wystarczający czas, alternatywą jest ręczne CLI
// (scripts/sync-isztar.js) albo zewnętrzny scheduler (np. GitHub Actions).

import express from 'express'
import { prisma } from '../_lib/prisma.js'
import { runSync } from '../../scripts/lib/syncCore.js'

const router = express.Router()

// Weryfikacja sekretu crona. Bez ustawionego CRON_SECRET endpoint jest zamknięty (503),
// żeby nie dało się go odpalić anonimowo.
function requireCronSecret(req, res, next) {
  const secret = process.env.CRON_SECRET
  if (!secret) return res.status(503).json({ error: 'CRON_SECRET nie skonfigurowany' })
  const auth = req.get('authorization') || ''
  if (auth !== `Bearer ${secret}`) return res.status(401).json({ error: 'Brak autoryzacji crona' })
  next()
}

// Vercel Cron wywołuje GET. Zwraca statystyki synchronizacji.
router.get('/sync-isztar', requireCronSecret, async (_req, res, next) => {
  try {
    const stats = await runSync(prisma, {
      withEn: false, // szybciej + nie kasuje istniejących opisów EN z ręcznych przebiegów
      log: (...a) => console.log('[cron sync-isztar]', ...a),
    })
    res.json({ ok: true, ...stats })
  } catch (e) {
    next(e)
  }
})

export default router
