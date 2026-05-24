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
    expect(instructions).toContain(`- tier: ${fusion.mechanics.tier}`)
    expect(instructions).not.toContain('- origin:')
    expect(instructions).toContain(fusion.roll.strategyInstruction)
    expect(instructions).toContain(fusion.roll.utilityNudge)
    expect(instructions).toContain('Permeation')
    expect(instructions).toContain('Hardening')
  })

  it('lists parent catalog names in not allowed names block', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x', [], undefined, 0, [
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

    expect(instructions).toContain('then write en.description, then en.name')
    expect(instructions).not.toContain('then tier last')
    expect(instructions).toContain('Lead with the concrete mechanism')
    expect(instructions).toContain('NEW birth Quirk')
    expect(instructions).toContain('Could this description belong to either parent unchanged?')
    expect(instructions).toContain(
      'the title must give a clear idea of what the quirk does',
    )
    expect(instructions).toContain('do not add arbitrary targets')
  })

  it('instructs the model to use question-mark names only for natural relevant puns', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x')
    const instructions = buildFusionEnglishInstructions(fusion)

    expect(instructions).toContain('Question marks in en.name are exceptional')
    expect(instructions).toContain('default to a non-question title')
    expect(instructions).toContain('naturally phrased, punny question')
    expect(instructions).toContain('finished quirk mechanism')
    expect(instructions).toContain('"Got Milk?"')
    expect(instructions).toContain('"Who, Me?"')
    expect(instructions).toContain('unexpectedly apt')
    expect(instructions).toContain('Never force a question')
  })

  it('includes inheritance criteria and treats facets as presentation only', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x')
    const instructions = buildFusionEnglishInstructions(fusion)

    expect(instructions).toContain('recognizable operational essence from EACH parent')
    expect(instructions).toContain(
      'Rolled facets describe how the hybrid presents; they never replace',
    )
  })

  it('includes tier calibration rubric while keeping the server tier authoritative', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x')
    const instructions = buildFusionEnglishInstructions(fusion)

    expect(instructions).toContain('## Tier calibration reference')
    expect(instructions).toContain('Seven evaluation questions')
    expect(instructions).toContain('Assigned tier (server-fixed; do not output)')
    expect(instructions).toContain('Do not include tier in JSON')
    expect(instructions).not.toContain('Set **tier** in JSON last')
  })

  it('keeps the long rubric in a stable prefix before request-specific values', () => {
    const first = buildFusionEnglishInstructions(
      buildFusionAgentInput(quirkA, quirkB, 'seed-x'),
    )
    const second = buildFusionEnglishInstructions(
      buildFusionAgentInput(quirkA, quirkB, 'seed-y'),
    )
    const requestMarker = '## Request-specific specification'
    const firstRequestIndex = first.indexOf(requestMarker)
    const secondRequestIndex = second.indexOf(requestMarker)

    expect(first.indexOf('## Tier calibration reference')).toBeLessThan(firstRequestIndex)
    expect(first.slice(0, firstRequestIndex)).toBe(second.slice(0, secondRequestIndex))
    expect(first.indexOf('Question marks in en.name are exceptional')).toBeLessThan(
      firstRequestIndex,
    )
    expect(first).not.toContain('seed seed-x')
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

  it('lists described prior titles once instead of repeating them as forbidden names', () => {
    const instructions = buildFusionEnglishInstructions(
      buildFusionAgentInput(
        quirkA,
        quirkB,
        'seed-x',
        [{ name: 'Old Hybrid', description: 'Prior idea.' }],
        undefined,
        0,
        ['Old Hybrid', 'Unused Sibling'],
      ),
    )

    expect(instructions.match(/"Old Hybrid"/g)).toHaveLength(1)
    expect(instructions).toContain('- "Unused Sibling"')
    expect(instructions).toContain('### Prior variants (titles are forbidden)')
  })
})
