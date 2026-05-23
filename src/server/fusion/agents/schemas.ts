import { z } from 'zod'
import { QUIRK_FACETS, QUIRK_RANGES, QUIRK_TYPES } from '../constants'
import type { FusionTranslationLocale } from '../constants'

export const FusionEnglishOutputSchema = z.object({
  en: z.object({
    name: z.string().min(1),
    description: z.string().min(1),
  }),
  type: z.enum(QUIRK_TYPES),
  range: z.enum(QUIRK_RANGES),
  facets: z.array(z.enum(QUIRK_FACETS)).min(1).max(3),
})

export type FusionEnglishAgentOutput = z.infer<typeof FusionEnglishOutputSchema>

const localeCopySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
})

export const FusionPtBrOutputSchema = z.object({
  'pt-BR': localeCopySchema,
})

export const FusionEsOutputSchema = z.object({
  es: localeCopySchema,
})

export function fusionTranslationOutputSchema(locale: FusionTranslationLocale) {
  return locale === 'pt-BR' ? FusionPtBrOutputSchema : FusionEsOutputSchema
}
