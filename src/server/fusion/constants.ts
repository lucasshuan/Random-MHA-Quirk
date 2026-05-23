/** Hard limits for fusion copy (en + locale adaptations). */
export const FUSION_DESCRIPTION_MIN_LENGTH = 70
export const FUSION_DESCRIPTION_MAX_LENGTH = 300

/** Locales produced by the post-English adaptation LLM step. */
export const FUSION_TRANSLATION_LOCALES = ['pt-BR', 'es'] as const
export type FusionTranslationLocale = (typeof FUSION_TRANSLATION_LOCALES)[number]

export const QUIRK_TYPES = ['Emitter', 'Transformation', 'Mutant'] as const
export const QUIRK_RANGES = [
  'Self',
  'Contact',
  'Short',
  'Medium',
  'Long',
  'Area',
] as const
export const QUIRK_FACETS = [
  'Elemental',
  'Psychic',
  'Enhancement',
  'Anthropomorphic',
  'Control',
  'Mobility',
  'Sensory',
  'Construct',
  'Emission',
  'Biological',
  'Stockpile',
] as const
