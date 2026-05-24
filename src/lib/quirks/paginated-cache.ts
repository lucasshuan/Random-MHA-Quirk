import type { Locale } from '@/i18n/types'
import {
  fetchPaginatedQuirks,
  type PaginatedQuirksListResponse,
} from '@/lib/quirks/api'
import { seedQuirkLocalesEntries } from '@/lib/quirks/catalog-client-cache'
import type { QuirkFilters } from '@/types/quirk'

const pageCache = new Map<string, PaginatedQuirksListResponse>()
const inflight = new Map<string, Promise<PaginatedQuirksListResponse>>()

export function paginatedQuirkCacheKey(
  locale: Locale,
  filters: QuirkFilters,
  page: number,
): string {
  return `${locale}:${JSON.stringify(filters)}:${page}`
}

export function getCachedPaginatedPage(
  locale: Locale,
  filters: QuirkFilters,
  page: number,
): PaginatedQuirksListResponse | undefined {
  return pageCache.get(paginatedQuirkCacheKey(locale, filters, page))
}

export async function loadPaginatedQuirkPage(
  locale: Locale,
  filters: QuirkFilters,
  page: number,
  init?: RequestInit,
): Promise<PaginatedQuirksListResponse> {
  const key = paginatedQuirkCacheKey(locale, filters, page)
  const cached = pageCache.get(key)
  if (cached) return cached

  const pending = inflight.get(key)
  if (pending) return pending

  const promise = fetchPaginatedQuirks(locale, filters, page, init)
    .then((response) => {
      pageCache.set(key, response)
      seedQuirkLocalesEntries(response.entries)
      inflight.delete(key)
      return response
    })
    .catch((err) => {
      inflight.delete(key)
      throw err
    })

  inflight.set(key, promise)
  return promise
}

export function prefetchPaginatedQuirkPage(
  locale: Locale,
  filters: QuirkFilters,
  page: number,
  pageCount?: number,
): void {
  if (page < 1) return
  if (pageCount !== undefined && page > pageCount) return

  const key = paginatedQuirkCacheKey(locale, filters, page)
  if (pageCache.has(key) || inflight.has(key)) return

  void loadPaginatedQuirkPage(locale, filters, page).catch(() => {})
}

export function prefetchPaginatedQuirkNeighbors(
  locale: Locale,
  filters: QuirkFilters,
  page: number,
  pageCount: number,
): void {
  prefetchPaginatedQuirkPage(locale, filters, page - 1, pageCount)
  prefetchPaginatedQuirkPage(locale, filters, page + 1, pageCount)
}
