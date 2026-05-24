import { requireOneOf } from '@/server/env/utils'
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

export type { FusionLlmPurpose } from './openai-model'
export {
  openAiSupportsCustomTemperature,
  openAiSupportsReasoningEffort,
  openAiSupportsWebSearchDomainFilters,
  resolveOpenAiReasoningEffort,
} from './openai-model'

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
