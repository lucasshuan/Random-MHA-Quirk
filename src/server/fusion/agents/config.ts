import type { ModelSettings } from '@openai/agents'
import type { FusionLlmPurpose } from '../openai-model'
import {
  openAiSupportsCustomTemperature,
  openAiSupportsReasoningEffort,
  resolveOpenAiReasoningEffort,
} from '../openai-model'

/** Default English fusion model when OPENAI_MODEL / OPENAI_FUSION_MODEL is unset. */
export const DEFAULT_FUSION_OPENAI_MODEL = 'gpt-4o-mini'

/** Default locale adaptation model when OPENAI_TRANSLATION_MODEL is unset. */
export const DEFAULT_FUSION_TRANSLATION_OPENAI_MODEL = 'gpt-4.1-nano'

/** English generation (name and description against server-rolled mechanics). */
export function resolveFusionOpenAiModel(): string {
  return (
    process.env.OPENAI_FUSION_MODEL?.trim() ||
    process.env.OPENAI_MODEL?.trim() ||
    DEFAULT_FUSION_OPENAI_MODEL
  )
}

/** pt-BR / es adaptation after English. */
export function resolveFusionTranslationOpenAiModel(): string {
  return (
    process.env.OPENAI_TRANSLATION_MODEL?.trim() ||
    DEFAULT_FUSION_TRANSLATION_OPENAI_MODEL
  )
}

export function resolveFusionOpenAiModelForPurpose(
  purpose: FusionLlmPurpose,
): string {
  return purpose === 'translation'
    ? resolveFusionTranslationOpenAiModel()
    : resolveFusionOpenAiModel()
}

function resolveFusionTemperature(): number {
  return Number(process.env.FUSION_TEMPERATURE ?? 0.85)
}

function resolveTranslationTemperature(): number {
  return Number(process.env.FUSION_TRANSLATION_TEMPERATURE ?? 0.5)
}

export function resolveFusionModelSettings(purpose: FusionLlmPurpose): ModelSettings {
  const model = resolveFusionOpenAiModelForPurpose(purpose)
  const settings: ModelSettings = {}

  if (openAiSupportsReasoningEffort(model)) {
    settings.reasoning = { effort: resolveOpenAiReasoningEffort(purpose) }
  } else if (openAiSupportsCustomTemperature(model)) {
    settings.temperature =
      purpose === 'translation'
        ? resolveTranslationTemperature()
        : resolveFusionTemperature()
  }

  return settings
}
