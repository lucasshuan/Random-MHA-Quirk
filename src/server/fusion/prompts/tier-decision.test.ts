import { describe, expect, it } from 'vitest'
import { buildFusionAgentInput } from '../agent-input'
import type { FusionCatalogQuirk } from '../catalog'
import { deriveFusionRollContext } from './roll-context'
import {
  buildFusionEnglishTierVariantBlock,
  buildFusionTierCalibrationRubric,
  buildFusionTierOmegaBlock,
  buildFusionTierWeakSimplicityBlock,
  formatFusionDescriptionLengthGuidance,
} from './tier-decision'

describe('buildFusionTierCalibrationRubric', () => {
  it('includes seven questions, full ladder, and rare Ω/D assignment', () => {
    const rubric = buildFusionTierCalibrationRubric()

    expect(rubric).toContain('Seven evaluation questions')
    expect(rubric).toContain('Does it bypass durability?')
    expect(rubric).toContain('Can it affect top-tier enemies?')
    expect(rubric).toContain('How easy is activation?')
    expect(rubric).toContain('What is the counterplay?')
    expect(rubric).toContain('What is the ceiling?')
    expect(rubric).toContain('Does it create instant-win scenarios?')
    expect(rubric).toContain('Are you ranking the quirk, not the user?')
    expect(rubric).toContain('War-arc benchmark')
    expect(rubric).toMatch(/\*\*Ω\*\*/)
    expect(rubric).toContain('Special')
    expect(rubric).toContain('**Ω**, **S**, **A**, **B**, **C**, or **D**')
    expect(rubric).toContain('rolled intentionally rare')
    expect(rubric).toContain('| **S** | Exceptional |')
    expect(rubric).toContain('| **D** | Gag / weak |')
    expect(rubric).not.toContain('never assigned to a generated fusion')
  })
})

const quirkA: FusionCatalogQuirk = {
  id: 'permeation',
  name: 'Permeation',
  origin: 'BNHA',
  tier: 'A',
  type: 'Emitter',
  range: 'Short',
  facets: ['Mobility'],
  description: 'Phasing.',
}

const quirkB: FusionCatalogQuirk = {
  id: 'hardening',
  name: 'Hardening',
  origin: 'BNHA',
  tier: 'B',
  type: 'Transformation',
  range: 'Contact',
  facets: ['Enhancement'],
  description: 'Hardens skin.',
}

describe('buildFusionEnglishTierVariantBlock', () => {
  it('embeds the server-assigned target tier without repeating parent summaries', () => {
    const fusion = buildFusionAgentInput(
      quirkA,
      quirkB,
      'tier-block-test',
      [],
      deriveFusionRollContext('tier-block-test', quirkA, quirkB, []),
    )
    const text = buildFusionEnglishTierVariantBlock(fusion)

    expect(text).toContain(`- tier: ${fusion.mechanics.tier}`)
    expect(text).toContain('server-fixed; do not output')
    expect(text).not.toContain('Permeation: tier A')
    expect(text).not.toContain('Hardening: tier B')
  })

  it('does not instruct the model to recalculate a strategy-adjusted tier', () => {
    const rollContext = deriveFusionRollContext('tier-block-test', quirkA, quirkB, [])
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'tier-block-test', [], {
      ...rollContext,
      roll: { ...rollContext.roll, strategyKey: 'failure-mode' },
    })

    const text = buildFusionEnglishTierVariantBlock(fusion)

    expect(text).toContain('tier roll already incorporates parent tiers')
    expect(text).toContain('do not recalculate or override it')
    expect(text).not.toContain('mandatory tier adjustment')
  })

  it('appends mandatory weak-tier simplicity for C and D', () => {
    const base = buildFusionAgentInput(
      quirkA,
      quirkB,
      'tier-block-test',
      [],
      deriveFusionRollContext('tier-block-test', quirkA, quirkB, []),
    )

    expect(
      buildFusionEnglishTierVariantBlock({
        ...base,
        mechanics: { ...base.mechanics, tier: 'C' },
      }),
    ).toContain('C-tier simplicity (mandatory for this variant')
    expect(
      buildFusionEnglishTierVariantBlock({
        ...base,
        mechanics: { ...base.mechanics, tier: 'D' },
      }),
    ).toContain('D-tier simplicity (mandatory for this variant')
    expect(buildFusionTierWeakSimplicityBlock('D')).toContain('enhanced chest hair')
  })

  it('appends mandatory Ω calibration when tier is Special', () => {
    const base = buildFusionAgentInput(
      quirkA,
      quirkB,
      'tier-block-test',
      [],
      deriveFusionRollContext('tier-block-test', quirkA, quirkB, []),
    )
    const text = buildFusionEnglishTierVariantBlock({
      ...base,
      mechanics: { ...base.mechanics, tier: 'Ω' },
    })

    expect(text).toContain('Ω-tier simplicity (mandatory for this variant')
    expect(buildFusionTierOmegaBlock()).toContain('do not think through limitations')
    expect(buildFusionTierOmegaBlock()).not.toContain('State explicit limits')
  })

  it('omits tier-specific blocks for mid tiers', () => {
    const fusion = buildFusionAgentInput(
      quirkA,
      quirkB,
      'tier-block-test',
      [],
      deriveFusionRollContext('tier-block-test', quirkA, quirkB, []),
    )

    if (fusion.mechanics.tier === 'C' || fusion.mechanics.tier === 'D' || fusion.mechanics.tier === 'Ω') {
      return
    }

    const text = buildFusionEnglishTierVariantBlock(fusion)
    expect(text).not.toContain('-tier simplicity')
    expect(text).not.toContain('Ω-tier simplicity')
  })
})

describe('formatFusionDescriptionLengthGuidance', () => {
  it('uses short targets for C and D tiers', () => {
    expect(formatFusionDescriptionLengthGuidance('C', 70, 300)).toContain(
      'C-tier target 70–130',
    )
    expect(formatFusionDescriptionLengthGuidance('D', 70, 300)).toContain(
      'D-tier target 70–110',
    )
  })

  it('uses short targets for Ω tier', () => {
    expect(formatFusionDescriptionLengthGuidance('Ω', 70, 300)).toContain(
      'Ω-tier target 90–150',
    )
    expect(formatFusionDescriptionLengthGuidance('Ω', 70, 300)).toContain(
      'do not pad with limits or drawbacks',
    )
  })

  it('keeps the default target band for mid tiers', () => {
    expect(formatFusionDescriptionLengthGuidance('S', 70, 300)).toContain(
      'Target 160–240',
    )
  })
})
