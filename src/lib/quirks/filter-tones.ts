import type { QuirkTier, QuirkType } from '@/types/quirk'

export const TYPE_FILTER_TONE_CLASS: Record<QuirkType, string> = {
  Emitter: 'filter-toggle-tone-emitter',
  Transformation: 'filter-toggle-tone-transformation',
  Mutant: 'filter-toggle-tone-mutant',
}

export const TIER_FILTER_TONE_CLASS: Record<QuirkTier, string> = {
  Ω: 'filter-toggle-tone-tier-omega',
  S: 'filter-toggle-tone-tier-s',
  A: 'filter-toggle-tone-tier-a',
  B: 'filter-toggle-tone-tier-b',
  C: 'filter-toggle-tone-tier-c',
  D: 'filter-toggle-tone-tier-d',
}
