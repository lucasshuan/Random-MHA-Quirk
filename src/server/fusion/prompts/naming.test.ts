import { describe, expect, it } from 'vitest'
import {
  FUSION_CANON_NAME_REFERENCES,
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
      pun: 22,
      blunt: 22,
      dramatic: 22,
      'absurd-long': 17,
      'meme-adjacent': 17,
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
  it('keeps question examples behind the exceptional-use guard', () => {
    const rules = FUSION_NAMING_RULES.join('\n')

    expect(rules).toContain('Question marks in en.name are exceptional')
    expect(rules).toContain('"Who, Me?"')
    expect(rules).toContain('"Got Milk?"')
    expect(rules).toContain('only when the new quirk makes that question unexpectedly apt')
    expect(rules).toContain('Never force a question')
  })

  it('keeps the canonical reference examples', () => {
    expect(FUSION_CANON_NAME_REFERENCES).toEqual([
      'Pop Off',
      'Comic',
      'Meatball',
      'Beams From His Eyes',
      'Gigantic Spinning Flying Turtle',
      'Sugar Rush',
      'Brainwashing',
      'Zero Gravity',
    ])
  })

  it('retains the meme-adjacent question example', () => {
    let examples: string[] = []
    for (let i = 0; i < 40; i++) {
      const selected = selectFusionNameRegister(`meme-${i}`, 'a', 'b')
      if (selected.key === 'meme-adjacent') {
        examples = selected.examples
        break
      }
    }

    expect(examples).toContain('Who, Me?')
  })

  it('uses the curated cheeky canon and spin-off meme-adjacent examples', () => {
    const memeAdjacent = REGISTER_DEFS.find(
      (definition) => definition.key === 'meme-adjacent',
    )

    expect(memeAdjacent?.examples).toEqual([
      'Sugar Rush',
      'Chest Hair',
      'Binging Ball',
      'Stress',
      'Sloshed',
      'Who, Me?',
      'Shame',
      'Smile',
      'Food',
      'Dog',
      'Soccer',
      'Playtime',
      'Squirmy Fingers',
    ])
  })
})
