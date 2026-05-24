import { unstable_cache } from 'next/cache'
import type { Locale } from '@/i18n/types'
import { filterFusionEntries } from '@/lib/fusion/database-filters'
import { paginateSlice, QUIRK_LIST_PAGE_SIZE } from '@/lib/quirks/pagination'
import { listAllFusionEntries } from '@/server/fusion/repository'
import { getLocalesCatalog } from '@/server/quirks/service'
import type { FusionCacheEntry } from '@/types/fusion'
import type { QuirkCopy, QuirkFilters, QuirkId } from '@/types/quirk'
import { hasActiveFilters } from '@/server/quirks/params'
import {
  quirkFromLocalesEntry,
  type QuirkLocalesEntry,
} from '@/types/quirk-list'
import { LOCALES } from '@/i18n/types'

const FUSION_LIST_CACHE_SECONDS = 300

function getCachedFusionEntries(): Promise<FusionCacheEntry[]> {
  return unstable_cache(
    async () => listAllFusionEntries(),
    ['fusion-catalog', 'v1'],
    { revalidate: FUSION_LIST_CACHE_SECONDS, tags: ['fusion-catalog'] },
  )()
}

async function getFusionCatalog(): Promise<FusionCacheEntry[]> {
  if (process.env.NODE_ENV === 'development') {
    return listAllFusionEntries()
  }
  return getCachedFusionEntries()
}

import type { FusionParentLabels } from '@/types/fusion-list'

export interface PaginatedFusionResult {
  locale: Locale
  entries: FusionCacheEntry[]
  parentLabels: FusionParentLabels
  total: number
  page: number
  pageSize: number
  pageCount: number
  filtered: boolean
}

function buildParentLabels(
  catalog: QuirkLocalesEntry[],
  parentIds: QuirkId[],
): FusionParentLabels {
  const labels: FusionParentLabels = {}
  const catalogById = new Map(catalog.map((entry) => [entry.id, entry]))

  for (const id of parentIds) {
    const entry = catalogById.get(id)
    if (!entry) continue
    const localeNames: Partial<Record<Locale, string>> = {}
    for (const targetLocale of LOCALES) {
      const copy: QuirkCopy | undefined = entry.locales[targetLocale]
      if (copy?.name) {
        localeNames[targetLocale] = copy.name
      }
    }
    labels[id] = localeNames
  }

  return labels
}

export async function getPaginatedFusionEntries(
  locale: Locale,
  filters: QuirkFilters,
  page: number,
  pageSize = QUIRK_LIST_PAGE_SIZE,
): Promise<PaginatedFusionResult> {
  const [entries, catalog] = await Promise.all([
    getFusionCatalog(),
    getLocalesCatalog(),
  ])

  const parentName = (id: QuirkId) => {
    const entry = catalog.find((item) => item.id === id)
    if (!entry) return undefined
    try {
      return quirkFromLocalesEntry(entry, locale).name
    } catch {
      return entry.locales.en?.name
    }
  }

  const filtered = hasActiveFilters(filters)
    ? filterFusionEntries(entries, filters, locale, { parentName })
    : entries

  const { slice, total, pageCount } = paginateSlice(filtered, page, pageSize)
  const parentIds = [...new Set(slice.flatMap((entry) => entry.parents))]
  const parentLabels = buildParentLabels(catalog, parentIds)

  return {
    locale,
    entries: slice,
    parentLabels,
    total,
    page,
    pageSize,
    pageCount,
    filtered: hasActiveFilters(filters),
  }
}
