// Czesciowy indeks unikalny dla powiadomien automatycznych (2026-08-07).
//
// Po co: dwie karty przegladarki otwarte jednoczesnie odpytuja GET /api/notifications
// w tej samej chwili. Oba zadania widza „brak nieprzeczytanej zachety" i oba probuja
// ja utworzyc — na serverless leca w dwoch osobnych instancjach, wiec zadna transakcja
// w jednym procesie tego nie zlapie. Baza odrzuca druga wstawke (P2002), a modul
// api/_lib/autoNotifications.js traktuje to jak sukces.
//
// Prisma nie deklaruje indeksow z warunkiem WHERE w schemacie, wiec zakladamy go
// RAW SQL-em. Skrypt jest IDEMPOTENTNY — mozna go puszczac po kazdym `prisma db push`.
//
// Powiadomien admina indeks CELOWO nie obejmuje: tych moze wisiec wiele
// nieprzeczytanych naraz.
//
// Uruchomienie (po `prisma db push`):
//   NODE_OPTIONS=--use-system-ca node --env-file=.env scripts/apply-notification-index.js

import { PrismaClient } from '@prisma/client'
import { AUTO_KINDS } from '../api/_lib/autoNotifications.js'

const prisma = new PrismaClient()

const INDEX_NAME = 'notifications_active_auto_kind_key'

// Lista kategorii wchodzi do SQL-a z tej samej stalej, ktorej uzywa aplikacja —
// definicja „powiadomienia automatycznego" nie moze sie rozjechac miedzy baza
// a kodem. Wartosci sa naszymi wlasnymi stalymi, nie danymi uzytkownika, ale
// apostrofy i tak escapujemy.
const kindList = AUTO_KINDS.map((k) => `'${k.replace(/'/g, "''")}'`).join(', ')

// Warunek indeksu odwzorowuje definicje powiadomienia AKTYWNEGO: read_at IS NULL.
// Trzeciego stanu nie ma — „X" w dzwonku kasuje wiersz fizycznie.
const INDEX_SQL = `
CREATE UNIQUE INDEX IF NOT EXISTS ${INDEX_NAME}
  ON notifications (user_id, kind)
  WHERE read_at IS NULL AND kind IN (${kindList});
`

async function main() {
  // Wersja z 2026-08-07 opierala warunek na nieistniejacej juz kolumnie `status`.
  // CREATE ... IF NOT EXISTS nie podmienia warunku istniejacego indeksu, wiec
  // najpierw kasujemy stary (na czystej bazie to no-op).
  console.log(`1/2 Usuwam poprzednia wersje indeksu ${INDEX_NAME} (jesli istnieje)...`)
  await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS ${INDEX_NAME};`)

  console.log(`2/2 Zakladam indeks ${INDEX_NAME} (kategorie automatyczne: ${AUTO_KINDS.join(', ')})`)
  await prisma.$executeRawUnsafe(INDEX_SQL)

  const rows = await prisma.$queryRawUnsafe(
    `SELECT indexdef FROM pg_indexes WHERE tablename = 'notifications' AND indexname = $1`,
    INDEX_NAME,
  )
  if (rows.length === 0) {
    console.error('Indeks nie powstal. Sprawdz uprawnienia do bazy.')
    process.exitCode = 1
    return
  }
  console.log('Gotowe:', rows[0].indexdef)

  const counts = await prisma.$queryRawUnsafe(
    `SELECT kind, (read_at IS NULL) AS unread, COUNT(*)::int AS count
       FROM notifications GROUP BY kind, (read_at IS NULL) ORDER BY kind`,
  )
  if (counts.length === 0) console.log('Tabela notifications jest pusta.')
  for (const row of counts) {
    console.log(`  ${row.kind} / ${row.unread ? 'nieprzeczytane' : 'przeczytane'}: ${row.count}`)
  }
}

main()
  .catch((e) => {
    console.error('Blad migracji powiadomien:', e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
