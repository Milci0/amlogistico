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
import { mapLimit } from '../_lib/rss.js'
import { shouldPoll } from '../_lib/containerTrackingRepo.js'
import { pollAndSave } from '../_lib/shipsgoSync.js'
import { isContainerReady, notifyContainerReady } from '../_lib/containerReadyNotifications.js'

const router = express.Router()

// ── Wielkosc porcji dla /tracking-ready ─────────────────────────────────────
// Jeden rekord kosztuje najwyzej 2 zapytania do ShipsGo (dane przesylki plus
// warunkowo trasa), zawsze GET, nigdy POST. 20 rekordow to najwyzej 40 zapytan,
// z zapasem ponizej limitu 100 na minute dzielonego z ruchem uzytkownikow,
// i mniej niz 20 sekund przy limicie 60 s funkcji serverless.
const READY_BATCH = 20
const READY_CONCURRENCY = 4

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

// GET /api/cron/tracking-ready — sprawdza, czy ktorys ze sledzonych kontenerow
// przestal byc „w przygotowaniu", i tworzy jednorazowe powiadomienie dla kazdego
// obserwujacego. Wywoluje wspolna funkcje z api/_lib/containerReadyNotifications.js:
// cron jest tylko JEDNYM z jej wejsc, wiec pozniejsze podpiecie webhooka ShipsGo
// nie wymaga przepisywania tej logiki.
//
// KOSZT: wylacznie GET-y do ShipsGo, ktore nie zdejmuja kredytu. Kredyt schodzi
// przy POST (utworzeniu sledzenia), a tego ta trasa nie robi w zadnym przypadku.
//
// HARMONOGRAM: patrz vercel.json, klucz `crons`. Plan Hobby dopuszcza wyzwalanie
// raz dziennie i najwyzej dwa zadania, stad "0 5 * * *". Po przejsciu na plan Pro
// wystarczy zmienic TE JEDNA LINIE w vercel.json na czestszy wzorzec, np.
// "0 */3 * * *" (co trzy godziny) albo "*/30 * * * *" (co pol godziny).
// Komentarza nie da sie umiescic w vercel.json, bo Vercel wymaga poprawnego JSON-a.
//
// Rekordy bez szans na gotowosc (UNTRACKED, DISCHARGED, fetchState 'failed') sa
// odsiewane juz w zapytaniu, zeby nie zajmowaly miejsca w porcji w kazdym przebiegu.
router.get('/tracking-ready', requireCronSecret, async (_req, res, next) => {
  try {
    const rows = await prisma.containerTracking.findMany({
      where: {
        discardedAt: null,
        readyNotifiedAt: null,
        fetchState: { not: 'failed' },
        status: { notIn: ['UNTRACKED', 'DISCHARGED'] },
      },
      // Najdawniej sprawdzane pierwsze, wiec przy dluzszej kolejce porcje rotuja
      // miedzy przebiegami zamiast w kolko brac tych samych rekordow.
      orderBy: { lastPolledAt: 'asc' },
      take: READY_BATCH,
    })

    const stats = { sprawdzone: rows.length, odpytane: 0, gotowe: 0, powiadomienia: 0, bledy: 0 }

    await mapLimit(rows, READY_CONCURRENCY, async (row) => {
      try {
        let current = row

        // Rekord, ktory dojechal juz webhookiem, jest gotowy od reki: zero
        // zapytan do ShipsGo, samo nadrobienie zaleglego powiadomienia.
        if (!isContainerReady(current) && shouldPoll(current)) {
          current = await pollAndSave(current)
          stats.odpytane++
        }
        if (!isContainerReady(current)) return

        stats.gotowe++
        const result = await notifyContainerReady(current)
        stats.powiadomienia += result.created
      } catch (e) {
        // Blad jednego rekordu nie moze przerwac calego przebiegu.
        stats.bledy++
        console.error('[cron tracking-ready] blad rekordu', row.containerNumber, e)
      }
    })

    console.log('[cron tracking-ready]', JSON.stringify(stats))
    res.json({ ok: true, ...stats })
  } catch (e) {
    next(e)
  }
})

export default router
