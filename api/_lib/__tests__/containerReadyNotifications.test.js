// Testy powiadomienia „kontener gotowy do sledzenia".
//
// Prisma jest zaslepiona pamieciowym magazynem, tak samo jak w testach powiadomien
// automatycznych: sprawdzamy LOGIKE decyzji, nie baze. Zaslepka odwzorowuje takze
// warunkowy updateMany na znaczniku (ready_notified_at IS NULL), bo to on, a nie
// kolejnosc w Node, przesadza o jednokrotnosci powiadomienia.

import { describe, it, expect, beforeEach, vi } from 'vitest'

const db = { tracking: [], links: [], notifications: [] }
let nextId = 1

const client = {
  $transaction: async (fn) => fn(client),
  containerTracking: {
    // Warunek `readyNotifiedAt: null` odwzorowuje zajecie znacznika: drugie
    // wywolanie na tym samym wierszu nie pasuje juz do zapytania i dostaje 0.
    updateMany: async ({ where, data }) => {
      const rows = db.tracking.filter((r) => {
        if (r.id !== where.id) return false
        if (where.readyNotifiedAt === null && r.readyNotifiedAt != null) return false
        return true
      })
      for (const r of rows) Object.assign(r, data)
      return { count: rows.length }
    },
  },
  containerTrackingUser: {
    findMany: async ({ where }) =>
      db.links.filter((l) => l.trackingId === where.trackingId && (where.hiddenAt !== null || l.hiddenAt == null)),
  },
  notification: {
    createMany: async ({ data }) => {
      for (const row of data) db.notifications.push({ id: `n${nextId++}`, readAt: null, ...row })
      return { count: data.length }
    },
  },
}

vi.mock('../prisma.js', () => ({ prisma: client }))

const { notifyContainerReady, isContainerReady, KIND_CONTAINER_READY } = await import('../containerReadyNotifications.js')

// Rejs spelniajacy definicje gotowosci. Poszczegolne testy psuja jedno pole naraz.
function readyRow(over = {}) {
  const row = {
    id: over.id || 't1',
    containerNumber: 'MSCU1234567',
    status: 'SAILING',
    fetchState: 'ready',
    discardedAt: null,
    readyNotifiedAt: null,
    carrierName: 'MSC',
    geojson: { features: [] },
    snapshot: {
      loadingLocation: { name: 'CALLAO' },
      dischargeLocation: { name: 'ROTTERDAM' },
    },
    ...over,
  }
  db.tracking.push(row)
  return row
}

function watch(trackingId, userId, hiddenAt = null) {
  db.links.push({ id: `l${nextId++}`, trackingId, userId, hiddenAt })
}

beforeEach(() => {
  db.tracking = []
  db.links = []
  db.notifications = []
  nextId = 1
})

describe('definicja gotowosci', () => {
  it('rejs w drodze z migawka i trasa jest gotowy', () => {
    expect(isContainerReady(readyRow())).toBe(true)
  })

  it('NEW i INPROGRESS nie sa gotowe', () => {
    expect(isContainerReady(readyRow({ id: 'a', status: 'NEW' }))).toBe(false)
    expect(isContainerReady(readyRow({ id: 'b', status: 'INPROGRESS' }))).toBe(false)
  })

  it('UNTRACKED nie jest gotowy', () => {
    expect(isContainerReady(readyRow({ status: 'UNTRACKED' }))).toBe(false)
  })

  it('DISCHARGED nie jest gotowy (rejs zakonczony, decyzja 2026-08-07)', () => {
    expect(isContainerReady(readyRow({ status: 'DISCHARGED' }))).toBe(false)
  })

  it('rejs odrzucony nie jest gotowy', () => {
    expect(isContainerReady(readyRow({ discardedAt: new Date() }))).toBe(false)
  })

  it('fetchState inny niz ready nie jest gotowy', () => {
    expect(isContainerReady(readyRow({ id: 'c', fetchState: 'pending' }))).toBe(false)
    expect(isContainerReady(readyRow({ id: 'd', fetchState: 'failed' }))).toBe(false)
  })

  it('brak migawki nie jest gotowy', () => {
    expect(isContainerReady(readyRow({ snapshot: null }))).toBe(false)
  })

  it('sam geojson wystarcza za dane trasy, gdy porty sa nieznane', () => {
    const row = readyRow({ snapshot: {}, geojson: { features: [] } })
    expect(isContainerReady(row)).toBe(true)
  })

  it('sama nazwa portu wystarcza, gdy geojson sie nie pobral', () => {
    const row = readyRow({ geojson: null, snapshot: { loadingLocation: { name: 'CALLAO' } } })
    expect(isContainerReady(row)).toBe(true)
  })

  it('migawka bez trasy i bez geojsona nie jest gotowa', () => {
    expect(isContainerReady(readyRow({ geojson: null, snapshot: { vessel: 'MSC AURORA' } }))).toBe(false)
  })
})

describe('tworzenie powiadomienia', () => {
  it('rekord juz powiadomiony nie tworzy niczego', async () => {
    const row = readyRow({ readyNotifiedAt: new Date() })
    watch(row.id, 'u1')
    const res = await notifyContainerReady(row)
    expect(res.created).toBe(0)
    expect(db.notifications).toHaveLength(0)
  })

  it('rekord niegotowy nie tworzy niczego i nie ustawia znacznika', async () => {
    const row = readyRow({ status: 'INPROGRESS' })
    watch(row.id, 'u1')
    const res = await notifyContainerReady(row)
    expect(res.created).toBe(0)
    expect(db.notifications).toHaveLength(0)
    expect(row.readyNotifiedAt).toBeNull()
  })

  it('rekord odrzucony nie tworzy niczego', async () => {
    const row = readyRow({ discardedAt: new Date() })
    watch(row.id, 'u1')
    expect((await notifyContainerReady(row)).created).toBe(0)
    expect(db.notifications).toHaveLength(0)
  })

  it('jeden obserwator dostaje jedno powiadomienie', async () => {
    const row = readyRow()
    watch(row.id, 'u1')
    const res = await notifyContainerReady(row)
    expect(res.created).toBe(1)
    expect(db.notifications).toHaveLength(1)
    expect(db.notifications[0].userId).toBe('u1')
    expect(db.notifications[0].kind).toBe(KIND_CONTAINER_READY)
    expect(row.readyNotifiedAt).toBeInstanceOf(Date)
  })

  it('dwoch obserwatorow dostaje po jednym powiadomieniu', async () => {
    const row = readyRow()
    watch(row.id, 'u1')
    watch(row.id, 'u2')
    const res = await notifyContainerReady(row)
    expect(res.created).toBe(2)
    expect(db.notifications.map((n) => n.userId).sort()).toEqual(['u1', 'u2'])
  })

  it('obserwator, ktory ukryl kontener, nie dostaje powiadomienia', async () => {
    const row = readyRow()
    watch(row.id, 'u1')
    watch(row.id, 'u2', new Date())
    const res = await notifyContainerReady(row)
    expect(res.created).toBe(1)
    expect(db.notifications.map((n) => n.userId)).toEqual(['u1'])
  })

  it('brak obserwatorow: znacznik ustawiony, zero powiadomien', async () => {
    const row = readyRow()
    const res = await notifyContainerReady(row)
    expect(res.created).toBe(0)
    expect(db.notifications).toHaveLength(0)
    expect(row.readyNotifiedAt).toBeInstanceOf(Date)
  })

  it('dwukrotne wywolanie tworzy powiadomienia tylko raz', async () => {
    const row = readyRow()
    watch(row.id, 'u1')
    await notifyContainerReady(row)
    await notifyContainerReady({ ...row, readyNotifiedAt: null }) // wymuszone ominiecie bramki wejsciowej
    expect(db.notifications).toHaveLength(1)
  })

  it('powiadomienie niesie identyfikator rejsu i adres docelowy', async () => {
    const row = readyRow()
    watch(row.id, 'u1')
    await notifyContainerReady(row)
    const n = db.notifications[0]
    expect(n.params.trackingId).toBe(row.id)
    expect(n.params.containerNumber).toBe('MSCU1234567')
    expect(n.params.carrier).toBe('MSC')
    expect(n.params.portOfLoading).toBe('CALLAO')
    expect(n.params.portOfDischarge).toBe('ROTTERDAM')
    expect(n.ctaUrl).toBe(`/tracking?tab=container&trackingId=${row.id}`)
  })
})
