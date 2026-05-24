import { describe, expect, it } from 'vitest'
import { buildFusionAgentInput } from '../agent-input'
import { deriveFusionRollContext } from './roll-context'
import {
  buildFusionEnglishTierVariantBlock,
  buildFusionTierDecisionRubric,
  formatFusionStrategyTierGuidance,
} from './tier-decision'

describe('buildFusionTierDecisionRubric', () => {
  it('includes seven questions, tier scale, and Special tier guard', () => {
    const rubric = buildFusionTierDecisionRubric()

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
    expect(rubric).toContain('never output Ω')
    expect(rubric).toContain('| **S** | Exceptional |')
    expect(rubric).toContain('| **A** | Strong |')
    expect(rubric).toContain('| **B** | Solid |')
    expect(rubric).toContain('| **C** | Weak-ish |')
    expect(rubric).toContain('| **D** | Gag / useless |')
    expect(rubric).toContain('never output D')
    expect(rubric).toContain('Never** return **Ω** (Special) or **D**')
  })
})

describe('formatFusionStrategyTierGuidance', () => {
  it('requires a downgrade for failure-mode', () => {
    const guidance = formatFusionStrategyTierGuidance('failure-mode')
    expect(guidance).toContain('at least one band lower')
    expect(guidance).toContain('failure-mode')
    expect(guidance).not.toContain('automatic downgrade')
  })
})

const quirkA = {
  id: 'permeation',
  name: 'Permeation',
  origin: 'BNHA' as const,
  tier: 'A' as const,
  type: 'Emitter' as const,
  range: 'Short' as const,
  facets: ['Mobility'] as const,
  description: 'Phasing.',
}

const quirkB = {
  id: 'hardening',
  name: 'Hardening',
  origin: 'BNHA' as const,
  tier: 'B' as const,
  type: 'Transformation' as const,
  range: 'Contact' as const,
  facets: ['Enhancement'] as const,
  description: 'Hardens skin.',
}

describe('buildFusionEnglishTierVariantBlock', () => {
  it('embeds parent tier calibration', () => {
    const fusion = buildFusionAgentInput(
      quirkA,
      quirkB,
      'tier-block-test',
      [],
      deriveFusionRollContext('tier-block-test', quirkA, quirkB, []),
    )
    const text = buildFusionEnglishTierVariantBlock(fusion)

    expect(text).toContain('Permeation: tier A')
    expect(text).toContain('Hardening: tier B')
    expect(text).toContain('Set **tier** in JSON last')
  })

  it('includes failure-mode downgrade when strategy is failure-mode', () => {
    const rollContext = deriveFusionRollContext('tier-block-test', quirkA, quirkB, [])
    const fusion = buildFusionAgentInput(quirkA, quirkB, 'tier-block-test', [], {
      ...rollContext,
      roll: { ...rollContext.roll, strategyKey: 'failure-mode' },
    })

    const text = buildFusionEnglishTierVariantBlock(fusion)

    expect(text).toContain('mandatory tier adjustment')
    expect(text).toContain('at least one band lower')
  })
})
