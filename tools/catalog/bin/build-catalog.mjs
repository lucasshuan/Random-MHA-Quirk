/**
 * Gera tools/catalog/output (quirks.base, quirk-ids, copy/{en,pt-BR}) a partir do índice wiki + taxonomia Fandom.
 * Sincroniza src/types/quirk-id.ts (re-export) para o tipo QuirkId no app.
 * Preserva cópia manual curada em tools/catalog/data/sources/manual-copy.json
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { isUsableCopy } from '../lib/copy-quality.mjs'
import {
  CATALOG_COPY,
  CATALOG_OUTPUT,
  GENERATED,
  SOURCES,
  SRC,
  WIKI,
} from '../lib/paths.mjs'
const API_EN = 'https://myheroacademia.fandom.com/api.php'
const API_PT = 'https://myheroacademia.fandom.com/pt-br/api.php'

const EXCLUDED_TITLES = new Set([
  'Quirk',
  'Quirkless',
  'Quirk Singularity',
  'Quirk Bestowal',
  'Forced Quirk Activation',
  'Trigger',
])

/** Slug canônico no app quando difere da wiki */
const SLUG_ALIASES = {
  erasure: 'eraser',
}

const FACET_KEYWORDS = [
  ['Elemental', /\b(flame|fire|ice|frost|acid|electric|lightning|laser|plasma|wind|whirlwind|sand|water|wave|eruption|hellflame|blueflame|ignition)\b/i],
  ['Psychic', /\b(brainwash|mind|telepath|foresight|danger sense|polygraph|confession|love|chart|iq)\b/i],
  ['Enhancement', /\b(muscle|power|strength|brawn|hardening|gigant|hypertrophy|physical enhancement|fierce gains)\b/i],
  ['Anthropomorphic', /\b(frog|rabbit|bird|wing|tail|engine|tape|horn|bat|cat|dog|bear|monkey|lion|eagle|whale|gecko|lizard|octopus|mantis|centipede|serpent|orcinus|chameleon)\b/i],
  ['Control', /\b(control|master|curdle|zero gravity|magnet|blood|fiber|leaf|metal|cement|compress|brainwash|rewind|decay|overhaul)\b/i],
  ['Mobility', /\b(flight|float|warp|teleport|engine|jet|leap|glide|slide|permeation|blackwhip|tape|wings)\b/i],
  ['Sensory', /\b(search|scan|infrared|ear|eye|voyance|danger sense|mind reading|pointer)\b/i],
  ['Emission', /\b(blast|beam|cannon|laser|bullet|wave|eruption|decay|gas|poison|smoke|air cannon|navel)\b/i],
  ['Biological', /\b(frog|rabbit|manifest|rewind|acid sweat|pop off|sugar|blood|mushroom|plant|virus)\b/i],
]

const FACET_OVERRIDES = new Map([
  ['blade-tooth', ['Biological']],
  ['foldabody', ['Biological']],
  ['rivet', ['Biological']],
  ['rivet-stab', ['Biological']],
  ['shield', ['Biological', 'Construct']],
  ['shock-absorption', ['Enhancement']],
  ['spike', ['Biological']],
  ['super-regeneration', ['Biological']],
])

// A construct is an object, structure, or entity the Quirk builds or forms.
// Curated IDs prevent lasers and body weapons from being mislabeled by name alone.
const CONSTRUCT_FACET_IDS = new Set([
  'air-wall',
  'alchemy',
  'arbor',
  'barrier',
  'bubble',
  'clones',
  'cloud',
  'comic',
  'control-glass',
  'creation',
  'dark-shadow',
  'double',
  'earth-flow',
  'king-slam',
  'metal-manipulation',
  'monster-summon',
  'mummification',
  'overhaul',
  'solid-air',
  'soul',
  'wooden-swords-from-his-hands',
])

function loadMembers(filename) {
  const raw = JSON.parse(readFileSync(join(WIKI, filename), 'utf8'))
  return raw.query?.categorymembers?.map((m) => m.title) ?? []
}

function slugFromTitle(title) {
  const base = title
    .replace(/\s*\(Quirk\)\s*/gi, '')
    .trim()
  const slug = base
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return SLUG_ALIASES[slug] ?? slug
}

function displayName(title) {
  return title
    .replace(/\s*\(Quirk\)\s*/gi, '')
    .replace(/\s*\([^)]+\)\s*/g, ' ')
    .trim()
}

function loadTierOverrides() {
  const raw = JSON.parse(readFileSync(join(SOURCES, 'tier-overrides.json'), 'utf8'))
  const map = new Map()
  for (const tier of ['Ω', 'S', 'A', 'B', 'C', 'D']) {
    for (const slug of raw[tier] ?? []) {
      map.set(slug, tier)
    }
  }
  return map
}

function inferType(title, emitter, transformation, mutant) {
  const votes = []
  if (emitter.has(title)) votes.push('Emitter')
  if (transformation.has(title)) votes.push('Transformation')
  if (mutant.has(title)) votes.push('Mutant')
  if (votes.length === 1) return votes[0]
  if (votes.length > 1) {
    const t = title.toLowerCase()
    if (mutant.has(title) && /engine|tape|frog|rabbit|wing|tail|horn|jet/.test(t)) return 'Mutant'
    if (transformation.has(title) && /hardening|permeation|manifest|muscle|steel|transform/.test(t)) return 'Transformation'
    return votes[0]
  }
  const t = title.toLowerCase()
  if (/body|arm|leg|muscle|scale|steel|harden|transform|manifest|permeat|fold|giant|horn|tail|wing|fist|claw|tooth|hair|skin|bulk|morph/.test(t)) return 'Transformation'
  if (/frog|rabbit|engine|tape|bird|bat|cat|dog|monkey|turtle|gecko|lizard|octopus|eagle|whale|centipede|chameleon|mutant|dupli/.test(t)) return 'Mutant'
  return 'Emitter'
}

function inferRange(title, type) {
  const t = title.toLowerCase()
  if (type === 'Transformation') return 'Self'
  if (/self|body|muscle|hardening|permeation|manifest|gigant|steel|transform|fold|engine|tail|wing|frog|rabbit|tape|jet/.test(t) && type === 'Mutant') return 'Self'
  if (/contact|touch|rewind|decay|zero gravity|brainwash|acid sweat|pop off|bloodcurdle|fat absorption/.test(t)) return 'Contact'
  if (/area|gas|poison|smoke|weather|magnet|electrif|spark|area/.test(t)) return 'Area'
  if (/laser|beam|cannon|gate|warp|teleport|search|pointer|landmine|radio|wave|flight|float|fiber|leaf|metal|navel|air cannon|hellflame|explosion|half-cold/.test(t)) return 'Long'
  if (/short|blink|leap|jet|burst|impact/.test(t)) return 'Short'
  if (type === 'Emitter') return 'Medium'
  if (type === 'Mutant') return 'Medium'
  return 'Self'
}

function inferFacets(title, type, slug) {
  const override = FACET_OVERRIDES.get(slug)
  if (override) return [...override]

  const facets = new Set()
  const t = title.toLowerCase()

  for (const [facet, pattern] of FACET_KEYWORDS) {
    if (pattern.test(t)) facets.add(facet)
  }

  if (type === 'Emitter' && !facets.has('Emission') && !facets.has('Control') && !facets.has('Elemental')) {
    facets.add('Emission')
  }
  if (type === 'Transformation' && facets.size === 0) facets.add('Enhancement')
  if (type === 'Mutant' && !facets.has('Anthropomorphic')) facets.add('Anthropomorphic')
  if (CONSTRUCT_FACET_IDS.has(slug)) facets.add('Construct')

  return [...facets].slice(0, 4)
}

function inferTier(slug, tierMap) {
  return tierMap.get(slug) ?? 'B'
}

function escapeTs(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function parseExistingCopy(path, exportKey) {
  if (!existsSync(path)) return {}
  const text = readFileSync(path, 'utf8')
  const entries = {}
  const re = /'([a-z0-9-]+)':\s*\{[^}]*name:\s*'([^']*)',[^}]*description:\s*'([^']*)'/gs
  let m
  while ((m = re.exec(text)) !== null) {
    entries[m[1]] = { name: m[2], description: m[3] }
  }
  return entries
}

async function fetchExtracts(titles, apiBase) {
  const map = new Map()
  const chunkSize = 40

  for (let i = 0; i < titles.length; i += chunkSize) {
    const chunk = titles.slice(i, i + chunkSize)
    const params = new URLSearchParams({
      action: 'query',
      format: 'json',
      prop: 'extracts',
      exintro: '1',
      explaintext: '1',
      exlimit: String(chunk.length),
      titles: chunk.join('|'),
    })

    const res = await fetch(`${apiBase}?${params}`)
    if (!res.ok) continue

    const data = await res.json()
    for (const page of Object.values(data.query?.pages ?? {})) {
      if (page.missing || !page.extract) continue
      const clean = page.extract
        .replace(/\s+/g, ' ')
        .replace(/\[\d+\]/g, '')
        .trim()
        .slice(0, 280)
      if (clean.length > 20) map.set(page.title, clean)
    }

    await new Promise((r) => setTimeout(r, 120))
  }

  return map
}

function buildIndex() {
  const main = loadMembers('wiki-quirks-raw.json')
  const vigilantes = new Set(loadMembers('wiki-vigilantes-quirks.json'))
  const teamUp = new Set(loadMembers('wiki-teamup-quirks.json'))
  const emitter = new Set(loadMembers('wiki-emitter-quirks.json'))
  const transformation = new Set(loadMembers('wiki-transformation-quirks.json'))
  const mutant = new Set(loadMembers('wiki-mutant-quirks.json'))

  const bySlug = new Map()

  for (const title of main) {
    if (EXCLUDED_TITLES.has(title)) continue
    const slug = slugFromTitle(title)
    if (!slug) continue

    let origin = 'BNHA'
    if (vigilantes.has(title)) origin = 'BNHA_VIGILANTES'
    else if (teamUp.has(title)) origin = 'BNHA_TEAM_UP'

    const type = inferType(title, emitter, transformation, mutant)
    const range = inferRange(title, type)
    const facets = inferFacets(title, type, slug)

    bySlug.set(slug, {
      id: slug,
      wikiTitle: title,
      displayName: displayName(title),
      origin,
      type,
      range,
      facets,
    })
  }

  // Quirk só no app (ex.: mind-reading) — preservar se existir
  const manualPath = join(SOURCES, 'manual-copy.json')
  if (existsSync(manualPath)) {
    const manual = JSON.parse(readFileSync(manualPath, 'utf8'))
    for (const id of Object.keys(manual.en ?? {})) {
      if (!bySlug.has(id)) {
        bySlug.set(id, {
          id,
          wikiTitle: manual.en[id].name,
          displayName: manual.en[id].name,
          origin: 'BNHA',
          type: 'Emitter',
          range: 'Contact',
          facets: ['Psychic', 'Sensory'],
        })
      }
    }
  }

  return [...bySlug.values()].sort((a, b) => a.id.localeCompare(b.id))
}

function ensureManualCopyBackup(enExisting, ptExisting) {
  const path = join(SOURCES, 'manual-copy.json')
  if (existsSync(path)) return JSON.parse(readFileSync(path, 'utf8'))

  const backup = { en: enExisting, 'pt-BR': ptExisting }
  writeFileSync(path, JSON.stringify(backup, null, 2) + '\n')
  console.log('Backed up existing copy → tools/catalog/data/sources/manual-copy.json')
  return backup
}

function writeQuirkIds(ids) {
  const lines = ids.map((id) => `  '${id}',`).join('\n')
  const content = `export const QUIRK_IDS = [\n${lines}\n] as const\n\nexport type QuirkId = (typeof QUIRK_IDS)[number]\n`
  writeFileSync(join(CATALOG_OUTPUT, 'quirk-ids.ts'), content)
  writeFileSync(join(SRC, 'data', 'quirk-ids.ts'), `/** Re-export for app runtime types */\nexport type { QuirkId } from '../../tools/catalog/output/quirk-ids'\nexport { QUIRK_IDS } from '../../tools/catalog/output/quirk-ids'\n`)
}

function writeQuirksBase(entries, tierMap) {
  const blocks = entries.map((e) => {
    const facets = e.facets.map((f) => `'${f}'`).join(', ')
    const tier = inferTier(e.id, tierMap)
    return `  {
    id: '${e.id}',
    origin: '${e.origin}',
    tier: '${tier}',
    type: '${e.type}',
    range: '${e.range}',
    facets: [${facets}],
  },`
  })

  const content = `import type { QuirkBase } from '../../../src/types/quirk'

export const quirksBase = [
${blocks.join('\n')}
] as const satisfies readonly QuirkBase[]
`
  writeFileSync(join(CATALOG_OUTPUT, 'quirks.base.ts'), content)
}

function writeCopyFile(locale, exportName, copy) {
  const blocks = Object.entries(copy)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, { name, description }]) => {
      const desc =
        description.includes('\n')
          ? `description:\n      '${escapeTs(description)}',`
          : `description: '${escapeTs(description)}',`
      return `  '${id}': {
    name: '${escapeTs(name)}',
    ${desc}
  },`
    })

  const importLine =
    "import type { QuirkCopy } from '../../../../src/types/quirk'\nimport type { QuirkId } from '../quirk-ids'\n\n"

  const content = `${importLine}export const ${exportName} = {\n${blocks.join('\n')}\n} as Record<QuirkId, QuirkCopy>\n`
  const filename = locale === 'en' ? 'en.ts' : 'pt-BR.ts'
  writeFileSync(join(CATALOG_COPY, filename), content)
}

async function main() {
  const tierMap = loadTierOverrides()
  const enExisting = parseExistingCopy(join(CATALOG_COPY, 'en.ts'))
  const ptExisting = parseExistingCopy(join(CATALOG_COPY, 'pt-BR.ts'))
  const manual = ensureManualCopyBackup(enExisting, ptExisting)

  const entries = buildIndex()
  console.log(`Catalog: ${entries.length} quirks`)

  const titles = entries.map((e) => e.wikiTitle)
  console.log('Fetching EN extracts from Fandom…')
  const enExtracts = await fetchExtracts(titles, API_EN)

  console.log('Fetching PT-BR extracts (when available)…')
  const ptExtracts = await fetchExtracts(titles, API_PT)

  const enCopy = {}
  const ptCopy = {}

  const genericFallback = (displayName) =>
    `Canonical quirk from the My Hero Academia universe (${displayName}).`

  for (const e of entries) {
    const manualEn = manual.en?.[e.id]
    const existingEn = enExisting[e.id]
    const manualPt = manual['pt-BR']?.[e.id]
    const existingPt = ptExisting[e.id]

    enCopy[e.id] = (isUsableCopy(manualEn) && manualEn) ||
      (isUsableCopy(existingEn) && existingEn) || {
        name: e.displayName,
        description:
          enExtracts.get(e.wikiTitle) ?? genericFallback(e.displayName),
      }

    const ptExtract = ptExtracts.get(e.wikiTitle)
    ptCopy[e.id] = (isUsableCopy(manualPt) && manualPt) ||
      (isUsableCopy(existingPt) && existingPt) || {
        name: e.displayName,
        description: ptExtract ?? enCopy[e.id].description,
      }
  }

  const ids = entries.map((e) => e.id)
  writeQuirkIds(ids)
  writeQuirksBase(entries, tierMap)
  writeCopyFile('en', 'enQuirkCopy', enCopy)
  writeCopyFile('pt-BR', 'ptBRQuirkCopy', ptCopy)

  writeFileSync(
    join(GENERATED, 'catalog-stats.json'),
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        total: entries.length,
        byOrigin: {
          BNHA: entries.filter((e) => e.origin === 'BNHA').length,
          BNHA_VIGILANTES: entries.filter((e) => e.origin === 'BNHA_VIGILANTES')
            .length,
          BNHA_TEAM_UP: entries.filter((e) => e.origin === 'BNHA_TEAM_UP').length,
        },
        byType: {
          Emitter: entries.filter((e) => e.type === 'Emitter').length,
          Transformation: entries.filter((e) => e.type === 'Transformation').length,
          Mutant: entries.filter((e) => e.type === 'Mutant').length,
        },
      },
      null,
      2,
    ) + '\n',
  )

  console.log(
    'Wrote tools/catalog/output (quirks.base, quirk-ids, copy/en, copy/pt-BR) and synced src/types/quirk-id.ts',
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
