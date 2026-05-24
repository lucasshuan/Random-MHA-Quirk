import type { FusionCopy, FusionCacheEntry, FusionRollMeta } from '@/types/fusion'
import type { QuirkTier } from '@/types/quirk'
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

function assertFusionDescriptionLength(
  description: string,
  label: string,
): void {
  const length = description.length
  if (length < FUSION_DESCRIPTION_MIN_LENGTH) {
    throw new Error(
      `Resposta inválida: ${label}.description curto demais (${length} caracteres; mínimo ${FUSION_DESCRIPTION_MIN_LENGTH}).`,
    )
  }
  if (length > FUSION_DESCRIPTION_MAX_LENGTH) {
    throw new Error(
      `Resposta inválida: ${label}.description longo demais (${length} caracteres; máximo ${FUSION_DESCRIPTION_MAX_LENGTH}).`,
    )
  }
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
  assertFusionDescriptionLength(description, label)

  return { name, description }
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

/** Coerces LLM JSON into a fusion payload. Rejects bad length (never truncates). */
export function validateEnglishFusionPayload(raw: unknown): ValidatedEnglishFusionPayload {
  const obj = asRecord(raw)
  const en = parseFusionCopy(obj.en, 'en')
  const mechanics = normalizeFusionMechanics(obj)

  return { en, ...mechanics, origin: 'ORIGINAL' }
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
