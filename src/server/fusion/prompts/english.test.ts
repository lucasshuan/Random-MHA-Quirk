import { describe, expect, it } from 'vitest'
import { buildFusionPrompt, formatPriorVariantNamesBlock } from './english'

describe('formatPriorVariantNamesBlock', () => {
  it('returns empty string when there are no prior names', () => {
    expect(formatPriorVariantNamesBlock([])).toBe('')
  })

  it('lists prior fusion names when provided', () => {
    const block = formatPriorVariantNamesBlock(['Corrosive Gale', 'Searing Gale'])
    expect(block).toContain('Corrosive Gale')
    expect(block).toContain('Searing Gale')
    expect(block).toContain('clearly different en.name')
  })
})

describe('buildFusionPrompt', () => {
  it('includes prior names block when provided', () => {
    const prompt = buildFusionPrompt(
      {
        id: 'a',
        name: 'A',
        origin: 'BNHA',
        type: 'Emitter',
        range: 'Short',
        facets: ['Elemental'],
        description: 'A test',
      },
      {
        id: 'b',
        name: 'B',
        origin: 'BNHA',
        type: 'Emitter',
        range: 'Long',
        facets: ['Emission'],
        description: 'B test',
      },
      'seed1',
      { type: 'Emitter', range: 'Medium', facets: ['Control'] },
      ['Old Title'],
    )

    expect(prompt).toContain('Old Title')
  })
})
