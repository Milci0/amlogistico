// Trwaly rejestr sledzen ShipsGo, jeden wiersz na NUMER KONTENERA
// (model ContainerTracking, patrz prisma/schema.prisma).
//
// Zastapil cache w pamieci procesu, ktory na Vercelu znikal przy kazdym
// cold-starcie i przez to NIE chronil kredytow: ten sam kontener sprawdzony
// pare minut pozniej leciał do ShipsGo jako nowe, platne utworzenie.
//
// Ta warstwa jest WSPOLNA dla obu sciezek w aplikacji (wyszukiwarka „Numer
// kontenera" i „Wlacz sledzenie" na wlasnej przesylce) — to wlasnie ta wspolnota
// sprawia, ze jedno pudlo = jedno platne utworzenie, niezaleznie od tego, ktoredy
// user do niego dotarl.

import { prisma } from './prisma.js'

// Jak dlugo dane uznajemy za swieze (nie odpytuj ShipsGo ponownie).
// Dane voyage zmieniaja sie kilka razy dziennie, nie w czasie rzeczywistym.
export const FRESH_MS = 60 * 60 * 1000

// Jak czesto wolno ponawiac odpytanie sledzenia, ktore wciaz jest `pending`.
// Krocej niz FRESH_MS, bo tu czekamy az ShipsGo dociagnie dane od przewoznika,
// a to zwykle kwestia minut. GET nie kosztuje kredytu, wiec ten limit chroni
// wylacznie przed zabiciem limitu 100 req/min, nie przed kosztem.
export const PENDING_RETRY_MS = 60 * 1000

export function getTracking(containerNo) {
  return prisma.containerTracking.findUnique({ where: { containerNo } })
}

// Rezerwuje wiersz PRZED wyslaniem POST-a do ShipsGo. Zwraca:
//   { created: true }  - wiersz powstal teraz, wolno wyslac platny POST
//   { created: false, row } - wiersz juz byl, NIE wysylaj POST-a (kredyt juz poszedl)
//
// Wyscig dwoch rownoleglych zadan o ten sam kontener rozstrzyga baza (klucz
// glowny), nie kolejnosc wykonania w Node - dlatego rezerwacja jest osobnym
// krokiem przed wywolaniem ShipsGo, a nie zapisem po nim.
export async function reserveTracking(containerNo) {
  try {
    await prisma.containerTracking.create({ data: { containerNo, status: 'pending' } })
    return { created: true, row: null }
  } catch (e) {
    // P2002 = naruszenie unikalnosci, czyli ktos nas ubiegl (albo wiersz juz istnial)
    if (e?.code === 'P2002') {
      return { created: false, row: await getTracking(containerNo) }
    }
    throw e
  }
}

// Zapisuje udana odpowiedz. `snapshot` bez `id` znaczy, ze ShipsGo przyjelo
// zlecenie, ale nie ma jeszcze danych — wtedy zostajemy przy `pending`.
export function saveSnapshot(containerNo, shipsgoId, snapshot) {
  const ready = !!snapshot && !!shipsgoId
  return prisma.containerTracking.update({
    where: { containerNo },
    data: {
      shipsgoId: shipsgoId ?? undefined,
      snapshot: snapshot ?? undefined,
      status: ready ? 'ready' : 'pending',
      lastError: null,
      lastPolledAt: new Date(),
    },
  })
}

// Blad TRWALY (404/422 — ShipsGo nie zna tego numeru): oznacz `failed`, zeby
// kolejne wejscia nie probowaly tworzyc sledzenia w kolko na tym samym numerze.
// Bledy przejsciowe (sieciowe, 429, 402) NIE trafiaja tutaj — one nie sa wina
// numeru i po ustaniu przyczyny ten sam kontener ma prawo sprobowac ponownie.
export function markFailed(containerNo, errorCode) {
  return prisma.containerTracking.update({
    where: { containerNo },
    data: { status: 'failed', lastError: errorCode, lastPolledAt: new Date() },
  })
}

// Kasuje rezerwacje po bledzie PRZEJSCIOWYM. Bez tego pusty wiersz `pending`
// blokowalby kontener na zawsze: kolejne proby widzialyby „juz zarezerwowany",
// nie wyslalyby POST-a i user nigdy nie dostalby danych.
export function releaseReservation(containerNo) {
  return prisma.containerTracking.delete({ where: { containerNo } }).catch(() => null)
}

// Czy wolno teraz odpytac ShipsGo o ten wiersz (GET, bez kosztu).
export function shouldPoll(row) {
  if (!row?.shipsgoId) return false
  if (row.status === 'failed') return false
  const last = row.lastPolledAt ? new Date(row.lastPolledAt).getTime() : 0
  const gap = row.status === 'pending' ? PENDING_RETRY_MS : FRESH_MS
  return Date.now() - last >= gap
}
