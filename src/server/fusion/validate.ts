import type { FusionCopy, FusionCacheEntry } from '@/types/fusion'
import type { QuirkFacet, QuirkOrigin, QuirkRange, QuirkType } from '@/types/quirk'
import type { Locale } from '@/i18n/types'
import {
  FUSION_DESCRIPTION_MAX_LENGTH,
  FUSION_TRANSLATION_LOCALES,
  type FusionTranslationLocale,
  QUIRK_FACETS,
  QUIRK_RANGES,
  QUIRK_TYPES,
} from './constants'

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
}

export type ValidatedLocaleFusionCopy = Pick<
  ValidatedFusionPayload,
  FusionTranslationLocale
>

function validateFusionCopy(block: unknown, locale: Locale): FusionCopy {
  const record = block as Record<string, unknown> | undefined
  if (!record?.name || typeof record.name !== 'string' || record.name.trim().length < 2) {
    throw new Error(`Campo ${locale}.name inválido.`)
  }

  const description =
    typeof record.description === 'string' ? record.description.trim() : ''
  if (description.length < 20) {
    throw new Error(`Campo ${locale}.description inválido.`)
  }
  if (description.length > FUSION_DESCRIPTION_MAX_LENGTH) {
    throw new Error(
      `Campo ${locale}.description excede ${FUSION_DESCRIPTION_MAX_LENGTH} caracteres.`,
    )
  }

  return { name: record.name.trim(), description }
}

function validateFusionMechanics(obj: Record<string, unknown>): {
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
} {
  if (!QUIRK_TYPES.includes(obj.type as (typeof QUIRK_TYPES)[number])) {
    throw new Error(`type inválido: ${String(obj.type)}`)
  }
  if (!QUIRK_RANGES.includes(obj.range as (typeof QUIRK_RANGES)[number])) {
    throw new Error(`range inválido: ${String(obj.range)}`)
  }
  if (!Array.isArray(obj.facets) || obj.facets.length === 0) {
    throw new Error('facets deve ser um array não vazio.')
  }
  for (const facet of obj.facets) {
    if (!QUIRK_FACETS.includes(facet as (typeof QUIRK_FACETS)[number])) {
      throw new Error(`facet inválida: ${String(facet)}`)
    }
  }

  return {
    type: obj.type as QuirkType,
    range: obj.range as QuirkRange,
    facets: [...new Set(obj.facets as QuirkFacet[])],
  }
}

function validateLocaleDescriptionRules(
  locale: FusionTranslationLocale,
  description: string,
): void {
  if (locale === 'pt-BR' && /\b(quirk|peculiaridade)\b/i.test(description)) {
    throw new Error(
      'pt-BR.description deve usar "individualidade" (não usar "Quirk" ou "Peculiaridade").',
    )
  }

  if (
    locale === 'es' &&
    /\b(quirk|peculiaridad|individualidad)\b/i.test(description)
  ) {
    throw new Error(
      'es.description deve usar "don" (não usar "Quirk", "Peculiaridad" ou "individualidad").',
    )
  }
}

export function validateEnglishFusionPayload(raw: unknown): ValidatedEnglishFusionPayload {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Resposta LLM (inglês) não é um objeto JSON.')
  }

  const obj = raw as Record<string, unknown>
  const en = validateFusionCopy(obj.en, 'en')
  const mechanics = validateFusionMechanics(obj)

  return { en, ...mechanics, origin: 'ORIGINAL' }
}

export function validateLocaleFusionTranslation(
  raw: unknown,
  locale: FusionTranslationLocale,
): ValidatedLocaleFusionCopy {
  if (!raw || typeof raw !== 'object') {
    throw new Error(`Resposta LLM (${locale}) não é um objeto JSON.`)
  }

  const obj = raw as Record<string, unknown>
  const copy = validateFusionCopy(obj[locale], locale)
  validateLocaleDescriptionRules(locale, copy.description)

  return { [locale]: copy } as ValidatedLocaleFusionCopy
}

/** @deprecated Use validateLocaleFusionTranslation */
export function validatePtBrFusionTranslation(raw: unknown): Pick<
  ValidatedFusionPayload,
  'pt-BR'
> {
  return validateLocaleFusionTranslation(raw, 'pt-BR')
}

export function mergeFusionPayload(
  english: ValidatedEnglishFusionPayload,
  ...translations: ValidatedLocaleFusionCopy[]
): ValidatedFusionPayload {
  const merged = { ...english } as ValidatedFusionPayload

  for (const locale of FUSION_TRANSLATION_LOCALES) {
    const block = translations.find((item) => locale in item)?.[locale]
    if (!block) {
      throw new Error(`Tradução ausente para ${locale}.`)
    }
    merged[locale] = block
  }

  return merged
}

export function buildFusionEntry(
  key: string,
  parents: FusionCacheEntry['parents'],
  seed: string,
  payload: ValidatedFusionPayload,
): FusionCacheEntry {
  return { key, parents, seed, ...payload }
}
