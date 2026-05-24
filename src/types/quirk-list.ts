import type { Locale } from '@/i18n/types'
import type { Quirk, QuirkBase, QuirkCopy } from './quirk'

export type QuirkLocaleBundle = Partial<Record<Locale, QuirkCopy>>

export interface QuirkLocalesEntry extends QuirkBase {
  locales: QuirkLocaleBundle
}

export function quirkFromLocalesEntry(entry: QuirkLocalesEntry, locale: Locale): Quirk {
  const copy = entry.locales[locale] ?? entry.locales.en
  if (!copy) {
    throw new Error(`Missing translation for quirk ${entry.id}`)
  }

  return {
    id: entry.id,
    origin: entry.origin,
    tier: entry.tier,
    type: entry.type,
    range: entry.range,
    facets: entry.facets,
    source: entry.source,
    inspiration: entry.inspiration,
    name: copy.name,
    description: copy.description,
  }
}

export function mapQuirkLocalesEntries(
  entries: QuirkLocalesEntry[],
  locale: Locale,
): Quirk[] {
  return entries.map((entry) => quirkFromLocalesEntry(entry, locale))
}
