/**
 * English-only fusion benchmark (strategy + output roll + prior variants).
 * Usage: pnpm exec tsx scripts/fusion/benchmark.ts
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fusionCacheKey, sortedParentPair } from '@/lib/fusion/keys'
import { loadEnv } from '@/server/env/load'
import { getQuirkById } from '@/server/fusion/catalog'
import { generateEnglishFusionWithLlm } from '@/server/fusion/llm'
import { buildFusionPrompt, deriveFusionRollContext } from '@/server/fusion/prompts/english'
import { listFusionPriorVariantsForParentPair } from '@/server/fusion/repository'
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

    for (const seed of SEEDS) {
      const parents = sortedParentPair(idA as never, idB as never)
      const key = fusionCacheKey(parents[0], parents[1], seed)
      const rollContext = deriveFusionRollContext(seed, quirkA, quirkB)
      const priorVariants = await listFusionPriorVariantsForParentPair(
        parents[0],
        parents[1],
        {
          excludeKey: key,
          match: {
            tier: rollContext.tier,
            type: rollContext.outputRoll.type,
            range: rollContext.outputRoll.range,
            facets: rollContext.outputRoll.facets,
            roll: rollContext.roll,
          },
        },
      )

      console.log(`Generating ${parents.join('+')} seed=${seed}...`)
      const english = await generateEnglishFusionWithLlm(
        buildFusionPrompt(quirkA, quirkB, seed, priorVariants, rollContext),
      )

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

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
