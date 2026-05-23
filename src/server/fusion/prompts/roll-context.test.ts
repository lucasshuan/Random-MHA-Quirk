import { describe, expect, it } from 'vitest'
import type { FusionCatalogQuirk } from '../catalog'
import { deriveFusionRollContext, deriveFusionTier } from './roll-context'

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
    expect(['S', 'A', 'B', 'C']).toContain(ctx.tier)
    expect(ctx.roll.strategyKey).toBeTruthy()
    expect(ctx.roll.nameRegister).toBeTruthy()
    expect(ctx.roll.utilityNiche).toBeTruthy()
    expect(ctx.roll.antiMashupRuleKey).toBe('coherent-loop')
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
  it('biases failure-mode below parent average', () => {
    const synergy = deriveFusionTier(
      't1',
      'S',
      'S',
      'synergy',
      'Long',
      'a',
      'b',
    )
    const failure = deriveFusionTier(
      't1',
      'S',
      'S',
      'failure-mode',
      'Long',
      'a',
      'b',
    )
    expect(['S', 'A', 'B', 'C'].indexOf(failure)).toBeGreaterThanOrEqual(
      ['S', 'A', 'B', 'C'].indexOf(synergy),
    )
  })
})
