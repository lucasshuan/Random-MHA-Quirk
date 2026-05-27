import type { FusionCatalogQuirk } from '../catalog'
import { analyzeParentPair } from './strategy'
import type { FusionStrategyKey } from './strategy'

export const FUSION_ANTI_MASHUP_RULE_KEYS = [
  'coherent-loop',
  'failure-reduced',
  'modifier-cost',
] as const

export type FusionAntiMashupRuleKey = (typeof FUSION_ANTI_MASHUP_RULE_KEYS)[number]

const ANTI_MASHUP_RULE_TEXT: Record<FusionAntiMashupRuleKey, string> = {
  'coherent-loop':
    'Anti-mashup: do not list both parents as separate powers. Resolve them into one inherited concept with one clear rule.',
  'failure-reduced':
    'Anti-mashup: failure-mode should feel like an imperfect inheritance — a damaged, narrower, unstable, or partial concept descended from both parents.',
  'modifier-cost':
    'Anti-mashup: one parent should lead the concept while the other reshapes how it appears, behaves, fails, or is limited.',
}

/** Strategies that get one pair-aware ❌ example after the strategy line. */
const STRATEGIES_WITH_PAIR_EXAMPLE = new Set<FusionStrategyKey>([
  'synergy',
  'dominant-a',
  'dominant-b',
])

const GENERAL_NEGATIVE_EXAMPLES = [
  'Hardening + Permeation -> turns fully armored and phases through anything as two separate powers',
  'Frog + Laser -> has frog traits plus a normal laser attack with no shared concept',
  'Blackwhip + Creation -> creates objects and controls black tendrils as unrelated abilities',
  'Absorption and Release + Arbor -> absorbs attacks and fires full-power wood barrages as separate effects',
] as const

const PAIR_SPECIFIC_NEGATIVE_EXAMPLES: Record<string, string> = {
  'hardening+permeation':
    'turns fully armored and phases through anything as two separate powers',
  'frog+laser':
    'has frog traits plus a normal laser attack with no shared concept',
  'blackwhip+creation':
    'creates objects and controls black tendrils as unrelated abilities',
  'absorption-and-release+arbor':
    'absorbs attacks and fires full-power wood barrages as separate effects',
}

function pairKey(idA: string, idB: string): string {
  return idA < idB ? `${idA}+${idB}` : `${idB}+${idA}`
}

function lookupPairNegativeExample(
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
): string {
  const hardcoded = PAIR_SPECIFIC_NEGATIVE_EXAMPLES[pairKey(quirkA.id, quirkB.id)]
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
  return `both parents' signature effects at peak power with no tradeoff, or one parent's signature effect unchanged with a fresh name or analogy`
}

export function isFusionAntiMashupRuleKey(
  value: string,
): value is FusionAntiMashupRuleKey {
  return (FUSION_ANTI_MASHUP_RULE_KEYS as readonly string[]).includes(value)
}

/** Deterministic anti-mashup rule key from the fusion strategy. */
export function resolveAntiMashupRuleKey(
  strategyKey: FusionStrategyKey,
): FusionAntiMashupRuleKey {
  if (strategyKey === 'synergy') return 'coherent-loop'
  if (strategyKey === 'failure-mode') return 'failure-reduced'
  return 'modifier-cost'
}

export function formatBaseAntiMashupRule(
  ruleKey: FusionAntiMashupRuleKey,
): string {
  return ANTI_MASHUP_RULE_TEXT[ruleKey]
}

export function formatStrategyAntiMashupExample(
  strategyKey: FusionStrategyKey,
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
): string {
  if (strategyKey === 'failure-mode' || !STRATEGIES_WITH_PAIR_EXAMPLE.has(strategyKey)) {
    return ''
  }

  const pairExample = lookupPairNegativeExample(quirkA, quirkB)

  return `Bad mashup examples to avoid:
${GENERAL_NEGATIVE_EXAMPLES.map((example) => `- ❌ ${example}`).join('\n')}

Bad mashup for this specific fusion:
- ❌ ${pairExample}`
}
