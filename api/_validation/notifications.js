import { z } from 'zod'

// Walidacja wysyłki powiadomienia (POST /api/notifications, tylko admin).
// target='user' → wymagany email odbiorcy; target='all' → broadcast do wszystkich.
export const createNotificationSchema = z
  .object({
    target: z.enum(['user', 'all']),
    email: z.email('Podaj poprawny adres email').optional(),
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
