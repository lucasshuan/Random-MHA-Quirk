/**
 * Lists catalog quirks with origin ORIGINAL from Supabase (English copy).
 *
 * Usage:
 *   pnpm quirks:list-originals
 *   pnpm quirks:list-originals -- --json
 *   pnpm quirks:list-originals -- --markdown
 *   pnpm quirks:list-originals -- --out docs/catalog-originals.json
 */
import { writeFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'
import { loadEnv } from '../../src/server/env/load'
import { getProjectRoot } from '../_shared/root'

const root = getProjectRoot()

export interface CatalogOriginalQuirk {
  id: string
  name: string
  description: string
  tier: string
  type: string
}

function parseArgs(argv: string[]) {
  const json = argv.includes('--json')
  const markdown = argv.includes('--markdown')
  const outIdx = argv.indexOf('--out')
  const out =
    outIdx !== -1 && argv[outIdx + 1] ? argv[outIdx + 1] : undefined

  if (json && markdown) {
    throw new Error('Use only one of --json or --markdown.')
  }

  return { json, markdown, out }
}

function normalizeName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, ' ')
}

async function fetchOriginals(): Promise<CatalogOriginalQuirk[]> {
  loadEnv(root)

  const url = process.env.SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env')
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: quirks, error: quirksError } = await supabase
    .from('quirks')
    .select('id, tier, type')
    .eq('origin', 'ORIGINAL')
    .order('id')

  if (quirksError) {
    throw new Error(`Query quirks failed: ${quirksError.message}`)
  }

  if (!quirks?.length) {
    return []
  }

  const ids = quirks.map((q) => q.id)

  const { data: translations, error: translationsError } = await supabase
    .from('quirk_translations')
    .select('quirk_id, name, description')
    .eq('locale', 'en')
    .in('quirk_id', ids)

  if (translationsError) {
    throw new Error(`Query translations failed: ${translationsError.message}`)
  }

  const enById = new Map(
    (translations ?? []).map((t) => [t.quirk_id, t] as const),
  )

  const rows: CatalogOriginalQuirk[] = []

  for (const quirk of quirks) {
    const en = enById.get(quirk.id)
    if (!en) {
      throw new Error(`Missing English translation for quirk: ${quirk.id}`)
    }

    rows.push({
      id: quirk.id,
      name: en.name,
      description: en.description,
      tier: quirk.tier,
      type: quirk.type,
    })
  }

  rows.sort((a, b) => a.name.localeCompare(b.name, 'en'))
  return rows
}

function printTable(rows: CatalogOriginalQuirk[]) {
  if (rows.length === 0) {
    console.log('No ORIGINAL quirks in Supabase (origin = ORIGINAL).')
    return
  }

  const headers = ['id', 'name', 'tier', 'type', 'description'] as const
  const widths = headers.map((h) => h.length)

  for (const row of rows) {
    widths[0] = Math.max(widths[0], row.id.length)
    widths[1] = Math.max(widths[1], row.name.length)
    widths[2] = Math.max(widths[2], row.tier.length)
    widths[3] = Math.max(widths[3], row.type.length)
    widths[4] = Math.max(widths[4], Math.min(row.description.length, 72))
  }

  const pad = (col: number, text: string) => text.padEnd(widths[col])

  console.log(
    headers.map((h, i) => pad(i, h)).join('  '),
  )
  console.log(widths.map((w) => '-'.repeat(w)).join('  '))

  for (const row of rows) {
    const desc =
      row.description.length > 72
        ? `${row.description.slice(0, 69)}...`
        : row.description
    console.log(
      [row.id, row.name, row.tier, row.type, desc]
        .map((cell, i) => pad(i, cell))
        .join('  '),
    )
  }

  console.log(`\n${rows.length} ORIGINAL quirk(s).`)
}

function printMarkdown(rows: CatalogOriginalQuirk[]) {
  if (rows.length === 0) {
    console.log('_No ORIGINAL quirks in Supabase._')
    return
  }

  console.log('| id | name | tier | type | description |')
  console.log('|----|------|------|------|-------------|')
  for (const row of rows) {
    const desc = row.description.replace(/\|/g, '\\|').replace(/\n/g, ' ')
    console.log(
      `| ${row.id} | ${row.name} | ${row.tier} | ${row.type} | ${desc} |`,
    )
  }
  console.log(`\n<!-- ${rows.length} ORIGINAL quirk(s) -->`)
}

async function main() {
  const { json, markdown, out } = parseArgs(process.argv.slice(2))
  const rows = await fetchOriginals()

  const payload = {
    origin: 'ORIGINAL' as const,
    locale: 'en' as const,
    count: rows.length,
    namesNormalized: rows.map((r) => normalizeName(r.name)),
    quirks: rows,
  }

  if (out) {
    writeFileSync(out, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
    console.error(`Wrote ${rows.length} quirk(s) to ${out}`)
  }

  if (json) {
    console.log(JSON.stringify(payload, null, 2))
    return
  }

  if (markdown) {
    printMarkdown(rows)
    return
  }

  printTable(rows)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
