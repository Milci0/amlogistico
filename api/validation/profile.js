import { z } from 'zod'

// Aktualizacja profilu — wszystkie pola opcjonalne (partial update).
// email NIE jest tu edytowalny (to login) — pomijamy go po stronie handlera.
// Puste stringi dopuszczamy (czyszczenie pola) — normalizacja na null w handlerze.
export const updateProfileSchema = z.object({
  fullName: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(30).optional(),
  companyName: z.string().trim().max(160).optional(),
  vatNumber: z.string().trim().max(40).optional(),
  eoriNumber: z.string().trim().max(40).optional(),
  address: z.string().trim().max(200).optional(),
  city: z.string().trim().max(120).optional(),
  postalCode: z.string().trim().max(20).optional(),
  country: z.string().trim().max(80).optional(),
  defaultCurrency: z.enum(['EUR', 'PLN', 'USD', 'CHF']).optional(),
  preferredLanguage: z.enum(['PL', 'EN']).optional(),
  marketingConsent: z.boolean().optional(),
})
