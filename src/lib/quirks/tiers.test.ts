import { describe, expect, it } from 'vitest'
import { DEFAULT_SELECTED_TIERS } from './tiers'
import { QUIRK_TIERS } from '@/types/quirk'

describe('DEFAULT_SELECTED_TIERS', () => {
  it('includes S–C but not Special or D', () => {
    expect(DEFAULT_SELECTED_TIERS).toEqual(['S', 'A', 'B', 'C'])
    expect(DEFAULT_SELECTED_TIERS).not.toContain('Ω')
    expect(DEFAULT_SELECTED_TIERS).not.toContain('D')
  })

  it('is a subset of all tiers', () => {
    for (const tier of DEFAULT_SELECTED_TIERS) {
      expect(QUIRK_TIERS).toContain(tier)
    }
  })
})
