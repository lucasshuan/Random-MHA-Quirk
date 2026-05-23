import { describe, expect, it } from 'vitest'
import { formatFusionUtilityNudge, selectFusionUtilityNudge } from './utility'

describe('selectFusionUtilityNudge', () => {
  it('is deterministic for the same seed and parent pair', () => {
    expect(selectFusionUtilityNudge('abc', 'acid', 'air-cannon')).toEqual(
      selectFusionUtilityNudge('abc', 'acid', 'air-cannon'),
    )
  })

  it('can differ for the same seed on different parent pairs', () => {
    const a = selectFusionUtilityNudge('ev4-s1', 'acid', 'air-cannon')
    const b = selectFusionUtilityNudge('ev4-s1', 'frog', 'laser')
    expect(a.niche === b.niche).toBe(false)
  })

  it('returns a simplicity nudge line', () => {
    const nudge = selectFusionUtilityNudge('seed-1', 'a', 'b')
    expect(nudge.line).toContain('Simplicity nudge for this variant:')
    expect(nudge.line).toContain(nudge.niche)
  })

  it('does not require a secondary detail after the mechanism is clear', () => {
    const nudge = formatFusionUtilityNudge('complete core effect')

    expect(nudge).toContain('stop after the core effect is clear')
    expect(formatFusionUtilityNudge('simple secondary detail')).toContain(
      'stop after the core effect is clear',
    )
  })

  it('does not select the legacy secondary-detail label for new variants', () => {
    const niches = Array.from({ length: 40 }, (_, index) =>
      selectFusionUtilityNudge(`new-${index}`, 'a', 'b').niche,
    )

    expect(niches).not.toContain('simple secondary detail')
    expect(niches).toContain('complete core effect')
  })
})
