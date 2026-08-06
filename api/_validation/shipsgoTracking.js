import { z } from 'zod'

// Kształt ISO 6346: 4 litery (kod właściciela + kategoria U/J/Z) + 7 cyfr
// (6 cyfr numeru + 1 cyfra kontrolna) = 11 znaków. Ta sama definicja co
// FULL_PATTERN w src/utils/containerNumber.js — nie importujemy stamtąd
// (frontendowy moduł), żeby backend nie zależał od drzewa src/.
const CONTAINER_PATTERN = /^[A-Z]{4}\d{7}$/

export const lookupSchema = z.object({
  containerNumber: z
    .string()
    .trim()
    .transform((v) => v.toUpperCase().replace(/[\s-]/g, ''))
    .refine((v) => CONTAINER_PATTERN.test(v), {
      message: 'Nieprawidłowy format numeru kontenera (oczekiwane 4 litery + 7 cyfr, np. MSCU1234567)',
    }),
})
