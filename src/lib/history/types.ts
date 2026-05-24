import type { Locale } from '@/i18n/types'
import type { ResultMode } from '@/lib/wizard/flow'
import type {
  QuirkFacet,
  QuirkId,
  QuirkOrigin,
  QuirkRange,
  QuirkTier,
  QuirkType,
} from '@/types/quirk'

export interface HistoryQuirkPreview {
  id: string
  name: string
  description?: string
  origin: QuirkOrigin
  tier: QuirkTier
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
}

export interface SingleHistoryResult {
  quirk: HistoryQuirkPreview & { id: QuirkId }
}

export interface HybridHistoryResult {
  parentA: HistoryQuirkPreview & { id: QuirkId }
  parentB: HistoryQuirkPreview & { id: QuirkId }
  seed: string
  fusion: HistoryQuirkPreview | null
}

export type HistoryModeFilter = {
  quirks: boolean
  hybrids: boolean
}

export type ResultHistoryEntry = {
  id: string
  createdAt: number
  locale: Locale
  mode: ResultMode
  searchText: string
} & (
  | {
      mode: 'single'
      single: SingleHistoryResult
    }
  | {
      mode: 'hybrid'
      hybrid: HybridHistoryResult
    }
)
