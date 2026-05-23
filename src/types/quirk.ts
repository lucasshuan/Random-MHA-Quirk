export const QUIRK_ORIGINS = [
  'BNHA',
  'BNHA_VIGILANTES',
  'BNHA_TEAM_UP',
  'ORIGINAL',
] as const
export type QuirkOrigin = (typeof QUIRK_ORIGINS)[number]

/** Canonical series only (excludes fan fusions). */
export const CANONICAL_QUIRK_ORIGINS = QUIRK_ORIGINS.filter(
  (origin): origin is Exclude<QuirkOrigin, 'ORIGINAL'> => origin !== 'ORIGINAL',
)

export const QUIRK_TYPES = ['Emitter', 'Transformation', 'Mutant'] as const
export type QuirkType = (typeof QUIRK_TYPES)[number]

export const QUIRK_RANGES = [
  'Self',
  'Contact',
  'Short',
  'Medium',
  'Long',
  'Area',
] as const
export type QuirkRange = (typeof QUIRK_RANGES)[number]

/** Above S — plot/meta quirks (All For One, One For All, etc.). */
export const QUIRK_TIER_OMEGA = 'Ω' as const

/** Standard ladder on tier scale cells (S weakest playable band through D gag tier). */
export const QUIRK_DISPLAY_TIERS = ['S', 'A', 'B', 'C', 'D'] as const
export type QuirkDisplayTier = (typeof QUIRK_DISPLAY_TIERS)[number]

export const QUIRK_TIERS = [
  QUIRK_TIER_OMEGA,
  ...QUIRK_DISPLAY_TIERS,
] as const

/** Tiers enabled by default on tier-picker steps (Ω Special and D off). */
export const DEFAULT_TIER_PICKER_SELECTION = ['S', 'A', 'B', 'C'] as const satisfies readonly QuirkTier[]
export type QuirkTier = (typeof QUIRK_TIERS)[number]

export function isOmegaTier(tier: QuirkTier): tier is typeof QUIRK_TIER_OMEGA {
  return tier === QUIRK_TIER_OMEGA
}

export function tierBadgeGlyph(tier: QuirkTier): string {
  return isOmegaTier(tier) ? QUIRK_TIER_OMEGA : tier
}

export const QUIRK_FACETS = [
  'Elemental',
  'Psychic',
  'Enhancement',
  'Anthropomorphic',
  'Control',
  'Mobility',
  'Sensory',
  'Emission',
  'Biological',
  'Stockpile',
] as const
export type QuirkFacet = (typeof QUIRK_FACETS)[number]

import type { QuirkId } from './quirk-id'

export type { QuirkId }

export interface QuirkCopy {
  name: string
  description: string
}

export interface QuirkBase {
  id: QuirkId
  origin: QuirkOrigin
  tier: QuirkTier
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
  /** Primary reference URL; mainly ORIGINAL catalog entries. */
  source?: string | null
  /** Short attribution / provenance note. */
  inspiration?: string | null
}

export type Quirk = QuirkBase & QuirkCopy

export interface QuirkFilters {
  origins: QuirkOrigin[]
  tiers: QuirkTier[]
  types: QuirkType[]
  ranges: QuirkRange[]
  facets: QuirkFacet[]
  query: string
}

export const DEFAULT_QUIRK_FILTERS: QuirkFilters = {
  origins: [],
  tiers: [],
  types: [],
  ranges: [],
  facets: [],
  query: '',
}

/** Selected options in advanced filter groups (excludes search query). */
export function countAdvancedFilterSelections(
  filters: QuirkFilters,
  options?: { includeTiers?: boolean },
): number {
  return (
    filters.origins.length +
    filters.types.length +
    filters.ranges.length +
    filters.facets.length +
    (options?.includeTiers ? filters.tiers.length : 0)
  )
}
