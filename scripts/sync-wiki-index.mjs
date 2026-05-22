import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const research = join(root, 'research')

const EXCLUDED_TITLES = new Set([
  'Quirk',
  'Quirkless',
  'Quirk Singularity',
  'Quirk Bestowal',
  'Forced Quirk Activation',
  'Trigger',
])

function loadMembers(filename) {
  const raw = JSON.parse(readFileSync(join(research, filename), 'utf8'))
  return raw.query?.categorymembers?.map((m) => m.title) ?? []
}

const SLUG_ALIASES = {
  erasure: 'eraser',
}

function slugFromTitle(title) {
  const slug = title
    .replace(/\s*\(Quirk\)\s*/gi, '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return SLUG_ALIASES[slug] ?? slug
}

const main = loadMembers('wiki-quirks-raw.json')
const vigilantes = new Set(loadMembers('wiki-vigilantes-quirks.json'))
const teamUp = new Set(loadMembers('wiki-teamup-quirks.json'))

const idSource = readFileSync(join(root, 'src/data/quirk-ids.ts'), 'utf8')
const inApp = new Set(
  [...idSource.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1]),
)

const bySlug = new Map()

for (const title of main) {
  if (EXCLUDED_TITLES.has(title)) continue
  const slug = slugFromTitle(title)
  if (!slug) continue

  let origin = 'BNHA'
  if (vigilantes.has(title) || teamUp.has(title)) {
    origin = 'BNHA_SPINOFF'
  }

  bySlug.set(slug, {
    wikiTitle: title,
    slug,
    origin,
    status: inApp.has(slug) ? 'in_app' : 'pending',
    tier: null,
  })
}

const entries = [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug))

const index = {
  generatedAt: new Date().toISOString(),
  sources: [
    'Category:Quirks',
    'Category:Vigilantes_Original_Quirks',
    'Category:Team-Up_Missions_Original_Quirks',
  ],
  excludedTitles: [...EXCLUDED_TITLES],
  counts: {
    total: entries.length,
    inApp: entries.filter((e) => e.status === 'in_app').length,
    pending: entries.filter((e) => e.status === 'pending').length,
    spinoff: entries.filter((e) => e.origin === 'BNHA_SPINOFF').length,
  },
  entries,
}

writeFileSync(join(research, 'wiki-index.json'), JSON.stringify(index, null, 2) + '\n')

console.log(
  `wiki-index: ${index.counts.total} quirks (${index.counts.inApp} in app, ${index.counts.pending} pending, ${index.counts.spinoff} spin-off)`,
)
