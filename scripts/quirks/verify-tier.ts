/**
 * Prints tier for key quirks in Supabase vs quirks.base.ts.
 * Usage: pnpm exec tsx scripts/quirks/verify-tier.ts
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { loadEnv } from '../../src/server/env/load'
import { getProjectRoot } from '../_shared/root'

const IDS = ['all-for-one', 'one-for-all', 'time-manipulation'] as const

function tierFromBase(id: string): string | undefined {
  const text = readFileSync(
    join(getProjectRoot(), 'tools/catalog/output/quirks.base.ts'),
    'utf8',
  )
  const m = text.match(
    new RegExp(`id: '${id}',[\\s\\S]*?tier: '([^']+)'`),
  )
  return m?.[1]
}

async function main() {
  const root = getProjectRoot()
  loadEnv(root)

  const url = process.env.SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data, error } = await supabase
    .from('quirks')
    .select('id, tier')
    .in('id', [...IDS])

  if (error) throw new Error(error.message)

  console.log('id                  | base.ts | supabase')
  console.log('--------------------|---------|--------')
  for (const id of IDS) {
    const base = tierFromBase(id) ?? '(missing)'
    const row = data?.find((r) => r.id === id)
    const db = row?.tier ?? '(missing)'
    console.log(`${id.padEnd(19)} | ${base.padEnd(7)} | ${db}`)
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
