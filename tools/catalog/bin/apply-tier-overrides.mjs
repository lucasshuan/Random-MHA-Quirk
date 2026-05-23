/**
 * Apply tier-overrides.json to quirks.base.ts without full wiki rebuild.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { CATALOG_OUTPUT, SOURCES } from '../lib/paths.mjs'

const overrides = JSON.parse(
  readFileSync(join(SOURCES, 'tier-overrides.json'), 'utf8'),
)
const tierMap = new Map()
for (const tier of ['Ω', 'S', 'A', 'B', 'C']) {
  for (const id of overrides[tier] ?? []) {
    tierMap.set(id, tier)
  }
}

const basePath = join(CATALOG_OUTPUT, 'quirks.base.ts')
let text = readFileSync(basePath, 'utf8')
let patched = 0

text = text.replace(
  /(\{\s*\n\s*id:\s*'([^']+)',\s*\n\s*origin:\s*'[^']+',\s*\n\s*)tier:\s*'([^']+)'/g,
  (block, pre, id, current) => {
    const next = tierMap.get(id)
    if (!next || next === current) return block
    patched++
    return `${pre}tier: '${next}'`
  },
)

writeFileSync(basePath, text)
console.log(`Patched ${patched} tier entries in quirks.base.ts`)

for (const id of [
  'eraser',
  'permeation',
  'warp-gate',
  'rewind',
  'overclock',
  'zombie-virus',
  'tail',
  'hardening',
  'barrier',
  'erasure-spot',
  'warping',
  'life-force',
  'all-for-one',
  'decay',
]) {
  const m = text.match(
    new RegExp(`id: '${id}',[\\s\\S]*?tier: '([^']+)'`),
  )
  console.log(`  ${id}: ${m?.[1] ?? '?'}`)
}
