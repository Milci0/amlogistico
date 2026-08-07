// ── Czy konto ma JAKIEKOLWIEK dane firmy ────────────────────────────────────────
//
// JEDYNE miejsce w repozytorium, w ktorym zdefiniowana jest lista pol zakladki
// „Dane firmy". Nie duplikuj jej nigdzie indziej — od niej zalezy, czy powstanie
// powiadomienie PROFILE_COMPANY_DATA.
//
// REGULA (celowa, nie do zmiany na sprawdzanie kompletnosci): wystarczy JEDNO
// niepuste pole, zeby uznac, ze uzytkownik zaczal wypelniac dane firmy. To logika
// OR. Nie mylic z `User.profileCompleted`, ktore jest koniunkcja piatki pol
// adresowych i sluzy do czego innego (auto-fill nadawcy w kreatorze).
//
// Liczy sie WYLACZNIE zakladka „Dane firmy", bo to te dane sa pozniej przenoszone
// do kreatora dokumentow. Pola zakladek „Dane osobowe" (fullName, phone, email),
// „Preferencje" (defaultCurrency, preferredLanguage), „Bezpieczenstwo" i „Zgody"
// (marketingConsent, termsAcceptedAt) sa pominiete swiadomie — tak samo jak pola
// techniczne konta (id, passwordHash, plan, stripeCustomerId, znaczniki czasu).
//
// Uwaga o wartosciach domyslnych: zadne z ponizszych siedmiu pol nie ma wartosci
// domyslnej w schemacie ani nie jest ustawiane przy rejestracji przez system.
// Gdyby ktorekolwiek ja dostalo, profil nigdy nie bylby pusty i powiadomienie nie
// powstaloby u nikogo. (`preferredLanguage` MA default „PL", dlatego nalezy do
// Preferencji i celowo nie jest tu liczone.)

// Nazwy pol sa identyczne w formularzu React (ProfilePage → CompanyTab) i w modelu
// Prisma; kolumny SQL to ich odpowiedniki snake_case (company_name, vat_number,
// eori_number, address, postal_code, city, country).
export const COMPANY_DATA_FIELDS = [
  'companyName',
  'vatNumber',
  'eoriNumber',
  'address',
  'postalCode',
  'city',
  'country',
]

// Pole jest puste, gdy jest null, undefined, pustym stringiem albo skladem samych
// bialych znakow. Sam odstep to nadal pusto — inaczej spacja w nazwie firmy
// wylaczalaby powiadomienie na zawsze.
function isBlank(value) {
  return String(value ?? '').trim() === ''
}

// hasAnyCompanyData(user) -> boolean
//   true, gdy CHOCIAZ JEDNO pole zakladki „Dane firmy" jest niepuste.
export function hasAnyCompanyData(user) {
  if (!user) return false
  return COMPANY_DATA_FIELDS.some((field) => !isBlank(user[field]))
}
