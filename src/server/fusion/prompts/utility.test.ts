import { describe, expect, it } from 'vitest'
import { selectFusionUtilityNudge } from './utility'

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
})
