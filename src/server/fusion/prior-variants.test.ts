import { describe, expect, it } from 'vitest'
import type { FusionCatalogQuirk } from './catalog'
import {
  MAX_PRIOR_VARIANTS,
  pickPriorVariantsForPrompt,
  scorePriorVariantSimilarity,
} from './prior-variants'

const quirkA: FusionCatalogQuirk = {
  id: 'acid',
  name: 'Acid',
  origin: 'BNHA',
  tier: 'A',
  type: 'Emitter',
  range: 'Short',
  facets: ['Elemental'],
  description: 'A',
}

const quirkB: FusionCatalogQuirk = {
  id: 'explosion',
  name: 'Explosion',
  origin: 'BNHA',
  tier: 'S',
  type: 'Emitter',
  range: 'Long',
  facets: ['Emission'],
  description: 'B',
}

const target = {
  tier: 'A' as const,
  type: 'Emitter' as const,
  range: 'Medium' as const,
  facets: ['Control'] as const,
  roll: {
    strategyKey: 'synergy',
    nameRegister: 'pun',
    utilityNiche: 'plain wording',
    antiMashupRuleKey: 'coherent-loop',
  },
}

describe('scorePriorVariantSimilarity', () => {
  it('ranks identical roll parameters highest', () => {
    const same = scorePriorVariantSimilarity(target, target)
    const different = scorePriorVariantSimilarity(
      {
        ...target,
        tier: 'C',
        type: 'Mutant',
        range: 'Self',
        facets: ['Biological'],
        roll: {
          strategyKey: 'failure-mode',
          nameRegister: 'dramatic',
          utilityNiche: 'clear body tell',
          antiMashupRuleKey: 'failure-reduced',
        },
      },
      target,
    )
    expect(same).toBeGreaterThan(different)
  })
})

describe('pickPriorVariantsForPrompt', () => {
  it('returns at most MAX_PRIOR_VARIANTS entries', () => {
    const rows = Array.from({ length: 8 }, (_, index) => ({
      key: `k${index}`,
      seed: `seed-${index}`,
      en: { name: `Variant ${index}`, description: `Description ${index}.` },
      type: 'Emitter',
      range: 'Medium',
      facets: ['Control'],
      tier: 'A',
      roll: target.roll,
    }))

    const picked = pickPriorVariantsForPrompt(rows, target, quirkA, quirkB)
    expect(picked.length).toBeLessThanOrEqual(MAX_PRIOR_VARIANTS)
  })

  it('prefers variants with matching strategy and name register', () => {
    const rows = [
      {
        key: 'k1',
        seed: 's1',
        en: { name: 'Far', description: 'Far variant.' },
        type: 'Mutant',
        range: 'Self',
        facets: ['Biological'],
        tier: 'C',
        roll: {
          strategyKey: 'failure-mode',
          nameRegister: 'dramatic',
          utilityNiche: 'clear body tell',
          antiMashupRuleKey: 'modifier-cost',
        },
      },
      {
        key: 'k2',
        seed: 's2',
        en: { name: 'Close', description: 'Close variant.' },
        type: 'Emitter',
        range: 'Medium',
        facets: ['Control'],
        tier: 'A',
        roll: target.roll,
      },
    ]

    const picked = pickPriorVariantsForPrompt(rows, target, quirkA, quirkB, { limit: 1 })
    expect(picked).toHaveLength(1)
    expect(picked[0]?.name).toBe('Close')
  })
})
