import { describe, expect, it } from 'vitest'
import { formatFusionNamingBlock, selectFusionNameRegister } from './naming'

describe('selectFusionNameRegister', () => {
  it('rotates register on dedup retry attempts', () => {
    const first = selectFusionNameRegister('seed-1', 'acid', 'explosion', 0)
    const retry = selectFusionNameRegister('seed-1', 'acid', 'explosion', 1)
    expect(retry.key).not.toBe(first.key)
  })
})

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
