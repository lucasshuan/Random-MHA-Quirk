import { describe, expect, it } from 'vitest'
import type { Quirk } from '../types/quirk'
import { applyFilters, pickHybridPair, pickRandom, pickTwoDistinctRandom } from './engine'

const sampleQuirks: Quirk[] = [
  {
    id: 'acid',
    origin: 'BNHA',
    tier: 'B',
    type: 'Emitter',
    range: 'Short',
    facets: ['Elemental'],
    name: 'Acid',
    description: 'Corrosive liquid from skin.',
  },
  {
    id: 'air-walk',
    origin: 'BNHA',
    tier: 'B',
    type: 'Emitter',
    range: 'Self',
    facets: ['Mobility', 'Support'],
    name: 'Air Walk',
    description: 'Walk on air pockets for mobility.',
  },
  {
    id: 'beast',
    origin: 'BNHA',
    tier: 'A',
    type: 'Transformation',
    range: 'Self',
    facets: ['Anthropomorphic', 'Enhancement'],
    name: 'Beast',
    description: 'Transform into a savage beast form.',
  },
]

describe('applyFilters', () => {
  it('returns only quirks that match selected type and range', () => {
    const result = applyFilters(sampleQuirks, {
      origins: [],
      tiers: [],
      types: ['Transformation'],
      ranges: ['Self'],
      facets: [],
      query: '',
    })

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('beast')
  })

  it('requires all selected facets to be present', () => {
    const result = applyFilters(sampleQuirks, {
      origins: [],
      tiers: [],
      types: [],
      ranges: [],
      facets: ['Mobility', 'Support'],
      query: '',
    })

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('air-walk')
  })

  it('matches query against searchable text callback', () => {
    const result = applyFilters(
      sampleQuirks,
      {
        origins: [],
        tiers: [],
        types: [],
        ranges: [],
        facets: [],
        query: 'beast form',
      },
      {
        searchableText: (quirk) => `${quirk.name} ${quirk.description}`,
      },
    )

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('beast')
  })
})

describe('pickRandom', () => {
  it('returns null for empty input', () => {
    expect(pickRandom([])).toBeNull()
  })
})

describe('pickTwoDistinctRandom', () => {
  it('returns null when fewer than two items', () => {
    expect(pickTwoDistinctRandom([sampleQuirks[0]])).toBeNull()
  })
})

describe('pickHybridPair', () => {
  it('returns two quirks from the provided pools', () => {
    const pair = pickHybridPair([sampleQuirks[0]], [sampleQuirks[1], sampleQuirks[2]])
    expect(pair).not.toBeNull()
    expect(pair?.[0].id).toBe('acid')
  })
})
