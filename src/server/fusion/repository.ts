import { getQuirkById } from './catalog'
import {
  pickSiblingVariantsForPrompt,
  pickPriorVariantsForPrompt,
  type FusionPriorVariantMatch,
} from './prior-variants'
import { deriveFusionRollContext } from './prompts/roll-context'
import { parseFusionRollMeta } from './roll-meta'
import type { FusionCacheEntry, FusionPriorVariant, FusionRollMeta } from '@/types/fusion'
import type { QuirkFacet, QuirkOrigin, QuirkRange, QuirkTier, QuirkType } from '@/types/quirk'
import { getSupabaseAdmin } from '@/server/db/supabase'

interface FusionRow {
  key: string
  parent_a: string
  parent_b: string
  seed: string
  en: { name: string; description: string }
  pt_br: { name: string; description: string }
  es: { name: string; description: string }
  type: string
  range: string
  facets: string[]
  origin: string
  tier: string | null
  roll: FusionRollMeta | null
}

const QUIRK_TIERS = ['S', 'A', 'B', 'C'] as const

const DEFAULT_ROLL: FusionRollMeta = {
  strategyKey: 'synergy',
  nameRegister: 'blunt',
  utilityNiche: 'plain wording',
  antiMashupRuleKey: 'coherent-loop',
}

function rowToEntry(row: FusionRow): FusionCacheEntry {
  const tier =
    row.tier && QUIRK_TIERS.includes(row.tier as QuirkTier)
      ? (row.tier as QuirkTier)
      : 'B'
  const roll = parseFusionRollMeta(row.roll) ?? DEFAULT_ROLL

  return {
    key: row.key,
    parents: [row.parent_a, row.parent_b] as FusionCacheEntry['parents'],
    seed: row.seed,
    en: row.en,
    'pt-BR': row.pt_br,
    es: row.es,
    type: row.type as QuirkType,
    range: row.range as QuirkRange,
    facets: row.facets as QuirkFacet[],
    origin: row.origin as QuirkOrigin,
    tier,
    roll,
  }
}

async function enrichFusionEntry(
  entry: FusionCacheEntry,
  stored: { hadTier: boolean; hadRoll: boolean },
): Promise<FusionCacheEntry> {
  if (stored.hadTier && stored.hadRoll) {
    return entry
  }

  const [quirkA, quirkB] = await Promise.all([
    getQuirkById(entry.parents[0]),
    getQuirkById(entry.parents[1]),
  ])
  if (!quirkA || !quirkB) {
    return entry
  }

  const ctx = deriveFusionRollContext(entry.seed, quirkA, quirkB)
  return {
    ...entry,
    tier: stored.hadTier ? entry.tier : ctx.tier,
    roll: stored.hadRoll ? entry.roll : ctx.roll,
  }
}

function entryToRow(entry: FusionCacheEntry): FusionRow {
  return {
    key: entry.key,
    parent_a: entry.parents[0],
    parent_b: entry.parents[1],
    seed: entry.seed,
    en: entry.en,
    pt_br: entry['pt-BR'],
    es: entry.es,
    type: entry.type,
    range: entry.range,
    facets: entry.facets,
    origin: entry.origin,
    tier: entry.tier,
    roll: entry.roll,
  }
}

export type { FusionPriorVariantMatch }

/** Up to 3 prior English variants closest to the target roll (for prompt diversity). */
export async function listFusionPriorVariantsForParentPair(
  parentA: string,
  parentB: string,
  options: {
    excludeKey?: string
    match?: FusionPriorVariantMatch
    limit?: number
  },
): Promise<FusionPriorVariant[]> {
  const [quirkA, quirkB] = await Promise.all([
    getQuirkById(parentA),
    getQuirkById(parentB),
  ])
  if (!quirkA || !quirkB) {
    return []
  }

  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('fusion_entries')
    .select('key, seed, en, type, range, facets, tier, roll')
    .eq('parent_a', parentA)
    .eq('parent_b', parentB)

  if (error) {
    throw new Error(`Supabase list by parents failed: ${error.message}`)
  }

  const rows = (data ?? []).map((row) => {
    const fusionRow = row as FusionRow
    return {
      key: fusionRow.key,
      seed: fusionRow.seed,
      en: fusionRow.en,
      type: fusionRow.type,
      range: fusionRow.range,
      facets: fusionRow.facets,
      tier: fusionRow.tier,
      roll: parseFusionRollMeta(fusionRow.roll),
    }
  })

  if (options.match) {
    return pickPriorVariantsForPrompt(rows, options.match, quirkA, quirkB, {
      excludeKey: options.excludeKey,
      limit: options.limit,
    })
  }

  return pickSiblingVariantsForPrompt(rows, quirkA, quirkB, {
    excludeKey: options.excludeKey,
    limit: options.limit,
  })
}

export async function findFusionByKey(key: string): Promise<FusionCacheEntry | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('fusion_entries')
    .select('*')
    .eq('key', key)
    .maybeSingle()

  if (error) {
    throw new Error(`Supabase lookup failed: ${error.message}`)
  }

  if (!data) return null
  const row = data as FusionRow
  const hadTier = Boolean(row.tier && QUIRK_TIERS.includes(row.tier as QuirkTier))
  const hadRoll = parseFusionRollMeta(row.roll) !== null
  const entry = rowToEntry(row)
  return enrichFusionEntry(entry, { hadTier, hadRoll })
}

export async function upsertFusionEntry(entry: FusionCacheEntry): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('fusion_entries').upsert(entryToRow(entry), {
    onConflict: 'key',
  })

  if (error) {
    throw new Error(`Supabase upsert failed: ${error.message}`)
  }
}
