// Bramka dostępu do płatnej integracji ShipsGo, WSPÓLNA dla obu tras
// (api/_routes/tracking.js i api/_routes/shipsgoTracking.js).
//
// Cała integracja jest za flagą SHIPSGO_ENABLED (domyślnie wyłączona) i
// DODATKOWO, dopóki nie wykupimy pakietu, zawężona do SHIPSGO_ALLOWED_EMAILS
// (lista adresów po przecinku). Nawet gdy SHIPSGO_ENABLED=true na produkcji,
// zwykli użytkownicy nie zobaczą funkcji. Pusta/nieustawiona lista = brak
// zawężenia, czyli docelowy stan po wykupieniu pakietu.

import { prisma } from './prisma.js'

export function isShipsgoEnabled() {
  // Zmienne środowiskowe są zawsze stringiem — !!process.env.SHIPSGO_ENABLED
  // byłoby prawdą też dla stringa "false" (patrz .env.example). Porównanie
  // z 'true' jest tu celowo dosłowne.
  return process.env.SHIPSGO_ENABLED === 'true' && !!process.env.SHIPSGO_API_TOKEN
}

function getAllowedEmails() {
  return (process.env.SHIPSGO_ALLOWED_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export async function isUserAllowed(userId) {
  const allowed = getAllowedEmails()
  if (allowed.length === 0) return true
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } })
  return !!user && allowed.includes(user.email.toLowerCase())
}

// Wspólna bramka dla tras, które MOGĄ sięgnąć do ShipsGo. Zwraca false i sama
// odpowiada, gdy dostępu nie ma. Trasy czytające wyłącznie z naszej bazy
// (lista, szczegóły, usuwanie z listy) jej NIE używają: użytkownik, który ma
// już dane, powinien je widzieć także po wyłączeniu flagi.
export async function ensureShipsgoAccess(req, res) {
  if (!isShipsgoEnabled()) {
    res.status(503).json({ error: 'Śledzenie ShipsGo jest wyłączone' })
    return false
  }
  if (!(await isUserAllowed(req.userId))) {
    res.status(403).json({ error: 'Brak dostępu' })
    return false
  }
  return true
}
