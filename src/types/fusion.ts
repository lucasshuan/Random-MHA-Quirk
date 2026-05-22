import type {
  Quirk,
  QuirkFacet,
  QuirkId,
  QuirkOrigin,
  QuirkRange,
  QuirkType,
} from './quirk'
import type { Locale } from '../i18n/types'

export interface FusionCopy {
  name: string
  description: string
}

export interface FusionCacheEntry {
  key: string
  parents: [QuirkId, QuirkId]
  seed: string
  en: FusionCopy
  'pt-BR': FusionCopy
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
  origin: QuirkOrigin
}

export interface FusionCacheFile {
  version: 1
  entries: FusionCacheEntry[]
}

/** Fusão exibida no app (sem tier). */
export interface FusionQuirk {
  id: string
  parents: [QuirkId, QuirkId]
  seed: string
  origin: QuirkOrigin
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
  name: string
  description: string
}

export interface HybridRollResult {
  parents: [Quirk, Quirk]
  /** Entrada bilíngue; texto exibido é resolvido pelo locale ativo. */
  fusionEntry: FusionCacheEntry | null
  seed: string
}

export function fusionCopyForLocale(
  entry: FusionCacheEntry,
  locale: Locale,
): FusionCopy {
  return entry[locale]
}
