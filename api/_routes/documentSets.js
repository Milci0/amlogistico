import { Router } from 'express'
import { prisma } from '../_lib/prisma.js'
import { requireAuth } from '../_lib/auth.js'
import { createSetSchema, updateSetSchema } from '../_validation/documentSets.js'
import { formatZodError } from '../_validation/auth.js'

const router = Router()

// Wszystkie trasy wymagają zalogowania. userId ZAWSZE z tokenu (req.userId),
// NIGDY z body/query — inaczej można by czytać/pisać cudze sety.
router.use(requireAuth)

// Płaskie kolumny wyszukiwarki wyciągamy z meta (pojedyncze źródło prawdy w formData/meta).
function flatColumns(meta) {
  const m = meta || {}
  return {
    transportMode: m.transportMode ?? null,
    countryFrom: m.routeFrom ?? null,
    countryTo: m.routeTo ?? null,
  }
}

// Rekord bazy → pełny obiekt DocumentSet oczekiwany przez frontend (repo).
function toClientSet(row) {
  return {
    id: row.id,
    userId: row.userId,
    status: row.status,
    kind: row.kind,
    flowType: row.flowType,
    totalSteps: row.totalSteps,
    derivedFromId: row.derivedFromId,
    lastStep: row.lastStep,
    maxStepReached: row.maxStepReached,
    templateVersion: row.templateVersion,
    formData: row.formData,
    engineResult: row.engineResult,
    selectedDocs: row.selectedDocs,
    meta: row.meta,
    completedAt: row.completedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

// Wersja listowa — bez ciężkiego formData/engineResult (oszczędność transferu).
function toClientListItem(row) {
  const { formData, engineResult, ...rest } = toClientSet(row)
  return rest
}

// GET /api/document-sets?status=draft|completed — metadane setów usera (bez formData)
router.get('/', async (req, res) => {
  const where = { userId: req.userId }
  if (req.query.status === 'draft' || req.query.status === 'completed') {
    where.status = req.query.status
  }
  const rows = await prisma.documentSet.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  })
  res.json({ sets: rows.map(toClientListItem) })
})

// GET /api/document-sets/:id — pełny set (z formData). Cudzy/nieistniejący = 404.
router.get('/:id', async (req, res) => {
  const row = await prisma.documentSet.findFirst({
    where: { id: req.params.id, userId: req.userId },
  })
  if (!row) return res.status(404).json({ error: 'Nie znaleziono zestawu' })
  res.json({ set: toClientSet(row) })
})

// POST /api/document-sets — nowy set (draft lub completed).
router.post('/', async (req, res) => {
  const parsed = createSetSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Błąd walidacji', fields: formatZodError(parsed.error) })
  }
  const b = parsed.data
  const now = new Date()
  const row = await prisma.documentSet.create({
    data: {
      userId: req.userId,
      status: b.status,
      kind: b.kind ?? null,
      flowType: b.flowType,
      totalSteps: b.totalSteps,
      templateVersion: b.templateVersion,
      formData: b.formData ?? {},
      engineResult: b.engineResult ?? null,
      selectedDocs: b.selectedDocs ?? [],
      meta: b.meta ?? {},
      lastStep: b.lastStep ?? 1,
      maxStepReached: b.maxStepReached ?? 1,
      derivedFromId: b.derivedFromId ?? null,
      completedAt: b.status === 'completed' ? now : null,
      ...flatColumns(b.meta),
    },
  })
  res.status(201).json({ set: toClientSet(row) })
})

// PATCH /api/document-sets/:id — aktualizacja (autosave draftu / promocja na completed).
// Cudzy/nieistniejący = 404 (nie ujawniamy istnienia).
router.patch('/:id', async (req, res) => {
  const parsed = updateSetSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Błąd walidacji', fields: formatZodError(parsed.error) })
  }
  const existing = await prisma.documentSet.findFirst({
    where: { id: req.params.id, userId: req.userId },
  })
  if (!existing) return res.status(404).json({ error: 'Nie znaleziono zestawu' })

  const b = parsed.data
  const data = {}
  for (const key of [
    'status', 'kind', 'flowType', 'totalSteps', 'templateVersion', 'formData',
    'engineResult', 'selectedDocs', 'meta', 'lastStep', 'maxStepReached', 'derivedFromId',
  ]) {
    if (b[key] !== undefined) data[key] = b[key]
  }
  if (b.meta !== undefined) Object.assign(data, flatColumns(b.meta))
  // Promocja draft → completed ustawia znacznik czasu (jeśli nie był ustawiony).
  if (b.status === 'completed' && !existing.completedAt) data.completedAt = new Date()

  const row = await prisma.documentSet.update({
    where: { id: existing.id },
    data,
  })
  res.json({ set: toClientSet(row) })
})

// DELETE /api/document-sets/:id — usuwa set usera. Cudzy/nieistniejący = 404.
router.delete('/:id', async (req, res) => {
  const existing = await prisma.documentSet.findFirst({
    where: { id: req.params.id, userId: req.userId },
  })
  if (!existing) return res.status(404).json({ error: 'Nie znaleziono zestawu' })
  await prisma.documentSet.delete({ where: { id: existing.id } })
  res.json({ ok: true })
})

export default router
