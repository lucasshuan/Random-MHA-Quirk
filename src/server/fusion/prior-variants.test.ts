import { describe, expect, it } from 'vitest'
import type { FusionCatalogQuirk } from './catalog'
import {
  collectSiblingNames,
  hasDuplicateFusionName,
  isSiblingNameTaken,
  mergeForbiddenFusionTitles,
  MAX_PRIOR_VARIANTS,
  MAX_PRIOR_VARIANTS_IN_PROMPT,
  MAX_SIBLING_NAMES_IN_PROMPT,
  pickSiblingVariantsForPrompt,
  pickPriorVariantsForPrompt,
  scorePriorVariantSimilarity,
} from './prior-variants'
import type { FusionPriorVariantMatch } from './prior-variants'

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

const target: FusionPriorVariantMatch = {
  tier: 'A' as const,
  type: 'Emitter' as const,
  range: 'Medium' as const,
  facets: ['Control'],
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

describe('collectSiblingNames', () => {
  it('returns unique sorted names up to the prompt limit', () => {
    const rows = Array.from({ length: 12 }, (_, index) => ({
      key: `k${index}`,
      seed: `seed-${index}`,
      en: { name: `Variant ${index}`, description: `Description ${index}.` },
      type: 'Emitter',
      range: 'Medium',
      facets: ['Control'],
      tier: 'A',
      roll: target.roll,
    }))

    expect(collectSiblingNames(rows, { limit: MAX_SIBLING_NAMES_IN_PROMPT })).toHaveLength(
      MAX_SIBLING_NAMES_IN_PROMPT,
    )
  })
})

describe('mergeForbiddenFusionTitles', () => {
  it('puts parent names first and dedupes siblings', () => {
    expect(
      mergeForbiddenFusionTitles('Permeation', 'Hardening', [
        'Hardening',
        'Sibling',
      ]),
    ).toEqual(['Permeation', 'Hardening', 'Sibling'])
  })
})

describe('isSiblingNameTaken', () => {
  it('treats whitespace and case-only name changes as duplicates', () => {
    expect(isSiblingNameTaken('  bubble   nap ', ['Bubble Nap'])).toBe(true)
  })
})

describe('pickSiblingVariantsForPrompt', () => {
  it('returns at most MAX_PRIOR_VARIANTS_IN_PROMPT entries', () => {
    const rows = Array.from({ length: 12 }, (_, index) => ({
      key: `k${index}`,
      seed: `seed-${index}`,
      en: { name: `Variant ${index}`, description: `Description ${index}.` },
      type: 'Emitter',
      range: 'Medium',
      facets: ['Control'],
      tier: 'A',
      roll: target.roll,
    }))

    const picked = pickSiblingVariantsForPrompt(rows, quirkA, quirkB)
    expect(picked.length).toBeLessThanOrEqual(MAX_PRIOR_VARIANTS_IN_PROMPT)
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

  it('retains stored strategy metadata for sibling coordination', () => {
    const picked = pickSiblingVariantsForPrompt(
      [
        {
          key: 'k1',
          seed: 's1',
          en: { name: 'Used', description: 'A used sibling.' },
          type: 'Emitter',
          range: 'Medium',
          facets: ['Control'],
          tier: 'A',
          roll: target.roll,
        },
      ],
      quirkA,
      quirkB,
    )

    expect(picked[0]?.roll?.strategyKey).toBe('synergy')
  })
})

describe('hasDuplicateFusionName', () => {
  it('treats whitespace and case-only name changes as duplicates', () => {
    expect(
      hasDuplicateFusionName('  bubble   nap ', [
        { name: 'Bubble Nap', description: 'Existing sibling.' },
      ]),
    ).toBe(true)
  })
})
