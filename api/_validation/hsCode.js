import { z } from 'zod'

// Błąd walidacji wejścia — łapany w routerze i zamieniany na 400.
export class ValidationError extends Error {
  constructor(message) {
    super(message)
    this.name = 'ValidationError'
  }
}

// Kształt wejścia. countryFrom/countryTo to kody ISO-2 (jak w snapshot.route).
export const suggestSchema = z.object({
  description: z.string(),
  countryFrom: z.string().trim().length(2, 'Kod kraju nadania musi mieć 2 znaki'),
  countryTo: z.string().trim().length(2, 'Kod kraju docelowego musi mieć 2 znaki'),
})

// Log wyboru kodu przez użytkownika (po kliknięciu „Użyj").
export const logChoiceSchema = z.object({
  description: z.string().trim().min(1).max(200),
  countryFrom: z.string().trim().length(2),
  countryTo: z.string().trim().length(2),
  chosenCode: z.string().trim().min(1).max(24),
  source: z.enum(['classify', 'destination']),
  verified: z.boolean().optional(),
  suggestedCodes: z.array(z.string().max(24)).max(10).optional().default([]),
})

// Sanityzacja opisu towaru PRZED jakimkolwiek wywołaniem API (ochrona kosztowa
// i przed prompt injection). Rzuca ValidationError przy naruszeniu.
export function sanitizeInput(text) {
  const t = String(text || '').trim()
  if (t.length < 3) throw new ValidationError('Opis za krótki')
  if (t.length > 200) throw new ValidationError('Opis za długi (max 200 znaków)')
  const injectionPatterns =
    /ignoruj|zapomnij|jesteś teraz|jestes teraz|system prompt|instrukcj|pomiń (poprzednie|powyższe)|pomin (poprzednie|powyzsze)/i
  if (injectionPatterns.test(t)) throw new ValidationError('Opis zawiera niedozwolone frazy')
  return t
}
