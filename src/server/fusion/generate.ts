import { randomBytes, randomUUID } from 'node:crypto'
import { fusionCacheKey, fusionPairKey, sortedParentPair } from '@/lib/fusion/keys'
import type { FusionCacheEntry } from '@/types/fusion'
import type { QuirkId } from '@/types/quirk-id'
import { buildFusionAgentInput } from './agent-input'
import { getQuirkById } from './catalog'
import { buildFusionEntry, mergeFusionPayload } from './validate'
import { deriveFusionRollContext, type FusionRollContext } from './prompts/roll-context'
import {
  generateEnglishFusionWithLlm,
  translateFusionToAllLocalesWithLlm,
} from './llm'
import {
  findFusionByKey,
  findFusionByParentPairAndEnglishName,
  loadFusionSiblingContext,
  releaseFusionGenerationClaim,
  renewFusionGenerationClaim,
  tryClaimFusionGeneration,
  upsertFusionEntry,
  upsertFusionEntryAlias,
} from './repository'
import { runWithFusionTrace } from './agents/tracing'

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
  /** True when an existing stored result was returned instead of a new result. */
  cached: boolean
  /** True when the LLM produced a new entry (also persisted). */
  generated: boolean
}

const inFlightFusionGenerations = new Map<string, Promise<GenerateFusionResult>>()
const FUSION_CLAIM_RETRY_MS = 250
const FUSION_CLAIM_RENEW_MS = 30_000

function storedResult(entry: FusionCacheEntry): GenerateFusionResult {
  return { entry, cached: true, generated: false }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function matchesRolledConstraints(
  entry: FusionCacheEntry,
  rollContext: FusionRollContext,
): boolean {
  const output = rollContext.outputRoll
  return (
    entry.tier === rollContext.tier &&
    entry.type === output.type &&
    entry.range === output.range &&
    entry.facets.length === output.facets.length &&
    entry.facets.every((facet, index) => facet === output.facets[index])
  )
}

/**
 * Generates a fusion entry via LLM (English quirk, then locale adaptations) and persists to Supabase.
 * Normal requests are idempotent by key; `force` is reserved for internal explicit regeneration.
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

  const generateNewEntry = async (): Promise<GenerateFusionResult> => {
    const siblingContext = await loadFusionSiblingContext(parents[0], parents[1], {
      excludeKey: key,
    })
    const { priorVariants, takenTitles } = siblingContext
    const rollContext = deriveFusionRollContext(seed, quirkA, quirkB, priorVariants)
    const traceContext = {
      pairKey: fusionPairKey(parents[0], parents[1]),
      seed,
      parentA: parents[0],
      parentB: parents[1],
    }

    try {
      return await runWithFusionTrace(traceContext, async () => {
        const fusionInput = buildFusionAgentInput(
          quirkA,
          quirkB,
          seed,
          priorVariants,
          rollContext,
          0,
          takenTitles,
        )
        const english = await generateEnglishFusionWithLlm(fusionInput)

        const existingByName = await findFusionByParentPairAndEnglishName(
          parents[0],
          parents[1],
          english.en.name,
        )
        if (existingByName && matchesRolledConstraints(existingByName, rollContext)) {
          await upsertFusionEntryAlias(key, existingByName.key)
          return storedResult(existingByName)
        }

        const translations = await translateFusionToAllLocalesWithLlm(
          english,
          { nameRegister: fusionInput.roll.nameRegister },
          traceContext,
        )

        const payload = mergeFusionPayload(english, ...translations)
        const entry = buildFusionEntry(
          key,
          parents,
          seed,
          { ...payload, ...rollContext.outputRoll },
          { tier: rollContext.tier, roll: rollContext.roll },
        )
        await upsertFusionEntry(entry)
        return { entry, cached: false, generated: true }
      })
    } catch (err) {
      if (force) throw err
      const existing = await findFusionByKey(key)
      if (existing) {
        return storedResult(existing)
      }
      throw err
    }
  }

  if (force) {
    return generateNewEntry()
  }

  const existingRequest = inFlightFusionGenerations.get(key)
  if (existingRequest) {
    return existingRequest
  }

  const pendingRequest = (async (): Promise<GenerateFusionResult> => {
    while (true) {
      const existing = await findFusionByKey(key)
      if (existing) {
        return storedResult(existing)
      }

      const claimId = randomUUID()
      const ownsClaim = await tryClaimFusionGeneration(key, claimId)
      if (!ownsClaim) {
        await delay(FUSION_CLAIM_RETRY_MS)
        continue
      }

      const renewal = setInterval(() => {
        void renewFusionGenerationClaim(key, claimId).catch(() => undefined)
      }, FUSION_CLAIM_RENEW_MS)

      try {
        const resultStoredWhileClaiming = await findFusionByKey(key)
        if (resultStoredWhileClaiming) {
          return storedResult(resultStoredWhileClaiming)
        }

        return await generateNewEntry()
      } finally {
        clearInterval(renewal)
        await releaseFusionGenerationClaim(key, claimId).catch(() => undefined)
      }
    }
  })()

  inFlightFusionGenerations.set(key, pendingRequest)

  try {
    return await pendingRequest
  } finally {
    if (inFlightFusionGenerations.get(key) === pendingRequest) {
      inFlightFusionGenerations.delete(key)
    }
  }
}
