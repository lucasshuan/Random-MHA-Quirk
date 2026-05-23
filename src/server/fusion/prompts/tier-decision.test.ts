import { describe, expect, it } from 'vitest'
import { buildFusionTierDecisionInstructions } from '../agents/instructions-tier'
import {
  buildFusionTierDecisionRubric,
  formatFusionStrategyTierGuidance,
  formatFusionTierDecisionQuirk,
} from './tier-decision'

const sampleFusion = {
  en: {
    name: 'Shear Dome',
    description:
      'The user sweats a non-Newtonian fluid that hardens on impact into a short-lived protective dome.',
  },
  type: 'Emitter' as const,
  range: 'Short' as const,
  facets: ['Enhancement'] as const,
  origin: 'ORIGINAL' as const,
}

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

describe('buildFusionTierDecisionInstructions', () => {
  it('embeds the quirk under test and parent calibration', () => {
    const text = buildFusionTierDecisionInstructions(sampleFusion, {
      id: 'permeation',
      name: 'Permeation',
      origin: 'BNHA',
      tier: 'A',
      type: 'Emitter',
      range: 'Short',
      facets: ['Mobility'],
      description: 'Phasing.',
    }, {
      id: 'hardening',
      name: 'Hardening',
      origin: 'BNHA',
      tier: 'B',
      type: 'Transformation',
      range: 'Contact',
      facets: ['Enhancement'],
      description: 'Hardens skin.',
    }, 'synergy')

    expect(text).toContain(formatFusionTierDecisionQuirk(sampleFusion))
    expect(text).toContain('Permeation: tier A')
    expect(text).toContain('Hardening: tier B')
  })

  it('includes failure-mode downgrade when strategy is failure-mode', () => {
    const text = buildFusionTierDecisionInstructions(
      sampleFusion,
      {
        id: 'a',
        name: 'A',
        origin: 'BNHA',
        tier: 'S',
        type: 'Emitter',
        range: 'Long',
        facets: [],
        description: '',
      },
      {
        id: 'b',
        name: 'B',
        origin: 'BNHA',
        tier: 'S',
        type: 'Emitter',
        range: 'Long',
        facets: [],
        description: '',
      },
      'failure-mode',
    )

    expect(text).toContain('mandatory tier adjustment')
    expect(text).toContain('at least one band lower')
  })
})
