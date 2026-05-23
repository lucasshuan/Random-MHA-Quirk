import { describe, expect, it } from 'vitest'
import { parseFusionRollMeta } from './roll-meta'

describe('parseFusionRollMeta', () => {
  it('reads antiMashupRuleKey from roll json', () => {
    const parsed = parseFusionRollMeta({
      strategyKey: 'synergy',
      nameRegister: 'pun',
      utilityNiche: 'plain wording',
      antiMashupRuleKey: 'coherent-loop',
    })
    expect(parsed?.antiMashupRuleKey).toBe('coherent-loop')
  })

  it('migrates legacy antiMashupRule text to a key', () => {
    const parsed = parseFusionRollMeta({
      strategyKey: 'failure-mode',
      nameRegister: 'blunt',
      utilityNiche: 'plain wording',
      antiMashupRule:
        'Anti-mashup: failure-mode is reduced-potential fusion — one surviving loop.',
    })
    expect(parsed?.antiMashupRuleKey).toBe('failure-reduced')
  })
})
