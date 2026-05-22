import { randomBytes } from 'node:crypto'
import { join } from 'node:path'
import { fusionCacheKey, sortedParentPair } from '@/lib/fusionKey'
import type { FusionCacheEntry } from '@/types/fusion'
import type { QuirkId } from '@/data/quirk-ids'
import { getQuirkById, loadQuirksCatalog } from './catalog'
import { buildFusionEntry } from './validate'
import { buildFusionPrompt } from './prompt'
import { generateWithLlm } from './llm'
import { findFusionByKey, upsertFusionEntry } from './repository'

export function defaultFusionSeed(): string {
  return randomBytes(4).toString('hex')
}

export interface GenerateFusionOptions {
  root?: string
  idA: string
  idB: string
  seed: string
  force?: boolean
}

export interface GenerateFusionResult {
  entry: FusionCacheEntry
  cached: boolean
}

/**
 * Generates (or reads from cache) a fusion entry. Persists to Supabase.
 */
export async function generateFusionEntry({
  root = process.cwd(),
  idA,
  idB,
  seed,
  force = false,
}: GenerateFusionOptions): Promise<GenerateFusionResult> {
  const src = join(root, 'src')
  const catalog = loadQuirksCatalog(src)

  const quirkA = getQuirkById(catalog, idA)
  const quirkB = getQuirkById(catalog, idB)
  if (!quirkA) throw new Error(`Quirk não encontrada: ${idA}`)
  if (!quirkB) throw new Error(`Quirk não encontrada: ${idB}`)
  if (idA === idB) throw new Error('Escolha duas quirks diferentes.')

  const parents = sortedParentPair(idA as QuirkId, idB as QuirkId)
  const key = fusionCacheKey(parents[0], parents[1], seed)

  const existing = await findFusionByKey(key)
  if (existing && !force) {
    return { entry: existing, cached: true }
  }

  const payload = await generateWithLlm(buildFusionPrompt(quirkA, quirkB, seed))
  const entry = buildFusionEntry(key, parents, seed, payload)

  await upsertFusionEntry(entry)
  return { entry, cached: false }
}
