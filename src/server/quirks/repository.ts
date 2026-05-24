import type { Locale } from '@/i18n/types'
import { LOCALES } from '@/i18n/types'
import { getSupabaseAdmin } from '@/server/db/supabase'
import type { QuirkLocalesEntry } from '@/types/quirk-list'
import {
  QUIRK_TIERS,
  type Quirk,
  type QuirkCopy,
  type QuirkFacet,
  type QuirkId,
  type QuirkOrigin,
  type QuirkRange,
  type QuirkTier,
  type QuirkType,
} from '@/types/quirk'

function parseTier(value: string): QuirkTier {
  return QUIRK_TIERS.includes(value as QuirkTier) ? (value as QuirkTier) : 'B'
}

interface QuirkRow {
  id: string
  origin: string
  tier: string
  type: string
  range: string
  facets: string[]
}

interface TranslationRow {
  quirk_id: string
  locale: string
  name: string
  description: string
}

function rowToQuirk(base: QuirkRow, translation: TranslationRow): Quirk {
  return {
    id: base.id as QuirkId,
    origin: base.origin as QuirkOrigin,
    tier: parseTier(base.tier),
    type: base.type as QuirkType,
    range: base.range as QuirkRange,
    facets: base.facets as QuirkFacet[],
    name: translation.name,
    description: translation.description,
  }
}

export async function listQuirksWithLocales(): Promise<QuirkLocalesEntry[]> {
  const supabase = getSupabaseAdmin()

  const { data: bases, error: baseError } = await supabase
    .from('quirks')
    .select('id, origin, tier, type, range, facets')
    .order('id')

  if (baseError) {
    throw new Error(`Supabase quirks list failed: ${baseError.message}`)
  }

  const { data: translations, error: translationError } = await supabase
    .from('quirk_translations')
    .select('quirk_id, locale, name, description')
    .in('locale', [...LOCALES])

  if (translationError) {
    throw new Error(`Supabase quirk translations failed: ${translationError.message}`)
  }

  const translationsByQuirk = new Map<string, Partial<Record<Locale, QuirkCopy>>>()
  for (const row of translations ?? []) {
    const typed = row as TranslationRow
    if (!isLocale(typed.locale)) continue
    const bundle = translationsByQuirk.get(typed.quirk_id) ?? {}
    bundle[typed.locale] = { name: typed.name, description: typed.description }
    translationsByQuirk.set(typed.quirk_id, bundle)
  }

  const entries: QuirkLocalesEntry[] = []
  for (const base of bases ?? []) {
    const locales = translationsByQuirk.get(base.id)
    if (!locales?.en) continue
    entries.push({
      id: base.id as QuirkId,
      origin: base.origin as QuirkOrigin,
      tier: parseTier(base.tier),
      type: base.type as QuirkType,
      range: base.range as QuirkRange,
      facets: base.facets as QuirkFacet[],
      locales,
    })
  }

  return entries
}

function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value)
}

export async function listLocalizedQuirks(locale: Locale): Promise<Quirk[]> {
  const supabase = getSupabaseAdmin()

  const { data: bases, error: baseError } = await supabase
    .from('quirks')
    .select('id, origin, tier, type, range, facets')
    .order('id')

  if (baseError) {
    throw new Error(`Supabase quirks list failed: ${baseError.message}`)
  }

  const { data: translations, error: translationError } = await supabase
    .from('quirk_translations')
    .select('quirk_id, locale, name, description')
    .eq('locale', locale)

  if (translationError) {
    throw new Error(`Supabase quirk translations failed: ${translationError.message}`)
  }

  const translationById = new Map(
    (translations ?? []).map((row) => [row.quirk_id, row as TranslationRow]),
  )

  const quirks: Quirk[] = []
  for (const base of bases ?? []) {
    const translation = translationById.get(base.id)
    if (!translation) continue
    quirks.push(rowToQuirk(base as QuirkRow, translation))
  }

  return quirks
}

export async function getLocalizedQuirkById(
  id: string,
  locale: Locale,
): Promise<Quirk | null> {
  const supabase = getSupabaseAdmin()

  const { data: base, error: baseError } = await supabase
    .from('quirks')
    .select('id, origin, tier, type, range, facets')
    .eq('id', id)
    .maybeSingle()

  if (baseError) {
    throw new Error(`Supabase quirk lookup failed: ${baseError.message}`)
  }

  if (!base) return null

  const { data: translation, error: translationError } = await supabase
    .from('quirk_translations')
    .select('quirk_id, locale, name, description')
    .eq('quirk_id', id)
    .eq('locale', locale)
    .maybeSingle()

  if (translationError) {
    throw new Error(`Supabase quirk translation failed: ${translationError.message}`)
  }

  if (!translation) return null

  return rowToQuirk(base as QuirkRow, translation as TranslationRow)
}

/** English catalog for fusion LLM prompts. */
export async function listEnglishQuirksForFusion(): Promise<Quirk[]> {
  return listLocalizedQuirks('en')
}

export async function getEnglishQuirkForFusion(id: string): Promise<Quirk | null> {
  return getLocalizedQuirkById(id, 'en')
}
