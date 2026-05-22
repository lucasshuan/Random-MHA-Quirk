import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Carrega catálogo mínimo para prompts de fusão (base + copy EN).
 */
export function loadQuirksCatalog(srcDir) {
  const baseText = readFileSync(join(srcDir, 'data', 'quirks.base.ts'), 'utf8')
  const enText = readFileSync(join(srcDir, 'i18n', 'quirks', 'en.ts'), 'utf8')

  const baseById = new Map()
  const blockRe =
    /id: '([^']+)',\s*origin: '([^']+)',\s*tier: '[^']+',\s*type: '([^']+)',\s*range: '([^']+)',\s*facets: \[([^\]]*)\]/g

  let match
  while ((match = blockRe.exec(baseText)) !== null) {
    const facetsRaw = match[5].trim()
    const facets = facetsRaw
      ? facetsRaw.split(',').map((f) => f.trim().replace(/^'|'$/g, ''))
      : []
    baseById.set(match[1], {
      id: match[1],
      origin: match[2],
      type: match[3],
      range: match[4],
      facets,
    })
  }

  const copyById = parseEnQuirkCopy(enText)

  const catalog = []
  for (const [id, base] of baseById) {
    const copy = copyById.get(id)
    if (!copy) continue
    catalog.push({ ...base, name: copy.name, description: copy.description })
  }

  return catalog
}

function parseEnQuirkCopy(content) {
  const map = new Map()
  const entryRe = /'([a-z0-9-]+)':\s*\{([^}]+)\}/g
  let m
  while ((m = entryRe.exec(content)) !== null) {
    const body = m[2]
    const nameMatch = body.match(/name:\s*'((?:\\'|[^'])*)'/)
    const descMatch = body.match(/description:\s*'((?:\\'|[^'])*)'/)
    if (!nameMatch || !descMatch) continue
    map.set(m[1], {
      name: unescapeTs(nameMatch[1]),
      description: unescapeTs(descMatch[1]),
    })
  }
  return map
}

function unescapeTs(value) {
  return value.replace(/\\'/g, "'").replace(/\\n/g, '\n')
}

export function getQuirkById(catalog, id) {
  return catalog.find((q) => q.id === id) ?? null
}
