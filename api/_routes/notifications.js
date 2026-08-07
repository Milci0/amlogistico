import { Router } from 'express'
import { prisma } from '../_lib/prisma.js'
import { requireAuth, requireAdmin } from '../_lib/auth.js'
import {
  syncAutoNotifications,
  recordReminderAction,
  isAutoKind,
  KIND_ADMIN_MESSAGE,
} from '../_lib/autoNotifications.js'
import { createNotificationSchema, readByObjectSchema, OBJECT_PARAM_BY_KIND } from '../_validation/notifications.js'
import { formatZodError } from '../_validation/auth.js'

const router = Router()

// Wszystkie trasy wymagają zalogowania. userId ZAWSZE z tokenu (req.userId) —
// nigdy z body/query, inaczej można by czytać/kasować cudze powiadomienia.
// Serwer nie przyjmuje od klienta ani dat, ani statusów, ani oceny stanu profilu:
// wszystko to liczy sam.
router.use(requireAuth)

// Ile powiadomień wraca do dzwonka. Paginacji nie ma (dzwonek to cała historia,
// osobnej podstrony nie budujemy), ale lista nie może rosnąć bez końca — przy
// koncie z setkami wpisów dropdown i tak pokazuje tylko to, co się przewinie.
// Licznik nieprzeczytanych liczony jest OSOBNYM zapytaniem, więc obcięcie listy
// nie zaniża czerwonej cyfry.
const LIST_LIMIT = 50

// Rekord bazy → obiekt oczekiwany przez frontend.
function toClient(row) {
  return {
    id: row.id,
    kind: row.kind,
    type: row.type,
    title: row.title,
    body: row.body,
    ctaLabel: row.ctaLabel,
    ctaUrl: row.ctaUrl,
    params: row.params,
    readAt: row.readAt,
    createdAt: row.createdAt,
  }
}

// GET /api/notifications — pełna zawartość dzwonka: nieprzeczytane I przeczytane,
// oba źródła w jednej liście, najnowsze pierwsze. Dzwonek JEST historią, więc
// przeczytany wpis zostaje na liście (front pokazuje go przygaszonego) i znika
// dopiero po skasowaniu przyciskiem „X".
//
// Najpierw leniwa synchronizacja powiadomień automatycznych: to jedyny moment,
// w którym mogą powstać albo zostać zamknięte.
router.get('/', async (req, res) => {
  await syncAutoNotifications(req.userId)
  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' },
      take: LIST_LIMIT,
    }),
    prisma.notification.count({ where: { userId: req.userId, readAt: null } }),
  ])
  res.json({ notifications: rows.map(toClient), unreadCount })
})

// POST /api/notifications/read-all — „oznacz wszystkie jako przeczytane".
// Obejmuje OBA źródła naraz (admin + automatyczne). Powiadomienia zostają na
// liście, znika tylko czerwona cyfra.
router.post('/read-all', async (req, res) => {
  // Które kategorie automatyczne obejmie ta akcja — trzeba sprawdzić PRZED
  // aktualizacją, bo potem nie ma już nieprzeczytanych.
  const affected = await prisma.notification.findMany({
    where: { userId: req.userId, readAt: null },
    select: { kind: true },
    distinct: ['kind'],
  })
  const result = await prisma.notification.updateMany({
    where: { userId: req.userId, readAt: null },
    data: { readAt: new Date() },
  })
  await recordReminderAction(req.userId, affected.map((n) => n.kind), 'read')
  res.json({ ok: true, count: result.count })
})

// POST /api/notifications/read-by-object — oznacza jako przeczytane powiadomienia
// dotyczące konkretnego obiektu, niezależnie od tego, czy użytkownik przyszedł
// z dzwonka, czy z listy. Dziś jedyne zastosowanie: wejście w szczegóły kontenera
// zamyka powiadomienie „gotowy do śledzenia" o tym rejsie.
//
// DLACZEGO TRASA, A NIE SZUKANIE PO STRONIE KLIENTA: dzwonek pobiera najwyżej
// 50 ostatnich wpisów i tylko wtedy, gdy jest zamontowany. Trasa nie zależy ani
// od jednego, ani od drugiego, a `userId` bierze z tokenu, więc cudzych
// powiadomień nie ruszy. Cudzy albo nieistniejący obiekt daje po prostu 0.
router.post('/read-by-object', async (req, res) => {
  const parsed = readByObjectSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Błąd walidacji', fields: formatZodError(parsed.error) })
  }
  const { kind, objectId } = parsed.data
  const result = await prisma.notification.updateMany({
    where: {
      userId: req.userId,
      kind,
      readAt: null,
      params: { path: [OBJECT_PARAM_BY_KIND[kind]], equals: objectId },
    },
    data: { readAt: new Date() },
  })
  res.json({ ok: true, count: result.count })
})

// PATCH /api/notifications/:id/read — klik w powiadomienie w dzwonku.
// Idempotentne: powtórne wywołanie na przeczytanym rekordzie nie jest błędem i NIE
// nadpisuje pierwotnego znacznika czasu ani odroczenia.
router.patch('/:id/read', async (req, res) => {
  const existing = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.userId },
  })
  if (!existing) return res.status(404).json({ error: 'Nie znaleziono powiadomienia' })
  if (existing.readAt) return res.json({ notification: toClient(existing) })

  const row = await prisma.notification.update({
    where: { id: existing.id },
    data: { readAt: new Date() },
  })
  await recordReminderAction(req.userId, [existing.kind], 'read')
  res.json({ notification: toClient(row) })
})

// DELETE /api/notifications/:id — „X" na pojedynczym powiadomieniu. Kasuje wiersz
// NA STAŁE: dzwonek jest jedyną historią, więc zamknięty wpis nie ma dokąd trafić.
// Cudze lub nieistniejące id → 404 (nie 403: nie ujawniamy, że rekord istnieje).
//
// Odroczenie zapisujemy PRZED skasowaniem, na koncie użytkownika — inaczej zniknęłoby
// razem z wierszem i zachęta wróciłaby przy najbliższym pobraniu listy.
router.delete('/:id', async (req, res) => {
  const existing = await prisma.notification.findFirst({
    where: { id: req.params.id, userId: req.userId },
    select: { id: true, kind: true },
  })
  if (!existing) return res.status(404).json({ error: 'Nie znaleziono powiadomienia' })

  if (isAutoKind(existing.kind)) {
    await recordReminderAction(req.userId, [existing.kind], 'dismissed')
  }
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
  // `kind` jest ustawiane TWARDO, nie przychodzi z formularza: przez panel admina
  // nie da się wysłać powiadomienia automatycznego (i odwrotnie — moduł
  // autoNotifications nigdy nie tworzy ADMIN_MESSAGE).
  const payload = {
    kind: KIND_ADMIN_MESSAGE,
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
