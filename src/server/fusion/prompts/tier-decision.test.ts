import { describe, expect, it } from 'vitest'
import { buildFusionAgentInput } from '../agent-input'
import type { FusionCatalogQuirk } from '../catalog'
import { deriveFusionRollContext } from './roll-context'
import {
  buildFusionEnglishTierVariantBlock,
  buildFusionTierCalibrationRubric,
} from './tier-decision'

describe('buildFusionTierCalibrationRubric', () => {
  it('includes seven questions, tier scale, and Special tier guard', () => {
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
    expect(rubric).toContain('never assigned to a generated fusion')
    expect(rubric).toContain('| **S** | Exceptional |')
    expect(rubric).toContain('| **A** | Strong |')
    expect(rubric).toContain('| **B** | Solid |')
    expect(rubric).toContain('| **C** | Weak-ish |')
    expect(rubric).toContain('| **D** | Gag / useless |')
    expect(rubric).toContain('server supplies one fixed generated tier')
    expect(rubric).toContain('Do not output or override it')
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
})
