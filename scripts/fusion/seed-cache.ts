/**
 * Migrates scripts/fusion/seed-data/fusion-cache.json into Supabase (one-time).
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
 *
 * Usage: pnpm exec tsx scripts/fusion/seed-cache.ts
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { loadEnv } from '../../src/server/env/load'
import { getProjectRoot } from '../_shared/root'

const root = getProjectRoot()
loadEnv(root)

const url = process.env.SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env')
  process.exit(1)
}

const cachePath = join(root, 'scripts/fusion/seed-data/fusion-cache.json')
if (!existsSync(cachePath)) {
  console.error('Arquivo não encontrado:', cachePath)
  process.exit(1)
}

const cache = JSON.parse(readFileSync(cachePath, 'utf8')) as {
  entries: Array<{
    key: string
    parents: [string, string]
    seed: string
    en: { name: string; description: string }
    'pt-BR': { name: string; description: string }
    es?: { name: string; description: string }
    type: string
    range: string
    facets: string[]
    origin?: string
  }>
}

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function main() {
  const rows = cache.entries.map((entry) => ({
    key: entry.key,
    parent_a: entry.parents[0],
    parent_b: entry.parents[1],
    seed: entry.seed,
    en: entry.en,
    pt_br: entry['pt-BR'],
    es: entry.es ?? entry.en,
    type: entry.type,
    range: entry.range,
    facets: entry.facets,
    origin: entry.origin ?? 'ORIGINAL',
    tier: (entry as { tier?: string }).tier ?? null,
    roll: (entry as { roll?: unknown }).roll ?? null,
  }))

  const { error } = await supabase.from('fusion_entries').upsert(rows, { onConflict: 'key' })
  if (error) {
    console.error('Seed failed:', error.message)
    process.exit(1)
  }

  console.log(`Seeded ${rows.length} fusion entries into Supabase.`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
