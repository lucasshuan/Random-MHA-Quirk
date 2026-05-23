import { hashSeed } from './seed-hash'
import { fusionRollKey } from './roll-key'

export type FusionUtilityNiche =
  | 'containment'
  | 'repositioning'
  | 'ally aid'
  | 'burst damage'
  | 'hazard setup'
  | 'self-sacrifice specialist'

export interface FusionUtilityNudge {
  niche: FusionUtilityNiche
  line: string
}

const UTILITY_NICHES: FusionUtilityNiche[] = [
  'containment',
  'repositioning',
  'ally aid',
  'burst damage',
  'hazard setup',
  'self-sacrifice specialist',
]

const UTILITY_HINTS: Record<FusionUtilityNiche, string> = {
  containment:
    'zone control, trapping, slowing, or denying space — not raw DPS',
  repositioning:
    'movement, escape, approach angles, or tempo shifts — not stationary blasting',
  'ally aid':
    'supporting teammates, setup, or protection — not solo carry power',
  'burst damage':
    'short explosive payoff with clear downtime — not always-on superiority',
  'hazard setup':
    'lingering terrain, traps, or environmental pressure — not direct hitscan spam',
  'self-sacrifice specialist':
    'high payoff only when the user accepts real self-risk or awkward limits',
}

function resolveRollKey(seed: string, parentA?: string, parentB?: string): string {
  return fusionRollKey(seed, parentA, parentB)
}

export function selectFusionUtilityNudge(
  seed: string,
  parentA?: string,
  parentB?: string,
): FusionUtilityNudge {
  const rollKey = resolveRollKey(seed, parentA, parentB)
  const niche = UTILITY_NICHES[hashSeed(rollKey, 'utility') % UTILITY_NICHES.length]
  return {
    niche,
    line: `Primary niche this variant: ${niche} — ${UTILITY_HINTS[niche]}. Let this niche shape the main fantasy; do not default to a generic all-purpose blaster.`,
  }
}
