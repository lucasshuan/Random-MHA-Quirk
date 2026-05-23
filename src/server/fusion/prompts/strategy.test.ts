import { describe, expect, it } from 'vitest'
import type { FusionCatalogQuirk } from '../catalog'
import { analyzeParentPair, selectFusionStrategy } from './strategy'

function mockQuirk(
  partial: Partial<FusionCatalogQuirk> & Pick<FusionCatalogQuirk, 'id' | 'name'>,
): FusionCatalogQuirk {
  return {
    origin: 'BNHA',
    type: 'Emitter',
    range: 'Medium',
    facets: ['Emission'],
    description: 'Test description for mock quirk.',
    ...partial,
  }
}

describe('analyzeParentPair', () => {
  it('surfaces shared facets as common ground', () => {
    const ctx = analyzeParentPair(
      mockQuirk({ id: 'a', name: 'A', facets: ['Elemental', 'Emission'] }),
      mockQuirk({ id: 'b', name: 'B', facets: ['Elemental', 'Control'] }),
    )

    expect(ctx.sharedFacets).toContain('Elemental')
    expect(ctx.commonPointLines.some((line) => line.includes('Shared facets'))).toBe(true)
  })
})

describe('selectFusionStrategy', () => {
  it('excludes oscillation when both parents are Mutant', () => {
    const a = mockQuirk({ id: 'beast', name: 'Beast', type: 'Mutant', range: 'Self' })
    const b = mockQuirk({
      id: 'bat',
      name: 'Bat',
      type: 'Mutant',
      range: 'Self',
      facets: ['Anthropomorphic', 'Mobility'],
    })

    const keys = new Set(
      Array.from({ length: 24 }, (_, i) =>
        selectFusionStrategy(`seed-${i}`, a, b).key,
      ),
    )

    expect(keys.has('oscillation')).toBe(false)
    expect(keys.has('body-weave')).toBe(true)
  })

  it('unlocks facet-anchor when parents share a facet', () => {
    const a = mockQuirk({ id: 'acid', name: 'Acid', facets: ['Elemental', 'Emission'] })
    const b = mockQuirk({
      id: 'air-cannon',
      name: 'Air Cannon',
      facets: ['Elemental', 'Control'],
    })

    const keys = new Set(
      Array.from({ length: 24 }, (_, i) =>
        selectFusionStrategy(`other-${i}`, a, b).key,
      ),
    )

    expect(keys.has('facet-anchor')).toBe(true)
  })
})
