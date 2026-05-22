import type { QuirkId } from '@/data/quirk-ids'
import type { FusionCacheEntry } from '@/types/fusion'
import { upsertFusionCacheEntry } from '@/lib/fusionCache'

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
    message?: string
  }

  if (!res.ok || !data.entry) {
    throw new Error(data.message ?? `HTTP ${res.status}`)
  }

  upsertFusionCacheEntry(data.entry)
  return data.entry
}
