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
  facets: ['Enhancement'],
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

  it('lists parent catalog names in not allowed names block', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x', [], undefined, 0, undefined, [
      'Old Hybrid',
    ])
    const instructions = buildFusionEnglishInstructions(fusion)

    expect(instructions).toContain('### Not allowed names (do not use for en.name)')
    expect(instructions).toContain('- "Permeation"')
    expect(instructions).toContain('- "Hardening"')
    expect(instructions).toContain('- "Old Hybrid"')
  })

  it('includes sibling diversity when prior variants exist', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x', [
      { name: 'Old', description: 'Prior idea.' },
    ])
    const instructions = buildFusionEnglishInstructions(fusion)

    expect(instructions).toContain('Sibling diversity REQUIRED')
    expect(instructions).toContain('Old')
  })

  it('mentions fandom search and scientific synthesis', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x')
    const instructions = buildFusionEnglishInstructions(fusion)

    expect(instructions).toContain('myheroacademia.fandom.com')
    expect(instructions).toContain('Scientific synthesis')
    expect(instructions).not.toContain('Softening + Barrier')
  })

  it('requires description-first copy and clear naming', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x')
    const instructions = buildFusionEnglishInstructions(fusion)

    expect(instructions).toContain('then write en.description, then en.name, then tier last')
    expect(instructions).toContain('what the user **has**')
    expect(instructions).toContain('NEW birth Quirk')
    expect(instructions).toContain('Could this description belong to either parent unchanged?')
    expect(instructions).toContain(
      'the title must give a clear idea of what the quirk does',
    )
    expect(instructions).toContain('do not add arbitrary targets')
  })

  it('includes inheritance criteria and treats facets as presentation only', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x')
    const instructions = buildFusionEnglishInstructions(fusion)

    expect(instructions).toContain('recognizable operational essence from EACH parent')
    expect(instructions).toContain(
      'Rolled facets describe how the hybrid presents; they never replace',
    )
  })

  it('includes tier assignment rubric in the same prompt', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x')
    const instructions = buildFusionEnglishInstructions(fusion)

    expect(instructions).toContain('## Tier assignment')
    expect(instructions).toContain('Seven evaluation questions')
    expect(instructions).toContain('Set **tier** in JSON last')
  })

  it('explains only the selected output type in description focus', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x')
    const instructions = buildFusionEnglishInstructions({
      ...fusion,
      mechanics: { ...fusion.mechanics, type: 'Emitter' },
    })

    expect(instructions).toContain('Emitter: state the outward effect')
    expect(instructions).not.toContain('Mutant: state the permanent body trait')
    expect(instructions).not.toContain('Transformation: state what changes while active')
  })
})
