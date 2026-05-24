import { describe, expect, it } from 'vitest'
import {
  fusionCacheKeyFromHybridRoute,
  isFusionSeed,
  isQuirkId,
  isQuirkIdSlug,
  isShareQuirkId,
  shareHybridPath,
  shareQuirkPath,
} from './paths'

describe('share paths', () => {
  it('validates known catalog ids', () => {
    expect(isQuirkId('explosion')).toBe(true)
    expect(isQuirkId('not-a-quirk')).toBe(false)
  })

  it('accepts share slugs for ids present in live catalog but not QUIRK_IDS', () => {
    expect(isShareQuirkId('memory-projector')).toBe(true)
    expect(isQuirkId('memory-projector')).toBe(false)
  })

  it('rejects malformed id slugs', () => {
    expect(isQuirkIdSlug('')).toBe(false)
    expect(isQuirkIdSlug('Bad-ID')).toBe(false)
    expect(isQuirkIdSlug('../escape')).toBe(false)
  })

  it('validates fusion seeds', () => {
    expect(isFusionSeed('abc12')).toBe(true)
    expect(isFusionSeed('bad seed')).toBe(false)
  })

  it('builds locale-free solo share paths', () => {
    expect(shareQuirkPath('explosion')).toBe('/r/quirk/explosion')
  })

  it('builds locale-free hybrid share paths preserving parent order', () => {
    expect(shareHybridPath('explosion', 'acid', 'seed1')).toBe(
      '/r/hybrid/explosion/acid/seed1',
    )
  })

  it('derives fusion cache keys from route segments', () => {
    expect(fusionCacheKeyFromHybridRoute('explosion', 'acid', 'seed1')).toBe(
      'acid+explosion:seed1',
    )
    expect(fusionCacheKeyFromHybridRoute('explosion', 'explosion', 'seed1')).toBeNull()
  })
})
