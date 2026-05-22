import fusionCacheFile from '../data/fusion-cache.json'
import type { QuirkId } from '../data/quirk-ids'
import type { Locale } from '../i18n/types'
import type { FusionCacheEntry, FusionCacheFile, FusionQuirk } from '../types/fusion'
import { fusionCopyForLocale } from '../types/fusion'
import { fusionCacheKey, fusionQuirkId } from './fusionKey'

const cache = fusionCacheFile as FusionCacheFile

const byKey = new Map<string, FusionCacheEntry>(
  cache.entries.map((entry) => [entry.key, entry]),
)

export function lookupFusion(
  parentA: QuirkId,
  parentB: QuirkId,
  seed: string,
  locale: Locale,
): FusionQuirk | null {
  const key = fusionCacheKey(parentA, parentB, seed)
  const entry = byKey.get(key)
  if (!entry) {
    return null
  }

  return entryToFusionQuirk(entry, locale)
}

function entryToFusionQuirk(entry: FusionCacheEntry, locale: Locale): FusionQuirk {
  const copy = fusionCopyForLocale(entry, locale)
  return {
    id: fusionQuirkId(entry.parents[0], entry.parents[1], entry.seed),
    parents: entry.parents,
    seed: entry.seed,
    origin: entry.origin,
    type: entry.type,
    range: entry.range,
    facets: entry.facets,
    name: copy.name,
    description: copy.description,
  }
}

export function getFusionCacheSize(): number {
  return cache.entries.length
}
