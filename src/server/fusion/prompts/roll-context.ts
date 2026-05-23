import type { FusionCatalogQuirk } from '../catalog'
import { resolveAntiMashupRuleKey } from './anti-mashup'
import type { FusionNameRegister } from './naming'
import { selectFusionNameRegister } from './naming'
import { deriveFusionOutputFromSeed, type FusionOutputRoll } from './output'
import { fusionRollKey } from './roll-key'
import { hashSeed } from './seed-hash'
import type { FusionStrategyKey } from './strategy'
import { selectFusionStrategy } from './strategy'
import type { FusionUtilityNiche } from './utility'
import { selectFusionUtilityNudge } from './utility'
import type { FusionRollMeta } from '@/types/fusion'
import type { QuirkRange, QuirkTier } from '@/types/quirk'

const TIER_ORDER: QuirkTier[] = ['S', 'A', 'B', 'C']
const TIER_SCORE: Record<QuirkTier, number> = { S: 0, A: 1, B: 2, C: 3 }

const RANGE_TIER_BIAS: Record<QuirkRange, number> = {
  Self: 0.35,
  Contact: 0.2,
  Short: 0,
  Medium: -0.1,
  Long: -0.2,
  Area: -0.3,
}

const STRATEGY_TIER_BIAS: Partial<Record<FusionStrategyKey, number>> = {
  'failure-mode': 1.2,
  byproduct: 0.45,
  oscillation: 0.25,
  synergy: -0.35,
  'dominant-a': -0.15,
  'dominant-b': -0.15,
  'facet-anchor': -0.1,
}

export interface FusionRollContext {
  outputRoll: FusionOutputRoll
  tier: QuirkTier
  roll: FusionRollMeta
}

function parentFacetHints(quirkA: FusionCatalogQuirk, quirkB: FusionCatalogQuirk): string[] {
  return [...new Set([...quirkA.facets, ...quirkB.facets])]
}

function scoreToTier(score: number): QuirkTier {
  const clamped = Math.max(0, Math.min(3, Math.round(score)))
  return TIER_ORDER[clamped] ?? 'B'
}

/** Deterministic fusion rank from parents, strategy, range, and seed. */
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
  let score = (TIER_SCORE[parentA] + TIER_SCORE[parentB]) / 2
  score += STRATEGY_TIER_BIAS[strategyKey] ?? 0
  score += RANGE_TIER_BIAS[range]
  const jitter = (hashSeed(rollKey, 'fusion-tier') % 81) / 81
  score += (jitter - 0.5) * 0.75
  return scoreToTier(score)
}

/** All deterministic prompt rolls for one fusion variant. */
export function deriveFusionRollContext(
  seed: string,
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
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
  const strategy = selectFusionStrategy(seed, quirkA, quirkB)
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
