import type { Locale } from '@/i18n/types'
import { parseApiErrorBody } from '@/lib/api/resolve-error'
import type { QuirkId } from '@/types/quirk-id'
import type { FusionCacheEntry } from '@/types/fusion'
import { upsertFusionCacheEntry } from '@/lib/fusion/cache'

export interface FusionCatalogResponse {
  locale: Locale
  entries: FusionCacheEntry[]
  total: number
}

export async function fetchFusionCatalog(locale: Locale): Promise<FusionCacheEntry[]> {
  const params = new URLSearchParams({ locale })
  const res = await fetch(`/api/fusion?${params}`, {
    headers: { Accept: 'application/json' },
    cache: process.env.NODE_ENV === 'development' ? 'no-store' : undefined,
  })

  const data = (await res.json().catch(() => ({}))) as FusionCatalogResponse & {
    error?: { code?: string }
  }

  if (!res.ok || !Array.isArray(data.entries)) {
    const apiError = parseApiErrorBody(data)
    if (apiError) throw apiError
    throw new Error(`HTTP ${res.status}`)
  }

  for (const entry of data.entries) {
    upsertFusionCacheEntry(entry)
  }

  return data.entries
}

export async function fetchFusionFromCache(
  parentA: QuirkId,
  parentB: QuirkId,
  seed: string,
): Promise<FusionCacheEntry | null> {
  const params = new URLSearchParams({ parentA, parentB, seed })
  const res = await fetch(`/api/fusion/cache?${params}`, {
    headers: { Accept: 'application/json' },
  })

  if (res.status === 404) {
    return null
  }

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
