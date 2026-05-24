import type { FusionCatalogQuirk } from '../catalog'
import { resolveAntiMashupRuleKey } from './anti-mashup'
import type { FusionNameRegister } from './naming'
import { selectFusionNameRegister } from './naming'
import { deriveFusionOutputFromSeed, type FusionOutputRoll } from './output'
import { fusionRollKey } from './roll-key'
import { pickWeightedFromHash } from './seed-hash'
import type { FusionStrategyKey } from './strategy'
import { selectFusionStrategy } from './strategy'
import type { FusionUtilityNiche } from './utility'
import { selectFusionUtilityNudge } from './utility'
import type { FusionPriorVariant, FusionRollMeta } from '@/types/fusion'
import type { QuirkDisplayTier, QuirkRange, QuirkTier } from '@/types/quirk'

/** Generated bands only; parent Ω is weighted as S and parent D is weighted as C. */
export const FUSION_GENERATED_TIERS = [
  'S',
  'A',
  'B',
  'C',
] as const satisfies readonly QuirkDisplayTier[]
const PARENT_TIER_INDEX: Record<QuirkTier, number> = {
  Ω: 0,
  S: 0,
  A: 1,
  B: 2,
  C: 3,
  D: 3,
}

const RANGE_TIER_SHIFT: Record<QuirkRange, number> = {
  Self: 0.35,
  Contact: 0.2,
  Short: 0,
  Medium: -0.1,
  Long: -0.2,
  Area: -0.3,
}

const STRATEGY_TIER_SHIFT: Partial<Record<FusionStrategyKey, number>> = {
  /** Positive shifts favor weaker bands; failure-mode should often land below its parents. */
  'failure-mode': 0.85,
  byproduct: 0.3,
  oscillation: 0.2,
  synergy: -0.15,
  'dominant-a': -0.1,
  'dominant-b': -0.1,
  'facet-anchor': -0.1,
}
const TIER_WEIGHT_AT_CENTER = 50
const TIER_DISTANCE_PENALTY = 18
const TIER_MIN_WEIGHT = 2

export interface FusionRollContext {
  outputRoll: FusionOutputRoll
  tier: QuirkDisplayTier
  roll: FusionRollMeta
}

function parentFacetHints(quirkA: FusionCatalogQuirk, quirkB: FusionCatalogQuirk): string[] {
  return [...new Set([...quirkA.facets, ...quirkB.facets])]
}

function clampTierCenter(value: number): number {
  return Math.max(0, Math.min(FUSION_GENERATED_TIERS.length - 1, value))
}

export function buildFusionTierWeights(
  parentA: QuirkTier,
  parentB: QuirkTier,
  strategyKey: FusionStrategyKey,
  range: QuirkRange,
): Array<{ tier: QuirkDisplayTier; weight: number }> {
  const parentCenter =
    (PARENT_TIER_INDEX[parentA] + PARENT_TIER_INDEX[parentB]) / 2
  const targetCenter = clampTierCenter(
    parentCenter +
      (STRATEGY_TIER_SHIFT[strategyKey] ?? 0) +
      RANGE_TIER_SHIFT[range],
  )

  return FUSION_GENERATED_TIERS.map((tier, index) => ({
    tier,
    weight: Math.max(
      TIER_MIN_WEIGHT,
      Math.round(
        TIER_WEIGHT_AT_CENTER -
          Math.abs(index - targetCenter) * TIER_DISTANCE_PENALTY,
      ),
    ),
  }))
}

/** Deterministic weighted fusion tier from normalized parents, strategy, range, and seed. */
export function deriveFusionTier(
  seed: string,
  parentA: QuirkTier,
  parentB: QuirkTier,
  strategyKey: FusionStrategyKey,
  range: QuirkRange,
  parentAId: string,
  parentBId: string,
): QuirkDisplayTier {
  const rollKey = fusionRollKey(seed, parentAId, parentBId)
  const weights = buildFusionTierWeights(parentA, parentB, strategyKey, range)
  return pickWeightedFromHash(rollKey, 'fusion-tier', weights).tier
}

/** All deterministic prompt rolls for one fusion variant. */
export function deriveFusionRollContext(
  seed: string,
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
  priorVariants: FusionPriorVariant[] = [],
): FusionRollContext {
  const outputRoll = deriveFusionOutputFromSeed(
    seed,
    quirkA.id,
    quirkB.id,
    parentFacetHints(quirkA, quirkB),
    {
      types: [quirkA.type, quirkB.type],
      ranges: [quirkA.range, quirkB.range],
    },
  )
  const strategy = selectFusionStrategy(seed, quirkA, quirkB, {
    priorStrategyKeys: priorVariants
      .map((variant) => variant.roll?.strategyKey)
      .filter((key): key is string => Boolean(key)),
  })
  const nameRegister = selectFusionNameRegister(seed, quirkA.id, quirkB.id)
  const utility = selectFusionUtilityNudge(seed, quirkA.id, quirkB.id)
  const antiMashupRuleKey = resolveAntiMashupRuleKey(strategy.key)
  const tier = deriveFusionTier(
    seed,
    quirkA.tier,
    quirkB.tier,
    strategy.key,
    outputRoll.range,
    quirkA.id,
    quirkB.id,
  )

  return {
    outputRoll,
    tier,
    roll: {
      strategyKey: strategy.key,
      nameRegister: nameRegister.key,
      utilityNiche: utility.niche,
      antiMashupRuleKey,
    },
  }
}

export type { FusionNameRegister, FusionStrategyKey, FusionUtilityNiche }
