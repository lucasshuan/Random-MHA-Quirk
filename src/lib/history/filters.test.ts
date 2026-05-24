import { describe, expect, it } from 'vitest'
import { matchesHistoryFilters, primaryHistoryQuirk } from './filters'
import type { ResultHistoryEntry } from './types'
import { DEFAULT_QUIRK_FILTERS } from '@/types/quirk'

const hybridEntry: ResultHistoryEntry = {
  id: '1',
  createdAt: 0,
  locale: 'en',
  mode: 'hybrid',
  searchText: 'fusion c parent b parent c',
  hybrid: {
    parentA: {
      id: 'parent-b',
      name: 'Parent B',
      tier: 'B',
      type: 'Emitter',
      range: 'Short',
      origin: 'BNHA',
      facets: [],
    },
    parentB: {
      id: 'parent-c',
      name: 'Parent C',
      tier: 'C',
      type: 'Mutant',
      range: 'Self',
      origin: 'BNHA',
      facets: [],
    },
    seed: 'seed1',
    fusion: {
      id: 'fusion-1',
      name: 'Fusion C',
      tier: 'C',
      type: 'Transformation',
      range: 'Medium',
      origin: 'ORIGINAL',
      facets: [],
    },
  },
}

describe('matchesHistoryFilters', () => {
  it('filters hybrids by fusion tier, not parent tiers', () => {
    expect(primaryHistoryQuirk(hybridEntry).tier).toBe('C')
    expect(
      matchesHistoryFilters(hybridEntry, {
        ...DEFAULT_QUIRK_FILTERS,
        tiers: ['B'],
      }),
    ).toBe(false)
    expect(
      matchesHistoryFilters(hybridEntry, {
        ...DEFAULT_QUIRK_FILTERS,
        tiers: ['C'],
      }),
    ).toBe(true)
  })
})
