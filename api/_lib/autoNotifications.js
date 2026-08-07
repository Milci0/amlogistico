// ── Powiadomienia generowane automatycznie ──────────────────────────────────────
//
// To modul kodu po stronie serwera, a NIE osobny system powiadomien. Rekordy ladują
// w tej samej tabeli `notifications`, co wysylki admina, i wracaja do dzwonka jedna
// wspolna lista. Rozroznia je wylacznie kolumna `kind`.
//
// Synchronizacja jest LENIWA: odpala sie przy kazdym pobraniu listy powiadomien
// (GET /api/notifications). Zadnego crona ani zadania w tle.
//
// Wszystkie porownania dat na znacznikach czasu (epoch ms), wiec strefa czasowa nie
// ma znaczenia — Date.getTime() jest z definicji UTC.

import { prisma } from './prisma.js'
import { hasAnyCompanyData } from './companyDataStatus.js'

export const KIND_PROFILE_COMPANY_DATA = 'PROFILE_COMPANY_DATA'
export const KIND_ADMIN_MESSAGE = 'ADMIN_MESSAGE'

// Kategorie tworzone przez ten modul. Uzywane takze przez
// scripts/apply-notification-index.js do zbudowania warunku indeksu czesciowego,
// zeby definicja „powiadomienia automatycznego" nie mogla sie rozjechac miedzy
// aplikacja a baza (ten sam wzorzec co INACTIVE_STATUSES w sledzeniu kontenerow).
export const AUTO_KINDS = [KIND_PROFILE_COMPANY_DATA]

// Odstep miedzy kolejnymi wystapieniami tego samego powiadomienia automatycznego.
// Liczony od ostatniej AKCJI UZYTKOWNIKA na powiadomieniu (przeczytania albo
// skasowania), nie od utworzenia poprzedniego rekordu.
export const REPEAT_AFTER_MS = 7 * 24 * 60 * 60 * 1000 // 7 dni

// Tresc powiadomienia automatycznego powstaje na serwerze, ktory nie zna jezyka
// wybranego w przegladarce (przelacznik zyje w localStorage). Dlatego frontend
// sklada tekst z warstwy i18n na podstawie `kind` i `params`, a to, co siedzi
// w `title`/`body`/`ctaLabel`, jest WYLACZNIE tekstem zapasowym na wypadek braku
// klucza tlumaczenia — i przy okazji czyni rekord czytelnym w Prisma Studio.
// Powiadomienia admina maja tu prawdziwa tresc wpisana recznie i nie przechodza
// przez tlumaczenie.
const AUTO_CONTENT = {
  [KIND_PROFILE_COMPANY_DATA]: {
    type: 'info',
    title: 'Dokończ konfigurację firmy',
    body: 'Dodaj dane firmy raz, a my uzupełnimy je automatycznie w każdym dokumencie i zleceniu. Oszczędzasz czas przy każdej wysyłce.',
    ctaLabel: 'Uzupełnij profil',
    ctaUrl: '/profile?tab=firma',
    params: null,
  },
}

// Kolumny znacznika odroczenia na koncie uzytkownika, per kategoria. Znacznik NIE
// moze lezec na powiadomieniu: „X" w dzwonku kasuje wiersz fizycznie, wiec zginalby
// razem z nim, a zacheta wrocilaby przy najblizszym pobraniu listy.
const REMINDER_FIELDS = {
  [KIND_PROFILE_COMPANY_DATA]: {
    at: 'profileReminderDismissedAt',
    action: 'profileReminderLastAction',
  },
}

// isAutoKind(kind) -> boolean   (czy kategoria jest generowana automatycznie)
export function isAutoKind(kind) {
  return AUTO_KINDS.includes(kind)
}

// recordReminderAction(userId, kinds, action) -> Promise<void>
//   Zapisuje na koncie moment ostatniej akcji uzytkownika na powiadomieniu
//   automatycznym; od niego liczy sie 7-dniowe odroczenie. `action` ('dismissed'
//   albo 'read') nie wplywa na zadna decyzje, jest materialem do analizy zachowan.
//   Kategorie spoza zbioru automatycznych sa po cichu pomijane, wiec trasy moga
//   wolac to bezwarunkowo.
export async function recordReminderAction(userId, kinds, action) {
  const data = {}
  for (const kind of new Set(kinds)) {
    const fields = REMINDER_FIELDS[kind]
    if (!fields) continue
    data[fields.at] = new Date()
    data[fields.action] = action
  }
  if (Object.keys(data).length === 0) return
  await prisma.user.update({ where: { id: userId }, data })
}

// Tworzy rekord, tolerujac wyscig. Czesciowy indeks unikalny (user_id, kind) dla
// nieprzeczytanych sprawia, ze druga rownolegla wstawka dostaje P2002 — traktujemy
// to jak sukces, bo powiadomienie juz istnieje. To jedyna wersja odporna na dwie
// karty przegladarki uderzajace w GET w tej samej chwili, ewentualnie w dwoch
// instancjach funkcji serverless (transakcja w jednym procesie by tego nie zlapala).
async function createIfAbsent(userId, kind) {
  const content = AUTO_CONTENT[kind]
  try {
    await prisma.notification.create({ data: { userId, kind, ...content } })
  } catch (err) {
    if (err?.code === 'P2002') return // rownolegle zadanie zdazylo pierwsze
    throw err
  }
}

// PROFILE_COMPANY_DATA — zacheta do uzupelnienia zakladki „Dane firmy".
async function syncProfileCompanyData(user) {
  const kind = KIND_PROFILE_COMPANY_DATA

  // (a) Dane firmy sa uzupelnione: oznacz aktywne powiadomienie jako przeczytane
  //     i nie twórz nowych. updateMany jest atomowe i idempotentne — powtorne
  //     wywolanie nie znajduje juz nic nieprzeczytanego, wiec nie nadpisze readAt.
  //     Znacznika odroczenia tu NIE ruszamy: to zamkniecie zrobil system, nie
  //     uzytkownik. Dzieki temu wyczyszczenie danych firmy nastepnego dnia
  //     przywraca zachete od razu, a nie po tygodniu.
  if (hasAnyCompanyData(user)) {
    await prisma.notification.updateMany({
      where: { userId: user.id, kind, readAt: null },
      data: { readAt: new Date() },
    })
    return
  }

  // (b) Dane firmy sa puste — czy jest juz co pokazywac?
  const active = await prisma.notification.findFirst({
    where: { userId: user.id, kind, readAt: null },
    select: { id: true },
  })
  if (active) return

  // (c) Odroczenie: 7 dni od ostatniej akcji uzytkownika. Brak znacznika = user
  //     nigdy nie zareagowal, wiec powiadomienie nalezy sie natychmiast.
  const lastAction = user.profileReminderDismissedAt
  if (lastAction && Date.now() - new Date(lastAction).getTime() < REPEAT_AFTER_MS) return

  await createIfAbsent(user.id, kind)
}

// syncAutoNotifications(userId) -> Promise<void>
//   Uzgadnia powiadomienia automatyczne uzytkownika ze stanem jego konta.
//   Nie dotyka powiadomien wyslanych przez admina.
export async function syncAutoNotifications(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return
  await syncProfileCompanyData(user)
}
