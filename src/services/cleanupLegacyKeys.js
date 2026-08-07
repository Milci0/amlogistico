// ── Jednorazowe sprzątanie martwych kluczy localStorage ────────────────────────
//
// Stan powiadomień jest od 2026-08-07 własnością konta i leży w bazie. Klucze,
// którymi wcześniej sterowała zachęta „Uzupełnij dane firmy", są nieużywane, ale
// zostały w przeglądarkach użytkowników. Kasujemy je przy starcie aplikacji, żeby
// nie zalegały tam bez końca.
//
// Klucze były namespace'owane per konto (`amlogistico:v1:${userId}:...`), a przy
// starcie nie znamy jeszcze wszystkich identyfikatorów, które kiedykolwiek były na
// tym urządzeniu. Dlatego dopasowujemy po SUFIKSIE, przechodząc całe localStorage.
//
// Świadomie NIE ruszamy: autozapisu kreatora, flagi migracji zestawów, motywu,
// języka interfejsu ani kluczy newsów.

const DEAD_KEY_SUFFIXES = [
  ':profileNudgeSnoozedUntil', // 7-dniowe uśpienie zachęty (zastąpione statusem w bazie)
  ':profileNudgeDismissed', // permanentne odrzucenie, martwe już od 2026-07-21
]

// cleanupLegacyNotificationKeys() -> string[]  (usunięte klucze; do testów i logu)
export function cleanupLegacyNotificationKeys() {
  const removed = []
  try {
    const all = []
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i)
      if (key) all.push(key)
    }
    for (const key of all) {
      if (DEAD_KEY_SUFFIXES.some((suffix) => key.endsWith(suffix))) {
        localStorage.removeItem(key)
        removed.push(key)
      }
    }
  } catch {
    // best-effort — brak dostępu do localStorage nie może wywalić startu aplikacji
  }
  return removed
}
