import { readFileSync } from 'node:fs'

function parseNames(content) {
  const map = new Map()
  const re = /'([a-z0-9-]+)':\s*\{\s*name: '((?:\\'|[^'])*)',/g
  let m
  while ((m = re.exec(content)) !== null) {
    map.set(m[1], m[2].replace(/\\'/g, "'"))
  }
  return map
}

const en = parseNames(readFileSync('src/i18n/quirks/en.ts', 'utf8'))
const pt = parseNames(readFileSync('src/i18n/quirks/pt-BR.ts', 'utf8'))

const same = []
for (const [id, enName] of en) {
  const ptName = pt.get(id)
  if (ptName && ptName === enName) same.push({ id, name: enName })
}

import { writeFileSync } from 'node:fs'
writeFileSync('research/same-names.json', `${JSON.stringify(same, null, 2)}\n`)
console.log('total:', same.length)
