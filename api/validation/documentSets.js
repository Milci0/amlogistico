import { z } from 'zod'

// Walidacja ciała zapytań dla /api/document-sets.
// formData/meta/engineResult to migawki kreatora — trzymamy jako dowolny JSON,
// nie narzucamy im schematu (kształt pilnuje frontend + docs/slownik_zmiennych.md).

const jsonObject = z.record(z.string(), z.any())

// POST — utworzenie nowego setu (draft lub completed).
export const createSetSchema = z.object({
  status: z.enum(['draft', 'completed']),
  kind: z.string().nullable().optional(),
  flowType: z.string().trim().min(1),
  totalSteps: z.number().int().positive(),
  templateVersion: z.string().trim().min(1),
  formData: jsonObject.nullable().optional(),
  engineResult: z.any().nullable().optional(),
  selectedDocs: z.array(z.any()).optional(),
  meta: jsonObject.optional(),
  lastStep: z.number().int().nonnegative().optional(),
  maxStepReached: z.number().int().nonnegative().optional(),
  derivedFromId: z.string().nullable().optional(),
})

// PATCH — częściowa aktualizacja (autosave draftu / promocja draft→completed).
export const updateSetSchema = z.object({
  status: z.enum(['draft', 'completed']).optional(),
  kind: z.string().nullable().optional(),
  flowType: z.string().trim().min(1).optional(),
  totalSteps: z.number().int().positive().optional(),
  templateVersion: z.string().trim().min(1).optional(),
  formData: jsonObject.nullable().optional(),
  engineResult: z.any().nullable().optional(),
  selectedDocs: z.array(z.any()).optional(),
  meta: jsonObject.optional(),
  lastStep: z.number().int().nonnegative().optional(),
  maxStepReached: z.number().int().nonnegative().optional(),
  derivedFromId: z.string().nullable().optional(),
})
