import type { Locale } from '@/i18n/types'
import type { HybridRollResult } from '@/types/fusion'
import type { Quirk } from '@/types/quirk'
import { randomFusionSeed } from '@/lib/fusion/keys'
import { pickHybridPair } from '@/lib/quirks/engine'

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
