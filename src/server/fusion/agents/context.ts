import type { FusionAgentInput } from '@/types/fusion-agent'
import type { FusionCatalogQuirk } from '../catalog'
import type { FusionTranslationLocale } from '../constants'
import type { FusionStrategyKey } from '../prompts/strategy'
import type { ValidatedEnglishFusionPayload } from '../validate'

/** Passed to `run(..., { context })` for English fusion — mirrors Agent Builder state `fusion`. */
export interface FusionEnglishRunContext {
  fusion: FusionAgentInput
}

/** Passed to `run(..., { context })` for locale adaptation. */
export interface FusionTranslationRunContext {
  locale: FusionTranslationLocale
  source: ValidatedEnglishFusionPayload
}

/** Passed to `run(..., { context })` for tier assignment. */
export interface FusionTierRunContext {
  fusion: ValidatedEnglishFusionPayload
  parentA: FusionCatalogQuirk
  parentB: FusionCatalogQuirk
  strategyKey: FusionStrategyKey
}
