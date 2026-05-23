import { describe, expect, it } from 'vitest'
import { buildFusionPrompt } from './build-fusion-prompt'
import { deriveFusionRollContext } from '@/server/fusion/prompts/roll-context'

describe('buildFusionPrompt', () => {
  it('includes diversity guidance before mechanics and prior names', () => {
    const quirkA = {
      id: 'permeation',
      name: 'Permeation',
      origin: 'BNHA' as const,
      tier: 'A' as const,
      type: 'Emitter' as const,
      range: 'Short' as const,
      facets: ['Elemental'],
      description: 'A test',
    }
    const quirkB = {
      id: 'hardening',
      name: 'Hardening',
      origin: 'BNHA' as const,
      tier: 'B' as const,
      type: 'Transformation' as const,
      range: 'Contact' as const,
      facets: ['Defense'],
      description: 'B test',
    }
    const rollContext = {
      ...deriveFusionRollContext('seed1', quirkA, quirkB),
      outputRoll: { type: 'Emitter' as const, range: 'Medium' as const, facets: ['Control'] },
    }
    const prompt = buildFusionPrompt(quirkA, quirkB, 'seed1', [
      { name: 'Old Title', description: 'Old effect that clears lingering ice in open space.' },
    ], rollContext)

    const namingIndex = prompt.indexOf('Naming (IMPORTANT')
    const strategyIndex = prompt.indexOf('Fusion strategy —')
    const mechanicsIndex = prompt.indexOf('Required result mechanics')
    expect(namingIndex).toBeGreaterThan(-1)
    expect(strategyIndex).toBeGreaterThan(namingIndex)
    expect(strategyIndex).toBeLessThan(mechanicsIndex)
    expect(prompt).toContain('Facet contract (keep one central mechanism)')
    expect(prompt).toContain('Source-faithfulness gate')
    expect(prompt).toContain('Simplicity nudge for this variant:')
    expect(prompt).toContain('Range prose check')
    expect(prompt).toContain('Type discipline (Emitter only)')
    expect(prompt).toContain('Structure the description in this order')
    expect(prompt).toContain('Old Title')
    expect(prompt).toContain('clears lingering ice')
    expect(prompt).toContain('never add healing, calming, remote senses, animal anatomy')
    expect(prompt).toContain('Changing only the title, range, strength')
    const hasStrategyExample =
      prompt.includes('Avoid this mashup for this strategy: ❌') &&
      prompt.includes('phase through walls while fully armored at all times')
    const hasFailureAntiMashup = prompt.includes('reduced-potential fusion')
    expect(hasStrategyExample || hasFailureAntiMashup).toBe(true)
  })
})
