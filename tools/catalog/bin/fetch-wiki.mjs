/**
 * Atualiza JSONs em tools/catalog/data/wiki/ a partir da API MediaWiki do Fandom (EN).
 * Fontes: Category:Quirks + Emitter/Transformation/Mutant + spin-offs.
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { WIKI } from '../lib/paths.mjs'
const API = 'https://myheroacademia.fandom.com/api.php'

const CATEGORIES = [
  ['wiki-quirks-raw.json', 'Category:Quirks'],
  ['wiki-emitter-quirks.json', 'Category:Emitter_Quirks'],
  ['wiki-transformation-quirks.json', 'Category:Transformation_Quirks'],
  ['wiki-mutant-quirks.json', 'Category:Mutant_Quirks'],
  ['wiki-vigilantes-quirks.json', 'Category:Vigilantes_Original_Quirks'],
  ['wiki-teamup-quirks.json', 'Category:Team-Up_Missions_Original_Quirks'],
]

async function fetchCategory(cmtitle) {
  const members = []
  let cmcontinue

  do {
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      list: 'categorymembers',
      cmtitle,
      cmlimit: '500',
    })
    if (cmcontinue) params.set('cmcontinue', cmcontinue)

    const res = await fetch(`${API}?${params}`)
    if (!res.ok) throw new Error(`${cmtitle}: HTTP ${res.status}`)

    const data = await res.json()
    const batch = data.query?.categorymembers ?? []
    members.push(...batch.filter((m) => m.ns === 0))
    cmcontinue = data.continue?.cmcontinue
  } while (cmcontinue)

  return { batchcomplete: '', query: { categorymembers: members } }
}

for (const [filename, category] of CATEGORIES) {
  console.log(`Fetching ${category}…`)
  const payload = await fetchCategory(category)
  writeFileSync(join(WIKI, filename), JSON.stringify(payload) + '\n')
  console.log(`  → ${filename} (${payload.query.categorymembers.length} pages)`)
}

console.log('Done.')
