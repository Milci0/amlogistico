// Trwaly rejestr sledzen ShipsGo, jeden wiersz na REJS (model ContainerTracking,
// patrz prisma/schema.prisma) plus tabela powiazan z uzytkownikami
// (ContainerTrackingUser).
//
// Zastapil cache w pamieci procesu, ktory na Vercelu znikal przy kazdym
// cold-starcie i przez to NIE chronil kredytow: ten sam kontener sprawdzony
// pare minut pozniej lecial do ShipsGo jako nowe, platne utworzenie.
//
// Ta warstwa jest WSPOLNA dla obu sciezek w aplikacji (wyszukiwarka „Numer
// kontenera" i „Wlacz sledzenie" na wlasnej przesylce) — to wlasnie ta wspolnota
// sprawia, ze jeden rejs = jedno platne utworzenie, niezaleznie od tego, ktoredy
// user do niego dotarl.

import { prisma } from './prisma.js'

// ── Pojecie rekordu AKTYWNEGO ───────────────────────────────────────────────
// Kredyt ShipsGo pokrywa sledzenie do konca DANEGO rejsu. Po jego zakonczeniu
// przesylka dostaje `discarded_at` i przestaje sie aktualizowac. Ten sam numer
// kontenera wroci za kilka miesiecy w zupelnie innym transporcie, wiec numer NIE
// moze byc unikalny — unikalny jest AKTYWNY rejs dla numeru.
//
// UWAGA: ta sama definicja jest zapisana w czesciowym indeksie unikalnym
// w bazie (scripts/apply-tracking-index.js buduje SQL z tych samych stalych).
// Zmiana tutaj wymaga ponownego uruchomienia tamtego skryptu.
export const INACTIVE_STATUSES = ['DISCHARGED', 'UNTRACKED']

export function isArchived(row) {
  if (!row) return false
  return !!row.discardedAt || INACTIVE_STATUSES.includes(row.status)
}

const ACTIVE_WHERE = {
  discardedAt: null,
  status: { notIn: INACTIVE_STATUSES },
}

// Jak dlugo dane uznajemy za swieze (nie odpytuj ShipsGo ponownie).
// Dane voyage zmieniaja sie kilka razy dziennie, nie w czasie rzeczywistym.
export const FRESH_MS = 60 * 60 * 1000

// Jak czesto wolno ponawiac odpytanie sledzenia, ktore wciaz jest `pending`.
// Krocej niz FRESH_MS, bo tu czekamy az ShipsGo dociagnie dane od przewoznika,
// a to zwykle kwestia minut. GET nie kosztuje kredytu, wiec ten limit chroni
// wylacznie przed zabiciem limitu 100 req/min, nie przed kosztem.
export const PENDING_RETRY_MS = 60 * 1000

// Reczne odswiezenie (przycisk usera): nie czesciej niz raz na 5 minut NA REJS,
// niezaleznie od liczby uzytkownikow, ktorzy go sledza. Ten endpoint jest
// zabezpieczeniem na wypadek niedzialajacego webhooka, nie podstawowym
// mechanizmem aktualizacji.
export const MANUAL_REFRESH_MS = 5 * 60 * 1000

// ── Odczyt ──────────────────────────────────────────────────────────────────

export function findActiveByNumber(containerNumber) {
  return prisma.containerTracking.findFirst({
    where: { containerNumber, ...ACTIVE_WHERE },
    orderBy: { createdAt: 'desc' },
  })
}

// Ostatni ZAKONCZONY rejs tego numeru. Uzywany, gdy nie ma aktywnego: pokazujemy
// dane archiwalne z adnotacja zamiast po cichu tworzyc (i oplacac) nowe sledzenie.
export function findLatestArchivedByNumber(containerNumber) {
  return prisma.containerTracking.findFirst({
    where: {
      containerNumber,
      OR: [{ discardedAt: { not: null } }, { status: { in: INACTIVE_STATUSES } }],
    },
    orderBy: { createdAt: 'desc' },
  })
}

export function findById(id) {
  return prisma.containerTracking.findUnique({ where: { id } })
}

export function findByShipsgoId(shipsgoId) {
  return prisma.containerTracking.findUnique({ where: { shipsgoId } })
}

// ── Zapis ───────────────────────────────────────────────────────────────────

// Rezerwuje wiersz PRZED wyslaniem POST-a do ShipsGo. Zwraca:
//   { created: true, row }  - wiersz powstal teraz, wolno wyslac platny POST
//   { created: false, row } - aktywny rejs juz byl, NIE wysylaj POST-a (kredyt poszedl)
//
// Wyscig dwoch rownoleglych zadan o ten sam kontener rozstrzyga BAZA (czesciowy
// indeks unikalny na container_number dla rekordow aktywnych), nie kolejnosc
// wykonania w Node — dlatego rezerwacja jest osobnym krokiem PRZED wywolaniem
// ShipsGo, a nie zapisem po nim. Bez tego dwa klikniecia „Sprawdz" w tej samej
// sekundzie utworzylyby dwie przesylki i dwa kredyty.
export async function reserveTracking(containerNumber) {
  try {
    const row = await prisma.containerTracking.create({
      data: { containerNumber, status: 'NEW', fetchState: 'pending' },
    })
    return { created: true, row }
  } catch (e) {
    // P2002 = naruszenie unikalnosci, czyli ktos nas ubiegl (albo wiersz juz istnial)
    if (e?.code === 'P2002') {
      return { created: false, row: await findActiveByNumber(containerNumber) }
    }
    throw e
  }
}

// Zapisuje udana odpowiedz ShipsGo. `snapshot` bez `shipsgoId` znaczy, ze ShipsGo
// przyjelo zlecenie, ale nie ma jeszcze danych — wtedy zostajemy przy `pending`.
export function saveSnapshot(id, { shipsgoId, status, snapshot, geojson, carrier, bookingNumber, mapToken, checkedAt, discardedAt }) {
  const ready = !!snapshot && !!shipsgoId
  return prisma.containerTracking.update({
    where: { id },
    data: {
      shipsgoId: shipsgoId ?? undefined,
      status: status || undefined,
      fetchState: ready ? 'ready' : 'pending',
      snapshot: snapshot ?? undefined,
      // geojson bywa niedostepny (status NEW/INPROGRESS albo blad zapytania) —
      // `undefined` zostawia poprzednia trase zamiast ja kasowac.
      geojson: geojson ?? undefined,
      carrierScac: carrier?.scac ?? undefined,
      carrierName: carrier?.name ?? undefined,
      bookingNumber: bookingNumber ?? undefined,
      mapToken: mapToken ?? undefined,
      checkedAt: checkedAt ? new Date(checkedAt) : undefined,
      // discardedAt celowo zapisujemy takze gdy jest null: rejs moze wrocic do
      // obrotu po stronie ShipsGo, a wtedy `undefined` zostawiloby go archiwalnym.
      discardedAt: discardedAt ? new Date(discardedAt) : null,
      lastError: null,
      lastPolledAt: new Date(),
    },
  })
}

// Blad TRWALY (404/422 — ShipsGo nie zna tego numeru): oznacz `failed`, zeby
// kolejne wejscia nie probowaly tworzyc sledzenia w kolko na tym samym numerze.
// Bledy przejsciowe (sieciowe, 429, 402) NIE trafiaja tutaj — one nie sa wina
// numeru i po ustaniu przyczyny ten sam kontener ma prawo sprobowac ponownie.
export function markFailed(id, errorCode) {
  return prisma.containerTracking.update({
    where: { id },
    data: { fetchState: 'failed', lastError: errorCode, lastPolledAt: new Date() },
  })
}

// Kasuje rezerwacje po bledzie PRZEJSCIOWYM. Bez tego pusty wiersz `pending`
// blokowalby kontener na zawsze: kolejne proby widzialyby „juz zarezerwowany",
// nie wyslalyby POST-a i user nigdy nie dostalby danych.
export function releaseReservation(id) {
  return prisma.containerTracking.delete({ where: { id } }).catch(() => null)
}

// Webhook SHIPMENT_DELETED — rejs znika po stronie ShipsGo. Historii NIE kasujemy
// (to dane, za ktore zaplacono), tylko oznaczamy jako nieaktywna.
export function markDiscarded(id, when) {
  return prisma.containerTracking.update({
    where: { id },
    data: { discardedAt: when ? new Date(when) : new Date() },
  })
}

// Czy wolno teraz odpytac ShipsGo o ten wiersz (GET, bez kosztu).
export function shouldPoll(row) {
  if (!row?.shipsgoId) return false
  if (row.fetchState === 'failed') return false
  if (isArchived(row)) return false // zakonczony rejs juz sie nie zmieni
  const last = row.lastPolledAt ? new Date(row.lastPolledAt).getTime() : 0
  const gap = row.fetchState === 'pending' ? PENDING_RETRY_MS : FRESH_MS
  return Date.now() - last >= gap
}

// Reczne odswiezenie ma wlasny, dluzszy cooldown niz automatyczny poll.
export function canManualRefresh(row) {
  if (!row?.shipsgoId) return false
  const last = row.lastPolledAt ? new Date(row.lastPolledAt).getTime() : 0
  return Date.now() - last >= MANUAL_REFRESH_MS
}

// ── Powiazania z uzytkownikami ──────────────────────────────────────────────

// Podpina uzytkownika pod rejs i CZYSCI `hiddenAt`. Wywolywane takze wtedy, gdy
// user wczesniej „usunal" kontener z listy — usuniecie bylo tylko ukryciem, wiec
// ponowne wyszukanie tego samego transportu nigdy nie kosztuje kredytu.
export function linkUser(userId, trackingId) {
  return prisma.containerTrackingUser.upsert({
    where: { userId_trackingId: { userId, trackingId } },
    create: { userId, trackingId },
    update: { hiddenAt: null },
  })
}

export async function hideForUser(userId, trackingId) {
  const link = await prisma.containerTrackingUser.findUnique({
    where: { userId_trackingId: { userId, trackingId } },
  })
  if (!link) return null
  return prisma.containerTrackingUser.update({
    where: { id: link.id },
    data: { hiddenAt: new Date() },
  })
}

// Lista rejsow uzytkownika (bez ukrytych), najnowsze pierwsze. Czyta WYLACZNIE
// z naszej bazy — zero zapytan do ShipsGo.
export async function listForUser(userId) {
  const links = await prisma.containerTrackingUser.findMany({
    where: { userId, hiddenAt: null },
    orderBy: { addedAt: 'desc' },
    include: { tracking: true },
  })
  return links.map((l) => ({ ...l.tracking, addedAt: l.addedAt }))
}

// Czy ten user ma dostep do tego rejsu (jest podpiety i go nie ukryl).
export async function userHasAccess(userId, trackingId) {
  const link = await prisma.containerTrackingUser.findUnique({
    where: { userId_trackingId: { userId, trackingId } },
  })
  return !!link && !link.hiddenAt
}

// Rejs widoczny dla usera po NUMERZE kontenera: najpierw aktywny, potem ostatni
// archiwalny. Uzywane przez trasy /:containerNumber — user operuje numerem,
// nie naszym id.
export async function findVisibleForUser(userId, containerNumber) {
  const links = await prisma.containerTrackingUser.findMany({
    where: { userId, hiddenAt: null, tracking: { containerNumber } },
    include: { tracking: true },
  })
  if (links.length === 0) return null
  const active = links.find((l) => !isArchived(l.tracking))
  const chosen = active || links.sort((a, b) => new Date(b.tracking.createdAt) - new Date(a.tracking.createdAt))[0]
  return { ...chosen.tracking, addedAt: chosen.addedAt }
}

// Rejs widoczny dla usera po NASZYM id. Uzywane przez odnosnik z powiadomienia
// „kontener gotowy do sledzenia": numer kontenera wraca w kolejnych rejsach, wiec
// tylko id jest jednoznaczne. Brak powiazania albo ukryty = brak dostepu (404).
export async function findVisibleByIdForUser(userId, trackingId) {
  const link = await prisma.containerTrackingUser.findUnique({
    where: { userId_trackingId: { userId, trackingId } },
    include: { tracking: true },
  })
  if (!link || link.hiddenAt) return null
  return { ...link.tracking, addedAt: link.addedAt }
}

// Poprzednie rejsy tego kontenera, do ktorych user ma dostep (widok 5b linkuje
// do nich z biezacego rejsu).
export async function listPreviousVoyages(userId, containerNumber, excludeId) {
  const links = await prisma.containerTrackingUser.findMany({
    where: { userId, hiddenAt: null, tracking: { containerNumber, id: { not: excludeId } } },
    include: { tracking: true },
    orderBy: { addedAt: 'desc' },
  })
  return links.map((l) => l.tracking)
}
