import { hashSeed } from './seed-hash'
import { fusionRollKey } from './roll-key'

export type FusionUtilityNiche =
  | 'single core effect'
  | 'clear body tell'
  | 'direct trigger'
  | 'complete core effect'
  /** Legacy stored value; accepted but no longer selected for new variants. */
  | 'simple secondary detail'
  | 'one practical limit'
  | 'plain wording'

export interface FusionUtilityNudge {
  niche: FusionUtilityNiche
  line: string
}

const SELECTABLE_UTILITY_NICHES: FusionUtilityNiche[] = [
  'single core effect',
  'clear body tell',
  'direct trigger',
  'complete core effect',
  'one practical limit',
  'plain wording',
]

const UTILITY_HINTS: Record<FusionUtilityNiche, string> = {
  'single core effect':
    'center everything on one thing the quirk does; avoid stacking subsystems',
  'clear body tell':
    'show one visible activation sign in the body or posture, then move on',
  'direct trigger':
    'state activation in plain terms and avoid multi-step setup chains',
  'complete core effect':
    'stop after the core effect is clear; add another detail only when needed to explain how that same effect works',
  'simple secondary detail':
    'stop after the core effect is clear; add another detail only when needed to explain how that same effect works',
  'one practical limit':
    'use at most one limit when needed — physical cost or one clear situational scope (what it affects vs skips); omit if already weak or narrow; never list multiple limits',
  'plain wording':
    'use direct action verbs and avoid jargon unless absolutely necessary',
}

export function isFusionUtilityNiche(value: string): value is FusionUtilityNiche {
  return Object.prototype.hasOwnProperty.call(UTILITY_HINTS, value)
}

export function formatFusionUtilityNudge(niche: FusionUtilityNiche): string {
  return `Simplicity nudge for this variant: ${niche} - ${UTILITY_HINTS[niche]}. Keep the description easy to summarize in one sentence.`
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
  const niche =
    SELECTABLE_UTILITY_NICHES[hashSeed(rollKey, 'utility') % SELECTABLE_UTILITY_NICHES.length]
  return {
    niche,
    line: formatFusionUtilityNudge(niche),
  }
}
