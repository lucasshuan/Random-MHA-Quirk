import type { ModelSettings } from '@openai/agents'
import { requireOneOf } from '@/server/env/utils'

type FusionReasoningEffort = NonNullable<
  NonNullable<ModelSettings['reasoning']>['effort']
>
import type { FusionAgentInput } from '@/types/fusion-agent'
import {
  decideFusionTierWithAgent,
  generateEnglishFusionWithAgent,
  translateFusionWithAgent,
} from './agents'
import type { FusionCatalogQuirk } from './catalog'
import type { FusionStrategyKey } from './prompts/strategy'
import type { QuirkDisplayTier } from '@/types/quirk'
import type { FusionTranslationLocale } from './constants'
import type { FusionPipelineTraceContext } from './agents/tracing'
import type {
  ValidatedEnglishFusionPayload,
  ValidatedLocaleFusionCopy,
} from './validate'

export type FusionLlmPurpose = 'fusion' | 'translation' | 'tier'

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
  if (purpose === 'tier') {
    return parseReasoningEffort(process.env.FUSION_TIER_REASONING_EFFORT, 'low')
  }
  return parseReasoningEffort(process.env.FUSION_REASONING_EFFORT, 'low')
}

export function resolveFusionProvider(): { name: 'openai'; apiKey: string } {
  const pref = (process.env.FUSION_PROVIDER ?? 'auto').toLowerCase()
  const openai = process.env.OPENAI_API_KEY?.trim()

  if (pref === 'gemini') {
    throw new Error(
      'Fusão com Gemini foi removida. Use FUSION_PROVIDER=openai e OPENAI_API_KEY.',
    )
  }
  if (pref === 'openai') {
    if (!openai) throw new Error('FUSION_PROVIDER=openai mas OPENAI_API_KEY está vazio.')
    return { name: 'openai', apiKey: openai }
  }

  if (openai) return { name: 'openai', apiKey: openai }

  requireOneOf(['OPENAI_API_KEY'], 'Fusão LLM')
  throw new Error('Nenhum provedor LLM configurado.')
}

export function generateEnglishFusionWithLlm(
  fusion: FusionAgentInput,
): Promise<ValidatedEnglishFusionPayload> {
  return generateEnglishFusionWithAgent(fusion)
}

export function translateFusionToLocaleWithLlm(
  english: ValidatedEnglishFusionPayload,
  locale: FusionTranslationLocale,
  trace?: FusionPipelineTraceContext,
): Promise<ValidatedLocaleFusionCopy> {
  return translateFusionWithAgent(english, locale, trace)
}

export function decideFusionTierWithLlm(
  fusion: ValidatedEnglishFusionPayload,
  parentA: FusionCatalogQuirk,
  parentB: FusionCatalogQuirk,
  strategyKey: FusionStrategyKey,
  trace?: FusionPipelineTraceContext,
): Promise<QuirkDisplayTier> {
  return decideFusionTierWithAgent(fusion, parentA, parentB, strategyKey, trace)
}
