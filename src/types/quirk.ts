export const QUIRK_ORIGINS = ['BNHA', 'BNHA_SPINOFF', 'ORIGINAL'] as const
export type QuirkOrigin = (typeof QUIRK_ORIGINS)[number]

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

export type QuirkId = string

export interface Quirk {
  id: QuirkId
  name: string
  description: string
  origin: QuirkOrigin
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
}

export interface QuirkFilters {
  origins: QuirkOrigin[]
  types: QuirkType[]
  ranges: QuirkRange[]
  facets: QuirkFacet[]
  query: string
}

export const DEFAULT_QUIRK_FILTERS: QuirkFilters = {
  origins: [],
  types: [],
  ranges: [],
  facets: [],
  query: '',
}

