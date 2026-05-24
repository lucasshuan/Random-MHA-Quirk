import type { Locale } from '@/i18n/types'
import { LOCALES } from '@/i18n/types'
import type { Quirk, QuirkId } from '@/types/quirk'
import {
  quirkFromLocalesEntry,
  type QuirkLocalesEntry,
} from '@/types/quirk-list'

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

export function seedQuirkLocalesEntries(entries: QuirkLocalesEntry[]): void {
  for (const entry of entries) {
    for (const targetLocale of LOCALES) {
      const copy = entry.locales[targetLocale]
      if (!copy) continue

      try {
        const quirk = quirkFromLocalesEntry(entry, targetLocale)
        const list = catalogCache.get(targetLocale) ?? []
        const index = list.findIndex((item) => item.id === quirk.id)
        if (index >= 0) {
          list[index] = quirk
        } else {
          list.push(quirk)
        }
        catalogCache.set(targetLocale, list)
      } catch {
        // skip incomplete locale bundles
      }
    }
  }
}

const fusionParentLabels = new Map<Locale, Map<QuirkId, string>>()

export function seedFusionParentLabels(
  locale: Locale,
  labels: Partial<Record<QuirkId, Partial<Record<Locale, string>>>>,
): void {
  for (const [id, localeNames] of Object.entries(labels)) {
    if (!localeNames) continue
    for (const targetLocale of LOCALES) {
      const name = localeNames[targetLocale]
      if (!name) continue
      const bucket = fusionParentLabels.get(targetLocale) ?? new Map()
      bucket.set(id as QuirkId, name)
      fusionParentLabels.set(targetLocale, bucket)
    }
  }
}

export function findFusionParentName(locale: Locale, id: QuirkId): string | undefined {
  return fusionParentLabels.get(locale)?.get(id) ?? findQuirkInCatalog(locale, id)?.name
}
