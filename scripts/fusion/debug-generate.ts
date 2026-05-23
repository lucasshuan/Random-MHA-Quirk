/**
 * Debug full fusion generate path.
 * Usage: pnpm exec tsx scripts/fusion/debug-generate.ts
 */
import { loadEnv } from '@/server/env/load'
import { generateFusionEntry } from '@/server/fusion/generate'
import { getProjectRoot } from '../_shared/root'

loadEnv(getProjectRoot())

try {
  const result = await generateFusionEntry({
    idA: 'permeation',
    idB: 'hardening',
    seed: 'debug-full',
    force: true,
  })
  console.log('OK', {
    generated: result.generated,
    cached: result.cached,
    name: result.entry.en.name,
  })
} catch (err) {
  console.error('FAILED:', err)
  process.exit(1)
}
