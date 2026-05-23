import { randomBytes } from 'node:crypto'
import { fusionCacheKey, sortedParentPair } from '@/lib/fusion/keys'
import type { FusionCacheEntry } from '@/types/fusion'
import type { QuirkId } from '@/types/quirk-id'
import { getQuirkById } from './catalog'
import { FUSION_TRANSLATION_LOCALES } from './constants'
import { buildFusionEntry, mergeFusionPayload } from './validate'
import { buildFusionPrompt } from './prompts/english'
import { deriveFusionOutputFromSeed } from './prompts/output'
import { buildFusionTranslationPrompt } from './prompts/translation'
import {
  generateEnglishFusionWithLlm,
  translateFusionToLocaleWithLlm,
} from './llm'
import {
  findFusionByKey,
  listFusionNamesForParentPair,
  upsertFusionEntry,
} from './repository'

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
  /** True when an existing Supabase row was returned after generation failed. */
  cached: boolean
  /** True when the LLM produced a new entry (also persisted). */
  generated: boolean
}

/**
 * Generates a fusion entry via LLM (English quirk, then locale adaptations) and persists to Supabase.
 * Uses an existing row only as a fallback when generation fails (unless `force`).
 */
export async function generateFusionEntry({
  idA,
  idB,
  seed,
  force = false,
}: GenerateFusionOptions): Promise<GenerateFusionResult> {
  const quirkA = await getQuirkById(idA)
  const quirkB = await getQuirkById(idB)
  if (!quirkA) throw new Error(`Quirk não encontrada: ${idA}`)
  if (!quirkB) throw new Error(`Quirk não encontrada: ${idB}`)
  if (idA === idB) throw new Error('Escolha duas quirks diferentes.')

  const parents = sortedParentPair(idA as QuirkId, idB as QuirkId)
  const key = fusionCacheKey(parents[0], parents[1], seed)
  const outputRoll = deriveFusionOutputFromSeed(seed)
  const priorVariantNames = await listFusionNamesForParentPair(
    parents[0],
    parents[1],
    { excludeKey: key },
  )

  try {
    const english = await generateEnglishFusionWithLlm(
      buildFusionPrompt(quirkA, quirkB, seed, outputRoll, priorVariantNames),
    )

    const translations = await Promise.all(
      FUSION_TRANSLATION_LOCALES.map(async (locale) =>
        translateFusionToLocaleWithLlm(
          buildFusionTranslationPrompt(english, locale),
          locale,
        ),
      ),
    )

    const payload = mergeFusionPayload(english, ...translations)
    const entry = buildFusionEntry(key, parents, seed, { ...payload, ...outputRoll })
    await upsertFusionEntry(entry)
    return { entry, cached: false, generated: true }
  } catch (err) {
    if (force) throw err
    const existing = await findFusionByKey(key)
    if (existing) {
      return { entry: existing, cached: true, generated: false }
    }
    throw err
  }
}
