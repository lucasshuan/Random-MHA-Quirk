import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FusionCacheEntry } from '@/types/fusion'

const mockGenerateEnglishFusionWithLlm = vi.fn()
const mockTranslateFusionToLocaleWithLlm = vi.fn()
const mockDecideFusionTierWithLlm = vi.fn()
const mockFindFusionByKey = vi.fn()
const mockFindFusionByParentPairAndEnglishName = vi.fn()
const mockListFusionPriorVariantsForParentPair = vi.fn()
const mockLoadFusionSiblingContext = vi.fn()
const mockUpsertFusionEntry = vi.fn()
const mockGetQuirkById = vi.fn()

vi.mock('./llm', () => ({
  generateEnglishFusionWithLlm: (...args: unknown[]) =>
    mockGenerateEnglishFusionWithLlm(...args),
  translateFusionToLocaleWithLlm: (...args: unknown[]) =>
    mockTranslateFusionToLocaleWithLlm(...args),
  decideFusionTierWithLlm: (...args: unknown[]) =>
    mockDecideFusionTierWithLlm(...args),
}))

vi.mock('./repository', () => ({
  findFusionByKey: (...args: unknown[]) => mockFindFusionByKey(...args),
  findFusionByParentPairAndEnglishName: (...args: unknown[]) =>
    mockFindFusionByParentPairAndEnglishName(...args),
  listFusionPriorVariantsForParentPair: (...args: unknown[]) =>
    mockListFusionPriorVariantsForParentPair(...args),
  loadFusionSiblingContext: (...args: unknown[]) =>
    mockLoadFusionSiblingContext(...args),
  upsertFusionEntry: (...args: unknown[]) => mockUpsertFusionEntry(...args),
}))

vi.mock('./catalog', () => ({
  getQuirkById: (...args: unknown[]) => mockGetQuirkById(...args),
}))

import { generateFusionEntry } from './generate'

const quirkA = {
  id: 'acid',
  name: 'Acid',
  description: 'Acid test',
  type: 'Emitter',
  range: 'Short',
  facets: ['Elemental'],
  origin: 'BNHA' as const,
  tier: 'B' as const,
}

const quirkB = {
  id: 'explosion',
  name: 'Explosion',
  description: 'Explosion test',
  type: 'Emitter',
  range: 'Long',
  facets: ['Emission'],
  origin: 'BNHA' as const,
  tier: 'A' as const,
}

const cachedEntry: FusionCacheEntry = {
  key: 'acid+explosion:seed1',
  parents: ['acid', 'explosion'],
  seed: 'seed1',
  en: { name: 'Cached', description: 'Cached EN' },
  'pt-BR': { name: 'Cacheado', description: 'Cached PT' },
  es: { name: 'Cacheado ES', description: 'Cached ES' },
  type: 'Emitter',
  range: 'Medium',
  facets: ['Emission'],
  origin: 'ORIGINAL',
  tier: 'A',
  roll: {
    strategyKey: 'synergy',
    nameRegister: 'blunt',
    utilityNiche: 'plain wording',
    antiMashupRuleKey: 'modifier-cost',
  },
}

const englishPayload = {
  en: { name: 'Fresh', description: 'Fresh EN description for test.' },
  type: 'Emitter' as const,
  range: 'Medium' as const,
  facets: ['Emission'] as const,
  origin: 'ORIGINAL' as const,
}

describe('generateFusionEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetQuirkById.mockImplementation((id: string) =>
      id === 'acid' ? quirkA : id === 'explosion' ? quirkB : null,
    )
    mockFindFusionByKey.mockResolvedValue(cachedEntry)
    mockFindFusionByParentPairAndEnglishName.mockResolvedValue(null)
    mockLoadFusionSiblingContext.mockResolvedValue({
      priorVariants: [
        { name: 'Cached', description: 'Cached EN description for prior variant.' },
      ],
      takenTitles: ['Cached'],
    })
    mockUpsertFusionEntry.mockResolvedValue(undefined)
    mockGenerateEnglishFusionWithLlm.mockResolvedValue(englishPayload)
    mockDecideFusionTierWithLlm.mockResolvedValue('A')
    mockTranslateFusionToLocaleWithLlm.mockImplementation(
      (_english: unknown, locale: 'pt-BR' | 'es') => {
        if (locale === 'pt-BR') {
          return Promise.resolve({
            'pt-BR': {
              name: 'Novo',
              description: 'Descrição PT adaptada para teste de fusão.',
            },
          })
        }

        return Promise.resolve({
          es: {
            name: 'Nuevo',
            description: 'Descripción ES adaptada para prueba de fusión.',
          },
        })
      },
    )
  })

  it('generates via English + locale LLM calls even when Supabase already has the key', async () => {
    const result = await generateFusionEntry({
      idA: 'acid',
      idB: 'explosion',
      seed: 'seed1',
    })

    expect(mockLoadFusionSiblingContext).toHaveBeenCalledOnce()
    expect(mockGenerateEnglishFusionWithLlm).toHaveBeenCalledOnce()
    const fusionInput = mockGenerateEnglishFusionWithLlm.mock.calls[0][0]
    expect(fusionInput.priorVariants[0].name).toBe('Cached')
    expect(fusionInput.takenTitles).toEqual(['Cached'])
    expect(fusionInput.meta.seed).toBe('seed1')
    expect(mockTranslateFusionToLocaleWithLlm).toHaveBeenCalledTimes(2)
    expect(mockTranslateFusionToLocaleWithLlm.mock.calls[0][0]).toEqual(englishPayload)
    expect(mockFindFusionByKey).not.toHaveBeenCalled()
    expect(mockUpsertFusionEntry).toHaveBeenCalledOnce()
    expect(result.generated).toBe(true)
    expect(result.cached).toBe(false)
    expect(result.entry.en.name).toBe('Fresh')
    expect(result.entry['pt-BR'].name).toBe('Novo')
    expect(result.entry.es.name).toBe('Nuevo')
  })

  it('falls back to Supabase when generation fails', async () => {
    mockGenerateEnglishFusionWithLlm.mockRejectedValue(new Error('LLM down'))

    const result = await generateFusionEntry({
      idA: 'acid',
      idB: 'explosion',
      seed: 'seed1',
    })

    expect(mockFindFusionByKey).toHaveBeenCalledOnce()
    expect(mockTranslateFusionToLocaleWithLlm).not.toHaveBeenCalled()
    expect(result.cached).toBe(true)
    expect(result.generated).toBe(false)
    expect(result.entry).toEqual(cachedEntry)
  })

  it('returns the existing sibling when the English title already exists', async () => {
    const siblingEntry: FusionCacheEntry = {
      ...cachedEntry,
      key: 'acid+explosion:older-seed',
      seed: 'older-seed',
    }

    mockGenerateEnglishFusionWithLlm.mockResolvedValue({
      ...englishPayload,
      en: { name: 'Cached', description: 'Duplicate name result.' },
    })
    mockFindFusionByParentPairAndEnglishName.mockResolvedValue(siblingEntry)

    const result = await generateFusionEntry({
      idA: 'acid',
      idB: 'explosion',
      seed: 'seed1',
    })

    expect(mockGenerateEnglishFusionWithLlm).toHaveBeenCalledOnce()
    expect(mockFindFusionByParentPairAndEnglishName).toHaveBeenCalledWith(
      'acid',
      'explosion',
      'Cached',
    )
    expect(mockTranslateFusionToLocaleWithLlm).not.toHaveBeenCalled()
    expect(mockUpsertFusionEntry).not.toHaveBeenCalled()
    expect(result.cached).toBe(true)
    expect(result.generated).toBe(false)
    expect(result.entry).toEqual(siblingEntry)
  })

  it('does not fall back when force is true', async () => {
    mockTranslateFusionToLocaleWithLlm.mockRejectedValue(
      new Error('Translation down'),
    )

    await expect(
      generateFusionEntry({
        idA: 'acid',
        idB: 'explosion',
        seed: 'seed1',
        force: true,
      }),
    ).rejects.toThrow('Translation down')

    expect(mockFindFusionByKey).not.toHaveBeenCalled()
  })
})
