import { z } from 'zod'

// Kształt ISO 6346: 4 litery (kod właściciela + kategoria U/J/Z) + 7 cyfr
// (6 cyfr numeru + 1 cyfra kontrolna) = 11 znaków. Ta sama definicja co
// FULL_PATTERN w src/utils/containerNumber.js — nie importujemy stamtąd
// (frontendowy moduł), żeby backend nie zależał od drzewa src/.
const CONTAINER_PATTERN = /^[A-Z]{4}\d{7}$/

// SCAC przewoźnika wg ShipsGo: cztery znaki alfanumeryczne, opcjonalnie
// z prefiksem SG_ dla linii, którym ShipsGo nadało własny kod.
const CARRIER_PATTERN = /^(SG_)?[A-Z0-9]{4}$/

const containerNumber = z
  .string()
  .trim()
  .transform((v) => v.toUpperCase().replace(/[\s-]/g, ''))
  .refine((v) => CONTAINER_PATTERN.test(v), {
    message: 'Nieprawidłowy format numeru kontenera (oczekiwane 4 litery + 7 cyfr, np. MSCU1234567)',
  })

export const createContainerSchema = z.object({
  containerNumber,
  // Przewoźnik jest OPCJONALNY i domyślnie NIE jest wysyłany do ShipsGo —
  // linia jest rozpoznawana z numeru kontenera. Pole wypełnia się tylko przy
  // ręcznym wskazaniu ze stanu „Bez śledzenia".
  carrier: z
    .string()
    .trim()
    .toUpperCase()
    .refine((v) => CARRIER_PATTERN.test(v), { message: 'Nieprawidłowy kod przewoźnika' })
    .optional(),
  // Jawna zgoda na utworzenie NOWEGO, płatnego śledzenia dla kontenera, którego
  // poprzedni rejs jest już zakończony. Bez tego backend zwraca dane archiwalne
  // i nie wydaje kredytu.
  startNewVoyage: z.boolean().optional(),
})

// Numer kontenera w ścieżce URL (trasy /:containerNumber). Ten sam kształt,
// ale bez transformacji Zod — normalizujemy ręcznie w trasie.
export const containerNumberParam = z
  .string()
  .transform((v) => (v || '').toUpperCase().replace(/[\s-]/g, ''))
  .refine((v) => CONTAINER_PATTERN.test(v), { message: 'Nieprawidłowy numer kontenera' })
