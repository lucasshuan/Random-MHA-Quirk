import type { FusionCopy, FusionCacheEntry } from '@/types/fusion'
import type { QuirkFacet, QuirkOrigin, QuirkRange, QuirkType } from '@/types/quirk'
import {
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

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}
}

function normalizeFusionCopy(block: unknown): FusionCopy {
  if (!block || typeof block !== 'object') {
    return { name: 'Unnamed', description: '—' }
  }

  const record = block as Record<string, unknown>
  const name = typeof record.name === 'string' ? record.name.trim() : ''
  const description =
    typeof record.description === 'string' ? record.description.trim() : ''

  return {
    name: name || 'Unnamed',
    description: description || '—',
  }
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

/** Coerces LLM JSON into a fusion payload — never rejects for length or wording. */
export function validateEnglishFusionPayload(raw: unknown): ValidatedEnglishFusionPayload {
  const obj = asRecord(raw)
  const en = normalizeFusionCopy(obj.en)
  const mechanics = normalizeFusionMechanics(obj)

  return { en, ...mechanics, origin: 'ORIGINAL' }
}

export function validateLocaleFusionTranslation(
  raw: unknown,
  locale: FusionTranslationLocale,
): ValidatedLocaleFusionCopy {
  const obj = asRecord(raw)
  const copy = normalizeFusionCopy(obj[locale])

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
    merged[locale] = block ?? english.en
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
