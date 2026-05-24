import { describe, expect, it } from 'vitest'
import { rerollHybridFromSettings } from './reroll-from-settings'
import { DEFAULT_QUIRK_FILTERS, type Quirk } from '@/types/quirk'

function quirk(id: string, type: Quirk['type']): Quirk {
  return {
    id: id as Quirk['id'],
    name: id,
    description: '',
    origin: 'ORIGINAL',
    tier: 'B',
    type,
    range: 'Self',
    facets: [],
  }
}

describe('rerollHybridFromSettings', () => {
  it('keeps manually pinned parents and rerolls the other slot', () => {
    const all = [
      quirk('emitter-1', 'Emitter'),
      quirk('emitter-2', 'Emitter'),
      quirk('mutant-1', 'Mutant'),
      quirk('mutant-2', 'Mutant'),
    ]

    const result = rerollHybridFromSettings(
      all,
      {
        slotFilters: [
          { ...DEFAULT_QUIRK_FILTERS, types: ['Emitter'] },
          { ...DEFAULT_QUIRK_FILTERS, types: ['Mutant'] },
        ],
        manualParentIds: ['emitter-1', null],
      },
      'en',
    )

    expect(result).not.toBeNull()
    expect(result?.parents[0].id).toBe('emitter-1')
    expect(result?.parents[1].type).toBe('Mutant')
    expect(result?.fusionEntry).toBeNull()
  })

  it('respects second-slot filters when both parents are random', () => {
    const all = [
      quirk('emitter-1', 'Emitter'),
      quirk('emitter-2', 'Emitter'),
      quirk('mutant-1', 'Mutant'),
      quirk('transformation-1', 'Transformation'),
    ]

    const result = rerollHybridFromSettings(
      all,
      {
        slotFilters: [
          { ...DEFAULT_QUIRK_FILTERS, types: ['Emitter'] },
          { ...DEFAULT_QUIRK_FILTERS, types: ['Mutant'] },
        ],
        manualParentIds: [null, null],
      },
      'en',
    )

    expect(result).not.toBeNull()
    expect(result?.parents[0].type).toBe('Emitter')
    expect(result?.parents[1].type).toBe('Mutant')
  })
})
