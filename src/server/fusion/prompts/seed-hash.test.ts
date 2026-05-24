import { describe, expect, it } from 'vitest'
import { pickUniformFromHash, pickWeightedFromHash } from './seed-hash'

describe('pickUniformFromHash', () => {
  it('returns only items from the provided pool', () => {
    const pool = ['a', 'b', 'c'] as const
    for (let i = 0; i < 30; i++) {
      expect(pool).toContain(pickUniformFromHash(`seed-${i}`, 'salt', pool))
    }
  })

  it('throws when the pool is empty', () => {
    expect(() => pickUniformFromHash('seed', 'salt', [])).toThrow(
      'pickUniformFromHash: options must not be empty',
    )
  })
})

describe('pickWeightedFromHash', () => {
  it('favors options with more configured weight', () => {
    const counts = new Map<string, number>()
    const pool = [
      { key: 'common', weight: 80 },
      { key: 'rare', weight: 20 },
    ] as const

    for (let i = 0; i < 1000; i++) {
      const picked = pickWeightedFromHash(`seed-${i}`, 'salt', pool)
      counts.set(picked.key, (counts.get(picked.key) ?? 0) + 1)
    }

    expect(counts.get('common') ?? 0).toBeGreaterThan(counts.get('rare') ?? 0)
  })

  it('rejects empty pools and invalid weights', () => {
    expect(() => pickWeightedFromHash('seed', 'salt', [])).toThrow(
      'pickWeightedFromHash: options must not be empty',
    )
    expect(() =>
      pickWeightedFromHash('seed', 'salt', [{ key: 'invalid', weight: 0 }]),
    ).toThrow('pickWeightedFromHash: weights must be positive integers')
  })
})
