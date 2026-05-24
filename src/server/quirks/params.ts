import type { Locale } from '@/i18n/types'
import { isLocale } from '@/i18n/types'
import {
  QUIRK_FACETS,
  QUIRK_ORIGINS,
  QUIRK_RANGES,
  QUIRK_TIERS,
  QUIRK_TYPES,
  type QuirkFacet,
  type QuirkFilters,
  type QuirkOrigin,
  type QuirkRange,
  type QuirkTier,
  type QuirkType,
} from '@/types/quirk'

function parseList<T extends string>(
  value: string | null,
  allowed: readonly T[],
): T[] {
  if (!value?.trim()) return []

  return value
    .split(',')
    .map((part) => part.trim())
    .filter((part): part is T => allowed.includes(part as T))
}

export function parseLocaleParam(value: string | null): Locale | null {
  if (!value || !isLocale(value)) return null
  return value
}

export function parseQuirkFiltersFromSearchParams(
  params: URLSearchParams,
): QuirkFilters {
  return {
    origins: parseList(params.get('origins'), QUIRK_ORIGINS),
    tiers: parseList(params.get('tiers'), QUIRK_TIERS),
    types: parseList(params.get('types'), QUIRK_TYPES),
    ranges: parseList(params.get('ranges'), QUIRK_RANGES),
    facets: parseList(params.get('facets'), QUIRK_FACETS),
    query: params.get('q')?.trim() ?? params.get('query')?.trim() ?? '',
  }
}

export function hasActiveFilters(filters: QuirkFilters): boolean {
  return (
    filters.origins.length > 0 ||
    filters.tiers.length > 0 ||
    filters.types.length > 0 ||
    filters.ranges.length > 0 ||
    filters.facets.length > 0 ||
    filters.query.length > 0
  )
}

export { parsePageParam, parsePageSizeParam } from '@/lib/quirks/pagination'
