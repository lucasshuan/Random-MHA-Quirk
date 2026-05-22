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

export const QUIRK_TIERS = ['S', 'A', 'B', 'C'] as const
export type QuirkTier = (typeof QUIRK_TIERS)[number]

export const QUIRK_FACETS = [
  'Elemental',
  'Psychic',
  'Enhancement',
  'Anthropomorphic',
  'Control',
  'Support',
  'Defense',
  'Mobility',
  'Sensory',
  'Construct',
  'Emission',
  'Biological',
] as const
export type QuirkFacet = (typeof QUIRK_FACETS)[number]

import type { QuirkId } from '../data/quirk-ids'

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

/** Selected options in advanced filter groups (excludes search query and tiers). */
export function countAdvancedFilterSelections(filters: QuirkFilters): number {
  return (
    filters.origins.length +
    filters.types.length +
    filters.ranges.length +
    filters.facets.length
  )
}

