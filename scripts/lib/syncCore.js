// Rdzeń synchronizacji cn_codes ⇄ ISZTAR4 — współdzielony przez:
//   - CLI: scripts/sync-isztar.js (ręczne uruchomienie z Prisma CLI)
//   - Vercel Cron: api/_routes/cron.js (tygodniowe odświeżenie)
//
// Używa parametryzowanego RAW SQL (działa niezależnie od tego, czy `prisma generate`
// objął model CnCode). `prisma` wstrzykiwane z zewnątrz (CLI tworzy własny klient,
// serverless używa singletona z api/_lib/prisma.js).

import { fetchAllCodes } from './isztar.js'

const INSERT_CHUNK = 800 // 800 wierszy × 8 parametrów = 6400 < limit 65535
const DEACT_CHUNK = 5000

async function upsertChunk(prisma, rows, now) {
  const cols = 8
  const values = []
  const params = []
  rows.forEach((r, i) => {
    const b = i * cols
    values.push(`($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7},$${b + 8})`)
    params.push(r.code, r.cn8, r.parentCode, r.level, r.descriptionPl, r.descriptionEn, now, now)
  })
  const sql = `
    INSERT INTO cn_codes
      (code, cn8, parent_code, level, description_pl, description_en, valid_from, updated_at)
    VALUES ${values.join(',')}
    ON CONFLICT (code) DO UPDATE SET
      cn8            = EXCLUDED.cn8,
      parent_code    = EXCLUDED.parent_code,
      level          = EXCLUDED.level,
      description_pl = EXCLUDED.description_pl,
      description_en = EXCLUDED.description_en,
      valid_to       = NULL,
      updated_at     = EXCLUDED.updated_at`
  // valid_from celowo NIE aktualizowane przy ON CONFLICT — zachowuje datę pierwszego wpisu.
  await prisma.$executeRawUnsafe(sql, ...params)
}

async function deactivateChunk(prisma, codes, now) {
  const ph = codes.map((_, i) => `$${i + 3}`).join(',')
  const sql = `UPDATE cn_codes SET valid_to = $1, updated_at = $2
               WHERE valid_to IS NULL AND code IN (${ph})`
  await prisma.$executeRawUnsafe(sql, now, now, ...codes)
}

// Główna procedura synchronizacji. Zwraca statystyki { added, updated, unchanged,
// deactivated, total, date }.
export async function runSync(prisma, { date, withEn = true, log = () => {}, onProgress } = {}) {
  const syncDate = date || new Date().toISOString().slice(0, 10)
  const now = new Date()

  log(`Pobieram nomenklaturę PL (${syncDate})…`)
  const plMap = await fetchAllCodes(syncDate, 'PL', { onProgress })
  log(`Pobrano ${plMap.size} kodów (PL).`)

  let enMap = new Map()
  if (withEn) {
    try {
      log('Pobieram opisy EN…')
      enMap = await fetchAllCodes(syncDate, 'EN', { onProgress })
      log(`Pobrano ${enMap.size} opisów (EN).`)
    } catch (e) {
      log(`OSTRZEŻENIE: pobranie EN nie powiodło się (description_en bez zmian): ${e.message}`)
    }
  }

  const fresh = new Map()
  for (const { code, parentCode, level, description } of plMap.values()) {
    fresh.set(code, {
      code,
      cn8: code.slice(0, 8),
      parentCode,
      level,
      descriptionPl: description,
      descriptionEn: enMap.get(code)?.description ?? null,
    })
  }

  const existingRows = await prisma.$queryRawUnsafe(
    'SELECT code, parent_code, level, description_pl, description_en, valid_to FROM cn_codes'
  )
  const existing = new Map(existingRows.map((r) => [r.code, r]))

  const toWrite = []
  let added = 0
  let updated = 0
  let unchanged = 0
  for (const row of fresh.values()) {
    const prev = existing.get(row.code)
    if (!prev) {
      added++
      toWrite.push(row)
    } else {
      // Gdy nie pobraliśmy EN (withEn=false), NIE porównujemy opisu EN i NIE nadpisujemy go
      // wartością null — cotygodniowy cron może działać bez EN, nie kasując istniejących opisów.
      const enChanged = withEn && (prev.description_en ?? null) !== (row.descriptionEn ?? null)
      const changed =
        prev.parent_code !== row.parentCode ||
        prev.level !== row.level ||
        prev.description_pl !== row.descriptionPl ||
        enChanged ||
        prev.valid_to !== null
      if (changed) {
        // przy withEn=false zachowaj istniejący opis EN
        if (!withEn) row.descriptionEn = prev.description_en ?? null
        updated++
        toWrite.push(row)
      } else {
        unchanged++
      }
    }
  }

  const toDeactivate = []
  for (const [code, prev] of existing) {
    if (prev.valid_to === null && !fresh.has(code)) toDeactivate.push(code)
  }

  log(`Zapisuję: ${added} nowych, ${updated} zaktualizowanych (bez zmian: ${unchanged})…`)
  for (let i = 0; i < toWrite.length; i += INSERT_CHUNK) {
    await upsertChunk(prisma, toWrite.slice(i, i + INSERT_CHUNK), now)
  }
  if (toDeactivate.length) {
    log(`Oznaczam ${toDeactivate.length} kodów jako wygasłe (valid_to = ${syncDate})…`)
    for (let i = 0; i < toDeactivate.length; i += DEACT_CHUNK) {
      await deactivateChunk(prisma, toDeactivate.slice(i, i + DEACT_CHUNK), now)
    }
  }

  const totalRows = await prisma.$queryRawUnsafe('SELECT COUNT(*)::int AS n FROM cn_codes')
  return { added, updated, unchanged, deactivated: toDeactivate.length, total: totalRows[0].n, date: syncDate }
}
