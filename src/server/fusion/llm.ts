import { requireOneOf } from '@/server/env/utils'
import type { FusionAgentInput } from '@/types/fusion-agent'
import {
  generateEnglishFusionWithAgent,
  translateFusionWithAgent,
} from './agents'
import type { FusionTranslationLocale } from './constants'
import type { FusionPipelineTraceContext } from './agents/tracing'
import type {
  ValidatedEnglishFusionPayload,
  ValidatedLocaleFusionCopy,
} from './validate'

export type FusionLlmPurpose = 'fusion' | 'translation'

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

export function resolveOpenAiReasoningEffort(purpose: FusionLlmPurpose): string {
  if (purpose === 'translation') {
    return process.env.FUSION_TRANSLATION_REASONING_EFFORT?.trim() || 'minimal'
  }
  return process.env.FUSION_REASONING_EFFORT?.trim() || 'low'
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
