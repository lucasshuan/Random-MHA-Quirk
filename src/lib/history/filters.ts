import type {
  HistoryModeFilter,
  HistoryQuirkPreview,
  ResultHistoryEntry,
} from '@/lib/history/types'
import type { QuirkFilters } from '@/types/quirk'

/** Same quirk metadata shown on the history card (not parent donors). */
export function primaryHistoryQuirk(entry: ResultHistoryEntry): HistoryQuirkPreview {
  if (entry.mode === 'single') {
    return entry.single.quirk
  }

  return entry.hybrid.fusion ?? entry.hybrid.parentA
}

export function matchesHistoryMode(
  entry: ResultHistoryEntry,
  mode: HistoryModeFilter,
): boolean {
  if (!mode.quirks && !mode.hybrids) {
    return true
  }

  if (entry.mode === 'single') {
    return mode.quirks
  }

  return mode.hybrids
}

export function matchesHistoryFilters(
  entry: ResultHistoryEntry,
  filters: QuirkFilters,
): boolean {
  const query = filters.query.trim().toLowerCase()
  if (query && !entry.searchText.includes(query)) {
    return false
  }

  const quirk = primaryHistoryQuirk(entry)

  if (filters.origins.length > 0 && !filters.origins.includes(quirk.origin)) {
    return false
  }
  if (filters.tiers.length > 0 && !filters.tiers.includes(quirk.tier)) {
    return false
  }
  if (filters.types.length > 0 && !filters.types.includes(quirk.type)) {
    return false
  }
  if (filters.ranges.length > 0 && !filters.ranges.includes(quirk.range)) {
    return false
  }
  if (
    filters.facets.length > 0 &&
    !filters.facets.every((facet) => quirk.facets.includes(facet))
  ) {
    return false
  }

  return true
}
