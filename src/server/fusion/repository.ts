import type { FusionCacheEntry } from '@/types/fusion'
import type { QuirkFacet, QuirkOrigin, QuirkRange, QuirkType } from '@/types/quirk'
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
}

function rowToEntry(row: FusionRow): FusionCacheEntry {
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
  }
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
  return rowToEntry(data as FusionRow)
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
