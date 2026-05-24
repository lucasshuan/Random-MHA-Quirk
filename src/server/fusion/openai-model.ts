import type { ModelSettings } from '@openai/agents'

export type FusionLlmPurpose = 'fusion' | 'translation'

type FusionReasoningEffort = NonNullable<
  NonNullable<ModelSettings['reasoning']>['effort']
>

/** OpenAI reasoning models only accept the default temperature (1); omit the param. */
export function openAiSupportsCustomTemperature(model: string): boolean {
  const id = model.trim().toLowerCase()
  if (id.startsWith('gpt-5-chat')) return true
  if (id.startsWith('gpt-5') || id.startsWith('o')) return false
  return true
}

/** GPT-5 / o-series reasoning models expose reasoning_effort instead of temperature. */
export function openAiSupportsReasoningEffort(model: string): boolean {
  const id = model.trim().toLowerCase()
  if (id.startsWith('gpt-5-chat')) return false
  if (id.startsWith('gpt-5') || id.startsWith('o')) return true
  return false
}

/** Domain filters on web_search are not available on mini/nano model tiers. */
export function openAiSupportsWebSearchDomainFilters(model: string): boolean {
  const id = model.trim().toLowerCase()
  return !id.includes('-mini') && !id.includes('-nano')
}

const REASONING_EFFORTS = new Set<FusionReasoningEffort>([
  'none',
  'minimal',
  'low',
  'medium',
  'high',
  'xhigh',
])

function parseReasoningEffort(
  raw: string | undefined,
  fallback: FusionReasoningEffort,
): FusionReasoningEffort {
  const value = raw?.trim()
  if (value && REASONING_EFFORTS.has(value as FusionReasoningEffort)) {
    return value as FusionReasoningEffort
  }
  return fallback
}

export function resolveOpenAiReasoningEffort(
  purpose: FusionLlmPurpose,
): FusionReasoningEffort {
  if (purpose === 'translation') {
    return parseReasoningEffort(
      process.env.FUSION_TRANSLATION_REASONING_EFFORT,
      'minimal',
    )
  }
  return parseReasoningEffort(process.env.FUSION_REASONING_EFFORT, 'low')
}
