/**
 * Gera uma fusão (híbrido) via LLM e grava em src/data/fusion-cache.json.
 *
 * Uso:
 *   pnpm fusion:generate -- --a acid --b explosion
 *   pnpm fusion:generate -- --a acid --b explosion --seed k7x2m9
 *   pnpm fusion:generate -- --random
 */
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defaultFusionSeed, generateFusionEntry } from './lib/fusion-generate-core.mjs'
import { loadQuirksCatalog } from './lib/load-quirks.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'src')

function parseArgs(argv) {
  const args = { a: null, b: null, seed: null, random: false, force: false }
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (token === '--random') args.random = true
    else if (token === '--force') args.force = true
    else if (token === '--a') args.a = argv[++i]
    else if (token === '--b') args.b = argv[++i]
    else if (token === '--seed') args.seed = argv[++i]
  }
  return args
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const catalog = loadQuirksCatalog(src)

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

  console.log(`Salvo: src/data/fusion-cache.json`)
  console.log(`  key: ${entry.key}`)
  console.log(`  EN: ${entry.en.name}`)
  console.log(`  PT: ${entry['pt-BR'].name}`)
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
