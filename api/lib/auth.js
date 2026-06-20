import jwt from 'jsonwebtoken'

const COOKIE_NAME = 'token'
const TOKEN_TTL = '7d'
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 dni w ms

function getSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('Brak JWT_SECRET w zmiennych środowiskowych')
  return secret
}

// Podpisuje token JWT z id użytkownika
export function signToken(userId) {
  return jwt.sign({ userId }, getSecret(), { expiresIn: TOKEN_TTL })
}

// Weryfikuje token, zwraca payload albo null gdy niepoprawny/wygasły
export function verifyToken(token) {
  try {
    return jwt.verify(token, getSecret())
  } catch {
    return null
  }
}

// Ustawia httpOnly cookie z tokenem
export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax', // mitygacja CSRF dla MVP (front i API na tej samej domenie)
    secure: process.env.NODE_ENV === 'production', // HTTPS only na produkcji
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
}

// Czyści cookie (wylogowanie)
export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
}

// Middleware — wymaga zalogowania; wkłada userId do req. Gotowe pod przyszłe trasy.
export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME]
  const payload = token && verifyToken(token)
  if (!payload) return res.status(401).json({ error: 'Brak autoryzacji' })
  req.userId = payload.userId
  next()
}

export { COOKIE_NAME }
