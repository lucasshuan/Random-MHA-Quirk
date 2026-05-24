import { describe, expect, it } from 'vitest'
import {
  fusionCacheKeyFromHybridRoute,
  isFusionSeed,
  isQuirkId,
  shareHybridPath,
  shareQuirkPath,
} from './paths'

describe('share paths', () => {
  it('validates catalog ids', () => {
    expect(isQuirkId('explosion')).toBe(true)
    expect(isQuirkId('not-a-quirk')).toBe(false)
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
