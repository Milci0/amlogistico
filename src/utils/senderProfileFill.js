// Pomocnicze, czyste funkcje przenoszące dane zakładki „Dane firmy" (profil)
// do sekcji NADAWCA w kreatorze. Lista siedmiu pól i predykat pustego pola
// pochodzą WYŁĄCZNIE z api/_lib/companyDataStatus.js (logika powiadomień,
// Prompt 1) - ten plik jej nie duplikuje ani nie modyfikuje, tylko czyta
// i ponownie wykorzystuje.
import { COMPANY_DATA_FIELDS, hasAnyCompanyData } from '../../api/_lib/companyDataStatus.js'

// Sprawdzenie pojedynczego pola profilu jako puste/niepuste BEZ przepisywania
// prywatnej funkcji isBlank z companyDataStatus.js: wywołujemy hasAnyCompanyData
// na obiekcie z tylko tym jednym kluczem - dla pozostałych pól z
// COMPANY_DATA_FIELDS wartość jest wtedy undefined (a więc pusta), więc wynik
// funkcji sprowadza się dokładnie do sprawdzenia jednego przekazanego pola tą
// samą definicją pustości, jakiej używa logika powiadomień.
function isProfileFieldFilled(field, value) {
  return hasAnyCompanyData({ [field]: value })
}

// companyDataStatus(user) -> 'full' | 'partial' | 'empty'
// Rozszerzenie logiki OR z hasAnyCompanyData o rozróżnienie pełny/częściowy,
// oparte na tej samej liście pól i tej samej definicji pustości.
export function companyDataStatus(user) {
  if (!hasAnyCompanyData(user)) return 'empty'
  const allFilled = COMPANY_DATA_FIELDS.every((field) => isProfileFieldFilled(field, user?.[field]))
  return allFilled ? 'full' : 'partial'
}

// Pole formularza/profilu jest puste, gdy jest null, undefined, pustym stringiem
// albo składa się wyłącznie z białych znaków. Dotyczy wyłącznie kształtu danych
// sekcji NADAWCA i lokalnego składania adresu - nie jest to ten sam kontekst co
// pola profilu z COMPANY_DATA_FIELDS (patrz isProfileFieldFilled powyżej).
function isBlank(value) {
  return String(value ?? '').trim() === ''
}

// composeCompanyAddress(profile) -> string
// Reguła R5: ulica i numer, kod pocztowy, miasto, kraj - rozdzielone
// przecinkiem ze spacją; kod pocztowy i miasto rozdzielone pojedynczą spacją.
// Puste fragmenty pomijane, bez podwójnych przecinków i bez przecinka na końcu.
export function composeCompanyAddress(profile) {
  const present = (value) => !isBlank(value)
  const line2 = [profile?.postalCode, profile?.city].filter(present).join(' ')
  return [profile?.address, line2, profile?.country].filter(present).join(', ')
}

// fillSenderFromProfile(sender, profile) -> nowy obiekt sender
// Uzupełnia WYŁĄCZNIE pola aktualnie puste (name, vat, address). Nigdy nie
// nadpisuje wartości już wpisanych ręcznie i nie dotyka pól bez odpowiednika
// w profilu (contact, phone, iban, swift, bank). Czysta - nie modyfikuje
// argumentów.
export function fillSenderFromProfile(sender, profile) {
  const patch = {
    name: profile?.companyName,
    vat: profile?.vatNumber,
    address: composeCompanyAddress(profile),
  }
  const next = { ...sender }
  for (const key of Object.keys(patch)) {
    if (isBlank(next[key]) && !isBlank(patch[key])) next[key] = patch[key]
  }
  return next
}
