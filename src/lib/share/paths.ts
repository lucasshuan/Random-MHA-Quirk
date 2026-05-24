import { isLocale, type Locale } from '@/i18n/types'
import { fusionCacheKey } from '@/lib/fusion/keys'
import { QUIRK_IDS, type QuirkId } from '@/types/quirk-id'

const QUIRK_ID_SET = new Set<string>(QUIRK_IDS)

const SEED_PATTERN = /^[a-z0-9]{4,32}$/i

/** Legacy share links only — locale is no longer written to URLs. */
export const SHARE_LANG_PARAM = 'lang'

export function isQuirkId(value: string): value is QuirkId {
  return QUIRK_ID_SET.has(value)
}

export function isFusionSeed(value: string): boolean {
  return SEED_PATTERN.test(value)
}

export function shareLocaleFromSearchParams(
  params: URLSearchParams,
): Locale | null {
  const raw = params.get(SHARE_LANG_PARAM)
  if (!raw) {
    return null
  }
  return isLocale(raw) ? raw : null
}

export function shareQuirkPath(quirkId: QuirkId): string {
  return `/r/quirk/${encodeURIComponent(quirkId)}`
}

export function shareHybridPath(
  parentA: QuirkId,
  parentB: QuirkId,
  seed: string,
): string {
  return `/r/hybrid/${encodeURIComponent(parentA)}/${encodeURIComponent(parentB)}/${encodeURIComponent(seed)}`
}

export function fusionCacheKeyFromHybridRoute(
  parentA: string,
  parentB: string,
  seed: string,
): string | null {
  if (!isQuirkId(parentA) || !isQuirkId(parentB) || !isFusionSeed(seed)) {
    return null
  }
  if (parentA === parentB) {
    return null
  }
  return fusionCacheKey(parentA, parentB, seed)
}

export function absoluteShareUrl(path: string): string {
  if (typeof window === 'undefined') {
    return path
  }
  return new URL(path, window.location.origin).toString()
}
