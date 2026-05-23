/**
 * Deletes a quirk by id from Supabase (translations cascade).
 *
 * Usage: pnpm tsx scripts/quirks/delete-quirk.ts <quirk-id>
 */
import { createClient } from '@supabase/supabase-js'
import { loadEnv } from '../../src/server/env/load'
import { getProjectRoot } from '../_shared/root'

async function main() {
  const id = process.argv[2]?.trim()
  if (!id) {
    throw new Error('Usage: pnpm tsx scripts/quirks/delete-quirk.ts <quirk-id>')
  }

  const root = getProjectRoot()
  loadEnv(root)

  const url = process.env.SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env')
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { error, count } = await supabase
    .from('quirks')
    .delete({ count: 'exact' })
    .eq('id', id)

  if (error) {
    throw new Error(`Delete failed: ${error.message}`)
  }

  console.log(`Deleted quirk "${id}" (${count ?? 0} row(s)).`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
