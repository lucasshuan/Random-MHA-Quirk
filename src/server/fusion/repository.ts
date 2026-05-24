import { getQuirkById } from './catalog'
import {
  collectSiblingNames,
  isSiblingNameTaken,
  pickSiblingVariantsForPrompt,
  pickPriorVariantsForPrompt,
  MAX_PRIOR_VARIANTS_IN_PROMPT,
  MAX_SIBLING_NAMES_IN_PROMPT,
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

const FUSION_GENERATION_CLAIM_TTL_SECONDS = 120

import { QUIRK_TIERS } from '@/types/quirk'

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

export interface FusionSiblingContext {
  /** Up to MAX_PRIOR_VARIANTS_IN_PROMPT prior variants (name + description) for diversity guidance. */
  priorVariants: FusionPriorVariant[]
  /** Up to MAX_SIBLING_NAMES_IN_PROMPT English titles shown in the prompt and used for dedup. */
  takenTitles: string[]
}

async function fetchFusionRowsForParentPair(
  parentA: string,
  parentB: string,
): Promise<
  Array<{
    key: string
    seed: string
    en: { name: string; description: string }
    type: string
    range: string
    facets: string[]
    tier: string | null
    roll: FusionRollMeta | null
  }>
> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('fusion_entries')
    .select('key, seed, en, type, range, facets, tier, roll')
    .eq('parent_a', parentA)
    .eq('parent_b', parentB)

  if (error) {
    throw new Error(`Supabase list by parents failed: ${error.message}`)
  }

  return (data ?? []).map((row) => {
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
}

/** Prior siblings for prompt diversity + taken-title dedup for a parent pair. */
export async function loadFusionSiblingContext(
  parentA: string,
  parentB: string,
  options?: { excludeKey?: string },
): Promise<FusionSiblingContext> {
  const [quirkA, quirkB] = await Promise.all([
    getQuirkById(parentA),
    getQuirkById(parentB),
  ])
  if (!quirkA || !quirkB) {
    return { priorVariants: [], takenTitles: [] }
  }

  const rows = await fetchFusionRowsForParentPair(parentA, parentB)
  const excludeKey = options?.excludeKey

  return {
    priorVariants: pickSiblingVariantsForPrompt(rows, quirkA, quirkB, {
      excludeKey,
      limit: MAX_PRIOR_VARIANTS_IN_PROMPT,
    }),
    takenTitles: collectSiblingNames(rows, {
      excludeKey,
      limit: MAX_SIBLING_NAMES_IN_PROMPT,
    }),
  }
}

/** Up to MAX_PRIOR_VARIANTS_IN_PROMPT prior English variants for prompt diversity. */
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

  const rows = await fetchFusionRowsForParentPair(parentA, parentB)

  if (options.match) {
    return pickPriorVariantsForPrompt(rows, options.match, quirkA, quirkB, {
      excludeKey: options.excludeKey,
      limit: options.limit,
    })
  }

  return pickSiblingVariantsForPrompt(rows, quirkA, quirkB, {
    excludeKey: options.excludeKey,
    limit: options.limit ?? MAX_PRIOR_VARIANTS_IN_PROMPT,
  })
}

export async function findFusionByParentPairAndEnglishName(
  parentA: string,
  parentB: string,
  englishName: string,
): Promise<FusionCacheEntry | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('fusion_entries')
    .select('*')
    .eq('parent_a', parentA)
    .eq('parent_b', parentB)

  if (error) {
    throw new Error(`Supabase lookup by parent pair failed: ${error.message}`)
  }

  for (const row of data ?? []) {
    const fusionRow = row as FusionRow
    const storedName = fusionRow.en?.name?.trim()
    if (!storedName || !isSiblingNameTaken(englishName, [storedName])) continue

    const hadTier = Boolean(
      fusionRow.tier && QUIRK_TIERS.includes(fusionRow.tier as QuirkTier),
    )
    const hadRoll = parseFusionRollMeta(fusionRow.roll) !== null
    const entry = rowToEntry(fusionRow)
    return enrichFusionEntry(entry, { hadTier, hadRoll })
  }

  return null
}

export async function listAllFusionEntries(): Promise<FusionCacheEntry[]> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('fusion_entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Supabase list all fusions failed: ${error.message}`)
  }

  return (data ?? []).map((row) => rowToEntry(row as FusionRow))
}

async function findFusionRowByKey(key: string): Promise<FusionRow | null> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('fusion_entries')
    .select('*')
    .eq('key', key)
    .maybeSingle()

  if (error) {
    throw new Error(`Supabase lookup failed: ${error.message}`)
  }

  return data ? (data as FusionRow) : null
}

export async function findFusionByKey(key: string): Promise<FusionCacheEntry | null> {
  const supabase = getSupabaseAdmin()
  let row = await findFusionRowByKey(key)

  if (!row) {
    const { data: alias, error } = await supabase
      .from('fusion_entry_aliases')
      .select('entry_key')
      .eq('key', key)
      .maybeSingle()

    if (error) {
      throw new Error(`Supabase alias lookup failed: ${error.message}`)
    }

    if (alias) {
      row = await findFusionRowByKey((alias as { entry_key: string }).entry_key)
    }
  }

  if (!row) return null
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

export async function upsertFusionEntryAlias(key: string, entryKey: string): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('fusion_entry_aliases').upsert(
    { key, entry_key: entryKey },
    { onConflict: 'key' },
  )

  if (error) {
    throw new Error(`Supabase alias upsert failed: ${error.message}`)
  }
}

export async function tryClaimFusionGeneration(
  key: string,
  claimId: string,
): Promise<boolean> {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.rpc('claim_fusion_generation', {
    p_key: key,
    p_claim_id: claimId,
    p_lease_seconds: FUSION_GENERATION_CLAIM_TTL_SECONDS,
  })

  if (error) {
    throw new Error(`Supabase fusion claim failed: ${error.message}`)
  }

  return data === true
}

export async function renewFusionGenerationClaim(
  key: string,
  claimId: string,
): Promise<void> {
  const supabase = getSupabaseAdmin()
  const expiresAt = new Date(
    Date.now() + FUSION_GENERATION_CLAIM_TTL_SECONDS * 1000,
  ).toISOString()
  const { error } = await supabase
    .from('fusion_generation_claims')
    .update({ expires_at: expiresAt })
    .eq('key', key)
    .eq('claim_id', claimId)

  if (error) {
    throw new Error(`Supabase fusion claim renewal failed: ${error.message}`)
  }
}

export async function releaseFusionGenerationClaim(
  key: string,
  claimId: string,
): Promise<void> {
  const supabase = getSupabaseAdmin()
  const { error } = await supabase
    .from('fusion_generation_claims')
    .delete()
    .eq('key', key)
    .eq('claim_id', claimId)

  if (error) {
    throw new Error(`Supabase fusion claim release failed: ${error.message}`)
  }
}
