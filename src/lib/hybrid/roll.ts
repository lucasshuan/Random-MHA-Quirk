import type { Quirk } from '../types/quirk'
import type { HybridRollResult } from '../types/fusion'
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

  return {
    parents: pair,
    fusionEntry: null,
    seed,
  }
}
