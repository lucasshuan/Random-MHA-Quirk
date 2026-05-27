import { requireOneOf } from '@/server/env/utils'
import type { FusionAgentInput } from '@/types/fusion-agent'
import {
  generateEnglishFusionWithAgent,
  translateFusionAllLocalesWithAgent,
  translateFusionWithAgent,
} from './agents'
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
  const openai = process.env.OPENAI_API_KEY?.trim()
  if (!openai) {
    requireOneOf(['OPENAI_API_KEY'], 'Fusão LLM')
    throw new Error('OPENAI_API_KEY está vazio.')
  }
  return { name: 'openai', apiKey: openai }
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

export function translateFusionToAllLocalesWithLlm(
  english: ValidatedEnglishFusionPayload,
  naming: {
    nameRegister: string
    nameRegisterInstruction: string
    nameExamples: string[]
  },
  trace?: FusionPipelineTraceContext,
): Promise<ValidatedLocaleFusionCopy[]> {
  return translateFusionAllLocalesWithAgent(english, naming, trace)
}
