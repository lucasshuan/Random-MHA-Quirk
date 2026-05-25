import { describe, expect, it } from 'vitest'
import type { FusionCatalogQuirk } from '../catalog'
import {
  buildFusionTierWeights,
  deriveFusionRollContext,
  deriveFusionTier,
} from './roll-context'

const quirkA: FusionCatalogQuirk = {
  id: 'acid',
  name: 'Acid',
  origin: 'BNHA',
  tier: 'A',
  type: 'Emitter',
  range: 'Short',
  facets: ['Elemental'],
  description: 'A',
}

const quirkB: FusionCatalogQuirk = {
  id: 'explosion',
  name: 'Explosion',
  origin: 'BNHA',
  tier: 'S',
  type: 'Emitter',
  range: 'Long',
  facets: ['Emission'],
  description: 'B',
}

describe('deriveFusionRollContext', () => {
  it('is deterministic for the same seed and parent pair', () => {
    expect(deriveFusionRollContext('seed-1', quirkA, quirkB)).toEqual(
      deriveFusionRollContext('seed-1', quirkA, quirkB),
    )
  })

  it('includes tier and roll metadata', () => {
    const ctx = deriveFusionRollContext('ev4-s1', quirkA, quirkB)
    expect(['S', 'A', 'B', 'C'] as const).toContain(ctx.tier)
    expect(ctx.tier).not.toBe('Ω')
    expect(ctx.roll.strategyKey).toBeTruthy()
    expect(ctx.roll.nameRegister).toBeTruthy()
    expect(ctx.roll.utilityNiche).toBeTruthy()
    expect(['coherent-loop', 'failure-reduced', 'modifier-cost']).toContain(
      ctx.roll.antiMashupRuleKey,
    )
    expect(ctx.outputRoll.type).toBeTruthy()
  })

  it('avoids a strategy already recorded on a prior sibling when alternatives exist', () => {
    const first = deriveFusionRollContext('sibling-a', quirkA, quirkB)
    const next = deriveFusionRollContext('sibling-b', quirkA, quirkB, [
      {
        name: 'Prior',
        description: 'Prior sibling.',
        roll: first.roll,
      },
    ])

    expect(next.roll.strategyKey).not.toBe(first.roll.strategyKey)
  })
})

describe('deriveFusionTier', () => {
  it('is deterministic and generates only playable fusion tiers', () => {
    const first = deriveFusionTier('tier-seed', 'A', 'B', 'synergy', 'Short', 'a', 'b')
    const second = deriveFusionTier('tier-seed', 'A', 'B', 'synergy', 'Short', 'a', 'b')

    expect(second).toBe(first)
    expect(['S', 'A', 'B', 'C']).toContain(first)
  })

  it('weights equal parent tiers toward their shared tier', () => {
    const sWeights = buildFusionTierWeights('S', 'S', 'synergy', 'Short')
    const cWeights = buildFusionTierWeights('C', 'C', 'synergy', 'Short')

    expect(sWeights[0].weight).toBeGreaterThan(sWeights[1].weight)
    expect(cWeights[3].weight).toBeGreaterThan(cWeights[2].weight)
  })

  it('weights tiers between separated parent tiers more heavily', () => {
    const weights = buildFusionTierWeights('S', 'C', 'synergy', 'Short')

    expect(weights[1].weight).toBeGreaterThan(weights[0].weight)
    expect(weights[2].weight).toBeGreaterThan(weights[3].weight)
  })

  it('nudges Special parents toward S and gag parents toward C', () => {
    const specialPair = buildFusionTierWeights('Ω', 'Ω', 'synergy', 'Short')
    const strongPair = buildFusionTierWeights('S', 'S', 'synergy', 'Short')
    const gagPair = buildFusionTierWeights('D', 'D', 'synergy', 'Short')
    const weakPair = buildFusionTierWeights('C', 'C', 'synergy', 'Short')

    expect(specialPair[0].weight).toBeGreaterThan(strongPair[0].weight)
    expect(gagPair[3].weight).toBeGreaterThan(weakPair[3].weight)
  })

  it('shifts failure-mode weight toward weaker tiers', () => {
    const score = (weights: Array<{ weight: number }>) =>
      weights.reduce((total, item, index) => total + item.weight * index, 0) /
      weights.reduce((total, item) => total + item.weight, 0)

    const synergy = buildFusionTierWeights('S', 'S', 'synergy', 'Short')
    const failure = buildFusionTierWeights('S', 'S', 'failure-mode', 'Short')

    expect(score(failure)).toBeGreaterThan(score(synergy))
  })
})
