import { describe, expect, it } from 'vitest'
import { pickUniformFromHash } from './seed-hash'

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
