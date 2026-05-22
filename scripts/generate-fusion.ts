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
import { loadEnv } from '../src/lib/server/env'
import { defaultFusionSeed, generateFusionEntry } from '../src/lib/server/fusion/generate'
import { loadQuirksCatalog } from '../src/lib/server/fusion/catalog'

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
  const catalog = loadQuirksCatalog(join(root, 'src'))

  let idA = args.a
  let idB = args.b

  if (args.random) {
    if (catalog.length < 2) throw new Error('Catálogo insuficiente.')
    const i = Math.floor(Math.random() * catalog.length)
    let j = Math.floor(Math.random() * catalog.length)
    while (j === i) j = Math.floor(Math.random() * catalog.length)
    idA = catalog[i].id
    idB = catalog[j].id
  }

  if (!idA || !idB) {
    console.error('Uso: pnpm fusion:generate -- --a <id> --b <id> [--seed <seed>] [--force]')
    console.error('     pnpm fusion:generate -- --random [--seed <seed>]')
    process.exit(1)
  }

  const seed = args.seed ?? defaultFusionSeed()
  const { entry, cached } = await generateFusionEntry({
    root,
    idA,
    idB,
    seed,
    force: args.force,
  })

  if (cached && !args.force) {
    console.log(`Já existe no cache: ${entry.key}`)
    console.log(`  EN: ${entry.en.name}`)
    console.log('Use --force para regenerar.')
    return
  }

  console.log(`Salvo no Supabase: ${entry.key}`)
  console.log(`  EN: ${entry.en.name}`)
  console.log(`  PT: ${entry['pt-BR'].name}`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
