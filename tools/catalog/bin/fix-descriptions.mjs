/**
 * Corrige descrições genéricas buscando o wikitext real da Fandom.
 * Atualiza data/sources/manual-copy.json com as descrições EN melhoradas.
 * Após rodar: `node tools/catalog/bin/build-catalog.mjs`
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { GENERATED, SOURCES, SRC } from '../lib/paths.mjs'
const API = 'https://myheroacademia.fandom.com/api.php'

const GENERIC_MARKER = 'Canonical quirk from the My Hero Academia universe'
const BATCH_SIZE = 8
const DELAY_MS = 300

// ── Wikitext cleaner ────────────────────────────────────────────────────────

function cleanWikitext(raw) {
  return raw
    // Remove refs
    .replace(/\{\{Ref[^}]*\}\}/gi, '')
    .replace(/\{\{Ref\/[^}]*\}\}/gi, '')
    // Remove file/image links
    .replace(/\[\[File:[^\]]+\]\]/gi, '')
    .replace(/\[\[Image:[^\]]+\]\]/gi, '')
    // Nihongo template → first arg (display name or romaji)
    .replace(/\{\{Nihongo\|'''([^|']+)'''/gi, '$1')
    .replace(/\{\{Nihongo\|([^|}]+)(?:\|[^}]*)?\}\}/gi, '$1')
    // Ruby template → just the reading
    .replace(/\{\{Ruby\|([^|]+)\|[^}]+\}\}/gi, '$1')
    // Wikipedia template → just the term
    .replace(/\{\{Wikipedia\|([^|}]+)(?:\|[^}]*)?\}\}/gi, '$1')
    // Any remaining {{ }} templates
    .replace(/\{\{[^}]+\}\}/g, '')
    // [[link|display]] → display
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    // [[link]] → link (strip category prefix)
    .replace(/\[\[([^\]]+)\]\]/g, (_, inner) => {
      const clean = inner.replace(/^[^:]+:/, '')
      return clean
    })
    // Bold/italic
    .replace(/'''([^']+)'''/g, '$1')
    .replace(/''([^']+)''/g, '$1')
    // HTML tags
    .replace(/<[^>]+>/g, '')
    // Multiple spaces / newlines
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function extractDescription(wikitext) {
  // Try the ==Description== section first
  const descMatch = wikitext.match(/==\s*Description\s*==\s*([\s\S]*?)(?:===|==\s*\w|$)/)
  if (descMatch) {
    const raw = descMatch[1]
      .replace(/===[\s\S]*?===/g, '') // remove sub-sections
      .split('\n')
      .filter((line) => line.trim() && !line.startsWith('=') && !line.startsWith('|') && !line.startsWith('{') && !line.startsWith('['))
      .join(' ')

    const cleaned = cleanWikitext(raw)
    if (cleaned.length > 30) return truncate(cleaned, 220)
  }

  // Fallback: first real paragraph after the infobox
  const noInfobox = wikitext.replace(/^\{\{Quirk Infobox[\s\S]*?\}\}/i, '').trim()
  const lines = noInfobox.split('\n')
  for (const line of lines) {
    if (!line.trim() || line.startsWith('=') || line.startsWith('|') || line.startsWith('{') || line.startsWith('[')) continue
    const cleaned = cleanWikitext(line)
    if (cleaned.length > 30) return truncate(cleaned, 220)
  }

  return null
}

function truncate(text, max) {
  if (text.length <= max) return text
  // Cut at sentence boundary
  const trimmed = text.slice(0, max)
  const lastDot = Math.max(trimmed.lastIndexOf('. '), trimmed.lastIndexOf('! '))
  return lastDot > max * 0.5 ? trimmed.slice(0, lastDot + 1) : trimmed.slice(0, trimmed.lastIndexOf(' ')) + '…'
}

// ── Wiki index for title lookup ─────────────────────────────────────────────

function loadWikiTitles() {
  const index = JSON.parse(readFileSync(join(GENERATED, 'wiki-index.json'), 'utf8'))
  const map = new Map()
  for (const entry of index.entries) {
    map.set(entry.slug, entry.wikiTitle)
  }
  return map
}

function slugFromId(id) {
  return id // already a slug
}

// ── Fetch wikitext for one title ────────────────────────────────────────────

async function fetchWikitext(title) {
  const params = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'wikitext',
    format: 'json',
  })
  const res = await fetch(`${API}?${params}`)
  if (!res.ok) return null
  const data = await res.json()
  return data?.parse?.wikitext?.['*'] ?? null
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const enPath = join(SRC, 'i18n', 'messages', 'quirks', 'en.ts')
  const enContent = readFileSync(enPath, 'utf8')

  const genericRe = /'([a-z0-9-]+)':\s*\{[^}]*description: 'Canonical quirk from/g
  const genericIds = []
  let m
  while ((m = genericRe.exec(enContent)) !== null) {
    genericIds.push(m[1])
  }

  console.log(`Found ${genericIds.length} quirks with generic descriptions.`)

  const wikiTitles = loadWikiTitles()
  const manualPath = join(SOURCES, 'manual-copy.json')
  const manual = existsSync(manualPath)
    ? JSON.parse(readFileSync(manualPath, 'utf8'))
    : { en: {}, 'pt-BR': {} }

  let fixed = 0
  let failed = 0

  for (let i = 0; i < genericIds.length; i += BATCH_SIZE) {
    const batch = genericIds.slice(i, i + BATCH_SIZE)
    const results = await Promise.allSettled(
      batch.map(async (id) => {
        const title = wikiTitles.get(id) ?? id.replace(/-/g, ' ')
        const wikitext = await fetchWikitext(title)
        if (!wikitext) return { id, desc: null }
        const desc = extractDescription(wikitext)
        return { id, desc }
      }),
    )

    for (const result of results) {
      if (result.status === 'rejected') { failed++; continue }
      const { id, desc } = result.value
      if (desc) {
        if (!manual.en[id]) manual.en[id] = {}
        if (!manual.en[id].name) {
          const title = wikiTitles.get(id) ?? id
          manual.en[id].name = title.replace(/\s*\(Quirk\)\s*/gi, '').trim()
        }
        manual.en[id].description = desc
        fixed++
      } else {
        failed++
      }
    }

    const progress = Math.min(i + BATCH_SIZE, genericIds.length)
    process.stdout.write(`\r  Progress: ${progress}/${genericIds.length} (fixed: ${fixed}, failed: ${failed})`)

    if (i + BATCH_SIZE < genericIds.length) await sleep(DELAY_MS)
  }

  console.log(`\nDone. Fixed: ${fixed}, still pending: ${failed}`)
  writeFileSync(manualPath, JSON.stringify(manual, null, 2) + '\n')
  console.log('Wrote tools/catalog/data/sources/manual-copy.json')
  console.log('Run: node tools/catalog/bin/build-catalog.mjs')
}

main().catch((err) => { console.error(err); process.exit(1) })
