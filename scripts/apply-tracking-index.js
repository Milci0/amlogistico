// Zaklada CZESCIOWY indeks unikalny na container_tracking, ktorego Prisma nie
// potrafi zadeklarowac w schemacie (`@@unique` nie przyjmuje warunku WHERE).
//
// Zasada, ktora ten indeks wymusza: dla jednego numeru kontenera moze istniec
// co najwyzej JEDEN rekord AKTYWNY. Rekordow archiwalnych (zakonczone rejsy)
// moze byc wiele i sa zachowywane — ten sam kontener wraca w kolejnych rejsach.
//
// Dlaczego indeks, a nie sama walidacja aplikacyjna: to jedyna wersja odporna na
// wyscig. Dwoch uzytkownikow moze kliknac „Sprawdz" dla tego samego numeru w tej
// samej sekundzie, a na serverless leca one w dwoch osobnych instancjach. Baza
// odrzuca druga wstawke (P2002), wiec do ShipsGo idzie jeden POST i jeden kredyt.
//
// Uruchomienie (po kazdym `prisma db push`, ktory odtwarza tabele):
//   NODE_OPTIONS=--use-system-ca node --env-file=.env scripts/apply-tracking-index.js
//
// Skrypt jest IDEMPOTENTNY — mozna go puszczac wielokrotnie.

import { PrismaClient } from '@prisma/client'
import { INACTIVE_STATUSES } from '../api/_lib/containerTrackingRepo.js'

const prisma = new PrismaClient()

const INDEX_NAME = 'container_tracking_active_number_key'

// Lista statusow wchodzi do SQL-a z tej samej stalej, ktorej uzywa kod aplikacji
// (api/_lib/containerTrackingRepo.js) — dzieki temu definicja „rekordu aktywnego"
// nie moze sie rozjechac miedzy baza a aplikacja. Wartosci sa naszymi wlasnymi
// stalymi, nie danymi od uzytkownika, ale i tak escapujemy apostrofy.
const statusList = INACTIVE_STATUSES.map((s) => `'${s.replace(/'/g, "''")}'`).join(', ')

const SQL = `
CREATE UNIQUE INDEX IF NOT EXISTS ${INDEX_NAME}
  ON container_tracking (container_number)
  WHERE discarded_at IS NULL AND status NOT IN (${statusList});
`

async function main() {
  console.log(`Zakladam indeks ${INDEX_NAME} (statusy nieaktywne: ${INACTIVE_STATUSES.join(', ')})`)
  await prisma.$executeRawUnsafe(SQL)

  const rows = await prisma.$queryRawUnsafe(
    `SELECT indexdef FROM pg_indexes WHERE tablename = 'container_tracking' AND indexname = $1`,
    INDEX_NAME,
  )
  if (rows.length === 0) {
    console.error('Indeks nie powstal. Sprawdz uprawnienia do bazy.')
    process.exitCode = 1
    return
  }
  console.log('Gotowe:', rows[0].indexdef)
}

main()
  .catch((e) => {
    console.error('Blad zakladania indeksu:', e)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
