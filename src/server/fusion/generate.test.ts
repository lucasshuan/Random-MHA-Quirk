import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FusionCacheEntry } from '@/types/fusion'

const mockGenerateEnglishFusionWithLlm = vi.fn()
const mockTranslateFusionToAllLocalesWithLlm = vi.fn()
const mockFindFusionByKey = vi.fn()
const mockFindFusionByParentPairAndEnglishName = vi.fn()
const mockListFusionPriorVariantsForParentPair = vi.fn()
const mockLoadFusionSiblingContext = vi.fn()
const mockTryClaimFusionGeneration = vi.fn()
const mockRenewFusionGenerationClaim = vi.fn()
const mockReleaseFusionGenerationClaim = vi.fn()
const mockUpsertFusionEntry = vi.fn()
const mockUpsertFusionEntryAlias = vi.fn()
const mockGetQuirkById = vi.fn()

vi.mock('./llm', () => ({
  generateEnglishFusionWithLlm: (...args: unknown[]) =>
    mockGenerateEnglishFusionWithLlm(...args),
  translateFusionToAllLocalesWithLlm: (...args: unknown[]) =>
    mockTranslateFusionToAllLocalesWithLlm(...args),
}))

vi.mock('./repository', () => ({
  findFusionByKey: (...args: unknown[]) => mockFindFusionByKey(...args),
  findFusionByParentPairAndEnglishName: (...args: unknown[]) =>
    mockFindFusionByParentPairAndEnglishName(...args),
  listFusionPriorVariantsForParentPair: (...args: unknown[]) =>
    mockListFusionPriorVariantsForParentPair(...args),
  loadFusionSiblingContext: (...args: unknown[]) =>
    mockLoadFusionSiblingContext(...args),
  tryClaimFusionGeneration: (...args: unknown[]) =>
    mockTryClaimFusionGeneration(...args),
  renewFusionGenerationClaim: (...args: unknown[]) =>
    mockRenewFusionGenerationClaim(...args),
  releaseFusionGenerationClaim: (...args: unknown[]) =>
    mockReleaseFusionGenerationClaim(...args),
  upsertFusionEntry: (...args: unknown[]) => mockUpsertFusionEntry(...args),
  upsertFusionEntryAlias: (...args: unknown[]) =>
    mockUpsertFusionEntryAlias(...args),
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
    mockFindFusionByKey.mockResolvedValue(null)
    mockFindFusionByParentPairAndEnglishName.mockResolvedValue(null)
    mockLoadFusionSiblingContext.mockResolvedValue({
      priorVariants: [
        { name: 'Cached', description: 'Cached EN description for prior variant.' },
      ],
      takenTitles: ['Cached'],
    })
    mockTryClaimFusionGeneration.mockResolvedValue(true)
    mockRenewFusionGenerationClaim.mockResolvedValue(undefined)
    mockReleaseFusionGenerationClaim.mockResolvedValue(undefined)
    mockUpsertFusionEntry.mockResolvedValue(undefined)
    mockUpsertFusionEntryAlias.mockResolvedValue(undefined)
    mockGenerateEnglishFusionWithLlm.mockResolvedValue(englishPayload)
    mockTranslateFusionToAllLocalesWithLlm.mockResolvedValue([
      {
        'pt-BR': {
          name: 'Novo',
          description: 'Descrição PT adaptada para teste de fusão.',
        },
      },
      {
        es: {
          name: 'Nuevo',
          description: 'Descripción ES adaptada para prueba de fusión.',
        },
      },
    ])
  })

  it('returns an existing keyed entry without issuing LLM calls', async () => {
    mockFindFusionByKey.mockResolvedValue(cachedEntry)

    const result = await generateFusionEntry({
      idA: 'acid',
      idB: 'explosion',
      seed: 'seed1',
    })

    expect(mockFindFusionByKey).toHaveBeenCalledOnce()
    expect(mockTryClaimFusionGeneration).not.toHaveBeenCalled()
    expect(mockLoadFusionSiblingContext).not.toHaveBeenCalled()
    expect(mockGenerateEnglishFusionWithLlm).not.toHaveBeenCalled()
    expect(result).toEqual({
      entry: cachedEntry,
      cached: true,
      generated: false,
    })
  })

  it('generates and persists a fresh claimed key', async () => {
    const result = await generateFusionEntry({
      idA: 'acid',
      idB: 'explosion',
      seed: 'seed1',
    })

    expect(mockTryClaimFusionGeneration).toHaveBeenCalledOnce()
    expect(mockLoadFusionSiblingContext).toHaveBeenCalledOnce()
    expect(mockGenerateEnglishFusionWithLlm).toHaveBeenCalledOnce()
    const fusionInput = mockGenerateEnglishFusionWithLlm.mock.calls[0][0]
    expect(fusionInput.priorVariants[0].name).toBe('Cached')
    expect(fusionInput.takenTitles).toEqual(['Acid', 'Explosion', 'Cached'])
    expect(fusionInput.meta.seed).toBe('seed1')
    expect(mockTranslateFusionToAllLocalesWithLlm).toHaveBeenCalledOnce()
    expect(mockTranslateFusionToAllLocalesWithLlm.mock.calls[0][0]).toEqual(englishPayload)
    expect(mockTranslateFusionToAllLocalesWithLlm.mock.calls[0][1]).toEqual({
      nameRegister: fusionInput.roll.nameRegister,
      nameRegisterInstruction: fusionInput.roll.nameRegisterInstruction,
      nameExamples: fusionInput.roll.nameExamples,
    })
    expect(mockUpsertFusionEntry).toHaveBeenCalledOnce()
    expect(mockReleaseFusionGenerationClaim).toHaveBeenCalledOnce()
    expect(result.generated).toBe(true)
    expect(result.cached).toBe(false)
    expect(result.entry.en.name).toBe('Fresh')
    expect(result.entry['pt-BR'].name).toBe('Novo')
    expect(result.entry.es.name).toBe('Nuevo')
    expect(result.entry.tier).toBe(fusionInput.mechanics.tier)
  })

  it('falls back to Supabase when generation fails', async () => {
    mockFindFusionByKey
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(cachedEntry)
    mockGenerateEnglishFusionWithLlm.mockRejectedValue(new Error('LLM down'))

    const result = await generateFusionEntry({
      idA: 'acid',
      idB: 'explosion',
      seed: 'seed1',
    })

    expect(mockFindFusionByKey).toHaveBeenCalledTimes(3)
    expect(mockTranslateFusionToAllLocalesWithLlm).not.toHaveBeenCalled()
    expect(mockReleaseFusionGenerationClaim).toHaveBeenCalledOnce()
    expect(result.cached).toBe(true)
    expect(result.generated).toBe(false)
    expect(result.entry).toEqual(cachedEntry)
  })

  it('returns the existing sibling when the English title already exists', async () => {
    let siblingEntry!: FusionCacheEntry

    mockGenerateEnglishFusionWithLlm.mockResolvedValue({
      ...englishPayload,
      en: { name: 'Cached', description: 'Duplicate name result.' },
    })
    mockFindFusionByParentPairAndEnglishName.mockImplementation(async () => {
      const input = mockGenerateEnglishFusionWithLlm.mock.calls[0][0]
      siblingEntry = {
        ...cachedEntry,
        key: 'acid+explosion:older-seed',
        seed: 'older-seed',
        type: input.mechanics.type,
        range: input.mechanics.range,
        facets: input.mechanics.facets,
        tier: input.mechanics.tier,
      }
      return siblingEntry
    })

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
    expect(mockTranslateFusionToAllLocalesWithLlm).not.toHaveBeenCalled()
    expect(mockUpsertFusionEntry).not.toHaveBeenCalled()
    expect(mockUpsertFusionEntryAlias).toHaveBeenCalledWith(
      'acid+explosion:seed1',
      'acid+explosion:older-seed',
    )
    expect(result.cached).toBe(true)
    expect(result.generated).toBe(false)
    expect(result.entry).toEqual(siblingEntry)
  })

  it('does not alias a duplicate title whose stored rolled constraints differ', async () => {
    mockGenerateEnglishFusionWithLlm.mockResolvedValue({
      ...englishPayload,
      en: { name: 'Cached', description: 'Duplicate name result.' },
    })
    mockFindFusionByParentPairAndEnglishName.mockImplementation(async () => {
      const input = mockGenerateEnglishFusionWithLlm.mock.calls[0][0]
      return {
        ...cachedEntry,
        type: input.mechanics.type,
        range: input.mechanics.range,
        facets: input.mechanics.facets,
        tier: input.mechanics.tier === 'S' ? 'C' : 'S',
      }
    })

    const result = await generateFusionEntry({
      idA: 'acid',
      idB: 'explosion',
      seed: 'seed1',
    })
    const input = mockGenerateEnglishFusionWithLlm.mock.calls[0][0]

    expect(mockUpsertFusionEntryAlias).not.toHaveBeenCalled()
    expect(mockUpsertFusionEntry).toHaveBeenCalledOnce()
    expect(result.generated).toBe(true)
    expect(result.entry.tier).toBe(input.mechanics.tier)
  })

  it('shares an in-flight generation for concurrent same-key requests', async () => {
    let resolveEnglish!: (payload: typeof englishPayload) => void
    mockGenerateEnglishFusionWithLlm.mockImplementationOnce(
      () =>
        new Promise<typeof englishPayload>((resolve) => {
          resolveEnglish = resolve
        }),
    )

    const first = generateFusionEntry({
      idA: 'acid',
      idB: 'explosion',
      seed: 'shared-seed',
    })
    const second = generateFusionEntry({
      idA: 'acid',
      idB: 'explosion',
      seed: 'shared-seed',
    })

    await vi.waitFor(() => {
      expect(mockGenerateEnglishFusionWithLlm).toHaveBeenCalledOnce()
    })
    resolveEnglish(englishPayload)

    const [firstResult, secondResult] = await Promise.all([first, second])

    expect(mockTryClaimFusionGeneration).toHaveBeenCalledOnce()
    expect(mockGenerateEnglishFusionWithLlm).toHaveBeenCalledOnce()
    expect(mockTranslateFusionToAllLocalesWithLlm).toHaveBeenCalledOnce()
    expect(firstResult).toEqual(secondResult)
  })

  it('waits for a different claimant to store the same key', async () => {
    mockTryClaimFusionGeneration.mockResolvedValueOnce(false)
    mockFindFusionByKey
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(cachedEntry)

    const result = await generateFusionEntry({
      idA: 'acid',
      idB: 'explosion',
      seed: 'seed1',
    })

    expect(mockTryClaimFusionGeneration).toHaveBeenCalledOnce()
    expect(mockGenerateEnglishFusionWithLlm).not.toHaveBeenCalled()
    expect(result.entry).toEqual(cachedEntry)
  })

  it('does not fall back when force is true', async () => {
    mockTranslateFusionToAllLocalesWithLlm.mockRejectedValue(
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
    expect(mockTryClaimFusionGeneration).not.toHaveBeenCalled()
  })
})
