import { describe, expect, it } from 'vitest'
import { buildFusionAgentInput } from '../agent-input'
import type { FusionCatalogQuirk } from '../catalog'
import { buildFusionEnglishInstructions } from './instructions-en'

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
  facets: ['Defense'],
  description: 'Harden body parts.',
}

describe('buildFusionEnglishInstructions', () => {
  it('embeds fixed mechanics and strategy from FusionAgentInput', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x')
    const instructions = buildFusionEnglishInstructions(fusion)

    expect(instructions).toContain(`type: ${fusion.mechanics.type}`)
    expect(instructions).toContain(fusion.roll.strategyInstruction)
    expect(instructions).toContain(fusion.roll.utilityNudge)
    expect(instructions).toContain('Permeation')
    expect(instructions).toContain('Hardening')
  })

  it('includes sibling diversity when prior variants exist', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x', [
      { name: 'Old', description: 'Prior idea.' },
    ])
    const instructions = buildFusionEnglishInstructions(fusion)

    expect(instructions).toContain('Sibling diversity REQUIRED')
    expect(instructions).toContain('Old')
  })
})
