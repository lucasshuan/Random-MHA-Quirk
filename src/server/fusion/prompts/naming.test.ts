import { describe, expect, it } from 'vitest'
import {
  FUSION_NAMING_RULES,
  FUSION_NAME_REGISTER_KEYS,
  REGISTER_DEFS,
  selectFusionNameRegister,
} from './naming'

describe('selectFusionNameRegister', () => {
  it('cycles through every register on dedup retry attempts', () => {
    const keys = FUSION_NAME_REGISTER_KEYS.map(
      (_, attempt) => selectFusionNameRegister('seed-1', 'acid', 'explosion', attempt).key,
    )

    expect(new Set(keys)).toEqual(new Set(FUSION_NAME_REGISTER_KEYS))
  })

  it('uses modestly higher initial weights for pun, blunt, and dramatic names', () => {
    expect(
      Object.fromEntries(REGISTER_DEFS.map((definition) => [definition.key, definition.weight])),
    ).toEqual({
      pun: 26,
      blunt: 26,
      dramatic: 26,
      'absurd-long': 11,
      'meme-adjacent': 11,
    })
    expect(REGISTER_DEFS.reduce((sum, definition) => sum + definition.weight, 0)).toBe(100)
  })

  it('continues producing every configured register', () => {
    const counts = new Map<string, number>()
    for (let i = 0; i < 250; i++) {
      const key = selectFusionNameRegister(`reg-${i}`, 'acid', 'explosion').key
      counts.set(key, (counts.get(key) ?? 0) + 1)
    }

    for (const key of FUSION_NAME_REGISTER_KEYS) {
      expect(counts.get(key) ?? 0).toBeGreaterThan(20)
    }
    const values = [...counts.values()]
    expect(Math.max(...values) / Math.min(...values)).toBeLessThan(3)
  })
})

describe('naming policy', () => {
  it('keeps shared naming rules independent of any rolled register', () => {
    const rules = FUSION_NAMING_RULES.join('\n')

    expect(rules).toContain('selected name register')
    expect(rules).toContain('NEW birth Quirk')
    expect(rules).not.toContain('question title')
    expect(rules).not.toContain('meme')
    expect(rules).not.toContain('absurd-long')
  })

  it('scopes question-title guidance to compatible playful registers', () => {
    const instructions = Object.fromEntries(
      REGISTER_DEFS.map((definition) => [definition.key, definition.instruction]),
    )

    expect(instructions.pun).toContain('A question title is exceptional')
    expect(instructions.pun).toContain('"Got Milk?"')
    expect(instructions['meme-adjacent']).toContain('A question title is exceptional')
    expect(instructions['meme-adjacent']).toContain('"Who, Me?"')
    expect(instructions.blunt).not.toContain('question title')
    expect(instructions.dramatic).not.toContain('question title')
    expect(instructions['absurd-long']).not.toContain('question title')
  })

  it('keeps examples associated with their register definition', () => {
    const pun = REGISTER_DEFS.find((definition) => definition.key === 'pun')
    const blunt = REGISTER_DEFS.find((definition) => definition.key === 'blunt')
    const absurdLong = REGISTER_DEFS.find(
      (definition) => definition.key === 'absurd-long',
    )
    const memeAdjacent = REGISTER_DEFS.find((definition) => definition.key === 'meme-adjacent')

    expect(pun?.examples).toContain('Got Milk?')
    expect(blunt?.examples).toContain('Comic')
    expect(absurdLong?.examples).toContain('Beams From His Eyes')
    expect(memeAdjacent?.examples).toContain('Sugar Rush')
    expect(memeAdjacent?.examples).toContain('Who, Me?')
    expect(memeAdjacent?.examples).not.toContain('Beams From His Eyes')
  })
})
