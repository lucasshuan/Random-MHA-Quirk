import { hashSeed } from './seed-hash'
import { fusionRollKey } from './roll-key'

export type FusionUtilityNiche =
  | 'single core effect'
  | 'clear body tell'
  | 'direct trigger'
  | 'simple secondary detail'
  | 'one practical limit'
  | 'plain wording'

export interface FusionUtilityNudge {
  niche: FusionUtilityNiche
  line: string
}

const UTILITY_NICHES: FusionUtilityNiche[] = [
  'single core effect',
  'clear body tell',
  'direct trigger',
  'simple secondary detail',
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
  'simple secondary detail':
    'allow one optional extra detail only if it clearly comes from the same mechanism',
  'one practical limit':
    'use at most one limit when needed — physical cost or one clear situational scope (what it affects vs skips); omit if already weak or narrow; never list multiple limits',
  'plain wording':
    'use direct action verbs and avoid jargon unless absolutely necessary',
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
    line: `Simplicity nudge for this variant: ${niche} — ${UTILITY_HINTS[niche]}. Keep the description easy to summarize in one sentence.`,
  }
}
