import { describe, expect, it } from 'vitest'
import type { QuirkTier } from '@/types/quirk'
import type { FusionCatalogQuirk } from '../catalog'
import {
  buildFusionTierWeights,
  deriveFusionRollContext,
  deriveFusionTier,
  FUSION_GENERATED_TIERS,
  resolveFusionTierTargetCenter,
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

function weightMap(
  parentA: QuirkTier,
  parentB: QuirkTier,
  strategyKey: 'synergy' | 'failure-mode' = 'synergy',
  range: 'Short' = 'Short',
): Record<QuirkTier, number> {
  const weights = buildFusionTierWeights(parentA, parentB, strategyKey, range)
  return Object.fromEntries(weights.map((entry) => [entry.tier, entry.weight])) as Record<
    QuirkTier,
    number
  >
}

function weightedMeanIndex(weights: Array<{ tier: QuirkTier; weight: number }>): number {
  const total = weights.reduce((sum, entry) => sum + entry.weight, 0)
  return (
    weights.reduce(
      (sum, entry) => sum + FUSION_GENERATED_TIERS.indexOf(entry.tier) * entry.weight,
      0,
    ) / total
  )
}

describe('deriveFusionRollContext', () => {
  it('is deterministic for the same seed and parent pair', () => {
    expect(deriveFusionRollContext('seed-1', quirkA, quirkB)).toEqual(
      deriveFusionRollContext('seed-1', quirkA, quirkB),
    )
  })

  it('includes tier and roll metadata from the full fusion ladder', () => {
    const ctx = deriveFusionRollContext('ev4-s1', quirkA, quirkB)
    expect(FUSION_GENERATED_TIERS).toContain(ctx.tier)
    expect(ctx.roll.strategyKey).toBeTruthy()
    expect(ctx.roll.nameRegister).toBeTruthy()
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

describe('buildFusionTierWeights', () => {
  it('is deterministic and generates only fusion ladder tiers', () => {
    const first = deriveFusionTier('tier-seed', 'A', 'B', 'synergy', 'Short', 'a', 'b')
    const second = deriveFusionTier('tier-seed', 'A', 'B', 'synergy', 'Short', 'a', 'b')

    expect(second).toBe(first)
    expect(FUSION_GENERATED_TIERS).toContain(first)
  })

  it('weights equal parent tiers toward their ladder position', () => {
    const weights = weightMap('S', 'S')

    expect(weights.S).toBeGreaterThan(weights.A)
    expect(weights.S).toBeGreaterThan(weights.Ω)
    expect(weights.S).toBeGreaterThan(weights.D)
  })

  it('weights mixed parent tiers toward the middle of the ladder', () => {
    const weights = weightMap('S', 'C')

    expect(weights.B).toBeGreaterThan(weights.S)
    expect(weights.B).toBeGreaterThan(weights.C)
    expect(weights.B).toBeGreaterThan(weights.Ω)
    expect(weights.B).toBeGreaterThan(weights.D)
  })

  it('shapes Ω+Ω toward Ω and S with decay toward D', () => {
    const weights = weightMap('Ω', 'Ω')

    expect(weights.Ω).toBeGreaterThan(weights.A)
    expect(weights.S).toBeGreaterThan(weights.A)
    expect(weights.A).toBeGreaterThan(weights.B)
    expect(weights.B).toBeGreaterThanOrEqual(weights.C)
    expect(weights.C).toBeGreaterThanOrEqual(weights.D)
    expect(Math.abs(weights.Ω - weights.S)).toBeLessThanOrEqual(40)
  })

  it('shapes D+D toward C and D with decay toward Ω', () => {
    const weights = weightMap('D', 'D')

    expect(weights.D).toBeGreaterThan(weights.B)
    expect(weights.C).toBeGreaterThan(weights.B)
    expect(weights.B).toBeGreaterThan(weights.A)
    expect(weights.A).toBeGreaterThanOrEqual(weights.S)
    expect(weights.S).toBeGreaterThanOrEqual(weights.Ω)
    expect(Math.abs(weights.C - weights.D)).toBeLessThanOrEqual(40)
  })

  it('shapes Ω+D toward middle tiers, not the extremes', () => {
    const weights = weightMap('Ω', 'D')

    expect(weights.A).toBeGreaterThan(weights.Ω)
    expect(weights.B).toBeGreaterThan(weights.Ω)
    expect(weights.A).toBeGreaterThan(weights.D)
    expect(weights.B).toBeGreaterThan(weights.D)
    expect(resolveFusionTierTargetCenter('Ω', 'D', 'synergy', 'Short')).toBeGreaterThan(1.5)
    expect(resolveFusionTierTargetCenter('Ω', 'D', 'synergy', 'Short')).toBeLessThan(3.5)
  })

  it('keeps ladder extremes weaker than the peak for neutral S+S parents', () => {
    const weights = weightMap('S', 'S')

    expect(weights.S).toBeGreaterThan(weights.Ω)
    expect(weights.S).toBeGreaterThan(weights.D)
    expect(weights.S).toBeGreaterThan(weights.C)
    expect(weights.Ω).toBeGreaterThan(weights.D)
  })

  it('concentrates most roll weight on Ω and S for Special + Special parents', () => {
    const weights = weightMap('Ω', 'Ω')
    const total =
      weights.Ω + weights.S + weights.A + weights.B + weights.C + weights.D

    expect((weights.Ω + weights.S) / total).toBeGreaterThan(0.68)
    expect(weights.Ω).toBeGreaterThan(weights.A)
    expect(weights.S).toBeGreaterThan(weights.D)
  })

  it('raises opposite-tail weight when center moves toward that end of the ladder', () => {
    expect(weightMap('Ω', 'C').D).toBeGreaterThan(weightMap('Ω', 'Ω').D)
    expect(weightMap('B', 'C').Ω).toBeGreaterThan(weightMap('D', 'D').Ω)
  })

  it('mirrors Ω+Ω and D+D tier percentages across the ladder', () => {
    const omega = weightMap('Ω', 'Ω')
    const gag = weightMap('D', 'D')
    const tiers = ['Ω', 'S', 'A', 'B', 'C', 'D'] as const
    const totalOmega =
      omega.Ω + omega.S + omega.A + omega.B + omega.C + omega.D
    const totalGag = gag.Ω + gag.S + gag.A + gag.B + gag.C + gag.D

    for (const tier of tiers) {
      const mirrored = tiers[tiers.length - 1 - tiers.indexOf(tier)]
      expect(gag[mirrored] / totalGag).toBeCloseTo(omega[tier] / totalOmega, 2)
    }
  })

  it('dampens Ω and D when parents lack that extreme tier', () => {
    const ss = weightMap('S', 'S')
    const aa = weightMap('A', 'A')
    const oo = weightMap('Ω', 'Ω')
    const dd = weightMap('D', 'D')

    expect(ss.Ω).toBeLessThan(ss.S / 4)
    expect(ss.D).toBeLessThan(ss.S / 4)
    expect(aa.Ω).toBeLessThan(aa.A / 4)
    expect(aa.D).toBeLessThan(aa.A / 4)
    expect(oo.Ω).toBeGreaterThan(ss.Ω * 4)
    expect(dd.D).toBeGreaterThan(ss.D * 4)
  })

  it('orders opposite-tail chance by parent strength in raw weight and percent', () => {
    const omegaD = (pair: [QuirkTier, QuirkTier]) => {
      const weights = buildFusionTierWeights(pair[0], pair[1], 'synergy', 'Short')
      const total = weights.reduce((sum, entry) => sum + entry.weight, 0)
      const d = weights.find((entry) => entry.tier === 'D')!
      return { raw: d.weight, pct: d.weight / total }
    }
    const weakOmega = (pair: [QuirkTier, QuirkTier]) => {
      const weights = buildFusionTierWeights(pair[0], pair[1], 'synergy', 'Short')
      const total = weights.reduce((sum, entry) => sum + entry.weight, 0)
      const omega = weights.find((entry) => entry.tier === 'Ω')!
      return { raw: omega.weight, pct: omega.weight / total }
    }

    const oo = omegaD(['Ω', 'Ω'])
    const os = omegaD(['Ω', 'S'])
    const oa = omegaD(['Ω', 'A'])
    expect(oo.raw).toBeLessThan(os.raw)
    expect(os.raw).toBeLessThan(oa.raw)
    expect(oo.pct).toBeLessThan(os.pct)
    expect(os.pct).toBeLessThan(oa.pct)

    const dd = weakOmega(['D', 'D'])
    const cd = weakOmega(['C', 'D'])
    const cc = weakOmega(['C', 'C'])
    const bd = weakOmega(['B', 'D'])
    expect(dd.raw).toBeLessThan(cd.raw)
    expect(cd.raw).toBeLessThan(cc.raw)
    expect(cc.raw).toBeLessThanOrEqual(bd.raw)
    expect(dd.pct).toBeLessThan(cd.pct)
    expect(cd.pct).toBeLessThan(cc.pct)
  })

  it('rolls S and Ω at comparable rates for Special + Special parents', () => {
    const counts = new Map<string, number>()
    for (let i = 0; i < 500; i++) {
      const tier = deriveFusionTier(`omega-${i}`, 'Ω', 'Ω', 'synergy', 'Short', 'a', 'b')
      counts.set(tier, (counts.get(tier) ?? 0) + 1)
    }

    const sRate = (counts.get('S') ?? 0) / 500
    const omegaRate = (counts.get('Ω') ?? 0) / 500

    expect(sRate).toBeGreaterThan(0.2)
    expect(omegaRate).toBeGreaterThan(0.2)
    expect(Math.abs(sRate - omegaRate)).toBeLessThan(0.2)
    expect((counts.get('D') ?? 0) / 500).toBeLessThan((counts.get('B') ?? 0) / 500)
  })

  it('rolls C and D at comparable rates for gag + gag parents', () => {
    const counts = new Map<string, number>()
    for (let i = 0; i < 500; i++) {
      const tier = deriveFusionTier(`gag-${i}`, 'D', 'D', 'synergy', 'Short', 'a', 'b')
      counts.set(tier, (counts.get(tier) ?? 0) + 1)
    }

    const cRate = (counts.get('C') ?? 0) / 500
    const dRate = (counts.get('D') ?? 0) / 500

    expect(cRate).toBeGreaterThan(0.2)
    expect(dRate).toBeGreaterThan(0.2)
    expect(Math.abs(cRate - dRate)).toBeLessThan(0.2)
    expect((counts.get('Ω') ?? 0) / 500).toBeLessThan((counts.get('B') ?? 0) / 500)
  })

  it('shifts failure-mode weight toward weaker tiers on the full ladder', () => {
    const synergy = buildFusionTierWeights('S', 'S', 'synergy', 'Short')
    const failure = buildFusionTierWeights('S', 'S', 'failure-mode', 'Short')

    expect(weightedMeanIndex(failure)).toBeGreaterThan(weightedMeanIndex(synergy))
  })
})
