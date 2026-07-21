// ── Logika powiadomienia „Uzupełnij dane firmy" (nudge w dzwonku) ───────────────
//
// Zasady:
//  1. Nudge NIE pokazuje się, gdy user zaczął już uzupełniać profil — ma wypełnione
//     ≥1 pole osobowe ORAZ ≥1 pole firmy. Wtedy nudge NIGDY więcej się nie pojawi
//     (uznajemy, że zna profil i sam go dokończy — nie zawracamy mu głowy).
//  2. Po odrzuceniu (X) nudge jest UŚPIONY na 7 dni — dopiero potem może wrócić.
//     (Wcześniej odrzucenie było „na zawsze", ale w praktyce wracało przy każdym
//      odświeżeniu przez niestabilny klucz — patrz niżej.)
//  3. Klucz uśpienia jest per-konto, oparty na przekazanym `userId` (NIE na
//     module'owym getCurrentUserId(), które podczas hydratacji sesji bywa jeszcze
//     'local-user' — to powodowało, że zapis i odczyt trafiały w różne klucze i
//     powiadomienie wracało po każdym odświeżeniu).

const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000 // 7 dni

// Pola „osobowe" liczone do reguły nr 1. email pomijamy — jest zawsze z rejestracji.
const PERSONAL_FIELDS = ['fullName', 'phone']
// Pola „Dane firmy" liczone do reguły nr 1.
const COMPANY_FIELDS = ['companyName', 'vatNumber', 'eoriNumber', 'address', 'city', 'postalCode', 'country']

function filledCount(user, fields) {
  return fields.filter((f) => String(user?.[f] ?? '').trim() !== '').length
}

// Reguła nr 1: ≥1 pole osobowe I ≥1 pole firmy → nudge nigdy więcej.
export function hasStartedProfile(user) {
  return filledCount(user, PERSONAL_FIELDS) > 0 && filledCount(user, COMPANY_FIELDS) > 0
}

function snoozeKey(userId) {
  return `amlogistico:v1:${userId || 'local-user'}:profileNudgeSnoozedUntil`
}

// Reguła nr 2: czy nudge jest aktualnie uśpiony (odrzucony < 7 dni temu).
export function isNudgeSnoozed(userId) {
  try {
    const until = Number(localStorage.getItem(snoozeKey(userId)))
    return Number.isFinite(until) && until > 0 && Date.now() < until
  } catch {
    return false
  }
}

// Odrzucenie (X) → uśpij na 7 dni.
export function snoozeNudge(userId) {
  try {
    localStorage.setItem(snoozeKey(userId), String(Date.now() + SNOOZE_MS))
  } catch {
    // best-effort — brak localStorage nie może wywalić UI
  }
}

// Czy pokazać nudge: user istnieje, nie zaczął uzupełniać profilu i nie jest uśpiony.
export function shouldShowNudge(user) {
  if (!user) return false
  if (hasStartedProfile(user)) return false
  return !isNudgeSnoozed(user.id)
}
