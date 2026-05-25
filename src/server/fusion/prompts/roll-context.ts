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
import type { QuirkRange, QuirkTier } from '@/types/quirk'

/** Full fusion output ladder; weights come from one parent-centered curve. */
export const FUSION_GENERATED_TIERS = [
  'Ω',
  'S',
  'A',
  'B',
  'C',
  'D',
] as const satisfies readonly QuirkTier[]

/** Parent position on the output ladder (Ω and D at the extremes). */
const PARENT_TIER_INDEX: Record<QuirkTier, number> = {
  Ω: 0,
  S: 1,
  A: 2,
  B: 3,
  C: 4,
  D: 5,
}

const RANGE_TIER_SHIFT: Record<QuirkRange, number> = {
  Self: 0.2,
  Contact: 0.1,
  Short: 0,
  Medium: -0.1,
  Long: -0.2,
  Area: -0.3,
}

const STRATEGY_TIER_SHIFT: Partial<Record<FusionStrategyKey, number>> = {
  /** Positive shifts favor weaker bands; failure-mode should often land below its parents. */
  'failure-mode': 0.75,
  byproduct: 0.25,
  oscillation: 0.2,
  'dominant-a': -0.1,
  'dominant-b': -0.1,
  'facet-anchor': -0.1,
  synergy: -0.08,
}

/**
 * Steep bell: high peak, quadratic distance falloff, readable tail floor.
 * Tails stay well above 1 but dominate far less than center tiers.
 */
const TIER_WEIGHT_AT_CENTER = 720
const TIER_DISTANCE_PENALTY = 52
const TIER_MIN_WEIGHT = 14
/**
 * Slightly favor tiers on the parent-strong side of the curve; trim middle spill
 * (A/B when parents are strong, Ω/S when weak) without crushing far C/D tails.
 */
const TIER_STRONGER_SIDE_MULTIPLIER = 0.72
const TIER_MIDDLE_SPILL_MULTIPLIER = 1.38
const TIER_MIDDLE_SPILL_MIN_DISTANCE = 1.05
const TIER_MIDDLE_SPILL_MAX_DISTANCE = 3.25
const LADDER_MIDPOINT_INDEX = 2.5
const LADDER_MAX_INDEX = FUSION_GENERATED_TIERS.length - 1
/** Parent blend offset from the Ω end; D end uses the mirror (5 − offset). */
const EXTREME_SAME_TIER_BLEND_OFFSET = 0.25
/** Ω/D output weight when no parent carries that extreme tier. */
const TIER_EXTREME_UNLICENSED_SCALE = 0.2
/** How much a non-matching parent pulls licensed extreme weight toward the floor. */
const TIER_EXTREME_PARTIAL_BLEND = 0.55

export interface FusionRollContext {
  outputRoll: FusionOutputRoll
  tier: QuirkTier
  roll: FusionRollMeta
}

function parentFacetHints(quirkA: FusionCatalogQuirk, quirkB: FusionCatalogQuirk): string[] {
  return [...new Set([...quirkA.facets, ...quirkB.facets])]
}

function clampTierCenter(value: number): number {
  return Math.max(0, Math.min(FUSION_GENERATED_TIERS.length - 1, value))
}

/** Parent midpoint on the output ladder before strategy/range shifts. */
export function resolveParentBlendCenter(
  parentA: QuirkTier,
  parentB: QuirkTier,
): number {
  const indexA = PARENT_TIER_INDEX[parentA]
  const indexB = PARENT_TIER_INDEX[parentB]

  if (parentA === parentB) {
    if (parentA === 'Ω') return EXTREME_SAME_TIER_BLEND_OFFSET
    if (parentA === 'D') return LADDER_MAX_INDEX - EXTREME_SAME_TIER_BLEND_OFFSET
    return indexA
  }

  return (indexA + indexB) / 2
}

function resolveExtremeSameTierTargetCenter(
  strategyKey: FusionStrategyKey,
  range: QuirkRange,
): number {
  return clampTierCenter(
    EXTREME_SAME_TIER_BLEND_OFFSET +
      (STRATEGY_TIER_SHIFT[strategyKey] ?? 0) +
      RANGE_TIER_SHIFT[range],
  )
}

/** Bell-curve center from parents, strategy, and range — no separate rare-tier add-ons. */
export function resolveFusionTierTargetCenter(
  parentA: QuirkTier,
  parentB: QuirkTier,
  strategyKey: FusionStrategyKey,
  range: QuirkRange,
): number {
  if (parentA === parentB && parentA === 'Ω') {
    return resolveExtremeSameTierTargetCenter(strategyKey, range)
  }

  if (parentA === parentB && parentA === 'D') {
    return clampTierCenter(
      LADDER_MAX_INDEX - resolveExtremeSameTierTargetCenter(strategyKey, range),
    )
  }

  return clampTierCenter(
    resolveParentBlendCenter(parentA, parentB) +
      (STRATEGY_TIER_SHIFT[strategyKey] ?? 0) +
      RANGE_TIER_SHIFT[range],
  )
}

/** Ω and D stay prominent only when a parent actually has that tier. */
function resolveLicensedExtremeScale(
  tier: 'Ω' | 'D',
  parentA: QuirkTier,
  parentB: QuirkTier,
): number {
  const extremeIndex = PARENT_TIER_INDEX[tier]
  const indexA = PARENT_TIER_INDEX[parentA]
  const indexB = PARENT_TIER_INDEX[parentB]
  const hasExtremeParent = indexA === extremeIndex || indexB === extremeIndex

  if (!hasExtremeParent) {
    return TIER_EXTREME_UNLICENSED_SCALE
  }

  if (indexA === extremeIndex && indexB === extremeIndex) {
    return 1
  }

  const partnerIndex = indexA === extremeIndex ? indexB : indexA
  const span = FUSION_GENERATED_TIERS.length - 1
  const partnerDistance = Math.abs(partnerIndex - extremeIndex)
  const affinity = 1 - (partnerDistance / span) * TIER_EXTREME_PARTIAL_BLEND

  return Math.max(TIER_EXTREME_UNLICENSED_SCALE, affinity)
}

/**
 * Opposite-tail floor scales with parent position and tier distance from parents.
 * Strong parents → lower D/weak-side floors; weak parents → lower Ω/strong-side floors.
 */
function tierMinWeight(index: number, parentBlendCenter: number): number {
  const ladderSpan = FUSION_GENERATED_TIERS.length - 1

  if (parentBlendCenter < LADDER_MIDPOINT_INDEX) {
    if (index <= parentBlendCenter) {
      return TIER_MIN_WEIGHT
    }

    const parentFactor = parentBlendCenter / LADDER_MIDPOINT_INDEX
    const tierFactor =
      (index - parentBlendCenter) / (ladderSpan - parentBlendCenter)

    return Math.max(
      1,
      Math.round(TIER_MIN_WEIGHT * parentFactor * tierFactor * tierFactor),
    )
  }

  if (index >= parentBlendCenter) {
    return TIER_MIN_WEIGHT
  }

  const parentFactor =
    (ladderSpan - parentBlendCenter) / LADDER_MIDPOINT_INDEX
  const tierFactor = (parentBlendCenter - index) / parentBlendCenter

  return Math.max(
    1,
    Math.round(TIER_MIN_WEIGHT * parentFactor * tierFactor * tierFactor),
  )
}

/** Scale only excess above the floor so opposite-tail ordering stays monotonic. */
function applyLicensedExtremeWeight(
  weight: number,
  tier: QuirkTier,
  floor: number,
  parentA: QuirkTier,
  parentB: QuirkTier,
): number {
  if (tier !== 'Ω' && tier !== 'D') {
    return weight
  }

  const scale = resolveLicensedExtremeScale(tier, parentA, parentB)
  if (scale >= 1) {
    return weight
  }

  return Math.max(1, floor + Math.round((weight - floor) * scale))
}

function tierWeightAtIndex(
  index: number,
  tier: QuirkTier,
  targetCenter: number,
  parentBlendCenter: number,
  parentA: QuirkTier,
  parentB: QuirkTier,
): number {
  const distance = Math.abs(index - targetCenter)
  const towardWeakerOutput =
    parentBlendCenter < LADDER_MIDPOINT_INDEX
      ? index > targetCenter
      : index < targetCenter
  const inMiddleSpill =
    distance >= TIER_MIDDLE_SPILL_MIN_DISTANCE &&
    distance <= TIER_MIDDLE_SPILL_MAX_DISTANCE
  const penaltyScale =
    towardWeakerOutput && inMiddleSpill
      ? TIER_MIDDLE_SPILL_MULTIPLIER
      : towardWeakerOutput
        ? 1
        : TIER_STRONGER_SIDE_MULTIPLIER

  const floor = tierMinWeight(index, parentBlendCenter, parentA, parentB)
  const curve = Math.round(
    TIER_WEIGHT_AT_CENTER -
      TIER_DISTANCE_PENALTY * penaltyScale * distance * distance,
  )

  return applyLicensedExtremeWeight(
    Math.max(floor, curve),
    tier,
    floor,
    parentA,
    parentB,
  )
}

export function buildFusionTierWeights(
  parentA: QuirkTier,
  parentB: QuirkTier,
  strategyKey: FusionStrategyKey,
  range: QuirkRange,
): Array<{ tier: QuirkTier; weight: number }> {
  const parentBlendCenter = resolveParentBlendCenter(parentA, parentB)
  const targetCenter = resolveFusionTierTargetCenter(
    parentA,
    parentB,
    strategyKey,
    range,
  )

  return FUSION_GENERATED_TIERS.map((tier, index) => ({
    tier,
    weight: tierWeightAtIndex(
      index,
      tier,
      targetCenter,
      parentBlendCenter,
      parentA,
      parentB,
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
): QuirkTier {
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
