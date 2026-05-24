import { describe, expect, it } from 'vitest'
import { filterFusionEntries } from './database-filters'
import type { FusionCacheEntry } from '@/types/fusion'
import { DEFAULT_QUIRK_FILTERS } from '@/types/quirk'

const sampleEntry: FusionCacheEntry = {
  key: 'a+b:seed1',
  parents: ['quirk-a', 'quirk-b'],
  seed: 'seed1',
  en: { name: 'Blaze Merge', description: 'Fires and ice combine.' },
  'pt-BR': { name: 'Fusão', description: 'Fogo e gelo.' },
  es: { name: 'Fusión', description: 'Fuego y hielo.' },
  type: 'Emitter',
  range: 'Medium',
  facets: ['Elemental'],
  origin: 'ORIGINAL',
  tier: 'A',
  roll: {
    strategyKey: 'synergy',
    nameRegister: 'blunt',
    utilityNiche: 'plain wording',
    antiMashupRuleKey: 'coherent-loop',
  },
}

describe('filterFusionEntries', () => {
  it('matches fusion name in query', () => {
    const result = filterFusionEntries(
      [sampleEntry],
      { ...DEFAULT_QUIRK_FILTERS, query: 'blaze' },
      'en',
    )
    expect(result).toHaveLength(1)
  })

  it('filters by tier', () => {
    const result = filterFusionEntries(
      [sampleEntry],
      { ...DEFAULT_QUIRK_FILTERS, tiers: ['B'] },
      'en',
    )
    expect(result).toHaveLength(0)
  })
})
