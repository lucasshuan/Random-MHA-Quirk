import type { QuirkId } from '../data/quirk-ids'
import type { Locale } from '../i18n/types'
import type { FusionCacheEntry, FusionQuirk } from '../types/fusion'
import { fusionCopyForLocale } from '../types/fusion'
import { fusionQuirkId } from './fusionKey'

export function fusionFromCacheEntry(entry: FusionCacheEntry, locale: Locale): FusionQuirk {
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

export function canGenerateFusionLive(): boolean {
  return import.meta.env.DEV
}

export async function requestFusionGeneration(
  parentA: QuirkId,
  parentB: QuirkId,
  seed: string,
  locale: Locale,
  options?: { force?: boolean },
): Promise<FusionQuirk> {
  const res = await fetch('/api/fusion/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      parentA,
      parentB,
      seed,
      force: options?.force ?? false,
    }),
  })

  const data = (await res.json().catch(() => ({}))) as {
    entry?: FusionCacheEntry
    message?: string
  }

  if (!res.ok || !data.entry) {
    throw new Error(data.message ?? `HTTP ${res.status}`)
  }

  return fusionFromCacheEntry(data.entry, locale)
}
