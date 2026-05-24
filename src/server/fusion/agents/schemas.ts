import { z } from 'zod'
import { FUSION_DESCRIPTION_MIN_LENGTH, QUIRK_FACETS, QUIRK_RANGES, QUIRK_TYPES } from '../constants'
import type { FusionTranslationLocale } from '../constants'
import { FUSION_TIER_DECISION_OUTPUT } from '../prompts/tier-decision'

export const FusionEnglishOutputSchema = z.object({
  type: z.enum(QUIRK_TYPES),
  range: z.enum(QUIRK_RANGES),
  facets: z.array(z.enum(QUIRK_FACETS)).min(1).max(3),
  en: z.object({
    description: z.string().min(FUSION_DESCRIPTION_MIN_LENGTH),
    name: z.string().min(1),
  }),
})

export type FusionEnglishAgentOutput = z.infer<typeof FusionEnglishOutputSchema>

export const FusionTierOutputSchema = z.object({
  tier: z.enum(FUSION_TIER_DECISION_OUTPUT),
})

export type FusionTierAgentOutput = z.infer<typeof FusionTierOutputSchema>

const localeCopySchema = z.object({
  name: z.string().min(1),
  description: z.string().min(FUSION_DESCRIPTION_MIN_LENGTH),
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
