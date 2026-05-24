import { describe, expect, it } from 'vitest'
import {
  FUSION_NAME_REGISTER_KEYS,
  formatFusionNamingBlock,
  selectFusionNameRegister,
} from './naming'

describe('selectFusionNameRegister', () => {
  it('rotates register on dedup retry attempts', () => {
    const first = selectFusionNameRegister('seed-1', 'acid', 'explosion', 0)
    const retry = selectFusionNameRegister('seed-1', 'acid', 'explosion', 1)
    expect(retry.key).not.toBe(first.key)
  })

  it('gives each register equal weight when no prior siblings', () => {
    const counts = new Map<string, number>()
    for (let i = 0; i < 250; i++) {
      const key = selectFusionNameRegister(`reg-${i}`, 'acid', 'explosion').key
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    for (const key of FUSION_NAME_REGISTER_KEYS) {
      expect(counts.get(key) ?? 0).toBeGreaterThan(20)
    }
    const values = [...counts.values()]
    expect(Math.max(...values) / Math.min(...values)).toBeLessThan(3)
  })

})

describe('formatFusionNamingBlock', () => {
  it('is deterministic for the same seed and parent pair', () => {
    expect(formatFusionNamingBlock('abc123', [], 'acid', 'air-cannon')).toEqual(
      formatFusionNamingBlock('abc123', [], 'acid', 'air-cannon'),
    )
  })

  it('lists parent catalog names in not allowed names', () => {
    const block = formatFusionNamingBlock('seed1', [], 'acid', 'air-cannon', {
      a: 'Acid',
      b: 'Air Cannon',
    })
    expect(block).toContain('Not allowed names')
    expect(block).toContain('"Acid"')
    expect(block).toContain('"Air Cannon"')
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
    expect(block).toContain('Question marks in en.name are exceptional')
    expect(block).toContain('default to a non-question title')
    expect(block).toContain('naturally phrased, punny question')
    expect(block).toContain('Never force a question')
    expect(block).toContain('random interjection')
    expect(block).toContain('"Oops, Cushion"')
    expect(block).toContain('"Oops-Proof"')
    expect(block).toContain('SAME selected register')
  })

  it('keeps fun question examples behind the exceptional-use guard', () => {
    const block = formatFusionNamingBlock('questions', [], 'a', 'b')

    expect(block).toContain('"Who, Me?"')
    expect(block).toContain('"Got Milk?"')
    expect(block).toContain('only when the new quirk makes that question unexpectedly apt')
    expect(block).toContain('Never force a question')
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
