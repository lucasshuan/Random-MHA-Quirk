import type { FusionCatalogQuirk } from '../catalog'
import { analyzeParentPair } from './strategy'
import type { FusionStrategyKey } from './strategy'

/** Strategies that get one pair-aware ❌ example after the strategy line. */
const STRATEGIES_WITH_PAIR_EXAMPLE = new Set<FusionStrategyKey>([
  'synergy',
  'dominant-a',
  'dominant-b',
  'facet-anchor',
  'body-weave',
  'emission-bridge',
  'range-meet',
  'oscillation',
  'byproduct',
])

const PAIR_NEGATIVE_EXAMPLES: Record<string, string> = {
  'hardening+permeation':
    'phase through walls while fully armored at all times',
  'frog+laser':
    'tongue fires lasers and also rescues allies at full laser DPS',
  'blackwhip+creation':
    'free-form object creation and full blackwhip reach/control at once',
  'absorption-and-release+arbor':
    'absorb any hit and launch amplified wood barrages at full strength together',
}

function pairKey(idA: string, idB: string): string {
  return idA < idB ? `${idA}+${idB}` : `${idB}+${idA}`
}

function lookupPairNegativeExample(
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
): string {
  const hardcoded = PAIR_NEGATIVE_EXAMPLES[pairKey(quirkA.id, quirkB.id)]
  if (hardcoded) return hardcoded

  const ctx = analyzeParentPair(quirkA, quirkB)
  if (!ctx.sameType) {
    return `full ${ctx.typeA} output and full ${ctx.typeB} output active together with no cost`
  }
  if (ctx.rangeGapLarge) {
    return `maximum ${ctx.rangeA} reach and maximum ${ctx.rangeB} body effect at full strength together`
  }
  if (ctx.sharedFacets.length > 0) {
    return `both parents' ${ctx.sharedFacets[0]} power at full strength stapled together`
  }
  return `both parents' signature effects at peak power with no tradeoff`
}

export function formatBaseAntiMashupRule(strategyKey: FusionStrategyKey): string {
  if (strategyKey === 'synergy') {
    return 'Anti-mashup: keep one coherent mechanism with one governing loop; do not describe two independent full-strength kits running in parallel.'
  }
  if (strategyKey === 'failure-mode') {
    return 'Anti-mashup: failure-mode is reduced-potential fusion — one surviving loop at sub-parent ceiling; do not restore both signatures to full strength through synergy wording or a second free kit.'
  }
  return 'Anti-mashup: one parent supplies the main loop; the other supplies one modifier, limit, or cost.'
}

export function formatStrategyAntiMashupExample(
  strategyKey: FusionStrategyKey,
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
): string {
  if (strategyKey === 'failure-mode' || !STRATEGIES_WITH_PAIR_EXAMPLE.has(strategyKey)) {
    return ''
  }

  const example = lookupPairNegativeExample(quirkA, quirkB)
  return `Avoid this mashup for this strategy: ❌ "${example}"`
}
