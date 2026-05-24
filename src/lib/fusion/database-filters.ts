import { resolveFusionQuirk } from '@/lib/fusion/cache'
import { findQuirkInCatalog } from '@/lib/quirks/catalog-client-cache'
import type { Locale } from '@/i18n/types'
import type { FusionCacheEntry } from '@/types/fusion'
import type { QuirkFilters, QuirkId } from '@/types/quirk'

export interface FusionFilterOptions {
  parentName?: (id: QuirkId) => string | undefined
}

function resolveParentName(
  locale: Locale,
  id: QuirkId,
  options?: FusionFilterOptions,
): string | undefined {
  if (options?.parentName) {
    return options.parentName(id)
  }
  return findQuirkInCatalog(locale, id)?.name
}

function hybridSearchText(
  entry: FusionCacheEntry,
  locale: Locale,
  options?: FusionFilterOptions,
): string {
  const fusion = resolveFusionQuirk(entry, locale)
  if (!fusion) {
    return ''
  }

  const parentA = resolveParentName(locale, entry.parents[0], options)
  const parentB = resolveParentName(locale, entry.parents[1], options)

  return [
    fusion.name,
    fusion.description,
    parentA,
    parentB,
    fusion.type,
    fusion.range,
    fusion.origin,
    ...fusion.facets,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

export function filterFusionEntries(
  entries: FusionCacheEntry[],
  filters: QuirkFilters,
  locale: Locale,
  options?: FusionFilterOptions,
): FusionCacheEntry[] {
  const query = filters.query.trim().toLowerCase()

  return entries.filter((entry) => {
    const fusion = resolveFusionQuirk(entry, locale)
    if (!fusion) {
      return false
    }

    if (filters.origins.length > 0 && !filters.origins.includes(fusion.origin)) {
      return false
    }

    if (filters.tiers.length > 0 && !filters.tiers.includes(fusion.tier)) {
      return false
    }

    if (filters.types.length > 0 && !filters.types.includes(fusion.type)) {
      return false
    }

    if (filters.ranges.length > 0 && !filters.ranges.includes(fusion.range)) {
      return false
    }

    if (
      filters.facets.length > 0 &&
      !filters.facets.every((facet) => fusion.facets.includes(facet))
    ) {
      return false
    }

    if (!query) {
      return true
    }

    return hybridSearchText(entry, locale, options).includes(query)
  })
}
