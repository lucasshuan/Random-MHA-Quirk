import { describe, expect, it } from 'vitest'
import type { Quirk } from '../types/quirk'
import { rollHybrid } from './hybridRoll'

function mockQuirk(id: string): Quirk {
  return {
    id,
    name: id,
    description: 'test',
    origin: 'BNHA',
    tier: 'B',
    type: 'Emitter',
    range: 'Medium',
    facets: ['Emission'],
  }
}

describe('rollHybrid', () => {
  it('retorna null se pool insuficiente', () => {
    expect(rollHybrid([mockQuirk('a')], [], 'en')).toBeNull()
  })

  it('retorna pais e seed', () => {
    const result = rollHybrid(
      [mockQuirk('a'), mockQuirk('b')],
      [mockQuirk('c')],
      'en',
      'fixedseed',
    )
    expect(result).not.toBeNull()
    expect(result!.seed).toBe('fixedseed')
    expect(result!.parents).toHaveLength(2)
  })
})
