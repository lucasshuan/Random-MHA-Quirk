import { describe, expect, it } from 'vitest'
import {
  buildFusionPrompt,
  deriveFusionRollContext,
  formatTypeDisciplineBlock,
  type FusionRollContext,
} from './english'
import { formatFusionNamingBlock } from './naming'

describe('formatFusionNamingBlock', () => {
  it('is deterministic for the same seed and parent pair', () => {
    expect(formatFusionNamingBlock('abc123', [], 'acid', 'air-cannon')).toEqual(
      formatFusionNamingBlock('abc123', [], 'acid', 'air-cannon'),
    )
  })

  it('lists prior variant names and descriptions when provided', () => {
    const block = formatFusionNamingBlock(
      'seed1',
      [
        {
          name: 'Corrosive Gale',
          description: 'Emits a corrosive mist that eats metal in open air.',
        },
        {
          name: 'Searing Gale',
          description: 'Channels hot wind that scorches targets at range.',
        },
      ],
      'acid',
      'air-cannon',
    )
    expect(block).toContain('Corrosive Gale')
    expect(block).toContain('corrosive mist')
    expect(block).toContain('meaningfully different effect idea')
    expect(block).toContain('commas and a single question mark')
    expect(block).toContain('random interjection')
    expect(block).toContain('"Oops, Cushion"')
    expect(block).toContain('"Oops-Proof"')
    expect(block).toContain('SAME selected register')
  })

  it('includes dramatic stem ban and name safety for non-meme registers', () => {
    let dramatic = ''
    for (let i = 0; i < 40; i++) {
      const block = formatFusionNamingBlock(`dramatic-${i}`, [], 'a', 'b')
      if (block.includes('Target name register for this variant: DRAMATIC')) {
        dramatic = block
        break
      }
    }
    expect(dramatic).toContain('Veil of')
    expect(dramatic).toContain('Hellflame')
    expect(dramatic).toContain('Name safety')
  })
})

describe('buildFusionPrompt', () => {
  it('includes diversity guidance before mechanics and prior names', () => {
    const quirkA = {
      id: 'permeation',
      name: 'Permeation',
      origin: 'BNHA',
      tier: 'A' as const,
      type: 'Emitter',
      range: 'Short',
      facets: ['Elemental'],
      description: 'A test',
    }
    const quirkB = {
      id: 'hardening',
      name: 'Hardening',
      origin: 'BNHA',
      tier: 'B' as const,
      type: 'Transformation',
      range: 'Contact',
      facets: ['Defense'],
      description: 'B test',
    }
    const rollContext: FusionRollContext = {
      ...deriveFusionRollContext('seed1', quirkA, quirkB),
      outputRoll: { type: 'Emitter', range: 'Medium', facets: ['Control'] },
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

  it('prints only the discipline for the rolled type', () => {
    const block = formatTypeDisciplineBlock('Emitter')

    expect(block).toContain('Type discipline (Emitter only)')
    expect(block).toContain('sends an effect outward from the body')
    expect(block).not.toContain('temporarily changes the user')
    expect(block).not.toContain('stable unusual anatomy')
  })
})
