import { describe, expect, it } from 'vitest'
import type { QuirkType } from '@/types/quirk'
import { deriveFusionOutputFromSeed } from './output'

const TYPE_FACET_POOLS = {
  Emitter: [
    'Elemental',
    'Psychic',
    'Control',
    'Mobility',
    'Sensory',
    'Construct',
    'Emission',
    'Stockpile',
  ],
  Transformation: [
    'Elemental',
    'Enhancement',
    'Anthropomorphic',
    'Control',
    'Mobility',
    'Sensory',
    'Construct',
    'Biological',
    'Stockpile',
  ],
  Mutant: [
    'Enhancement',
    'Anthropomorphic',
    'Mobility',
    'Sensory',
    'Construct',
    'Biological',
    'Stockpile',
  ],
} as const

function countTypes(parentTypes: [QuirkType, QuirkType]): Record<QuirkType, number> {
  const counts: Record<QuirkType, number> = {
    Emitter: 0,
    Transformation: 0,
    Mutant: 0,
  }

  for (let i = 0; i < 1_000; i++) {
    const roll = deriveFusionOutputFromSeed(
      `type-inheritance-${parentTypes.join('-')}-${i}`,
      'parent-a',
      'parent-b',
      [],
      { types: parentTypes },
    )
    counts[roll.type]++
  }

  return counts
}

describe('deriveFusionOutputFromSeed', () => {
  it('is deterministic for the same seed and parent pair', () => {
    const a = deriveFusionOutputFromSeed('seed-abc', 'acid', 'air-cannon', [
      'Elemental',
      'Emission',
    ])
    const b = deriveFusionOutputFromSeed('seed-abc', 'acid', 'air-cannon', [
      'Elemental',
      'Emission',
    ])
    expect(b).toEqual(a)
  })

  it('differs across seeds for the same parent pair', () => {
    const a = deriveFusionOutputFromSeed('seed-1', 'acid', 'air-cannon')
    const b = deriveFusionOutputFromSeed('seed-2', 'acid', 'air-cannon')
    const same =
      a.type === b.type &&
      a.range === b.range &&
      a.facets.join() === b.facets.join()
    expect(same).toBe(false)
  })

  it('differs for the same seed on different parent pairs', () => {
    const a = deriveFusionOutputFromSeed('shared-seed', 'acid', 'air-cannon')
    const b = deriveFusionOutputFromSeed('shared-seed', 'beast', 'barrier')
    const same =
      a.type === b.type &&
      a.range === b.range &&
      a.facets.join() === b.facets.join()
    expect(same).toBe(false)
  })

  it('picks 1–3 facets with three as the rarest', () => {
    let oneFacetCount = 0
    let threeFacetCount = 0
    for (let i = 0; i < 200; i++) {
      const roll = deriveFusionOutputFromSeed(`facet-seed-${i}`, 'acid', 'explosion')
      expect(roll.facets.length).toBeGreaterThanOrEqual(1)
      expect(roll.facets.length).toBeLessThanOrEqual(3)
      if (roll.facets.length === 1) oneFacetCount++
      if (roll.facets.length === 3) threeFacetCount++
    }
    expect(oneFacetCount).toBeGreaterThan(100)
    expect(threeFacetCount).toBeGreaterThan(0)
    expect(threeFacetCount).toBeLessThan(60)
  })

  it('biases facet picks toward parent facet hints when provided', () => {
    const parentFacets = ['Elemental', 'Emission', 'Control']
    const hits = Array.from({ length: 30 }, (_, i) =>
      deriveFusionOutputFromSeed(`facet-bias-${i}`, 'acid', 'air-cannon', parentFacets),
    ).filter((roll) => roll.facets.some((facet) => parentFacets.includes(facet)))

    expect(hits.length).toBeGreaterThan(14)
  })

  it('biases type and range toward parent mechanic hints', () => {
    const rolls = Array.from({ length: 60 }, (_, i) =>
      deriveFusionOutputFromSeed(
        `mechanic-bias-${i}`,
        'acid',
        'beast',
        ['Elemental', 'Enhancement'],
        { types: ['Emitter', 'Transformation'], ranges: ['Medium', 'Self'] },
      ),
    )

    const typeHits = rolls.filter((roll) =>
      ['Emitter', 'Transformation'].includes(roll.type),
    )
    const rangeHits = rolls.filter((roll) =>
      ['Self', 'Short', 'Medium'].includes(roll.range),
    )

    expect(typeHits.length).toBeGreaterThan(40)
    expect(rangeHits.length).toBeGreaterThan(40)
  })

  it('reinforces same-type inheritance while keeping the dominant hierarchy', () => {
    const emitterEmitter = countTypes(['Emitter', 'Emitter'])
    const transformationTransformation = countTypes([
      'Transformation',
      'Transformation',
    ])
    const mutantMutant = countTypes(['Mutant', 'Mutant'])

    expect(emitterEmitter.Emitter).toBeGreaterThan(emitterEmitter.Transformation)
    expect(transformationTransformation.Transformation).toBeGreaterThan(
      transformationTransformation.Mutant,
    )
    expect(mutantMutant.Mutant).toBeGreaterThan(mutantMutant.Transformation)
  })

  it('makes Emitter dominant and Mutant recessive in mixed inheritance', () => {
    const emitterTransformation = countTypes(['Emitter', 'Transformation'])
    const emitterMutant = countTypes(['Emitter', 'Mutant'])
    const transformationMutant = countTypes(['Transformation', 'Mutant'])

    expect(emitterTransformation.Emitter).toBeGreaterThan(
      emitterTransformation.Transformation,
    )
    expect(emitterMutant.Emitter).toBeGreaterThan(emitterMutant.Transformation)
    expect(transformationMutant.Transformation).toBeGreaterThan(
      transformationMutant.Mutant,
    )
    expect(emitterMutant.Mutant).toBeLessThan(emitterMutant.Transformation)
    expect(transformationMutant.Mutant).toBeGreaterThan(
      transformationMutant.Emitter,
    )
  })

  it('retains rare off-type outcomes for every parent-type pairing', () => {
    const pairs: [QuirkType, QuirkType][] = [
      ['Emitter', 'Emitter'],
      ['Emitter', 'Transformation'],
      ['Emitter', 'Mutant'],
      ['Transformation', 'Transformation'],
      ['Transformation', 'Mutant'],
      ['Mutant', 'Mutant'],
    ]

    for (const pair of pairs) {
      const counts = countTypes(pair)
      expect(counts.Emitter).toBeGreaterThan(0)
      expect(counts.Transformation).toBeGreaterThan(0)
      expect(counts.Mutant).toBeGreaterThan(0)
    }
  })

  it('keeps wildcard facets compatible with the rolled type', () => {
    const rolls = Array.from({ length: 40 }, (_, i) =>
      deriveFusionOutputFromSeed(`compatible-${i}`),
    )

    for (const roll of rolls) {
      if (roll.type === 'Emitter') {
        expect(roll.facets).not.toContain('Anthropomorphic')
        expect(roll.facets).not.toContain('Biological')
      }
      if (roll.type === 'Mutant') {
        expect(roll.facets).not.toContain('Emission')
        expect(roll.facets).not.toContain('Psychic')
      }
    }
  })

  it('keeps parent-hint anchors compatible with the rolled type', () => {
    const rolls = Array.from({ length: 40 }, (_, i) =>
      deriveFusionOutputFromSeed(
        `incompatible-hints-${i}`,
        'acid',
        'air-cannon',
        ['Anthropomorphic', 'Biological', 'Emission'],
        { types: ['Emitter'], ranges: ['Short'] },
      ),
    )

    for (const roll of rolls) {
      const allowed = TYPE_FACET_POOLS[roll.type]
      for (const facet of roll.facets) {
        expect(allowed).toContain(facet)
      }
    }
  })

  it('does not add unsupported source-bound facets when compatible parent facets exist', () => {
    const parentFacets = ['Mobility', 'Emission']
    const rolls = Array.from({ length: 40 }, (_, i) =>
      deriveFusionOutputFromSeed(
        `source-bound-${i}`,
        'air-walk',
        'tail',
        parentFacets,
        { types: ['Emitter'], ranges: ['Medium'] },
      ),
    )

    for (const roll of rolls) {
      if (roll.type === 'Emitter') {
        expect(roll.facets).not.toContain('Sensory')
        expect(roll.facets).not.toContain('Psychic')
        expect(roll.facets).not.toContain('Elemental')
        expect(roll.facets).not.toContain('Construct')
      }
    }
  })

  it('does not invent source-bound facets when the rolled type cannot carry parent facets', () => {
    const rolls = Array.from({ length: 80 }, (_, i) =>
      deriveFusionOutputFromSeed(
        `incompatible-source-bound-${i}`,
        'tail',
        'shield',
        ['Biological'],
        { types: ['Emitter'], ranges: ['Medium'] },
      ),
    ).filter((roll) => roll.type === 'Emitter')

    expect(rolls.length).toBeGreaterThan(0)
    for (const roll of rolls) {
      expect(roll.facets).not.toContain('Elemental')
      expect(roll.facets).not.toContain('Psychic')
      expect(roll.facets).not.toContain('Enhancement')
      expect(roll.facets).not.toContain('Anthropomorphic')
      expect(roll.facets).not.toContain('Sensory')
      expect(roll.facets).not.toContain('Construct')
      expect(roll.facets).not.toContain('Biological')
    }
  })
})
