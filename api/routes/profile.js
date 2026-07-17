import { Router } from 'express'
import { prisma } from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'
import { updateProfileSchema } from '../validation/profile.js'
import { formatZodError } from '../validation/auth.js'

const router = Router()

// Pola profilu zwracane klientowi (bez passwordHash i innych wrażliwych).
function publicProfile(u) {
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
    plan: u.plan,
    createdAt: u.createdAt,
  }
}

// profileCompleted = true tylko gdy komplet danych adresowych firmy jest wypełniony.
// VAT/EORI/preferencje NIE wpływają na tę flagę (patrz ETAP 2b spec).
function computeProfileCompleted(u) {
  return !!(
    u.companyName?.trim() &&
    u.address?.trim() &&
    u.city?.trim() &&
    u.postalCode?.trim() &&
    u.country?.trim()
  )
}

// GET /api/profile — dane profilu zalogowanego usera
router.get('/', requireAuth, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!user) return res.status(401).json({ error: 'Brak autoryzacji' })
  res.json({ profile: publicProfile(user) })
})

// PATCH /api/profile — aktualizacja pól profilu (userId zawsze z tokenu)
router.patch('/', requireAuth, async (req, res) => {
  const parsed = updateProfileSchema.safeParse(req.body)
  if (!parsed.success) {
    return res.status(400).json({ error: 'Błąd walidacji', fields: formatZodError(parsed.error) })
  }

  const current = await prisma.user.findUnique({ where: { id: req.userId } })
  if (!current) return res.status(401).json({ error: 'Brak autoryzacji' })

  // Puste stringi → null (wyczyszczenie pola). Booleany zostawiamy jak przyszły.
  const data = {}
  for (const [key, val] of Object.entries(parsed.data)) {
    if (typeof val === 'string') data[key] = val.trim() === '' ? null : val.trim()
    else data[key] = val
  }

  // Przelicz profileCompleted na scalonym stanie (obecny + zmiany)
  const merged = { ...current, ...data }
  data.profileCompleted = computeProfileCompleted(merged)

  const updated = await prisma.user.update({ where: { id: req.userId }, data })
  res.json({ profile: publicProfile(updated) })
})

export default router
