import { describe, expect, it } from 'vitest'
import { deriveFusionOutputFromSeed } from './output'

describe('deriveFusionOutputFromSeed', () => {
  it('is deterministic for the same seed', () => {
    const a = deriveFusionOutputFromSeed('seed-abc')
    const b = deriveFusionOutputFromSeed('seed-abc')
    expect(b).toEqual(a)
  })

  it('differs across seeds', () => {
    const a = deriveFusionOutputFromSeed('seed-1')
    const b = deriveFusionOutputFromSeed('seed-2')
    const same =
      a.type === b.type &&
      a.range === b.range &&
      a.facets.join() === b.facets.join()
    expect(same).toBe(false)
  })

  it('picks 1–4 facets', () => {
    for (let i = 0; i < 20; i++) {
      const roll = deriveFusionOutputFromSeed(`facet-seed-${i}`)
      expect(roll.facets.length).toBeGreaterThanOrEqual(1)
      expect(roll.facets.length).toBeLessThanOrEqual(4)
    }
  })
})
