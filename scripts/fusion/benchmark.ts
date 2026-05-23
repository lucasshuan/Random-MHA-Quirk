/**
 * English-only fusion benchmark (strategy + output roll + prior names).
 * Usage: pnpm exec tsx scripts/fusion/benchmark.ts
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fusionCacheKey, sortedParentPair } from '@/lib/fusion/keys'
import { loadEnv } from '@/server/env/load'
import { getQuirkById } from '@/server/fusion/catalog'
import { generateEnglishFusionWithLlm } from '@/server/fusion/llm'
import { buildFusionPrompt } from '@/server/fusion/prompts/english'
import { selectFusionNameRegister } from '@/server/fusion/prompts/naming'
import { deriveFusionOutputFromSeed } from '@/server/fusion/prompts/output'
import { selectFusionStrategy } from '@/server/fusion/prompts/strategy'
import { selectFusionUtilityNudge } from '@/server/fusion/prompts/utility'
import { listFusionNamesForParentPair } from '@/server/fusion/repository'
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
      const parentFacets = [...new Set([...quirkA.facets, ...quirkB.facets])]
      const outputRoll = deriveFusionOutputFromSeed(
        seed,
        parents[0],
        parents[1],
        parentFacets,
        {
          types: [quirkA.type, quirkB.type],
          ranges: [quirkA.range, quirkB.range],
        },
      )
      const strategy = selectFusionStrategy(seed, quirkA, quirkB)
      const nameRegister = selectFusionNameRegister(seed, parents[0], parents[1])
      const utilityNudge = selectFusionUtilityNudge(seed, parents[0], parents[1])
      const priorVariantNames = await listFusionNamesForParentPair(
        parents[0],
        parents[1],
        { excludeKey: key },
      )

      console.log(`Generating ${parents.join('+')} seed=${seed}...`)
      const english = await generateEnglishFusionWithLlm(
        buildFusionPrompt(quirkA, quirkB, seed, outputRoll, priorVariantNames),
      )

      results.push({
        pair: `${parents[0]}+${parents[1]}`,
        parentNames: [quirkA.name, quirkB.name],
        seed,
        promptRoll: {
          nameRegister: nameRegister.key,
          utilityNiche: utilityNudge.niche,
          strategy: strategy.key,
          outputRoll,
          priorVariantNames,
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
