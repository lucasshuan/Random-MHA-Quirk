import type { Locale } from '@/i18n/types'
import { parseApiErrorBody } from '@/lib/api/resolve-error'
import type { FusionParentLabels } from '@/types/fusion-list'
import { QUIRK_LIST_PAGE_SIZE } from '@/lib/quirks/pagination'
import type { QuirkFilters } from '@/types/quirk'
import type { QuirkId } from '@/types/quirk-id'
import type { FusionCacheEntry } from '@/types/fusion'
import { upsertFusionCacheEntry } from '@/lib/fusion/cache'

export interface FusionCatalogResponse {
  locale: Locale
  entries: FusionCacheEntry[]
  total: number
}

export interface PaginatedFusionCatalogResponse extends FusionCatalogResponse {
  parentLabels: FusionParentLabels
  page: number
  pageSize: number
  pageCount: number
  filtered: boolean
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

export async function fetchPaginatedFusionCatalog(
  locale: Locale,
  filters: QuirkFilters,
  page: number,
): Promise<PaginatedFusionCatalogResponse> {
  const params = new URLSearchParams({
    locale,
    paginate: '1',
    page: String(page),
    limit: String(QUIRK_LIST_PAGE_SIZE),
  })

  if (filters.query) params.set('q', filters.query)
  if (filters.origins.length) params.set('origins', filters.origins.join(','))
  if (filters.tiers.length) params.set('tiers', filters.tiers.join(','))
  if (filters.types.length) params.set('types', filters.types.join(','))
  if (filters.ranges.length) params.set('ranges', filters.ranges.join(','))
  if (filters.facets.length) params.set('facets', filters.facets.join(','))

  const res = await fetch(`/api/fusion?${params}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  })

  const data = (await res.json().catch(() => ({}))) as PaginatedFusionCatalogResponse & {
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

  return data
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
): Promise<FusionCacheEntry> {
  const res = await fetch('/api/fusion/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      parentA,
      parentB,
      seed,
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
