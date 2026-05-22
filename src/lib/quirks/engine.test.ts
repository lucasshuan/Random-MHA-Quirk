import { describe, expect, it } from 'vitest'
import { getQuirks } from '../i18n/quirks'

const quirks = getQuirks('en')
import { applyFilters, pickHybridPair, pickRandom, pickTwoDistinctRandom } from './quirkEngine'

describe('applyFilters', () => {
  it('returns only quirks that match selected type and range', () => {
    const result = applyFilters(quirks, {
      origins: [],
      tiers: [],
      types: ['Transformation'],
      ranges: ['Self'],
      facets: [],
      query: '',
    })

    expect(result.length).toBeGreaterThan(0)
    expect(result.every((quirk) => quirk.type === 'Transformation')).toBe(true)
    expect(result.every((quirk) => quirk.range === 'Self')).toBe(true)
  })

  it('requires all selected facets to be present', () => {
    const result = applyFilters(quirks, {
      origins: [],
      tiers: [],
      types: [],
      ranges: [],
      facets: ['Mobility', 'Support'],
      query: '',
    })

    expect(result.length).toBeGreaterThan(0)
    expect(
      result.every(
        (quirk) =>
          quirk.facets.includes('Mobility') && quirk.facets.includes('Support'),
      ),
    ).toBe(true)
  })

  it('supports case-insensitive query search', () => {
    const result = applyFilters(quirks, {
      origins: [],
      tiers: [],
      types: [],
      ranges: [],
      facets: [],
      query: 'eLeCtRiCaL',
    })

    expect(result.map((quirk) => quirk.id)).toContain('electrification')
  })
})

describe('pickRandom', () => {
  it('returns null for empty input', () => {
    expect(pickRandom([])).toBeNull()
  })

  it('returns an item from input list', () => {
    const items = ['a', 'b', 'c']
    const result = pickRandom(items)
    expect(result === null ? false : items.includes(result)).toBe(true)
  })
})

describe('pickTwoDistinctRandom', () => {
  it('returns null when list has fewer than two entries', () => {
    expect(pickTwoDistinctRandom([])).toBeNull()
    expect(pickTwoDistinctRandom(['one'])).toBeNull()
  })

  it('returns two distinct entries', () => {
    const items = ['alpha', 'beta', 'gamma']
    const pair = pickTwoDistinctRandom(items)

    expect(pair).not.toBeNull()
    if (!pair) {
      return
    }

    expect(items.includes(pair[0])).toBe(true)
    expect(items.includes(pair[1])).toBe(true)
    expect(pair[0]).not.toBe(pair[1])
  })
})

describe('pickHybridPair', () => {
  it('returns one quirk from each pool when possible', () => {
    const poolA = quirks.filter((quirk) => quirk.type === 'Emitter')
    const poolB = quirks.filter((quirk) => quirk.type === 'Mutant')
    const pair = pickHybridPair(poolA, poolB)

    expect(pair).not.toBeNull()
    if (!pair) {
      return
    }

    expect(poolA.some((quirk) => quirk.id === pair[0].id)).toBe(true)
    expect(poolB.some((quirk) => quirk.id === pair[1].id)).toBe(true)
  })
})

