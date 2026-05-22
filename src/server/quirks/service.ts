import { unstable_cache } from 'next/cache'
import { buildQuirkSearchText } from '@/i18n/quirkSearchText'
import type { Locale } from '@/i18n/types'
import { applyFilters } from '@/lib/quirks/engine'
import type { Quirk, QuirkFilters } from '@/types/quirk'
import { hasActiveFilters } from './params'
import { getLocalizedQuirkById, listLocalizedQuirks } from './repository'

const CATALOG_CACHE_SECONDS = 60 * 60 * 24

function getCachedCatalog(locale: Locale): Promise<Quirk[]> {
  return unstable_cache(
    async () => listLocalizedQuirks(locale),
    ['quirks-catalog', locale],
    { revalidate: CATALOG_CACHE_SECONDS, tags: [`quirks-${locale}`] },
  )()
}

export async function getQuirksCatalog(locale: Locale): Promise<Quirk[]> {
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

export async function getQuirkById(locale: Locale, id: string): Promise<Quirk | null> {
  const cached = await getCachedCatalog(locale)
  const fromCache = cached.find((quirk) => quirk.id === id)
  if (fromCache) return fromCache

  return getLocalizedQuirkById(id, locale)
}
