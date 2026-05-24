import type { Locale } from '@/i18n/types'
import type { Quirk } from '@/types/quirk'

const catalogCache = new Map<Locale, Quirk[]>()
const inflight = new Map<Locale, Promise<Quirk[]>>()

export function getCatalogCache(): Map<Locale, Quirk[]> {
  return catalogCache
}

export function getCatalogInflight(): Map<Locale, Promise<Quirk[]>> {
  return inflight
}

export function isCatalogBootstrapped(): boolean {
  return catalogCache.size > 0
}

export function hasQuirksCatalog(locale: Locale): boolean {
  return catalogCache.has(locale)
}

export function findQuirkInCatalog(locale: Locale, id: string): Quirk | undefined {
  return catalogCache.get(locale)?.find((entry) => entry.id === id)
}

export function resolveQuirkFromCatalog(quirk: Quirk, locale: Locale): Quirk {
  return findQuirkInCatalog(locale, quirk.id) ?? quirk
}
