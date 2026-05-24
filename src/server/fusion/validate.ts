import type { FusionCopy, FusionCacheEntry, FusionRollMeta } from '@/types/fusion'
import type { QuirkDisplayTier, QuirkTier } from '@/types/quirk'
import type { QuirkFacet, QuirkOrigin, QuirkRange, QuirkType } from '@/types/quirk'
import {
  FUSION_DESCRIPTION_MAX_LENGTH,
  FUSION_DESCRIPTION_MIN_LENGTH,
  FUSION_TRANSLATION_LOCALES,
  type FusionTranslationLocale,
  QUIRK_FACETS,
  QUIRK_RANGES,
  QUIRK_TYPES,
} from './constants'
import { FUSION_TIER_DECISION_OUTPUT } from './prompts/tier-decision'

export interface ValidatedFusionPayload {
  en: FusionCopy
  'pt-BR': FusionCopy
  es: FusionCopy
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
  origin: QuirkOrigin
}

export interface ValidatedEnglishFusionPayload {
  en: FusionCopy
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
  origin: QuirkOrigin
  tier: QuirkDisplayTier
}

export type ValidatedLocaleFusionCopy = Pick<
  ValidatedFusionPayload,
  FusionTranslationLocale
>

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
}

/** Trim overlong copy without a second LLM call — keeps full sentences when possible. */
export function clampFusionDescription(
  description: string,
  min = FUSION_DESCRIPTION_MIN_LENGTH,
  max = FUSION_DESCRIPTION_MAX_LENGTH,
): string {
  const trimmed = description.trim()
  if (trimmed.length <= max) return trimmed

  const window = trimmed.slice(0, max)
  const sentenceBreak = Math.max(
    window.lastIndexOf('. '),
    window.lastIndexOf('! '),
    window.lastIndexOf('? '),
  )

  if (sentenceBreak >= min - 1) {
    const sentenceCut = trimmed.slice(0, sentenceBreak + 1).trim()
    if (sentenceCut.length >= min) return sentenceCut
  }

  const wordBreak = window.lastIndexOf(' ')
  if (wordBreak >= min) {
    const wordCut = `${trimmed.slice(0, wordBreak).trim()}.`
    if (wordCut.length >= min) return wordCut
  }

  const hardCut = trimmed.slice(0, max).trim()
  if (hardCut.length >= min) return hardCut

  throw new Error(
    `Resposta inválida: description longo demais (${trimmed.length} caracteres; máximo ${max}) e não pôde ser encurtado com segurança.`,
  )
}

function normalizeFusionDescription(description: string, label: string): string {
  const trimmed = description.trim()
  if (trimmed.length < FUSION_DESCRIPTION_MIN_LENGTH) {
    throw new Error(
      `Resposta inválida: ${label}.description curto demais (${trimmed.length} caracteres; mínimo ${FUSION_DESCRIPTION_MIN_LENGTH}).`,
    )
  }

  return clampFusionDescription(trimmed)
}

function parseFusionCopy(block: unknown, label: string): FusionCopy {
  if (!block || typeof block !== 'object') {
    throw new Error(`Resposta inválida: bloco ${label} ausente.`)
  }

  const record = block as Record<string, unknown>
  const name = typeof record.name === 'string' ? record.name.trim() : ''
  const description =
    typeof record.description === 'string' ? record.description.trim() : ''

  if (!name) {
    throw new Error(`Resposta inválida: ${label}.name vazio.`)
  }
  if (!description) {
    throw new Error(`Resposta inválida: ${label}.description vazio.`)
  }

  return { name, description: normalizeFusionDescription(description, label) }
}

function normalizeFusionMechanics(obj: Record<string, unknown>): {
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
} {
  const type = QUIRK_TYPES.includes(obj.type as QuirkType)
    ? (obj.type as QuirkType)
    : 'Emitter'

  const range = QUIRK_RANGES.includes(obj.range as QuirkRange)
    ? (obj.range as QuirkRange)
    : 'Short'

  const facets = Array.isArray(obj.facets)
    ? [
        ...new Set(
          obj.facets.filter(
            (facet): facet is QuirkFacet =>
              typeof facet === 'string' &&
              QUIRK_FACETS.includes(facet as QuirkFacet),
          ),
        ),
      ]
    : []

  return {
    type,
    range,
    facets: facets.length > 0 ? facets : ['Enhancement'],
  }
}

function normalizeFusionTier(raw: unknown): QuirkDisplayTier {
  if (
    typeof raw === 'string' &&
    (FUSION_TIER_DECISION_OUTPUT as readonly string[]).includes(raw)
  ) {
    return raw as QuirkDisplayTier
  }

  throw new Error(
    `Resposta inválida: tier deve ser ${FUSION_TIER_DECISION_OUTPUT.join(', ')}.`,
  )
}

/** Coerces LLM JSON into a fusion payload. Overlong descriptions are clamped server-side. */
export function validateEnglishFusionPayload(raw: unknown): ValidatedEnglishFusionPayload {
  const obj = asRecord(raw)
  const en = parseFusionCopy(obj.en, 'en')
  const mechanics = normalizeFusionMechanics(obj)
  const tier = normalizeFusionTier(obj.tier)

  return { en, ...mechanics, origin: 'ORIGINAL', tier }
}

export function validateLocaleFusionTranslation(
  raw: unknown,
  locale: FusionTranslationLocale,
): ValidatedLocaleFusionCopy {
  const obj = asRecord(raw)
  const copy = parseFusionCopy(obj[locale], locale)

  return { [locale]: copy } as ValidatedLocaleFusionCopy
}

export function mergeFusionPayload(
  english: ValidatedEnglishFusionPayload,
  ...translations: ValidatedLocaleFusionCopy[]
): ValidatedFusionPayload {
  const merged = { ...english } as ValidatedFusionPayload

  for (const locale of FUSION_TRANSLATION_LOCALES) {
    const block = translations.find((item) => locale in item)?.[locale]
    merged[locale] = block ?? english.en
  }

  return merged
}

export function buildFusionEntry(
  key: string,
  parents: FusionCacheEntry['parents'],
  seed: string,
  payload: ValidatedFusionPayload,
  meta: { tier: QuirkTier; roll: FusionRollMeta },
): FusionCacheEntry {
  return { key, parents, seed, ...payload, tier: meta.tier, roll: meta.roll }
}
