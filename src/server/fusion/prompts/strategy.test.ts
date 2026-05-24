import { describe, expect, it } from 'vitest'
import type { FusionCatalogQuirk } from '../catalog'
import {
  analyzeParentPair,
  formatStrategyCoherenceGuidance,
  FUSION_STRATEGY_KEYS,
  selectFusionStrategy,
} from './strategy'

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
      Array.from({ length: 80 }, (_, i) =>
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

  it('picks eligible strategies with uniform weight when no prior siblings', () => {
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

    const counts = new Map<string, number>()
    for (let i = 0; i < 120; i++) {
      const key = selectFusionStrategy(`uniform-${i}`, a, b).key
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    const values = [...counts.values()]
    expect(values.length).toBeGreaterThan(3)
    expect(Math.min(...values)).toBeGreaterThan(0)
    expect(Math.max(...values) / Math.min(...values)).toBeLessThan(5)
  })

  it('selects unused eligible strategies while siblings still have unused options', () => {
    const a = mockQuirk({
      id: 'tail',
      name: 'Tail',
      type: 'Mutant',
      range: 'Self',
      facets: ['Anthropomorphic'],
    })
    const b = mockQuirk({
      id: 'air-walk',
      name: 'Air Walk',
      type: 'Emitter',
      range: 'Medium',
      facets: ['Mobility', 'Emission'],
    })

    const first = selectFusionStrategy('sibling-1', a, b).key
    const second = selectFusionStrategy('sibling-2', a, b, {
      priorStrategyKeys: [first],
    }).key
    const third = selectFusionStrategy('sibling-3', a, b, {
      priorStrategyKeys: [first, second],
    }).key

    expect(new Set([first, second, third]).size).toBe(3)
  })
})

describe('formatStrategyCoherenceGuidance', () => {
  it('requires recognizable parental operations in every strategy', () => {
    for (const key of FUSION_STRATEGY_KEYS) {
      const guidance = formatStrategyCoherenceGuidance(key)
      expect(guidance).toContain('recognizable operational essence from EACH parent')
      expect(guidance).toContain('must be NEW')
      expect(guidance).not.toContain('Example')
    }
  })

  it('keeps failure mode weaker without erasing parent identity', () => {
    const guidance = formatStrategyCoherenceGuidance('failure-mode')

    expect(guidance).toContain('never degrade recognizability')
    expect(guidance).toContain('narrower rule itself')
  })

  it('forbids cloning either parent in dominant strategies', () => {
    const dominantA = formatStrategyCoherenceGuidance('dominant-a')
    const dominantB = formatStrategyCoherenceGuidance('dominant-b')

    expect(dominantA).toContain('must NOT be parent A unchanged')
    expect(dominantA).toContain('distinct third rule')
    expect(dominantB).toContain('must NOT be parent B unchanged')
    expect(dominantB).toContain('distinct third rule')
  })
})
