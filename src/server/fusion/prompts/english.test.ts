import { describe, expect, it } from 'vitest'
import { buildFusionPrompt, formatTypeDisciplineBlock } from './english'
import { formatFusionNamingBlock } from './naming'

describe('formatFusionNamingBlock', () => {
  it('is deterministic for the same seed and parent pair', () => {
    expect(formatFusionNamingBlock('abc123', [], 'acid', 'air-cannon')).toEqual(
      formatFusionNamingBlock('abc123', [], 'acid', 'air-cannon'),
    )
  })

  it('lists prior variant names when provided', () => {
    const block = formatFusionNamingBlock(
      'seed1',
      ['Corrosive Gale', 'Searing Gale'],
      'acid',
      'air-cannon',
    )
    expect(block).toContain('Corrosive Gale')
    expect(block).toContain('different joke/hook/register')
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
    const prompt = buildFusionPrompt(
      {
        id: 'permeation',
        name: 'Permeation',
        origin: 'BNHA',
        type: 'Emitter',
        range: 'Short',
        facets: ['Elemental'],
        description: 'A test',
      },
      {
        id: 'hardening',
        name: 'Hardening',
        origin: 'BNHA',
        type: 'Transformation',
        range: 'Contact',
        facets: ['Defense'],
        description: 'B test',
      },
      'seed1',
      { type: 'Emitter', range: 'Medium', facets: ['Control'] },
      ['Old Title'],
    )

    const namingIndex = prompt.indexOf('Naming (IMPORTANT')
    const utilityIndex = prompt.indexOf('Primary niche this variant:')
    const mechanicsIndex = prompt.indexOf('Required result mechanics')
    expect(namingIndex).toBeGreaterThan(-1)
    expect(utilityIndex).toBeGreaterThan(namingIndex)
    expect(utilityIndex).toBeLessThan(mechanicsIndex)
    expect(prompt).toContain('Facet validation (mandatory before output)')
    expect(prompt).toContain('Range prose check')
    expect(prompt).toContain('Type discipline (Emitter only)')
    expect(prompt).toContain('Old Title')
    const hasStrategyExample =
      prompt.includes('Avoid this mashup for this strategy: ❌') &&
      prompt.includes('phase through walls while fully armored at all times')
    const hasFailureAntiMashup = prompt.includes('reduced-potential fusion')
    expect(hasStrategyExample || hasFailureAntiMashup).toBe(true)
  })

  it('prints only the discipline for the rolled type', () => {
    const block = formatTypeDisciplineBlock('Emitter')

    expect(block).toContain('Type discipline (Emitter only)')
    expect(block).toContain('emits, projects, controls, or alters')
    expect(block).not.toContain('temporarily changes the user')
    expect(block).not.toContain('stable unusual anatomy')
  })
})
