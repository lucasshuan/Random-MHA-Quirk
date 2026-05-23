import type { QuirkFacet, QuirkRange, QuirkType } from '@/types/quirk'
import { QUIRK_FACETS, QUIRK_RANGES, QUIRK_TYPES } from '../constants'
import { hashSeed } from './seed-hash'
import { fusionRollKey } from './roll-key'

export interface FusionOutputRoll {
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
}

export interface FusionOutputParentHints {
  types?: string[]
  ranges?: string[]
}

const TYPE_FACET_POOLS: Record<QuirkType, QuirkFacet[]> = {
  Emitter: [
    'Elemental',
    'Psychic',
    'Control',
    'Support',
    'Defense',
    'Mobility',
    'Sensory',
    'Construct',
    'Emission',
  ],
  Transformation: [
    'Elemental',
    'Enhancement',
    'Anthropomorphic',
    'Control',
    'Defense',
    'Mobility',
    'Sensory',
    'Construct',
    'Biological',
  ],
  Mutant: [
    'Enhancement',
    'Anthropomorphic',
    'Defense',
    'Mobility',
    'Sensory',
    'Construct',
    'Biological',
  ],
}

const SOURCE_BOUND_FACETS = new Set<QuirkFacet>([
  'Elemental',
  'Psychic',
  'Enhancement',
  'Anthropomorphic',
  'Support',
  'Defense',
  'Sensory',
  'Biological',
])

export function fusionOutputRollKey(
  seed: string,
  parentA: string,
  parentB: string,
): string {
  return fusionRollKey(seed, parentA, parentB)
}

function normalizeParentFacets(facets: string[]): QuirkFacet[] {
  return [
    ...new Set(
      facets.filter((facet): facet is QuirkFacet =>
        QUIRK_FACETS.includes(facet as QuirkFacet),
      ),
    ),
  ]
}

function normalizeParentTypes(types: string[]): QuirkType[] {
  return [
    ...new Set(
      types.filter((type): type is QuirkType =>
        QUIRK_TYPES.includes(type as QuirkType),
      ),
    ),
  ]
}

function normalizeParentRanges(ranges: string[]): QuirkRange[] {
  return [
    ...new Set(
      ranges.filter((range): range is QuirkRange =>
        QUIRK_RANGES.includes(range as QuirkRange),
      ),
    ),
  ]
}

function rangeIndex(range: QuirkRange): number {
  return QUIRK_RANGES.indexOf(range)
}

function pickTypeFromSeed(rollKey: string, parentTypeHints: QuirkType[]): QuirkType {
  if (parentTypeHints.length === 0) {
    return QUIRK_TYPES[hashSeed(rollKey, 'type') % QUIRK_TYPES.length]
  }

  const pool: QuirkType[] = [...QUIRK_TYPES]
  for (const type of parentTypeHints) {
    pool.push(type, type, type)
  }

  return pool[hashSeed(rollKey, 'type') % pool.length]
}

function pickRangeFromSeed(
  rollKey: string,
  parentRangeHints: QuirkRange[],
): QuirkRange {
  if (parentRangeHints.length === 0) {
    return QUIRK_RANGES[hashSeed(rollKey, 'range') % QUIRK_RANGES.length]
  }

  const pool: QuirkRange[] = [...QUIRK_RANGES]
  for (const range of parentRangeHints) {
    pool.push(range, range, range)
  }

  if (parentRangeHints.length >= 2) {
    const indexes = parentRangeHints.map(rangeIndex)
    const mid = Math.round((Math.min(...indexes) + Math.max(...indexes)) / 2)
    pool.push(QUIRK_RANGES[mid], QUIRK_RANGES[mid])
  }

  return pool[hashSeed(rollKey, 'range') % pool.length]
}

function buildFacetPool(
  type: QuirkType,
  parentFacetHints: QuirkFacet[],
): QuirkFacet[] {
  const typeFacets = TYPE_FACET_POOLS[type]
  const parentCompatible = parentFacetHints.filter((facet) =>
    typeFacets.includes(facet),
  )

  if (parentFacetHints.length === 0) return [...typeFacets]

  const bridgeFacets = typeFacets.filter(
    (facet) =>
      !parentFacetHints.includes(facet) && !SOURCE_BOUND_FACETS.has(facet),
  )

  if (parentCompatible.length > 0) {
    return [
      ...parentCompatible,
      ...parentCompatible,
      ...parentCompatible,
      ...bridgeFacets,
    ]
  }

  return [
    ...bridgeFacets,
    ...bridgeFacets,
  ]
}

function pickFacetsFromSeed(
  rollKey: string,
  count: number,
  type: QuirkType,
  parentFacetHints: QuirkFacet[] = [],
): QuirkFacet[] {
  const pool = buildFacetPool(type, parentFacetHints)
  const picked: QuirkFacet[] = []
  let roll = hashSeed(rollKey, 'facets')

  while (picked.length < count && pool.length > 0) {
    const index = roll % pool.length
    const facet = pool[index]
    pool.splice(index, 1)
    if (!picked.includes(facet)) picked.push(facet)
    roll = (roll * 31 + picked.length) >>> 0
  }

  if (
    parentFacetHints.length > 0 &&
    picked.length > 0 &&
    !picked.some((facet) => parentFacetHints.includes(facet))
  ) {
    const compatibleHints = parentFacetHints.filter((facet) =>
      TYPE_FACET_POOLS[type].includes(facet),
    )
    const anchorPool =
      compatibleHints.length > 0 ? compatibleHints : TYPE_FACET_POOLS[type]
    picked[0] = anchorPool[hashSeed(rollKey, 'facet-anchor') % anchorPool.length]
  }

  return picked
}

/** Deterministic type, range, and facets for this variant — chosen by seed + parent pair, not the LLM. */
export function deriveFusionOutputFromSeed(
  seed: string,
  parentA?: string,
  parentB?: string,
  parentFacetHints: string[] = [],
  parentMechanicHints: FusionOutputParentHints = {},
): FusionOutputRoll {
  const rollKey = fusionRollKey(seed, parentA, parentB)
  const base = hashSeed(rollKey, 'output')
  const type = pickTypeFromSeed(
    rollKey,
    normalizeParentTypes(parentMechanicHints.types ?? []),
  )
  const range = pickRangeFromSeed(
    rollKey,
    normalizeParentRanges(parentMechanicHints.ranges ?? []),
  )
  // Keep hybrid mechanics readable: most variants get one core facet, some get two.
  const facetCount = (base >>> 16) % 100 < 70 ? 1 : 2
  const parentFacets = normalizeParentFacets(parentFacetHints)

  return {
    type,
    range,
    facets: pickFacetsFromSeed(rollKey, facetCount, type, parentFacets),
  }
}
