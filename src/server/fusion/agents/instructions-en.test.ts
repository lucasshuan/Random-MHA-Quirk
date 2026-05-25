import { describe, expect, it } from 'vitest'
import { buildFusionAgentInput } from '../agent-input'
import type { FusionCatalogQuirk } from '../catalog'
import { REGISTER_DEFS } from '../prompts/naming'
import { formatTypeDisciplineBlock } from '../prompts/type-discipline'
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

function buildWithNameRegister(
  key: (typeof REGISTER_DEFS)[number]['key'],
): string {
  const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x')
  const register = REGISTER_DEFS.find((definition) => definition.key === key)!

  return buildFusionEnglishInstructions({
    ...fusion,
    roll: {
      ...fusion.roll,
      nameRegister: register.key,
      nameRegisterInstruction: register.instruction,
      nameExamples: register.examples,
    },
  })
}

describe('buildFusionEnglishInstructions', () => {
  it('embeds fixed mechanics and strategy from FusionAgentInput', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x')
    const instructions = buildFusionEnglishInstructions(fusion)

    expect(instructions).toContain(`type: ${fusion.mechanics.type}`)
    expect(instructions).toContain(`- tier: ${fusion.mechanics.tier}`)
    expect(instructions).not.toContain('- origin:')
    expect(instructions).toContain(fusion.roll.strategyInstruction)
    expect(instructions).not.toContain('### Utility')
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

  it('mentions fandom search and scientific/conceptual synthesis', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x')
    const instructions = buildFusionEnglishInstructions(fusion)

    expect(instructions).toContain('myheroacademia.fandom.com')
    expect(instructions).toContain('Scientific / conceptual synthesis')
    expect(instructions).toContain(
      'third organism, machine, material, mythic creature, or phenomenon',
    )
    expect(instructions).toContain('mechanically earned by the description')
    expect(instructions).toContain('do not force parent keywords into en.name')
    expect(instructions).toContain('rolled intentionally rare')
    expect(instructions).toContain('Softening + Barrier')
  })

  it('adapts third-concept naming illustrations to the rolled register', () => {
    expect(buildWithNameRegister('blunt')).toContain('Cow + Horns -> bull -> "Bull"')
    expect(buildWithNameRegister('blunt')).toContain(
      'Magnetism + Projectile -> railgun -> "Railgun"',
    )
    expect(buildWithNameRegister('blunt')).toContain(
      'Sand + Lightning -> fulgurite -> "Fulgurite"',
    )
    expect(buildWithNameRegister('dramatic')).toContain(
      'Lion + Eagle -> griffin -> "Skyclaw"',
    )
    expect(buildWithNameRegister('dramatic')).toContain(
      'Engine + Jet/Fan -> turbofan -> "Afterburner"',
    )
    expect(buildWithNameRegister('dramatic')).toContain(
      'Centipede + Armor -> armored arthropod -> "Arthroplate"',
    )
    expect(buildWithNameRegister('pun')).toContain(
      'Beetle + Explosion -> bombardier beetle -> "Shell Shock"',
    )
    expect(buildWithNameRegister('pun')).toContain(
      'Steam + Muscle -> hydraulic press -> "Pressing Issue"',
    )
    expect(buildWithNameRegister('pun')).toContain(
      'Octopus + Camouflage -> mimic octopus -> "Inkognito"',
    )
    expect(buildWithNameRegister('meme-adjacent')).toContain(
      'Ant + Telepathy -> colony mind -> "Group Chat"',
    )
    expect(buildWithNameRegister('meme-adjacent')).toContain(
      'Shark + Electricity -> electroreception -> "Shark Wi-Fi"',
    )
    expect(buildWithNameRegister('absurd-long')).toContain(
      'Serpent + Rooster -> cockatrice -> "Snake Chicken of Doom"',
    )
    expect(buildWithNameRegister('absurd-long')).toContain(
      'Mushroom + Mind Control -> cordyceps -> "Mushrooms That Borrow Other People\'s Bodies"',
    )
    expect(buildWithNameRegister('blunt')).toContain('if the earned mechanism resolves')
    expect(buildWithNameRegister('blunt')).toContain('selected register')
    expect(buildWithNameRegister('blunt')).toContain('These are models, not preferred outputs')
    expect(buildWithNameRegister('blunt')).not.toContain('"Bull Rush"')
  })

  it('places tier target before strategy and forces weak-tier guidance for C and D', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x')
    const cInstructions = buildFusionEnglishInstructions({
      ...fusion,
      mechanics: { ...fusion.mechanics, tier: 'C' },
    })
    const dInstructions = buildFusionEnglishInstructions({
      ...fusion,
      mechanics: { ...fusion.mechanics, tier: 'D' },
    })

    for (const instructions of [cInstructions, dInstructions]) {
      expect(instructions.indexOf('## Tier target for this variant')).toBeLessThan(
        instructions.indexOf('### Fusion strategy'),
      )
      expect(instructions).toContain('overrides generic detail')
      expect(instructions).toContain("it's not convoluted")
    }

    expect(cInstructions).toContain('C-tier target 70–130')
    expect(cInstructions).toContain('C-tier simplicity (mandatory for this variant')
    expect(dInstructions).toContain('D-tier target 70–110')
    expect(dInstructions).toContain('enhanced chest hair')
  })

  it('forces Ω-tier simplicity when tier is Ω', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x')
    const instructions = buildFusionEnglishInstructions({
      ...fusion,
      mechanics: { ...fusion.mechanics, tier: 'Ω' },
    })

    expect(instructions).toContain('Ω-tier simplicity (mandatory for this variant')
    expect(instructions).toContain('do not think through limitations')
    expect(instructions).toContain('Ω-tier target 90–150')
    expect(instructions.indexOf('## Tier target for this variant')).toBeLessThan(
      instructions.indexOf('### Fusion strategy'),
    )
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

  it('renders question-title guidance only for compatible rolled registers', () => {
    const pun = buildWithNameRegister('pun')
    const memeAdjacent = buildWithNameRegister('meme-adjacent')
    const blunt = buildWithNameRegister('blunt')
    const dramatic = buildWithNameRegister('dramatic')

    expect(pun).toContain('A question title is exceptional')
    expect(pun).toContain('finished mechanism')
    expect(pun).toContain('"Got Milk?"')
    expect(memeAdjacent).toContain('A question title is exceptional')
    expect(memeAdjacent).toContain('"Who, Me?"')
    expect(blunt).not.toContain('question title is exceptional')
    expect(dramatic).not.toContain('question title is exceptional')
    expect(pun).not.toContain('Canon-style reference names (any register)')
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
    expect(first.indexOf('## Tier target for this variant')).toBeGreaterThan(
      first.indexOf('### Fixed mechanics'),
    )
    expect(first.indexOf('## Tier target for this variant')).toBeLessThan(
      first.indexOf('### Fusion strategy'),
    )
    expect(first.slice(0, firstRequestIndex)).toBe(second.slice(0, secondRequestIndex))
    expect(first.slice(0, firstRequestIndex)).not.toContain('question title is exceptional')
    expect(first).not.toContain('Canon-style reference names (any register)')
    expect(first).not.toContain('seed seed-x')
  })

  it('renders the fixed type reference before detailed selected-type rules', () => {
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'seed-x')
    const emitterRules = formatTypeDisciplineBlock('Emitter')
      .split('\n')
      .slice(1)
      .map((line) => line.replace(/^- /, ''))
    const instructions = buildFusionEnglishInstructions({
      ...fusion,
      mechanics: { ...fusion.mechanics, type: 'Emitter' },
      constraints: { ...fusion.constraints, typeDiscipline: emitterRules },
    })
    const fixedReference = instructions.indexOf('## Quirk type reference')
    const requestSpecification = instructions.indexOf('## Request-specific specification')
    const selectedRules = instructions.indexOf(
      '### Selected output type: Emitter (must follow)',
    )
    const tierTarget = instructions.indexOf('## Tier target for this variant')
    const selectedRulesBlock = instructions.slice(selectedRules, tierTarget)

    expect(fixedReference).toBeLessThan(requestSpecification)
    expect(instructions).toContain('Emitter:')
    expect(instructions).toContain('Transformation:')
    expect(instructions).toContain('Mutant:')
    expect(selectedRules).toBeGreaterThan(instructions.indexOf('### Fixed mechanics'))
    expect(selectedRules).toBeLessThan(tierTarget)
    expect(selectedRulesBlock).toContain('sends an effect outward from the body')
    expect(selectedRulesBlock).not.toContain('temporarily changes the user')
    expect(selectedRulesBlock).not.toContain('stable unusual anatomy')
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
