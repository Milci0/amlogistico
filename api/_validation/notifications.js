import { z } from 'zod'
import { KIND_ADMIN_MESSAGE } from '../_lib/autoNotifications.js'
import { KIND_CONTAINER_READY } from '../_lib/containerReadyNotifications.js'

// Oznaczenie jako przeczytane po OBIEKCIE, którego powiadomienie dotyczy
// (POST /api/notifications/read-by-object). Klucz w `params`, po którym szukamy,
// wynika z kategorii i jest ustalany na serwerze, nie przychodzi z żądania.
// Kategorie bez powiązanego obiektu (wysyłki admina, zachęta profilowa) są tu
// nieosiągalne, bo lista jest zamknięta.
export const OBJECT_PARAM_BY_KIND = {
  [KIND_CONTAINER_READY]: 'trackingId',
}

export const readByObjectSchema = z.object({
  kind: z.enum(Object.keys(OBJECT_PARAM_BY_KIND), 'Nieobsługiwana kategoria powiadomienia'),
  objectId: z.string().trim().min(1, 'Podaj identyfikator obiektu').max(100),
})

// Walidacja wysyłki powiadomienia (POST /api/notifications, tylko admin).
// target='user' → wymagany email odbiorcy; target='all' → broadcast do wszystkich.
//
// `kind` NIE jest polem formularza: kategorię ustawia trasa. Gdyby ktoś dopisał ją
// do żądania ręcznie, jedyną dopuszczalną wartością jest ADMIN_MESSAGE — panelem
// admina nie da się podszyć pod powiadomienie generowane automatycznie (te mają
// własną regułę odradzania się co 7 dni i własny znacznik odroczenia na koncie).
export const createNotificationSchema = z
  .object({
    target: z.enum(['user', 'all']),
    email: z.email('Podaj poprawny adres email').optional(),
    kind: z.literal(KIND_ADMIN_MESSAGE, 'Panel admina wysyła wyłącznie powiadomienia zwykłe').optional(),
    type: z.enum(['info', 'success', 'warning']).default('info'),
    title: z.string().trim().min(1, 'Podaj tytuł'),
    body: z.string().trim().min(1, 'Podaj treść'),
    ctaLabel: z.string().trim().min(1).max(40, 'Etykieta max 40 znaków').optional(),
    ctaUrl: z.string().trim().min(1).optional(),
  })
  .refine((d) => d.target !== 'user' || (d.email && d.email.trim() !== ''), {
    error: 'Podaj adres email odbiorcy',
    path: ['email'],
  })
  // CTA ma sens tylko jako komplet etykieta+link (albo żadne). Częściowe → błąd pod URL.
  .refine((d) => !!d.ctaLabel === !!d.ctaUrl, {
    error: 'Podaj i etykietę, i link przycisku (albo zostaw oba puste)',
    path: ['ctaUrl'],
  })
