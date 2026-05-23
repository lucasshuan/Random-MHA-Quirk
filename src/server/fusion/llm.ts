import { requireOneOf } from '@/server/env/utils'
import type { FusionAgentInput, FusionAgentParent } from '@/types/fusion-agent'
import type { QuirkOrigin } from '@/types/quirk'
import {
  generateEnglishFusionWithAgent,
  translateFusionWithAgent,
} from './agents'
import type { FusionCatalogQuirk } from './catalog'
import type { FusionTranslationLocale } from './constants'
import { buildFusionPrompt, deriveFusionRollContext } from './prompts/english'
import { buildFusionTranslationPrompt } from './prompts/translation'
import {
  validateEnglishFusionPayload,
  validateLocaleFusionTranslation,
  type ValidatedEnglishFusionPayload,
  type ValidatedLocaleFusionCopy,
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

function resolveFusionTemperature(): number {
  return Number(process.env.FUSION_TEMPERATURE ?? 0.7)
}

function resolveTranslationTemperature(): number {
  return Number(process.env.FUSION_TRANSLATION_TEMPERATURE ?? 0.5)
}

function resolveGeminiTemperature(purpose: FusionLlmPurpose): number {
  return purpose === 'translation'
    ? resolveTranslationTemperature()
    : resolveFusionTemperature()
}

function resolveOpenAiOutputTokenCap(model: string): number {
  if (openAiSupportsReasoningEffort(model)) {
    return Number(process.env.FUSION_MAX_COMPLETION_TOKENS ?? 1024)
  }
  return Number(process.env.FUSION_MAX_TOKENS ?? 700)
}

export function resolveFusionProvider(): { name: 'openai' | 'gemini'; apiKey: string } {
  const pref = (process.env.FUSION_PROVIDER ?? 'auto').toLowerCase()
  const openai = process.env.OPENAI_API_KEY?.trim()
  const gemini = process.env.GEMINI_API_KEY?.trim()

  if (pref === 'openai') {
    if (!openai) throw new Error('FUSION_PROVIDER=openai mas OPENAI_API_KEY está vazio.')
    return { name: 'openai', apiKey: openai }
  }
  if (pref === 'gemini') {
    if (!gemini) throw new Error('FUSION_PROVIDER=gemini mas GEMINI_API_KEY está vazio.')
    return { name: 'gemini', apiKey: gemini }
  }

  if (openai) return { name: 'openai', apiKey: openai }
  if (gemini) return { name: 'gemini', apiKey: gemini }

  requireOneOf(['OPENAI_API_KEY', 'GEMINI_API_KEY'], 'Fusão LLM')
  throw new Error('Nenhum provedor LLM configurado.')
}

const FUSION_EN_SYSTEM =
  'You design My Hero Academia fan fusion quirks. en.name must sound like a REAL canon quirk title — often punny, blunt, silly, or absurd — NOT a fantasy RPG skill or technical label; a comma or one question mark is fine when it fits the joke. en.description stays objective and encyclopedic, but short and easy to imagine: one core effect, optional one secondary detail, optional limit only when it adds balance (physical cost OR clear situational scope — what the effect hits vs skips; many entries need none; never stack multiple limits). Keep wording compact and avoid long clause chains. Output strict JSON only.'

const FUSION_LOCALE_SYSTEM: Record<FusionTranslationLocale, string> = {
  'pt-BR':
    'You adapt My Hero Academia quirk entries into natural Brazilian Portuguese for fans. Prioritize adaptation over literal translation. Output strict JSON only.',
  es: 'You adapt My Hero Academia quirk entries into natural Spanish for fans. Prioritize adaptation over literal translation. Output strict JSON only.',
}

function toCatalogQuirk(parent: FusionAgentParent, origin: QuirkOrigin = 'BNHA'): FusionCatalogQuirk {
  return { ...parent, origin }
}

function buildLegacyEnglishPrompt(fusion: FusionAgentInput): string {
  const quirkA = toCatalogQuirk(fusion.parents[0])
  const quirkB = toCatalogQuirk(fusion.parents[1])
  const rollContext = deriveFusionRollContext(
    fusion.meta.seed,
    quirkA,
    quirkB,
    fusion.priorVariants,
  )
  return buildFusionPrompt(
    quirkA,
    quirkB,
    fusion.meta.seed,
    fusion.priorVariants,
    rollContext,
  )
}

async function callOpenAI(
  apiKey: string,
  userPrompt: string,
  systemContent: string,
  purpose: FusionLlmPurpose,
): Promise<unknown> {
  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4.1'
  const body: Record<string, unknown> = {
    model,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemContent },
      { role: 'user', content: userPrompt },
    ],
  }

  if (openAiSupportsReasoningEffort(model)) {
    body.reasoning_effort = resolveOpenAiReasoningEffort(purpose)
    body.max_completion_tokens = resolveOpenAiOutputTokenCap(model)
  } else {
    body.max_tokens = resolveOpenAiOutputTokenCap(model)
    if (openAiSupportsCustomTemperature(model)) {
      body.temperature =
        purpose === 'translation'
          ? resolveTranslationTemperature()
          : resolveFusionTemperature()
    }
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI HTTP ${res.status}: ${err.slice(0, 400)}`)
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenAI retornou resposta vazia.')
  return JSON.parse(text)
}

async function callGemini(
  apiKey: string,
  userPrompt: string,
  systemContent: string,
  purpose: FusionLlmPurpose,
): Promise<unknown> {
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const prompt = `${systemContent}\n\n${userPrompt}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: resolveGeminiTemperature(purpose),
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini HTTP ${res.status}: ${err.slice(0, 400)}`)
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini retornou resposta vazia.')
  return JSON.parse(text)
}

async function callLlmJson<T>(
  userPrompt: string,
  systemContent: string,
  purpose: FusionLlmPurpose,
  validate: (raw: unknown) => T,
): Promise<T> {
  const provider = resolveFusionProvider()
  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const raw =
        provider.name === 'openai'
          ? await callOpenAI(provider.apiKey, userPrompt, systemContent, purpose)
          : await callGemini(provider.apiKey, userPrompt, systemContent, purpose)
      return validate(raw)
    } catch (err) {
      if (attempt === maxAttempts) throw err
    }
  }

  throw new Error('Falha na chamada LLM.')
}

/** English fusion: OpenAI Agents SDK + FusionAgentInput; Gemini uses legacy prose prompt. */
export function generateEnglishFusionWithLlm(
  fusion: FusionAgentInput,
): Promise<ValidatedEnglishFusionPayload> {
  const provider = resolveFusionProvider()
  if (provider.name === 'openai') {
    return generateEnglishFusionWithAgent(fusion)
  }

  return callLlmJson(
    buildLegacyEnglishPrompt(fusion),
    FUSION_EN_SYSTEM,
    'fusion',
    (raw) => {
      const validated = validateEnglishFusionPayload(raw)
      return {
        ...validated,
        type: fusion.mechanics.type,
        range: fusion.mechanics.range,
        facets: fusion.mechanics.facets,
        origin: fusion.mechanics.origin,
      }
    },
  )
}

/** Locale adaptation: OpenAI agent when available; Gemini uses legacy prompt. */
export function translateFusionToLocaleWithLlm(
  english: ValidatedEnglishFusionPayload,
  locale: FusionTranslationLocale,
): Promise<ValidatedLocaleFusionCopy> {
  const provider = resolveFusionProvider()
  if (provider.name === 'openai') {
    return translateFusionWithAgent(english, locale)
  }

  return callLlmJson(
    buildFusionTranslationPrompt(english, locale),
    FUSION_LOCALE_SYSTEM[locale],
    'translation',
    (raw) => validateLocaleFusionTranslation(raw, locale),
  )
}
