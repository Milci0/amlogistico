import { Router } from 'express'
import { prisma } from '../_lib/prisma.js'
import { requireAuth, requireAdmin } from '../_lib/auth.js'
import { createNotificationSchema } from '../_validation/notifications.js'
import { formatZodError } from '../_validation/auth.js'

const router = Router()

// Wszystkie trasy wymagają zalogowania. userId ZAWSZE z tokenu (req.userId) —
// nigdy z body/query, inaczej można by czytać/kasować cudze powiadomienia.
router.use(requireAuth)

// Rekord bazy → obiekt oczekiwany przez frontend.
function toClient(row) {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    ctaLabel: row.ctaLabel,
    ctaUrl: row.ctaUrl,
    readAt: row.readAt,
    createdAt: row.createdAt,
  }
}

// GET /api/notifications — moje powiadomienia (najnowsze pierwsze).
router.get('/', async (req, res) => {
  const rows = await prisma.notification.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  })
  res.json({ notifications: rows.map(toClient) })
})

// POST /api/notifications/read-all — oznacz wszystkie moje jako przeczytane.
// (Przed '/:id/read', by nie kolidowało z parametrem.)
router.post('/read-all', async (req, res) => {
  const result = await prisma.notification.updateMany({
    where: { userId: req.userId, readAt: null },
    data: { readAt: new Date() },
  })
  res.json({ ok: true, count: result.count })
})

// PATCH /api/notifications/:id/read — oznacz moje jako przeczytane.
router.patch('/:id/read', async (req, res) => {
  const existing = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.userId },
  })
  if (!existing) return res.status(404).json({ error: 'Nie znaleziono powiadomienia' })
  const row = await prisma.notification.update({
    where: { id: existing.id },
    data: { readAt: existing.readAt ?? new Date() },
  })
  res.json({ notification: toClient(row) })
})

// DELETE /api/notifications/:id — usuń moje powiadomienie.
router.delete('/:id', async (req, res) => {
  const existing = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.userId },
  })
  if (!existing) return res.status(404).json({ error: 'Nie znaleziono powiadomienia' })
  await prisma.notification.delete({ where: { id: existing.id } })
  res.json({ ok: true })
})

// POST /api/notifications — WYSŁANIE (tylko admin). Odbiorca: konkretne konto (email)
// albo wszyscy (fan-out: osobny wiersz na użytkownika).
router.post('/', requireAdmin, async (req, res) => {
  const parsed = createNotificationSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Błąd walidacji', fields: formatZodError(parsed.error) })
  }
  const b = parsed.data
  const payload = {
    type: b.type,
    title: b.title,
    body: b.body,
    ctaLabel: b.ctaLabel ?? null,
    ctaUrl: b.ctaUrl ?? null,
  }

  if (b.target === 'user') {
    const user = await prisma.user.findUnique({
      where: { email: b.email.trim().toLowerCase() },
      select: { id: true },
    })
    if (!user) {
      return res.status(404).json({
        error: 'Błąd walidacji',
        fields: { email: 'Nie znaleziono użytkownika o tym adresie' },
      })
    }
    await prisma.notification.create({ data: { userId: user.id, ...payload } })
    return res.status(201).json({ ok: true, count: 1 })
  }

  // target === 'all' → broadcast do wszystkich kont.
  const users = await prisma.user.findMany({ select: { id: true } })
  if (users.length === 0) return res.status(201).json({ ok: true, count: 0 })
  await prisma.notification.createMany({
    data: users.map((u) => ({ userId: u.id, ...payload })),
  })
  res.status(201).json({ ok: true, count: users.length })
})

export default router
