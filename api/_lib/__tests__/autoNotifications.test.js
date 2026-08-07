// Testy synchronizacji powiadomien automatycznych (regula 7 dni, R6/R7).
//
// Prisma jest zaslepiona pamieciowym magazynem — testujemy LOGIKE decyzji, nie
// baze. Zaslepka odwzorowuje tylko te operacje, ktorych uzywa modul, i wymusza
// czesciowy indeks unikalny (jedno nieprzeczytane powiadomienie danej kategorii
// na uzytkownika), zeby test wyscigu mial sens.
//
// Kluczowe zalozenie modelu: „X" w dzwonku KASUJE wiersz powiadomienia, wiec
// znacznik odroczenia lezy na koncie (users.profileReminderDismissedAt), a nie
// na powiadomieniu.

import { describe, it, expect, beforeEach, vi } from 'vitest'

const db = { users: [], notifications: [] }
let nextId = 1

// Odwzorowanie indeksu `notifications_active_auto_kind_key` z bazy.
function violatesUniqueIndex(data) {
  if (data.readAt) return false
  return db.notifications.some(
    (n) => n.userId === data.userId && n.kind === data.kind && !n.readAt,
  )
}

function matches(row, where) {
  return Object.entries(where).every(([key, cond]) => {
    if (cond && typeof cond === 'object' && Array.isArray(cond.in)) return cond.in.includes(row[key])
    if (cond === null) return row[key] == null
    return row[key] === cond
  })
}

vi.mock('../prisma.js', () => ({
  prisma: {
    user: {
      findUnique: async ({ where }) => db.users.find((u) => u.id === where.id) ?? null,
      update: async ({ where, data }) => {
        const user = db.users.find((u) => u.id === where.id)
        if (!user) throw new Error('Nie ma takiego uzytkownika')
        Object.assign(user, data)
        return user
      },
    },
    notification: {
      create: async ({ data }) => {
        if (violatesUniqueIndex(data)) {
          const err = new Error('Unique constraint failed')
          err.code = 'P2002'
          throw err
        }
        const row = { id: `n${nextId++}`, readAt: null, createdAt: new Date(), ...data }
        db.notifications.push(row)
        return row
      },
      findFirst: async ({ where, orderBy }) => {
        const found = db.notifications.filter((n) => matches(n, where))
        if (orderBy?.createdAt === 'desc') {
          found.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        }
        return found[0] ?? null
      },
      updateMany: async ({ where, data }) => {
        const found = db.notifications.filter((n) => matches(n, where))
        for (const row of found) Object.assign(row, data)
        return { count: found.length }
      },
    },
  },
}))

const {
  syncAutoNotifications,
  recordReminderAction,
  isAutoKind,
  REPEAT_AFTER_MS,
  KIND_PROFILE_COMPANY_DATA,
  KIND_ADMIN_MESSAGE,
} = await import('../autoNotifications.js')

const USER_ID = 'u1'
const EMPTY_COMPANY = {
  id: USER_ID,
  fullName: 'Jan Kowalski',
  phone: '+48123123123',
  companyName: null,
  vatNumber: null,
  eoriNumber: null,
  address: null,
  postalCode: null,
  city: null,
  country: null,
  profileReminderDismissedAt: null,
  profileReminderLastAction: null,
}

function daysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000)
}

function autoRows() {
  return db.notifications.filter((n) => n.kind === KIND_PROFILE_COMPANY_DATA)
}

function user() {
  return db.users[0]
}

beforeEach(() => {
  db.users = [{ ...EMPTY_COMPANY }]
  db.notifications = []
  nextId = 1
})

describe('syncAutoNotifications - PROFILE_COMPANY_DATA', () => {
  it('brak wczesniejszych powiadomien i pusta firma -> tworzy jedno', async () => {
    await syncAutoNotifications(USER_ID)
    expect(autoRows()).toHaveLength(1)
    expect(autoRows()[0].readAt).toBeNull()
    expect(autoRows()[0].kind).toBe(KIND_PROFILE_COMPANY_DATA)
  })

  it('rekord niesie tekst zapasowy i link do zakladki „Dane firmy"', async () => {
    await syncAutoNotifications(USER_ID)
    const row = autoRows()[0]
    // Tekst w bazie jest zapasem na wypadek braku klucza i18n; front sklada tresc
    // z tlumaczen na podstawie `kind`.
    expect(row.title).toContain('firm')
    expect(row.body.length).toBeGreaterThan(20)
    expect(row.ctaUrl).toBe('/profile?tab=firma')
    expect(row.type).toBe('info')
  })

  it('istniejace nieprzeczytane -> nie tworzy drugiego (idempotencja)', async () => {
    await syncAutoNotifications(USER_ID)
    await syncAutoNotifications(USER_ID)
    await syncAutoNotifications(USER_ID)
    expect(autoRows()).toHaveLength(1)
  })

  it('ostatnia akcja 3 dni temu -> nie tworzy nowego', async () => {
    user().profileReminderDismissedAt = daysAgo(3)
    user().profileReminderLastAction = 'dismissed'
    await syncAutoNotifications(USER_ID)
    expect(autoRows()).toHaveLength(0)
  })

  it('ostatnia akcja 6 dni temu -> nie tworzy nowego (granica 7 dni)', async () => {
    user().profileReminderDismissedAt = daysAgo(6)
    await syncAutoNotifications(USER_ID)
    expect(autoRows()).toHaveLength(0)
  })

  it('ostatnia akcja 8 dni temu -> tworzy NOWY', async () => {
    user().profileReminderDismissedAt = daysAgo(8)
    user().profileReminderLastAction = 'read'
    await syncAutoNotifications(USER_ID)
    expect(autoRows()).toHaveLength(1)
    expect(autoRows()[0].readAt).toBeNull()
  })

  it('odroczenie przezywa skasowanie powiadomienia (R6)', async () => {
    // Pelna sciezka: powstaje, user kasuje („X"), rekord znika, ale znacznik
    // zostaje na koncie i blokuje odrodzenie sie zachety.
    await syncAutoNotifications(USER_ID)
    const created = autoRows()[0]
    await recordReminderAction(USER_ID, [created.kind], 'dismissed')
    db.notifications = db.notifications.filter((n) => n.id !== created.id)

    await syncAutoNotifications(USER_ID)
    expect(autoRows()).toHaveLength(0)
    expect(user().profileReminderLastAction).toBe('dismissed')
  })

  it('stary PRZECZYTANY rekord nie blokuje nowego, gdy minelo 7 dni', async () => {
    db.notifications.push({
      id: 'stary',
      userId: USER_ID,
      kind: KIND_PROFILE_COMPANY_DATA,
      createdAt: daysAgo(20),
      readAt: daysAgo(9),
    })
    user().profileReminderDismissedAt = daysAgo(9)
    await syncAutoNotifications(USER_ID)
    expect(autoRows()).toHaveLength(2)
    expect(autoRows().filter((n) => !n.readAt)).toHaveLength(1)
  })

  it('dane firmy uzupelnione przy aktywnym -> oznacza przeczytane', async () => {
    await syncAutoNotifications(USER_ID)
    expect(autoRows()[0].readAt).toBeNull()

    user().companyName = 'AMLogistico'
    await syncAutoNotifications(USER_ID)

    expect(autoRows()).toHaveLength(1)
    expect(autoRows()[0].readAt).toBeInstanceOf(Date)
  })

  it('dane firmy uzupelnione -> nie tworzy nowych mimo uplywu 8 dni', async () => {
    user().vatNumber = 'PL1234567890'
    user().profileReminderDismissedAt = daysAgo(8)
    await syncAutoNotifications(USER_ID)
    expect(autoRows()).toHaveLength(0)
  })

  it('automatyczne zamkniecie NIE liczy sie jako akcja uzytkownika', async () => {
    // User uzupelnia dane firmy (zamkniecie robi system), po czym je kasuje.
    // Zachety nie odklada 7-dniowe odroczenie, bo user nigdy na nia nie zareagowal.
    await syncAutoNotifications(USER_ID)
    user().companyName = 'AMLogistico'
    await syncAutoNotifications(USER_ID)
    expect(user().profileReminderDismissedAt).toBeNull()

    user().companyName = ''
    await syncAutoNotifications(USER_ID)
    expect(autoRows().filter((n) => !n.readAt)).toHaveLength(1)
  })

  it('zamkniecie przy uzupelnionych danych jest idempotentne (nie nadpisuje readAt)', async () => {
    await syncAutoNotifications(USER_ID)
    user().city = 'Gdansk'
    await syncAutoNotifications(USER_ID)
    const pierwszyReadAt = autoRows()[0].readAt

    await syncAutoNotifications(USER_ID)
    expect(autoRows()[0].readAt).toBe(pierwszyReadAt)
  })

  it('dwa rownolegle zadania tworza JEDEN rekord (wyscig dwoch kart)', async () => {
    await Promise.all([
      syncAutoNotifications(USER_ID),
      syncAutoNotifications(USER_ID),
      syncAutoNotifications(USER_ID),
    ])
    expect(autoRows()).toHaveLength(1)
  })

  it('nie dotyka powiadomien wyslanych przez admina', async () => {
    db.notifications.push({
      id: 'admin1',
      userId: USER_ID,
      kind: KIND_ADMIN_MESSAGE,
      createdAt: daysAgo(1),
      readAt: null,
    })
    user().companyName = 'AMLogistico' // sciezka „zamknij aktywne"
    await syncAutoNotifications(USER_ID)

    const admin = db.notifications.find((n) => n.id === 'admin1')
    expect(admin.readAt).toBeNull()
  })

  it('nieistniejacy uzytkownik -> nic sie nie dzieje (bez wyjatku)', async () => {
    await syncAutoNotifications('kogo-nie-ma')
    expect(db.notifications).toHaveLength(0)
  })

  it('okres powtorzenia to dokladnie 7 dni', () => {
    expect(REPEAT_AFTER_MS).toBe(7 * 24 * 60 * 60 * 1000)
  })
})

describe('recordReminderAction', () => {
  it('zapisuje moment i rodzaj akcji dla kategorii automatycznej', async () => {
    await recordReminderAction(USER_ID, [KIND_PROFILE_COMPANY_DATA], 'dismissed')
    expect(user().profileReminderDismissedAt).toBeInstanceOf(Date)
    expect(user().profileReminderLastAction).toBe('dismissed')
  })

  it('powiadomienie admina nie ustawia zadnego odroczenia (R9)', async () => {
    await recordReminderAction(USER_ID, [KIND_ADMIN_MESSAGE], 'dismissed')
    expect(user().profileReminderDismissedAt).toBeNull()
    expect(user().profileReminderLastAction).toBeNull()
  })

  it('miesznana lista kategorii zapisuje tylko czesc automatyczna', async () => {
    await recordReminderAction(USER_ID, [KIND_ADMIN_MESSAGE, KIND_PROFILE_COMPANY_DATA], 'read')
    expect(user().profileReminderLastAction).toBe('read')
  })

  it('isAutoKind odroznia kategorie generowane od wysylek admina', () => {
    expect(isAutoKind(KIND_PROFILE_COMPANY_DATA)).toBe(true)
    expect(isAutoKind(KIND_ADMIN_MESSAGE)).toBe(false)
    expect(isAutoKind('COS_INNEGO')).toBe(false)
  })
})
