import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../lib/prisma.js'
import { signToken, setAuthCookie, clearAuthCookie, requireAuth } from '../lib/auth.js'
import { authLimiter } from '../lib/rateLimit.js'
import { registerSchema, loginSchema, formatZodError } from '../validation/auth.js'

const router = Router()

// Zwraca usera bez wrażliwych pól (nigdy nie wysyłamy passwordHash)
function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    companyName: u.companyName,
    vatNumber: u.vatNumber,
    plan: u.plan,
    createdAt: u.createdAt,
  }
}

// POST /api/auth/register
router.post('/register', authLimiter, async (req, res) => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Błąd walidacji', fields: formatZodError(parsed.error) })
  }
  const { email, password, companyName, vatNumber } = parsed.data
  const normalizedEmail = email.trim().toLowerCase()

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    return res.status(409).json({ error: 'Konto z tym adresem email już istnieje' })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  let user
  try {
    user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        companyName,
        vatNumber: vatNumber || null,
      },
    })
  } catch (err) {
    // P2002 = naruszenie unikalności (wyścig równoległych rejestracji)
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Konto z tym adresem email już istnieje' })
    }
    throw err
  }

  setAuthCookie(res, signToken(user.id))
  res.status(201).json({ user: publicUser(user) })
})

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Błąd walidacji', fields: formatZodError(parsed.error) })
  }
  const normalizedEmail = parsed.data.email.trim().toLowerCase()

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
  const valid = user && (await bcrypt.compare(parsed.data.password, user.passwordHash))
  if (!valid) {
    return res.status(401).json({ error: 'Nieprawidłowy email lub hasło' })
  }

  setAuthCookie(res, signToken(user.id))
  res.json({ user: publicUser(user) })
})

// GET /api/auth/me — hydratacja sesji z cookie
router.get('/me', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) {
    clearAuthCookie(res) // token wskazuje na nieistniejącego usera
    return res.status(401).json({ error: 'Brak autoryzacji' })
  }
  res.json({ user: publicUser(user) })
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

export default router
