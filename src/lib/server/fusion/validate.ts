import type { FusionCopy, FusionCacheEntry } from '@/types/fusion'
import type { QuirkFacet, QuirkOrigin, QuirkRange, QuirkType } from '@/types/quirk'
import { QUIRK_FACETS, QUIRK_RANGES, QUIRK_TYPES } from './constants'

export interface ValidatedFusionPayload {
  en: FusionCopy
  'pt-BR': FusionCopy
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
  origin: QuirkOrigin
}

export function validateFusionPayload(raw: unknown): ValidatedFusionPayload {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Resposta LLM não é um objeto JSON.')
  }

  const obj = raw as Record<string, unknown>

  for (const locale of ['en', 'pt-BR'] as const) {
    const block = obj[locale] as Record<string, unknown> | undefined
    if (!block?.name || typeof block.name !== 'string' || block.name.length < 2) {
      throw new Error(`Campo ${locale}.name inválido.`)
    }
    if (
      !block?.description ||
      typeof block.description !== 'string' ||
      block.description.length < 20
    ) {
      throw new Error(`Campo ${locale}.description inválido.`)
    }
  }

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

  const en = obj.en as FusionCopy
  const pt = obj['pt-BR'] as FusionCopy
  const enDescription = en.description.trim()
  const ptDescription = pt.description.trim()

  if (/\b(quirk|peculiaridade)\b/i.test(ptDescription)) {
    throw new Error(
      'pt-BR.description deve usar "individualidade" (não usar "Quirk" ou "Peculiaridade").',
    )
  }

  return {
    en: { name: en.name.trim(), description: enDescription },
    'pt-BR': { name: pt.name.trim(), description: ptDescription },
    type: obj.type as QuirkType,
    range: obj.range as QuirkRange,
    facets: [...new Set(obj.facets as QuirkFacet[])],
    origin: 'ORIGINAL',
  }
}

export function buildFusionEntry(
  key: string,
  parents: FusionCacheEntry['parents'],
  seed: string,
  payload: ValidatedFusionPayload,
): FusionCacheEntry {
  return { key, parents, seed, ...payload }
}
