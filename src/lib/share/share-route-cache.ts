import type { Locale } from '@/i18n/types'
import { peekQuirkById } from '@/lib/quirks/api'
import { isFusionSeed, isShareQuirkId } from '@/lib/share/paths'
import type { ResultMode } from '@/lib/wizard/flow'
import type { HybridRollResult } from '@/types/fusion'
import type { Quirk } from '@/types/quirk'
import type { QuirkId } from '@/types/quirk-id'

export type ShareRouteResult = Quirk | HybridRollResult

type LocaleResultMap = Map<Locale, ShareRouteResult>

const routeCache = new Map<string, LocaleResultMap>()

function localeMapForRoute(routeKey: string): LocaleResultMap {
  let map = routeCache.get(routeKey)
  if (!map) {
    map = new Map()
    routeCache.set(routeKey, map)
  }
  return map
}

export function getShareRouteCachedResult(
  routeKey: string,
  locale: Locale,
): ShareRouteResult | null {
  return routeCache.get(routeKey)?.get(locale) ?? null
}

export function setShareRouteCachedResult(
  routeKey: string,
  locale: Locale,
  result: ShareRouteResult,
): void {
  localeMapForRoute(routeKey).set(locale, result)
}

export function trySyncResolveShareRoute(input: {
  mode: ResultMode
  locale: Locale
  quirkId?: string
  parentA?: string
  parentB?: string
  seed?: string
}): ShareRouteResult | null {
  const { mode, locale, quirkId, parentA, parentB, seed } = input

  if (mode === 'single') {
    if (!quirkId || !isShareQuirkId(quirkId)) {
      return null
    }
    return peekQuirkById(locale, quirkId) ?? null
  }

  if (
    !parentA ||
    !parentB ||
    !seed ||
    !isShareQuirkId(parentA) ||
    !isShareQuirkId(parentB) ||
    !isFusionSeed(seed) ||
    parentA === parentB
  ) {
    return null
  }

  const first = peekQuirkById(locale, parentA)
  const second = peekQuirkById(locale, parentB)
  if (!first || !second) {
    return null
  }

  let fusionEntry: HybridRollResult['fusionEntry'] = null
  for (const entry of localeMapForRoute(`hybrid:${parentA}:${parentB}:${seed}`).values()) {
    if ('parents' in entry && entry.seed === seed && entry.fusionEntry) {
      fusionEntry = entry.fusionEntry
      break
    }
  }

  return {
    parents: [first, second],
    seed,
    fusionEntry,
  }
}

export function isShareRouteResult(
  result: ShareRouteResult | null,
  input: {
    mode: ResultMode
    quirkId?: string
    parentA?: string
    parentB?: string
    seed?: string
  },
): result is ShareRouteResult {
  if (!result) {
    return false
  }

  if (input.mode === 'single') {
    return (
      !('parents' in result) &&
      Boolean(input.quirkId) &&
      result.id === input.quirkId
    )
  }

  if (!('parents' in result)) {
    return false
  }

  return (
    Boolean(input.parentA) &&
    Boolean(input.parentB) &&
    Boolean(input.seed) &&
    result.parents[0].id === input.parentA &&
    result.parents[1].id === input.parentB &&
    result.seed === input.seed
  )
}
