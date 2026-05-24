import { resolveFusionQuirk } from '@/lib/fusion/cache'
import { findQuirkInCatalog } from '@/lib/quirks/catalog-client-cache'
import type { Locale } from '@/i18n/types'
import type { FusionCacheEntry } from '@/types/fusion'
import type { QuirkFilters } from '@/types/quirk'

function hybridSearchText(entry: FusionCacheEntry, locale: Locale): string {
  const fusion = resolveFusionQuirk(entry, locale)
  if (!fusion) {
    return ''
  }

  const parentA = findQuirkInCatalog(locale, entry.parents[0])
  const parentB = findQuirkInCatalog(locale, entry.parents[1])

  return [
    fusion.name,
    fusion.description,
    parentA?.name,
    parentB?.name,
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

    return hybridSearchText(entry, locale).includes(query)
  })
}
