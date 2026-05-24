import type { Locale } from '@/i18n/types'
import {
  findQuirkInCatalog,
  getCatalogCache,
} from '@/lib/quirks/catalog-client-cache'
import { QUIRK_LIST_PAGE_SIZE } from '@/lib/quirks/pagination'
import type { Quirk, QuirkFilters } from '@/types/quirk'
import type { QuirkLocalesEntry } from '@/types/quirk-list'

const quirkDetailCache = new Map<string, Quirk>()

function quirkDetailCacheKey(locale: Locale, id: string): string {
  return `${locale}:${id}`
}

export interface QuirksListResponse {
  locale: Locale
  quirks: Quirk[]
  total: number
  filtered: boolean
}

export interface PaginatedQuirksListResponse extends QuirksListResponse {
  entries: QuirkLocalesEntry[]
  page: number
  pageSize: number
  pageCount: number
}

export interface QuirkDetailResponse {
  locale: Locale
  quirk: Quirk
}

/** Bust browser/CDN cache after catalog tier schema changes. */
const CATALOG_FETCH_VERSION = 'v2-omega'

function filtersToSearchParams(
  locale: Locale,
  filters?: QuirkFilters,
  pagination?: { page: number; pageSize?: number },
): URLSearchParams {
  const params = new URLSearchParams({ locale, catalog: CATALOG_FETCH_VERSION })

  if (pagination) {
    params.set('paginate', '1')
    params.set('page', String(pagination.page))
    params.set('limit', String(pagination.pageSize ?? QUIRK_LIST_PAGE_SIZE))
  }

  if (!filters) return params

  if (filters.query) params.set('q', filters.query)
  if (filters.origins.length) params.set('origins', filters.origins.join(','))
  if (filters.tiers.length) params.set('tiers', filters.tiers.join(','))
  if (filters.types.length) params.set('types', filters.types.join(','))
  if (filters.ranges.length) params.set('ranges', filters.ranges.join(','))
  if (filters.facets.length) params.set('facets', filters.facets.join(','))

  return params
}

export async function fetchQuirks(
  locale: Locale,
  filters?: QuirkFilters,
  init?: RequestInit,
): Promise<QuirksListResponse> {
  const params = filtersToSearchParams(locale, filters)
  const res = await fetch(`/api/quirks?${params}`, {
    ...init,
    cache: process.env.NODE_ENV === 'development' ? 'no-store' : init?.cache,
    headers: { Accept: 'application/json', ...init?.headers },
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? `Failed to load quirks (${res.status}).`)
  }

  return res.json() as Promise<QuirksListResponse>
}

export async function fetchPaginatedQuirks(
  locale: Locale,
  filters: QuirkFilters,
  page: number,
  init?: RequestInit,
): Promise<PaginatedQuirksListResponse> {
  const params = filtersToSearchParams(locale, filters, { page })
  const res = await fetch(`/api/quirks?${params}`, {
    ...init,
    cache: 'no-store',
    headers: { Accept: 'application/json', ...init?.headers },
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? `Failed to load quirks (${res.status}).`)
  }

  return res.json() as Promise<PaginatedQuirksListResponse>
}

export function peekQuirkById(locale: Locale, id: string): Quirk | undefined {
  const fromCatalog = findQuirkInCatalog(locale, id)
  if (fromCatalog) {
    return fromCatalog
  }

  return quirkDetailCache.get(quirkDetailCacheKey(locale, id))
}

export async function fetchQuirkById(
  locale: Locale,
  id: string,
  init?: RequestInit,
): Promise<Quirk> {
  const cached = peekQuirkById(locale, id)
  if (cached) {
    return cached
  }

  const params = new URLSearchParams({ locale })
  const res = await fetch(`/api/quirks/${encodeURIComponent(id)}?${params}`, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  })

  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { message?: string } | null
    throw new Error(body?.message ?? `Failed to load quirk (${res.status}).`)
  }

  const data = (await res.json()) as QuirkDetailResponse
  quirkDetailCache.set(quirkDetailCacheKey(locale, id), data.quirk)

  const catalog = getCatalogCache()
  const list = catalog.get(locale) ?? []
  if (!list.some((entry) => entry.id === data.quirk.id)) {
    catalog.set(locale, [...list, data.quirk])
  }

  return data.quirk
}
