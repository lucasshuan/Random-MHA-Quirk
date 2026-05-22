import type { Quirk } from '../types/quirk'
import type { HybridRollResult } from '../types/fusion'
import { lookupFusionEntry } from './fusionCache'
import { randomFusionSeed } from './fusionKey'
import { pickHybridPair } from './quirkEngine'
import type { Locale } from '../i18n/types'

export function rollHybrid(
  poolA: Quirk[],
  poolB: Quirk[],
  _locale: Locale,
  seed = randomFusionSeed(),
): HybridRollResult | null {
  const pair = pickHybridPair(poolA, poolB)
  if (!pair) {
    return null
  }

  const fusionEntry = lookupFusionEntry(pair[0].id, pair[1].id, seed)

  return {
    parents: pair,
    fusionEntry,
    seed,
  }
}
