import { readFileSync, writeFileSync } from 'node:fs'

function parseNames(content) {
  const map = new Map()
  const re = /'([a-z0-9-]+)':\s*\{\s*name: '((?:\\'|[^'])*)',/g
  let m
  while ((m = re.exec(content)) !== null) {
    map.set(m[1], m[2].replace(/\\'/g, "'"))
  }
  return map
}

const tokens = (s) =>
  s
    .toLowerCase()
    .replace(/[.'"]/g, '')
    .split(/[\s-]+/)
    .filter((t) => t.length > 2)

const en = parseNames(readFileSync('src/i18n/quirks/en.ts', 'utf8'))
const pt = parseNames(readFileSync('src/i18n/quirks/pt-BR.ts', 'utf8'))

const skip = new Set([
  'jet',
  'neo',
  'mega',
  'ultra',
  'super',
  'mini',
  '2d',
  'ify',
  'art',
  'spray',
  'for',
  'one',
  'all',
  'off',
  'pop',
  'jack',
  'bang',
  'flash',
  'hot',
  'cold',
  'half',
])

const hits = []

for (const [id, ptName] of pt) {
  const enName = en.get(id)
  if (!enName) continue
  if (ptName === enName) {
    hits.push({ id, pt: ptName, en: enName, reason: 'identical' })
    continue
  }
  const enT = tokens(enName)
  const ptT = tokens(ptName)
  const borrowed = enT.filter((t) => ptT.includes(t) && !skip.has(t))
  if (borrowed.length > 0) {
    hits.push({ id, pt: ptName, en: enName, borrowed })
  }
}

hits.sort((a, b) => a.pt.localeCompare(b.pt))
writeFileSync(
  'research/untranslated-pt-names.json',
  JSON.stringify(hits, null, 2) + '\n',
)
console.log('hits:', hits.length)
for (const x of hits) {
  console.log(
    `${x.id}: "${x.pt}" | en: "${x.en}"${x.borrowed ? ` [${x.borrowed.join(', ')}]` : ''}`,
  )
}
