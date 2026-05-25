import { describe, expect, it } from 'vitest'
import type { FusionCatalogQuirk } from '../catalog'
import {
  analyzeParentPair,
  formatStrategyCoherenceGuidance,
  FUSION_STRATEGY_KEYS,
  resolveFusionStrategyForKey,
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
  it('exposes only the supported strategy set', () => {
    expect(FUSION_STRATEGY_KEYS).toEqual([
      'synergy',
      'dominant-a',
      'dominant-b',
      'failure-mode',
    ])
  })

  it('falls back when legacy roll metadata names a retired strategy', () => {
    const a = mockQuirk({ id: 'a', name: 'A' })
    const b = mockQuirk({ id: 'b', name: 'B' })
    const retired = [
      'byproduct',
      'oscillation',
      'range-meet',
      'emission-bridge',
      'body-weave',
      'facet-anchor',
    ]

    for (const key of retired) {
      expect(FUSION_STRATEGY_KEYS).toContain(
        resolveFusionStrategyForKey(key, a, b).key,
      )
    }
  })

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

  it('picks selectable strategies with uniform weight when no prior siblings', () => {
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

  it('selects unused strategies while siblings still have unused options', () => {
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
  it('contains only strategy-specific rules after global rules move to instructions', () => {
    for (const key of FUSION_STRATEGY_KEYS) {
      const guidance = formatStrategyCoherenceGuidance(key)
      expect(guidance).toContain(`Strategy-specific requirements (${key})`)
      expect(guidance).not.toContain('recognizable operational essence from EACH parent')
      expect(guidance).not.toContain('must be NEW')
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

    expect(dominantA).toContain('Parent A supplies the main operation')
    expect(dominantA).toContain('Parent B changes exactly one')
    expect(dominantB).toContain('Parent B supplies the main operation')
    expect(dominantB).toContain('Parent A changes exactly one')
  })
})
