/**
 * Applies supabase/migrations/*.sql to the linked remote project.
 *
 * Prereqs (once):
 *   1. pnpm exec supabase login
 *   2. Set SUPABASE_URL + SUPABASE_DB_PASSWORD in .env
 *
 * Usage: pnpm db:push
 */
import { spawnSync } from 'node:child_process'
import { getProjectRoot } from '../_shared/root'
import { loadEnv } from '../../src/server/env/load'

const root = getProjectRoot()
loadEnv(root)

const url = process.env.SUPABASE_URL?.trim()
const dbPassword = process.env.SUPABASE_DB_PASSWORD?.trim()

if (!url) {
  console.error('Defina SUPABASE_URL no .env (https://<ref>.supabase.co)')
  process.exit(1)
}

const match = url.match(/^https?:\/\/([a-z0-9]+)\.supabase\.co\/?$/i)
if (!match) {
  console.error(
    'SUPABASE_URL deve ser a Project URL (https://<ref>.supabase.co), não a connection string Postgres.',
  )
  process.exit(1)
}

const projectRef = match[1]

if (!dbPassword) {
  console.error(
    'Defina SUPABASE_DB_PASSWORD no .env (Database password em Project Settings → Database).',
  )
  process.exit(1)
}

function run(args: string[]) {
  const result = spawnSync('pnpm', ['exec', 'supabase', ...args], {
    cwd: root,
    stdio: 'inherit',
    shell: true,
  })
  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

console.log(`Linking project ${projectRef}…`)
run(['link', '--project-ref', projectRef, '--password', dbPassword])

console.log('Pushing migrations…')
run(['db', 'push'])

console.log('Done.')
