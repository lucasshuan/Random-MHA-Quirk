/**
 * Seeds ORIGINAL quirks from tools/catalog/data/originals.json into Supabase.
 *
 * Usage:
 *   pnpm quirks:seed-originals
 */
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { buildQuirkSearchText } from '../../src/i18n/quirkSearchText'
import { LOCALES, type Locale } from '../../src/i18n/types'
import { loadEnv } from '../../src/server/env/load'
import type { FusionTranslationLocale } from '../../src/server/fusion/constants'
import { FUSION_TRANSLATION_LOCALES } from '../../src/server/fusion/constants'
import type { QuirkCopy } from '../../src/types/quirk'
import type {
  QuirkFacet,
  QuirkOrigin,
  QuirkRange,
  QuirkTier,
  QuirkType,
} from '../../src/types/quirk'
import { getProjectRoot } from '../_shared/root'

const root = getProjectRoot()
const ORIGINALS_PATH = join(root, 'tools/catalog/data/originals.json')

const SEED_LOCALES = LOCALES

interface OriginalSeedRow {
  id: string
  origin: QuirkOrigin
  tier: QuirkTier
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
  source: string | null
  inspiration: string | null
  name: string
  description: string
  copy?: Partial<Record<FusionTranslationLocale, QuirkCopy>>
}

function loadOriginals(): OriginalSeedRow[] {
  const raw = readFileSync(ORIGINALS_PATH, 'utf8')
  const rows = JSON.parse(raw) as OriginalSeedRow[]
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`No rows in ${ORIGINALS_PATH}`)
  }
  return rows
}

function resolveCopy(row: OriginalSeedRow, locale: Locale): QuirkCopy {
  if (locale === 'en') {
    return { name: row.name, description: row.description }
  }

  const copy = row.copy?.[locale]
  if (!copy?.name || !copy?.description) {
    throw new Error(
      `Missing ${locale} copy for original "${row.id}". Run: pnpm quirks:translate-originals`,
    )
  }

  return copy
}

function assertTranslations(rows: OriginalSeedRow[]): void {
  const missing: string[] = []

  for (const row of rows) {
    for (const locale of FUSION_TRANSLATION_LOCALES) {
      if (!row.copy?.[locale]?.name || !row.copy?.[locale]?.description) {
        missing.push(`${row.id} (${locale})`)
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Incomplete originals translations: ${missing.join(', ')}. Run: pnpm quirks:translate-originals`,
    )
  }
}

async function main() {
  loadEnv(root)

  const url = process.env.SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env')
  }

  const rows = loadOriginals()
  assertTranslations(rows)

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const quirkRows = rows.map((row) => ({
    id: row.id,
    origin: row.origin,
    tier: row.tier,
    type: row.type,
    range: row.range,
    facets: row.facets,
    source: row.source,
    inspiration: row.inspiration,
  }))

  const { error: quirkError } = await supabase.from('quirks').upsert(quirkRows, {
    onConflict: 'id',
  })
  if (quirkError) {
    throw new Error(`Seed quirks failed: ${quirkError.message}`)
  }

  const translationRows = SEED_LOCALES.flatMap((locale) =>
    rows.map((row) => {
      const { name, description } = resolveCopy(row, locale)
      const quirk = {
        id: row.id,
        origin: row.origin,
        tier: row.tier,
        type: row.type,
        range: row.range,
        facets: row.facets,
        source: row.source,
        inspiration: row.inspiration,
        name,
        description,
      }
      return {
        quirk_id: row.id,
        locale,
        name,
        description,
        search_text: buildQuirkSearchText(quirk, locale),
      }
    }),
  )

  const { error: translationError } = await supabase
    .from('quirk_translations')
    .upsert(translationRows, { onConflict: 'quirk_id,locale' })

  if (translationError) {
    throw new Error(`Seed translations failed: ${translationError.message}`)
  }

  console.log(
    `Seeded ${quirkRows.length} ORIGINAL quirks (${SEED_LOCALES.join(', ')}) from tools/catalog/data/originals.json.`,
  )
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
