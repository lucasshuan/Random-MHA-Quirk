/**
 * Lista nomes PT suspeitos (calque de "Control X" → "X de Controle", etc.)
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { CATALOG_COPY } from '../lib/paths.mjs'

const enPath = join(CATALOG_COPY, 'en.ts')
const ptPath = join(CATALOG_COPY, 'pt-BR.ts')

function parseCopy(path) {
  const text = readFileSync(path, 'utf8')
  const map = new Map()
  for (const m of text.matchAll(/'([a-z0-9-]+)':\s*\{\s*name:\s*'((?:\\'|[^'])*)'/g)) {
    map.set(m[1], m[2].replace(/\\'/g, "'"))
  }
  return map
}

const en = parseCopy(enPath)
const pt = parseCopy(ptPath)
const suspects = []

for (const [id, enName] of en) {
  const ptName = pt.get(id)
  if (!ptName) continue

  const controlMatch = /^Control (.+)$/i.exec(enName)
  if (controlMatch) {
    const noun = controlMatch[1]
    if (ptName.toLowerCase() === `${noun.toLowerCase()} de controle`.replace(/\s+/g, ' ')) {
      suspects.push({ id, enName, ptName, fix: `Controle de ${noun}` })
    }
    if (ptName.toLowerCase().includes('de controle') && !ptName.toLowerCase().startsWith('controle')) {
      suspects.push({ id, enName, ptName, fix: `Controle de ${noun}` })
    }
  }

  if (id === 'earphone-jack' && /conector de fone/i.test(ptName)) {
    suspects.push({ id, enName, ptName, fix: 'Plug de Ouvido' })
  }
}

console.log(JSON.stringify(suspects, null, 2))
