import { parseApiErrorBody } from '@/lib/api/resolve-error'
import type { QuirkId } from '@/types/quirk-id'
import type { FusionCacheEntry } from '@/types/fusion'
import { upsertFusionCacheEntry } from '@/lib/fusion/cache'

export async function requestFusionGeneration(
  parentA: QuirkId,
  parentB: QuirkId,
  seed: string,
  options?: { force?: boolean },
): Promise<FusionCacheEntry> {
  const res = await fetch('/api/fusion/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      parentA,
      parentB,
      seed,
      force: options?.force ?? false,
    }),
  })

  const data = (await res.json().catch(() => ({}))) as {
    entry?: FusionCacheEntry
    error?: { code?: string; retryAfterSec?: number; minutes?: number }
  }

  if (!res.ok || !data.entry) {
    const apiError = parseApiErrorBody(data)
    if (apiError) throw apiError
    throw new Error(`HTTP ${res.status}`)
  }

  upsertFusionCacheEntry(data.entry)
  return data.entry
}
