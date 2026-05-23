import { describe, expect, it } from 'vitest'
import type { FusionCatalogQuirk } from '../catalog'
import { analyzeParentPair, selectFusionStrategy } from './strategy'

function mockQuirk(
  partial: Partial<FusionCatalogQuirk> & Pick<FusionCatalogQuirk, 'id' | 'name'>,
): FusionCatalogQuirk {
  return {
    origin: 'BNHA',
    tier: 'B',
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
  it('can vary across parent ids even when mechanics are identical', () => {
    const pairA = [
      mockQuirk({ id: 'alpha-a', name: 'Alpha A' }),
      mockQuirk({ id: 'alpha-b', name: 'Alpha B' }),
    ] as const
    const pairB = [
      mockQuirk({ id: 'beta-a', name: 'Beta A' }),
      mockQuirk({ id: 'beta-b', name: 'Beta B' }),
    ] as const

    const differences = Array.from({ length: 24 }, (_, i) => {
      const seed = `pair-aware-${i}`
      const a = selectFusionStrategy(seed, pairA[0], pairA[1]).key
      const b = selectFusionStrategy(seed, pairB[0], pairB[1]).key
      return a !== b
    }).filter(Boolean)

    expect(differences.length).toBeGreaterThan(0)
  })

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
      Array.from({ length: 80 }, (_, i) =>
        selectFusionStrategy(`other-${i}`, a, b).key,
      ),
    )

    expect(keys.has('facet-anchor')).toBe(true)
  })

  it('biases toward simple strategies when many options are eligible', () => {
    const a = mockQuirk({
      id: 'acid',
      name: 'Acid',
      type: 'Emitter',
      range: 'Short',
      facets: ['Elemental', 'Emission'],
    })
    const b = mockQuirk({
      id: 'air-cannon',
      name: 'Air Cannon',
      type: 'Emitter',
      range: 'Long',
      facets: ['Elemental', 'Control'],
    })

    const keys = Array.from({ length: 48 }, (_, i) =>
      selectFusionStrategy(`boost-${i}`, a, b).key,
    )
    const simpleCount = keys.filter(
      (key) =>
        key === 'synergy' ||
        key === 'dominant-a' ||
        key === 'dominant-b' ||
        key === 'facet-anchor' ||
        key === 'body-weave' ||
        key === 'emission-bridge' ||
        key === 'failure-mode',
    ).length

    expect(simpleCount).toBeGreaterThan(24)
  })
})
