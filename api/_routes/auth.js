import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { prisma } from '../_lib/prisma.js'
import { signToken, setAuthCookie, clearAuthCookie, requireAuth } from '../_lib/auth.js'
import { authLimiter } from '../_lib/rateLimit.js'
import { registerSchema, loginSchema, changePasswordSchema, formatZodError } from '../_validation/auth.js'

const router = Router()

// Zwraca usera bez wrażliwych pól (nigdy nie wysyłamy passwordHash).
// Zawiera pola profilu potrzebne frontendowi (auto-fill nadawcy, nudge, waluta),
// więc AuthContext ma je od razu bez dodatkowego zapytania.
function publicUser(u) {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    phone: u.phone,
    companyName: u.companyName,
    vatNumber: u.vatNumber,
    eoriNumber: u.eoriNumber,
    address: u.address,
    city: u.city,
    postalCode: u.postalCode,
    country: u.country,
    defaultCurrency: u.defaultCurrency,
    preferredLanguage: u.preferredLanguage,
    marketingConsent: u.marketingConsent,
    termsAcceptedAt: u.termsAcceptedAt,
    profileCompleted: u.profileCompleted,
    isAdmin: u.isAdmin,
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
  const { email, password, fullName, phone, companyName, marketingConsent } = parsed.data
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
        fullName,
        phone,
        companyName: companyName || null,
        marketingConsent: !!marketingConsent,
        // Liczy się znacznik czasu akceptacji, nie sam boolean z formularza
        termsAcceptedAt: new Date(),
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

// POST /api/auth/change-password — zmiana hasła zalogowanego usera.
// Objęte tym samym rate-limitem co login/register (ochrona przed zgadywaniem
// currentPassword).
router.post('/change-password', authLimiter, requireAuth, async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Błąd walidacji', fields: formatZodError(parsed.error) })
  }
  const { currentPassword, newPassword } = parsed.data

  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) {
    clearAuthCookie(res)
    return res.status(401).json({ error: 'Brak autoryzacji' })
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!valid) {
    // Ten sam kształt co register/login — front pokaże błąd pod polem currentPassword
    return res.status(400).json({
      error: 'Błąd walidacji',
      fields: { currentPassword: 'Nieprawidłowe aktualne hasło' },
    })
  }

  const passwordHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } })

  // Nowe cookie — użytkownik zostaje zalogowany po zmianie hasła
  setAuthCookie(res, signToken(user.id))
  res.json({ ok: true })
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

export default router
