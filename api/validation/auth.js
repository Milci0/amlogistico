import { z } from 'zod'

export const registerSchema = z.object({
  fullName: z.string().trim().min(3, 'Podaj imię i nazwisko (min. 3 znaki)'),
  email: z.email('Podaj poprawny adres email'),
  // Międzynarodowy format: cyfry, spacje, myślniki, nawiasy, opcjonalny +
  phone: z
    .string()
    .trim()
    .min(6, 'Podaj numer telefonu')
    .regex(/^\+?[0-9\s\-()]{6,20}$/, 'Podaj poprawny numer telefonu'),
  password: z.string().min(8, 'Hasło musi mieć min. 8 znaków'),
  companyName: z.string().trim().min(1).optional(), // opcjonalne przy rejestracji
  termsAccepted: z.literal(true, {
    error: 'Musisz zaakceptować regulamin i politykę prywatności',
  }),
  marketingConsent: z.boolean().optional().default(false),
})

export const loginSchema = z.object({
  email: z.email('Podaj poprawny adres email'),
  password: z.string().min(1, 'Podaj hasło'),
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Podaj aktualne hasło'),
    newPassword: z.string().min(8, 'Nowe hasło musi mieć min. 8 znaków'),
    confirmPassword: z.string().min(1, 'Powtórz nowe hasło'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    error: 'Hasła nie są zgodne',
    path: ['confirmPassword'],
  })
  .refine((d) => d.newPassword !== d.currentPassword, {
    error: 'Nowe hasło musi różnić się od obecnego',
    path: ['newPassword'],
  })

// Zamienia błędy zod na prosty obiekt { pole: komunikat } dla frontendu
export function formatZodError(error) {
  const fields = {}
  for (const issue of error.issues) {
    const key = issue.path[0]
    if (key && !fields[key]) fields[key] = issue.message
  }
  return fields
}
