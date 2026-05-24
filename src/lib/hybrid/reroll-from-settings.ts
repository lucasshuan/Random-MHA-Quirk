import type { Locale } from '@/i18n/types'
import { randomFusionSeed } from '@/lib/fusion/keys'
import { rollHybrid } from '@/lib/hybrid/roll'
import { applyFilters, pickRandom } from '@/lib/quirks/engine'
import type { HybridRollSessionSettings } from '@/lib/wizard/hybrid-roll-session'
import type { HybridRollResult } from '@/types/fusion'
import type { Quirk } from '@/types/quirk'
import type { QuirkId } from '@/types/quirk-id'

export function rerollHybridFromSettings(
  allQuirks: Quirk[],
  settings: HybridRollSessionSettings,
  locale: Locale,
  options?: { searchableText?: (quirk: Quirk) => string },
): HybridRollResult | null {
  const poolA = applyFilters(allQuirks, settings.slotFilters[0], options)
  const poolB = applyFilters(allQuirks, settings.slotFilters[1], options)

  const resolveParent = (id: QuirkId | null, pool: Quirk[]): Quirk | null => {
    if (id) {
      return allQuirks.find((quirk) => quirk.id === id) ?? null
    }
    return pickRandom(pool)
  }

  const firstParent = resolveParent(settings.manualParentIds[0], poolA)
  const secondParent = resolveParent(settings.manualParentIds[1], poolB)

  if (firstParent && secondParent) {
    return {
      parents: [firstParent, secondParent],
      seed: randomFusionSeed(),
      fusionEntry: null,
    }
  }

  return rollHybrid(poolA, poolB, locale)
}
