// Uzupelnienie znacznika container_tracking.ready_notified_at (2026-08-07).
//
// PO CO: powiadomienie „kontener gotowy do sledzenia" ma dotyczyc rejsow, ktore
// stana sie gotowe PO wdrozeniu. Bez tego kroku pierwszy przebieg zadania
// cyklicznego uznalby wszystkie dawno sledzone kontenery za swiezo gotowe
// i zasypal uzytkownikow lawina powiadomien o czyms, co ogladaja od tygodni.
//
// Skrypt jest IDEMPOTENTNY: rusza wylacznie wiersze z pustym znacznikiem, wiec
// mozna go puszczac wielokrotnie. Uruchamiac RAZ, tuz po `prisma db push`.
//
// Warunek gotowosci jest ten sam co w kodzie (api/_lib/containerReadyNotifications.js);
// lista statusow wchodzi do SQL-a z tej samej stalej, zeby definicja nie mogla sie
// rozjechac miedzy baza a aplikacja (ten sam wzorzec co INACTIVE_STATUSES
// w scripts/apply-tracking-index.js).
//
// Uruchomienie:
//   NODE_OPTIONS=--use-system-ca node --env-file=.env scripts/backfill-ready-notified.js

import { PrismaClient } from '@prisma/client'
import { NOT_READY_STATUSES } from '../api/_lib/containerReadyNotifications.js'

const prisma = new PrismaClient()

const statusList = NOT_READY_STATUSES.map((s) => `'${s.replace(/'/g, "''")}'`).join(', ')

const SQL = `
UPDATE container_tracking
   SET ready_notified_at = now()
 WHERE ready_notified_at IS NULL
   AND discarded_at IS NULL
   AND fetch_state = 'ready'
   AND status NOT IN (${statusList})
   AND snapshot IS NOT NULL
   AND (
        geojson IS NOT NULL
     OR snapshot->'loadingLocation'->>'name' IS NOT NULL
     OR snapshot->'dischargeLocation'->>'name' IS NOT NULL
   );
`

async function main() {
  const before = await prisma.$queryRawUnsafe(
    `SELECT COUNT(*)::int AS total,
            COUNT(ready_notified_at)::int AS oznaczone
       FROM container_tracking`,
  )
  console.log(`Przed: ${before[0].total} rekordow sledzenia, ${before[0].oznaczone} z ustawionym znacznikiem.`)

  const updated = await prisma.$executeRawUnsafe(SQL)
  console.log(`Oznaczono jako „juz powiadomiono": ${updated}`)

  const after = await prisma.$queryRawUnsafe(
    `SELECT status, fetch_state, (ready_notified_at IS NOT NULL) AS oznaczony, COUNT(*)::int AS ile
       FROM container_tracking
      GROUP BY status, fetch_state, (ready_notified_at IS NOT NULL)
      ORDER BY status`,
  )
  for (const r of after) {
    console.log(`  ${r.status} / ${r.fetch_state} / ${r.oznaczony ? 'oznaczony' : 'do powiadomienia'}: ${r.ile}`)
  }
}

main()
  .catch((e) => {
    console.error('Blad uzupelniania znacznika:', e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
