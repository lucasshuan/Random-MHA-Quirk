import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { FusionCacheEntry } from '@/types/fusion'

const mockGenerateWithLlm = vi.fn()
const mockFindFusionByKey = vi.fn()
const mockUpsertFusionEntry = vi.fn()
const mockGetQuirkById = vi.fn()
const mockLoadQuirksCatalog = vi.fn()

vi.mock('./llm', () => ({
  generateWithLlm: (...args: unknown[]) => mockGenerateWithLlm(...args),
}))

vi.mock('./repository', () => ({
  findFusionByKey: (...args: unknown[]) => mockFindFusionByKey(...args),
  upsertFusionEntry: (...args: unknown[]) => mockUpsertFusionEntry(...args),
}))

vi.mock('./catalog', () => ({
  loadQuirksCatalog: () => mockLoadQuirksCatalog(),
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
}

const quirkB = {
  id: 'explosion',
  name: 'Explosion',
  description: 'Explosion test',
  type: 'Emitter',
  range: 'Long',
  facets: ['Emission'],
}

const cachedEntry: FusionCacheEntry = {
  key: 'acid+explosion:seed1',
  parents: ['acid', 'explosion'],
  seed: 'seed1',
  en: { name: 'Cached', description: 'Cached EN' },
  'pt-BR': { name: 'Cacheado', description: 'Cached PT' },
  type: 'Emitter',
  range: 'Medium',
  facets: ['Emission'],
  origin: 'ORIGINAL',
}

const generatedPayload = {
  en: { name: 'Fresh', description: 'Fresh EN' },
  'pt-BR': { name: 'Novo', description: 'Fresh PT' },
  type: 'Emitter' as const,
  range: 'Medium' as const,
  facets: ['Emission'] as const,
  origin: 'ORIGINAL' as const,
}

describe('generateFusionEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockLoadQuirksCatalog.mockReturnValue([quirkA, quirkB])
    mockGetQuirkById.mockImplementation((_catalog: unknown, id: string) =>
      id === 'acid' ? quirkA : id === 'explosion' ? quirkB : null,
    )
    mockFindFusionByKey.mockResolvedValue(cachedEntry)
    mockUpsertFusionEntry.mockResolvedValue(undefined)
    mockGenerateWithLlm.mockResolvedValue(generatedPayload)
  })

  it('generates via LLM even when Supabase already has the key', async () => {
    const result = await generateFusionEntry({
      root: process.cwd(),
      idA: 'acid',
      idB: 'explosion',
      seed: 'seed1',
    })

    expect(mockGenerateWithLlm).toHaveBeenCalledOnce()
    expect(mockFindFusionByKey).not.toHaveBeenCalled()
    expect(mockUpsertFusionEntry).toHaveBeenCalledOnce()
    expect(result.generated).toBe(true)
    expect(result.cached).toBe(false)
    expect(result.entry.en.name).toBe('Fresh')
  })

  it('falls back to Supabase when generation fails', async () => {
    mockGenerateWithLlm.mockRejectedValue(new Error('LLM down'))

    const result = await generateFusionEntry({
      root: process.cwd(),
      idA: 'acid',
      idB: 'explosion',
      seed: 'seed1',
    })

    expect(mockFindFusionByKey).toHaveBeenCalledOnce()
    expect(result.cached).toBe(true)
    expect(result.generated).toBe(false)
    expect(result.entry).toEqual(cachedEntry)
  })

  it('does not fall back when force is true', async () => {
    mockGenerateWithLlm.mockRejectedValue(new Error('LLM down'))

    await expect(
      generateFusionEntry({
        root: process.cwd(),
        idA: 'acid',
        idB: 'explosion',
        seed: 'seed1',
        force: true,
      }),
    ).rejects.toThrow('LLM down')

    expect(mockFindFusionByKey).not.toHaveBeenCalled()
  })
})
