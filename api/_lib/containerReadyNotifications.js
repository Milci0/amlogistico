// ── Powiadomienie „kontener gotowy do sledzenia" ────────────────────────────────
//
// Rekordy laduja w tej samej tabeli `notifications`, co wysylki admina i zacheta
// profilowa. Dzwonek ma nadal JEDNO zrodlo i jeden licznik. Rozroznia je kolumna
// `kind`.
//
// CO TA KATEGORIA MA INNEGO NIZ PROFILE_COMPANY_DATA:
//   • powstaje DOKLADNIE RAZ na rejs i nigdy sie nie odradza (regula 7 dni tu nie
//     obowiazuje), wiec NIE nalezy do AUTO_KINDS w autoNotifications.js,
//   • jednokrotnosci pilnuje kolumna container_tracking.ready_notified_at, a nie
//     czesciowy indeks unikalny (user_id, kind). Ten indeks dopuszczalby tylko
//     JEDNO nieprzeczytane powiadomienie tej kategorii na konto, wiec drugi
//     kontener gotowy tego samego dnia przepadlby po cichu,
//   • dotyczy konkretnego OBIEKTU, wiec `params` niesie identyfikator rejsu
//     (stad tez trasa oznaczania jako przeczytane po obiekcie).
//
// WEJSCIA: dzis wola to zadanie cykliczne (api/_routes/cron.js). Funkcja nie wie
// nic o cronie, wiec pozniejsze podpiecie webhooka ShipsGo to dopisanie jednego
// wywolania w api/_routes/tracking.js, bez przepisywania czegokolwiek tutaj.

import { prisma } from './prisma.js'

export const KIND_CONTAINER_READY = 'CONTAINER_READY'

// Statusy, przy ktorych rejs NIE jest gotowy do pokazania:
//   NEW, INPROGRESS – ShipsGo dopiero kompletuje dane od przewoznika
//   UNTRACKED       – ShipsGo nie ma danych i miec nie bedzie
//   DISCHARGED      – rejs zakonczony; isArchived() traktuje go jako nieaktywny,
//                     a caly interfejs pokazuje wtedy „Rejs zakonczony".
//                     Powiadomienie „gotowy do sledzenia" byloby mylace.
// Ta sama lista buduje warunek SQL w scripts/backfill-ready-notified.js.
export const NOT_READY_STATUSES = ['NEW', 'INPROGRESS', 'UNTRACKED', 'DISCHARGED']

// Czy w migawce jest cokolwiek, co da sie pokazac jako trase.
// Sam geojson NIE moze byc warunkiem twardym: fetchGeojsonSafe celowo zwraca null
// przy bledzie zapytania o trase, wiec wymog blokowalby powiadomienie o realnie
// gotowej przesylce z powodu jednego nieudanego GET-a.
export function hasRouteData(row) {
  const s = row?.snapshot
  if (!s) return false
  if (row.geojson) return true
  return !!(s.loadingLocation?.name || s.dischargeLocation?.name)
}

// isContainerReady(row) -> boolean   (definicja gotowosci, uzgodniona 2026-08-07)
export function isContainerReady(row) {
  if (!row) return false
  if (row.discardedAt) return false
  if (row.fetchState !== 'ready') return false
  if (NOT_READY_STATUSES.includes(row.status)) return false
  return hasRouteData(row)
}

// Wartosci do zlozenia tresci w warstwie i18n (patrz src/utils/notificationContent.js).
// Tekst zapisany w title/body jest WYLACZNIE zapasem na wypadek braku klucza
// tlumaczenia i przy okazji czyni rekord czytelnym w Prisma Studio.
function buildParams(row) {
  const s = row.snapshot || {}
  return {
    trackingId: row.id,
    containerNumber: row.containerNumber,
    carrier: row.carrierName || s.carrier?.name || null,
    portOfLoading: s.loadingLocation?.name || null,
    portOfDischarge: s.dischargeLocation?.name || null,
  }
}

function buildPayload(row) {
  const params = buildParams(row)
  const route = [params.portOfLoading, params.portOfDischarge].filter(Boolean)
  const full = params.carrier && route.length === 2

  return {
    kind: KIND_CONTAINER_READY,
    type: 'success',
    title: `Kontener ${params.containerNumber} jest gotowy do śledzenia`,
    body: full
      ? `${params.carrier} udostępnił trasę i harmonogram przewozu. ${route[0]} → ${route[1]}.`
      : 'Przewoźnik udostępnił dane przewozu tego kontenera.',
    ctaLabel: 'Zobacz szczegóły',
    ctaUrl: `/tracking?tab=container&trackingId=${row.id}`,
    params,
  }
}

// notifyContainerReady(row) -> Promise<{ created, reason }>
//   JEDNO wejscie dla wszystkich wywolujacych (zadanie cykliczne dzis, webhook
//   jutro). Dla pojedynczego rekordu sledzenia:
//     • znacznik juz ustawiony        -> nic,
//     • rekord nie spelnia definicji  -> nic,
//     • w przeciwnym razie            -> powiadomienie dla KAZDEGO obserwujacego,
//       ktory go nie ukryl, plus ustawienie znacznika.
//
//   Wszystko w JEDNEJ transakcji, i to w kolejnosci „najpierw zajmij znacznik":
//   warunkowy updateMany (ready_notified_at IS NULL) zaklada blokade wiersza, wiec
//   drugie rownolegle wywolanie czeka na zatwierdzenie pierwszego i widzi juz zero
//   pasujacych wierszy. Awaria w polowie wycofuje calosc, wiec kolejny przebieg
//   sprobuje od nowa i nadal utworzy dokladnie jeden komplet powiadomien.
export async function notifyContainerReady(row) {
  if (!row) return { created: 0, reason: 'brak-rekordu' }
  if (row.readyNotifiedAt) return { created: 0, reason: 'juz-powiadomiono' }
  if (!isContainerReady(row)) return { created: 0, reason: 'niegotowy' }

  const payload = buildPayload(row)

  return prisma.$transaction(async (tx) => {
    const claim = await tx.containerTracking.updateMany({
      where: { id: row.id, readyNotifiedAt: null },
      data: { readyNotifiedAt: new Date() },
    })
    if (claim.count === 0) return { created: 0, reason: 'juz-powiadomiono' }

    const watchers = await tx.containerTrackingUser.findMany({
      where: { trackingId: row.id, hiddenAt: null },
      select: { userId: true },
    })
    if (watchers.length === 0) {
      // Brak obserwatorow to nie blad: znacznik zostaje ustawiony, zeby ktos,
      // kto doda ten kontener pozniej, nie dostal powiadomienia o czyms, co
      // widzi od razu po dodaniu.
      return { created: 0, reason: 'brak-obserwatorow' }
    }

    await tx.notification.createMany({
      data: watchers.map((w) => ({ userId: w.userId, ...payload })),
    })
    return { created: watchers.length, reason: 'utworzono' }
  })
}
