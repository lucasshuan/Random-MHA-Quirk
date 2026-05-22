/**
 * Migra scripts/seed-data/fusion-cache.json para Supabase (one-time).
 * Requer SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env
 */
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createClient } from '@supabase/supabase-js'
import { loadEnv } from './lib/load-env.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
loadEnv(root)

const url = process.env.SUPABASE_URL?.trim()
const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
if (!url || !key) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env')
  process.exit(1)
}

const cachePath = join(root, 'scripts', 'seed-data', 'fusion-cache.json')
if (!existsSync(cachePath)) {
  console.error('Arquivo não encontrado:', cachePath)
  process.exit(1)
}

const cache = JSON.parse(readFileSync(cachePath, 'utf8'))
const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const rows = cache.entries.map((entry) => ({
  key: entry.key,
  parent_a: entry.parents[0],
  parent_b: entry.parents[1],
  seed: entry.seed,
  en: entry.en,
  pt_br: entry['pt-BR'],
  type: entry.type,
  range: entry.range,
  facets: entry.facets,
  origin: entry.origin ?? 'ORIGINAL',
}))

const { error } = await supabase.from('fusion_entries').upsert(rows, { onConflict: 'key' })
if (error) {
  console.error('Seed failed:', error.message)
  process.exit(1)
}

console.log(`Seeded ${rows.length} fusion entries into Supabase.`)
