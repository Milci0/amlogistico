import { z } from 'zod'

export const registerSchema = z.object({
  email: z.email('Podaj poprawny adres email'),
  password: z.string().min(8, 'Hasło musi mieć min. 8 znaków'),
  companyName: z.string().trim().min(1, 'Podaj nazwę firmy'),
  vatNumber: z.string().trim().optional(),
})

export const loginSchema = z.object({
  email: z.email('Podaj poprawny adres email'),
  password: z.string().min(1, 'Podaj hasło'),
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
