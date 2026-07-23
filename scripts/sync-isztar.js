// scripts/sync-isztar.js
// CLI do synchronizacji tabeli `cn_codes` z nomenklaturą CN/TARIC z ISZTAR4 (MF).
// Rdzeń logiki jest w scripts/lib/syncCore.js (współdzielony z Vercel Cron).
//
// Uruchomienie:
//   NODE_OPTIONS=--use-system-ca node --env-file=.env scripts/sync-isztar.js
//   opcjonalnie: --date=YYYY-MM-DD (domyślnie dzisiaj),  --no-en (pomiń opisy EN)
//
// Zasady: UPSERT po `code` (brak duplikatów przy powtórnym przebiegu); kodów, które
// zniknęły z API, NIE kasujemy — oznaczamy valid_to. Cron/scheduler = api/_routes/cron.js.

import { PrismaClient } from '@prisma/client'
import { runSync } from './lib/syncCore.js'

function arg(name, def = null) {
  const hit = process.argv.find((a) => a.startsWith(`--${name}=`))
  return hit ? hit.split('=')[1] : def
}
const hasFlag = (name) => process.argv.includes(`--${name}`)

const DATE = arg('date', new Date().toISOString().slice(0, 10))
const WITH_EN = !hasFlag('no-en')

const prisma = new PrismaClient()

runSync(prisma, {
  date: DATE,
  withEn: WITH_EN,
  log: (...a) => console.log(`[sync-isztar ${DATE}]`, ...a),
  onProgress: (p, last) => process.stdout.write(`\r  strona ${p}/${last}   `),
})
  .then((stats) => {
    process.stdout.write('\n')
    console.log(`[sync-isztar ${DATE}] ── PODSUMOWANIE ──`)
    console.log(`  dodano:         ${stats.added}`)
    console.log(`  zaktualizowano: ${stats.updated}`)
    console.log(`  bez zmian:      ${stats.unchanged}`)
    console.log(`  wygaszono:      ${stats.deactivated}`)
    console.log(`  razem w bazie:  ${stats.total}`)
  })
  .catch((e) => {
    console.error('[sync-isztar] BŁĄD:', e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
