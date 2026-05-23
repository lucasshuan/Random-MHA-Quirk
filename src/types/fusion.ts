import type {
  Quirk,
  QuirkFacet,
  QuirkId,
  QuirkOrigin,
  QuirkRange,
  QuirkTier,
  QuirkType,
} from './quirk'
import type { Locale } from '../i18n/types'

export interface FusionCopy {
  name: string
  description: string
}

/** Prior English variant for the same parent pair — fed into fusion prompts for diversity. */
export interface FusionPriorVariant {
  name: string
  description: string
  /** Stored when available so later siblings can avoid repeating the same strategy. */
  roll?: FusionRollMeta
}

/** Deterministic prompt rolls persisted with each fusion entry. */
export interface FusionRollMeta {
  strategyKey: string
  nameRegister: string
  utilityNiche: string
  antiMashupRuleKey: string
}

export interface FusionCacheEntry {
  key: string
  parents: [QuirkId, QuirkId]
  seed: string
  en: FusionCopy
  'pt-BR': FusionCopy
  es: FusionCopy
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
  origin: QuirkOrigin
  tier: QuirkTier
  roll: FusionRollMeta
}

export interface FusionCacheFile {
  version: 1
  entries: FusionCacheEntry[]
}

/** Fusão exibida no app. */
export interface FusionQuirk {
  id: string
  parents: [QuirkId, QuirkId]
  seed: string
  origin: QuirkOrigin
  tier: QuirkTier
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
  roll: FusionRollMeta
  name: string
  description: string
}

export interface HybridRollResult {
  parents: [Quirk, Quirk]
  /** Entrada multilíngue; texto exibido é resolvido pelo locale ativo. */
  fusionEntry: FusionCacheEntry | null
  seed: string
}

export function fusionCopyForLocale(
  entry: FusionCacheEntry,
  locale: Locale,
): FusionCopy {
  return entry[locale]
}
