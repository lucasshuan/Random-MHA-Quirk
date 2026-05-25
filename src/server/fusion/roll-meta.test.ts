import { describe, expect, it } from 'vitest'
import { parseFusionRollMeta } from './roll-meta'

describe('parseFusionRollMeta', () => {
  it('reads antiMashupRuleKey from roll json', () => {
    const parsed = parseFusionRollMeta({
      strategyKey: 'synergy',
      nameRegister: 'pun',
      antiMashupRuleKey: 'coherent-loop',
    })
    expect(parsed?.antiMashupRuleKey).toBe('coherent-loop')
  })

  it('migrates legacy antiMashupRule text to a key', () => {
    const parsed = parseFusionRollMeta({
      strategyKey: 'failure-mode',
      nameRegister: 'blunt',
      antiMashupRule:
        'Anti-mashup: failure-mode is reduced-potential fusion — one surviving loop.',
    })
    expect(parsed?.antiMashupRuleKey).toBe('failure-reduced')
  })

  it('ignores obsolete stored utility niche metadata', () => {
    expect(
      parseFusionRollMeta({
        strategyKey: 'synergy',
        nameRegister: 'pun',
        utilityNiche: 'plain wording',
        antiMashupRuleKey: 'coherent-loop',
      }),
    ).toEqual({
      strategyKey: 'synergy',
      nameRegister: 'pun',
      antiMashupRuleKey: 'coherent-loop',
    })
  })
})
