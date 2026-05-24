import { describe, expect, it } from 'vitest'
import { buildFusionAgentInput } from './agent-input'
import type { FusionCatalogQuirk } from './catalog'

const quirkA: FusionCatalogQuirk = {
  id: 'permeation',
  name: 'Permeation',
  origin: 'BNHA',
  tier: 'A',
  type: 'Emitter',
  range: 'Short',
  facets: ['Mobility'],
  description: 'Phase through solids.',
}

const quirkB: FusionCatalogQuirk = {
  id: 'hardening',
  name: 'Hardening',
  origin: 'BNHA',
  tier: 'B',
  type: 'Transformation',
  range: 'Contact',
  facets: ['Enhancement'],
  description: 'Harden body parts.',
}

describe('buildFusionAgentInput', () => {
  it('is deterministic for the same seed and parents', () => {
    const a = buildFusionAgentInput(quirkA, quirkB, 'seed-1')
    const b = buildFusionAgentInput(quirkA, quirkB, 'seed-1')
    expect(a).toEqual(b)
  })

  it('echoes fixed mechanics from roll context', () => {
    const input = buildFusionAgentInput(quirkA, quirkB, 'seed-1')
    expect(input.mechanics.origin).toBe('ORIGINAL')
    expect(input.mechanics.type).toBeTruthy()
    expect(input.mechanics.facets.length).toBeGreaterThan(0)
    expect(input.roll.strategyInstruction).toContain('Fusion strategy')
  })

  it('includes parent catalog names in takenTitles', () => {
    const input = buildFusionAgentInput(quirkA, quirkB, 'seed-1', [], undefined, 0, [
      'Sibling Title',
    ])
    expect(input.takenTitles).toEqual(['Permeation', 'Hardening', 'Sibling Title'])
  })

  it('flags sibling diversity when priors exist', () => {
    const without = buildFusionAgentInput(quirkA, quirkB, 'seed-1')
    const withPrior = buildFusionAgentInput(quirkA, quirkB, 'seed-1', [
      { name: 'Prior', description: 'Already used idea.' },
    ])
    expect(without.constraints.siblingDiversityRequired).toBe(false)
    expect(withPrior.constraints.siblingDiversityRequired).toBe(true)
    expect(withPrior.priorVariants).toHaveLength(1)
  })

  it('contains request-specific data rather than invariant prompt policy', () => {
    const input = buildFusionAgentInput(quirkA, quirkB, 'seed-1')

    expect(input.roll.nameRegister).toBeTruthy()
    expect(input.roll.nameExamples.length).toBeGreaterThan(0)
    expect(input.constraints).not.toHaveProperty('namingRules')
    expect(input.constraints).not.toHaveProperty('canonNameReferences')
  })
})
