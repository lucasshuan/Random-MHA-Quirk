/**
 * Verifies fusion_entries table (count + tier/roll columns).
 * Usage: pnpm exec tsx scripts/db/verify-fusion-entries.ts
 */
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

const supabase = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
})

async function main() {
  const { count, error: countError } = await supabase
    .from('fusion_entries')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    throw new Error(`Count failed: ${countError.message}`)
  }

  console.log(`fusion_entries row count: ${count ?? 0}`)

  const { data, error: sampleError } = await supabase
    .from('fusion_entries')
    .select('key, parent_a, parent_b, seed, tier, roll')
    .limit(5)

  if (sampleError) {
    throw new Error(`Sample select failed: ${sampleError.message}`)
  }

  console.log(`sample rows (up to 5): ${JSON.stringify(data ?? [], null, 2)}`)

  const probe = await supabase
    .from('fusion_entries')
    .select('tier, roll')
    .limit(1)

  if (probe.error) {
    throw new Error(
      `tier/roll columns missing or inaccessible: ${probe.error.message}`,
    )
  }

  console.log('tier and roll columns: OK')
  console.log('Verification complete.')
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
