import { unstable_cache } from 'next/cache'
import { buildQuirkSearchText } from '@/i18n/quirkSearchText'
import type { Locale } from '@/i18n/types'
import { applyFilters } from '@/lib/quirks/engine'
import { paginateSlice, QUIRK_LIST_PAGE_SIZE } from '@/lib/quirks/pagination'
import type { Quirk, QuirkFilters } from '@/types/quirk'
import {
  mapQuirkLocalesEntries,
  type QuirkLocalesEntry,
} from '@/types/quirk-list'
import { hasActiveFilters } from './params'
import {
  getLocalizedQuirkById,
  listLocalizedQuirks,
  listQuirksWithLocales,
} from './repository'

/** Bump when catalog shape/tiers change to invalidate stale Next.js cache entries. */
const CATALOG_CACHE_VERSION = 'v2-omega'

const CATALOG_CACHE_SECONDS = 60 * 60 * 24

function getCachedCatalog(locale: Locale): Promise<Quirk[]> {
  return unstable_cache(
    async () => listLocalizedQuirks(locale),
    ['quirks-catalog', CATALOG_CACHE_VERSION, locale],
    { revalidate: CATALOG_CACHE_SECONDS, tags: [`quirks-${locale}`] },
  )()
}

function getCachedLocalesCatalog(): Promise<QuirkLocalesEntry[]> {
  return unstable_cache(
    async () => listQuirksWithLocales(),
    ['quirks-catalog', CATALOG_CACHE_VERSION, 'all-locales'],
    { revalidate: CATALOG_CACHE_SECONDS, tags: ['quirks-all-locales'] },
  )()
}

export async function getLocalesCatalog(): Promise<QuirkLocalesEntry[]> {
  if (process.env.NODE_ENV === 'development') {
    return listQuirksWithLocales()
  }
  return getCachedLocalesCatalog()
}

export async function getQuirksCatalog(locale: Locale): Promise<Quirk[]> {
  if (process.env.NODE_ENV === 'development') {
    return listLocalizedQuirks(locale)
  }
  return getCachedCatalog(locale)
}

export async function getFilteredQuirks(
  locale: Locale,
  filters: QuirkFilters,
): Promise<{ quirks: Quirk[]; total: number; filtered: boolean }> {
  const catalog = await getQuirksCatalog(locale)

  if (!hasActiveFilters(filters)) {
    return { quirks: catalog, total: catalog.length, filtered: false }
  }

  const searchableText = (quirk: Quirk) => buildQuirkSearchText(quirk, locale)
  const quirks = applyFilters(catalog, filters, { searchableText })

  return { quirks, total: quirks.length, filtered: true }
}

export interface PaginatedQuirksResult {
  locale: Locale
  entries: QuirkLocalesEntry[]
  quirks: Quirk[]
  total: number
  page: number
  pageSize: number
  pageCount: number
  filtered: boolean
}

export async function getPaginatedQuirks(
  locale: Locale,
  filters: QuirkFilters,
  page: number,
  pageSize = QUIRK_LIST_PAGE_SIZE,
): Promise<PaginatedQuirksResult> {
  const catalog = await getLocalesCatalog()
  const localized = mapQuirkLocalesEntries(catalog, locale)
  const searchableText = (quirk: Quirk) => buildQuirkSearchText(quirk, locale)
  const matched = hasActiveFilters(filters)
    ? applyFilters(localized, filters, { searchableText })
    : localized

  const filteredIds = new Set(matched.map((quirk) => quirk.id))
  const filteredEntries = catalog.filter((entry) => filteredIds.has(entry.id))
  const { slice, total, pageCount } = paginateSlice(filteredEntries, page, pageSize)

  return {
    locale,
    entries: slice,
    quirks: mapQuirkLocalesEntries(slice, locale),
    total,
    page,
    pageSize,
    pageCount,
    filtered: hasActiveFilters(filters),
  }
}

export async function getQuirkById(locale: Locale, id: string): Promise<Quirk | null> {
  const catalog = await getQuirksCatalog(locale)
  const fromCatalog = catalog.find((quirk) => quirk.id === id)
  if (fromCatalog) return fromCatalog

  return getLocalizedQuirkById(id, locale)
}
