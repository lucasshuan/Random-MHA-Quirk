import type { QuirkFacet, QuirkRange, QuirkType } from '@/types/quirk'
import { QUIRK_FACETS, QUIRK_RANGES, QUIRK_TYPES } from '../constants'
import { hashSeed } from './seed-hash'

export interface FusionOutputRoll {
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
}

function pickFacetsFromSeed(seed: string, count: number): QuirkFacet[] {
  const pool = [...QUIRK_FACETS]
  const picked: QuirkFacet[] = []
  let roll = hashSeed(seed, 'facets')

  while (picked.length < count && pool.length > 0) {
    const index = roll % pool.length
    picked.push(pool.splice(index, 1)[0])
    roll = (roll * 31 + picked.length) >>> 0
  }

  return picked
}

/** Deterministic type, range, and facets for this variant — chosen by seed, not the LLM. */
export function deriveFusionOutputFromSeed(seed: string): FusionOutputRoll {
  const base = hashSeed(seed, 'output')
  const type = QUIRK_TYPES[base % QUIRK_TYPES.length]
  const range = QUIRK_RANGES[(base >>> 8) % QUIRK_RANGES.length]
  const facetCount = 1 + ((base >>> 16) % 4)

  return {
    type,
    range,
    facets: pickFacetsFromSeed(seed, facetCount),
  }
}
