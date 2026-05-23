/**
 * English-only fusion benchmark (strategy + output roll + prior variants).
 * Usage: pnpm exec tsx scripts/fusion/benchmark.ts
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fusionCacheKey, sortedParentPair } from '@/lib/fusion/keys'
import { loadEnv } from '@/server/env/load'
import { getQuirkById } from '@/server/fusion/catalog'
import { buildFusionAgentInput } from '@/server/fusion/agent-input'
import { flushFusionTraces } from '@/server/fusion/agents/tracing'
import { generateEnglishFusionWithLlm } from '@/server/fusion/llm'
import { deriveFusionRollContext } from '@/server/fusion/prompts/roll-context'
import { hasDuplicateFusionName } from '@/server/fusion/prior-variants'
import { listFusionPriorVariantsForParentPair } from '@/server/fusion/repository'
import type { FusionPriorVariant } from '@/types/fusion'
import { getProjectRoot } from '../_shared/root'

const PAIRS: [string, string][] = [
  ['creation', 'blackwhip'],
  ['permeation', 'hardening'],
  ['sugar-rush', 'explosion'],
  ['frog', 'laser'],
  ['brainwashing', 'tape'],
]

const SEEDS = ['ev4-s1', 'ev4-s2', 'ev4-s3']

const root = getProjectRoot()
loadEnv(root)

async function main() {
  const results: unknown[] = []

  for (const [idA, idB] of PAIRS) {
    const quirkA = await getQuirkById(idA)
    const quirkB = await getQuirkById(idB)
    if (!quirkA || !quirkB) {
      throw new Error(`Missing quirk: ${idA} or ${idB}`)
    }

    const generatedVariants: FusionPriorVariant[] = []

    for (const seed of SEEDS) {
      const parents = sortedParentPair(idA as never, idB as never)
      const key = fusionCacheKey(parents[0], parents[1], seed)
      const storedVariants = await listFusionPriorVariantsForParentPair(
        parents[0],
        parents[1],
        {
          excludeKey: key,
        },
      )
      const priorVariants = [...storedVariants, ...generatedVariants]
      const rollContext = deriveFusionRollContext(seed, quirkA, quirkB, priorVariants)

      console.log(`Generating ${parents.join('+')} seed=${seed}...`)
      const promptVariants = [...priorVariants]
      let english: Awaited<ReturnType<typeof generateEnglishFusionWithLlm>> | null =
        null
      for (let attempt = 0; attempt < 3; attempt++) {
        const fusionInput = buildFusionAgentInput(
          quirkA,
          quirkB,
          seed,
          promptVariants,
          rollContext,
          attempt,
        )
        const candidate = await generateEnglishFusionWithLlm(fusionInput)
        if (!hasDuplicateFusionName(candidate.en.name, promptVariants)) {
          english = candidate
          break
        }
        promptVariants.push({ ...candidate.en, roll: rollContext.roll })
      }
      if (!english) {
        throw new Error(`Repeated fusion name for ${parents.join('+')} seed=${seed}`)
      }
      generatedVariants.push({ ...english.en, roll: rollContext.roll })

      results.push({
        pair: `${parents[0]}+${parents[1]}`,
        parentNames: [quirkA.name, quirkB.name],
        seed,
        promptRoll: {
          tier: rollContext.tier,
          roll: rollContext.roll,
          outputRoll: rollContext.outputRoll,
          priorVariants,
        },
        english,
      })
    }
  }

  const outPath = join(root, 'scripts/fusion/benchmark-ev4.json')
  writeFileSync(outPath, JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2))
  console.log(`Wrote ${results.length} results to ${outPath}`)
}

main()
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err)
    process.exit(1)
  })
  .finally(async () => {
    await flushFusionTraces()
  })
