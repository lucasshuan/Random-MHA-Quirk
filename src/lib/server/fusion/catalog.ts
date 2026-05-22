import { readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface FusionCatalogQuirk {
  id: string
  origin: string
  type: string
  range: string
  facets: string[]
  name: string
  description: string
}

/**
 * Loads minimal catalog for fusion prompts (base + EN copy).
 */
export function loadQuirksCatalog(srcDir: string): FusionCatalogQuirk[] {
  const baseText = readFileSync(join(srcDir, 'data', 'quirks.base.ts'), 'utf8')
  const enText = readFileSync(
    join(srcDir, 'i18n', 'messages', 'quirks', 'en.ts'),
    'utf8',
  )

  const baseById = new Map<string, Omit<FusionCatalogQuirk, 'name' | 'description'>>()
  const blockRe =
    /id: '([^']+)',\s*origin: '([^']+)',\s*tier: '[^']+',\s*type: '([^']+)',\s*range: '([^']+)',\s*facets: \[([^\]]*)\]/g

  let match: RegExpExecArray | null
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

  const catalog: FusionCatalogQuirk[] = []
  for (const [id, base] of baseById) {
    const copy = copyById.get(id)
    if (!copy) continue
    catalog.push({ ...base, name: copy.name, description: copy.description })
  }

  return catalog
}

function parseEnQuirkCopy(content: string): Map<string, { name: string; description: string }> {
  const map = new Map<string, { name: string; description: string }>()
  const entryRe = /'([a-z0-9-]+)':\s*\{([^}]+)\}/g
  let m: RegExpExecArray | null
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

function unescapeTs(value: string): string {
  return value.replace(/\\'/g, "'").replace(/\\n/g, '\n')
}

export function getQuirkById(
  catalog: FusionCatalogQuirk[],
  id: string,
): FusionCatalogQuirk | null {
  return catalog.find((q) => q.id === id) ?? null
}
