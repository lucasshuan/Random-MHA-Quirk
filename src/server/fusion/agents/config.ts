import type { ModelSettings } from '@openai/agents'
import type { FusionLlmPurpose } from '../llm'
import {
  openAiSupportsCustomTemperature,
  openAiSupportsReasoningEffort,
  resolveOpenAiReasoningEffort,
} from '../llm'

/** Default fusion model when OPENAI_MODEL is unset (unverified accounts: gpt-4.1). */
export const DEFAULT_FUSION_OPENAI_MODEL = 'gpt-4.1'

export function resolveFusionOpenAiModel(): string {
  return process.env.OPENAI_MODEL?.trim() || DEFAULT_FUSION_OPENAI_MODEL
}

function resolveFusionTemperature(): number {
  return Number(process.env.FUSION_TEMPERATURE ?? 0.85)
}

function resolveTranslationTemperature(): number {
  return Number(process.env.FUSION_TRANSLATION_TEMPERATURE ?? 0.5)
}

function resolveTierTemperature(): number {
  return Number(process.env.FUSION_TIER_TEMPERATURE ?? 0.35)
}

export function resolveFusionModelSettings(purpose: FusionLlmPurpose): ModelSettings {
  const model = resolveFusionOpenAiModel()
  const settings: ModelSettings = {}

  if (openAiSupportsReasoningEffort(model)) {
    settings.reasoning = { effort: resolveOpenAiReasoningEffort(purpose) }
  } else if (openAiSupportsCustomTemperature(model)) {
    settings.temperature =
      purpose === 'translation'
        ? resolveTranslationTemperature()
        : purpose === 'tier'
          ? resolveTierTemperature()
          : resolveFusionTemperature()
  }

  return settings
}

export const FUSION_AGENT_MAX_ATTEMPTS = 3
