/**
 * Gera uma fusão (híbrido) via LLM e grava no Supabase.
 *
 * Uso:
 *   pnpm fusion:generate -- --a acid --b explosion
 *   pnpm fusion:generate -- --a acid --b explosion --seed k7x2m9
 *   pnpm fusion:generate -- --random
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadEnv } from '../src/server/env/load'
import { defaultFusionSeed, generateFusionEntry } from '../src/server/fusion/generate'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function parseArgs(argv: string[]) {
  const args = { a: null as string | null, b: null as string | null, seed: null as string | null, random: false, force: false }
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (token === '--random') args.random = true
    else if (token === '--force') args.force = true
    else if (token === '--a') args.a = argv[++i] ?? null
    else if (token === '--b') args.b = argv[++i] ?? null
    else if (token === '--seed') args.seed = argv[++i] ?? null
  }
  return args
}

async function main() {
  loadEnv(root)
  const args = parseArgs(process.argv.slice(2))
  let idA = args.a
  let idB = args.b

  if (args.random) {
    const { QUIRK_IDS } = await import('../tools/catalog/output/quirk-ids')
    if (QUIRK_IDS.length < 2) throw new Error('Catálogo insuficiente.')
    const i = Math.floor(Math.random() * QUIRK_IDS.length)
    let j = Math.floor(Math.random() * QUIRK_IDS.length)
    while (j === i) j = Math.floor(Math.random() * QUIRK_IDS.length)
    idA = QUIRK_IDS[i]
    idB = QUIRK_IDS[j]
  }

  if (!idA || !idB) {
    console.error('Uso: pnpm fusion:generate -- --a <id> --b <id> [--seed <seed>] [--force]')
    console.error('     pnpm fusion:generate -- --random [--seed <seed>]')
    process.exit(1)
  }

  const seed = args.seed ?? defaultFusionSeed()
  const { entry, cached, generated } = await generateFusionEntry({
    root,
    idA,
    idB,
    seed,
    force: args.force,
  })

  if (cached) {
    console.log(`Fallback do Supabase (geração falhou): ${entry.key}`)
    console.log(`  EN: ${entry.en.name}`)
    return
  }

  if (generated) {
    console.log(`Salvo no Supabase: ${entry.key}`)
    console.log(`  EN: ${entry.en.name}`)
    console.log(`  PT: ${entry['pt-BR'].name}`)
    console.log(`  ES: ${entry.es.name}`)
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
