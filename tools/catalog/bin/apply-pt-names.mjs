/**
 * Aplica data/sources/name-overrides-pt.json em manual-copy e pt-BR.ts
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { CATALOG_COPY, SOURCES } from '../lib/paths.mjs'

const overrides = JSON.parse(
  readFileSync(join(SOURCES, 'name-overrides-pt.json'), 'utf8'),
)

const manualPath = join(SOURCES, 'manual-copy.json')
const manual = JSON.parse(readFileSync(manualPath, 'utf8'))
manual['pt-BR'] ??= {}

for (const [id, name] of Object.entries(overrides)) {
  if (!manual['pt-BR'][id]) manual['pt-BR'][id] = {}
  manual['pt-BR'][id].name = name
  if (manual.en?.[id] && !manual['pt-BR'][id].description) {
    manual['pt-BR'][id].description = manual.en[id].description
  }
}

writeFileSync(manualPath, `${JSON.stringify(manual, null, 2)}\n`)

const ptPath = join(CATALOG_COPY, 'pt-BR.ts')
let pt = readFileSync(ptPath, 'utf8')

for (const [id, name] of Object.entries(overrides)) {
  const escaped = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
  const re = new RegExp(
    `('${id}':\\s*\\{[^}]*name: )'(?:\\\\'|[^']*)'`,
    's',
  )
  if (!re.test(pt)) {
    console.warn(`  não encontrado: ${id}`)
    continue
  }
  pt = pt.replace(re, `$1'${escaped}'`)
}

writeFileSync(ptPath, pt)
console.log(`Atualizados ${Object.keys(overrides).length} nomes em PT-BR.`)
