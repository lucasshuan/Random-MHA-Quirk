import { describe, expect, it } from 'vitest'
import type { FusionCatalogQuirk } from '../catalog'
import {
  formatAntiMashupRule,
  formatBaseAntiMashupRule,
  formatStrategyAntiMashupExample,
} from './anti-mashup'

function mockQuirk(
  partial: Partial<FusionCatalogQuirk> & Pick<FusionCatalogQuirk, 'id'>,
): FusionCatalogQuirk {
  return {
    name: partial.id,
    origin: 'BNHA',
    type: 'Emitter',
    range: 'Medium',
    facets: ['Emission'],
    description: 'Test',
    ...partial,
  }
}

describe('formatBaseAntiMashupRule', () => {
  it('keeps the global rule short for synergy', () => {
    const rule = formatBaseAntiMashupRule('synergy')
    expect(rule).toContain('one parent supplies the main loop')
    expect(rule).not.toContain('phase through walls')
  })
})

describe('formatStrategyAntiMashupExample', () => {
  it('uses pair-specific wording for permeation + hardening', () => {
    const example = formatStrategyAntiMashupExample(
      'synergy',
      mockQuirk({ id: 'permeation', type: 'Emitter', range: 'Short' }),
      mockQuirk({ id: 'hardening', type: 'Transformation', range: 'Contact' }),
    )
    expect(example).toContain('❌')
    expect(example).toContain('phase through walls while fully armored at all times')
  })

  it('uses pair-specific wording for frog + laser', () => {
    const example = formatStrategyAntiMashupExample(
      'emission-bridge',
      mockQuirk({ id: 'frog', type: 'Mutant', range: 'Medium' }),
      mockQuirk({ id: 'laser', type: 'Emitter', range: 'Long' }),
    )
    expect(example).toContain('tongue fires lasers and also rescues allies at full laser DPS')
  })

  it('falls back to a type-based example for unknown pairs', () => {
    const example = formatStrategyAntiMashupExample(
      'dominant-a',
      mockQuirk({ id: 'a', type: 'Emitter' }),
      mockQuirk({ id: 'b', type: 'Mutant' }),
    )
    expect(example).toContain('Emitter output and full Mutant output')
  })

  it('returns empty for failure-mode', () => {
    expect(
      formatStrategyAntiMashupExample(
        'failure-mode',
        mockQuirk({ id: 'frog' }),
        mockQuirk({ id: 'laser' }),
      ),
    ).toBe('')
  })
})

describe('formatAntiMashupRule', () => {
  it('combines base rule and strategy example', () => {
    const rule = formatAntiMashupRule(
      'synergy',
      mockQuirk({ id: 'permeation' }),
      mockQuirk({ id: 'hardening' }),
    )
    expect(rule).toContain('one parent supplies the main loop')
    expect(rule).toContain('phase through walls while fully armored at all times')
  })
})
