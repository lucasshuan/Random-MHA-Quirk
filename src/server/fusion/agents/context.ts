import type { FusionAgentInput } from '@/types/fusion-agent'
import type { FusionTranslationLocale } from '../constants'
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

/** Passed to `run(..., { context })` for multi-locale adaptation in one call. */
export interface FusionTranslationAllRunContext {
  source: ValidatedEnglishFusionPayload
  naming: {
    nameRegister: string
  }
}
