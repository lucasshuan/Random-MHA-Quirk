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

import type { QuirkId } from '../data/quirk-ids'

export type { QuirkId }

export interface QuirkCopy {
  name: string
  description: string
}

export interface QuirkBase {
  id: QuirkId
  origin: QuirkOrigin
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
}

export type Quirk = QuirkBase & QuirkCopy

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

