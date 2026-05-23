/**
 * Seeds quirks + quirk_translations from tools/catalog/output into Supabase.
 *
 * Usage:
 *   pnpm quirks:seed
 */
import { createClient } from '@supabase/supabase-js'
import type { Locale } from '../../src/i18n/types'
import { loadEnv } from '../../src/server/env/load'
import type { Quirk, QuirkCopy } from '../../src/types/quirk'
import { enQuirkCopy } from '../../tools/catalog/output/copy/en'
import { esQuirkCopy } from '../../tools/catalog/output/copy/es.locale'
import { ptBRQuirkCopy } from '../../tools/catalog/output/copy/pt-BR'
import { QUIRK_IDS } from '../../tools/catalog/output/quirk-ids'
import { quirksBase } from '../../tools/catalog/output/quirks.base'
import { getProjectRoot } from '../_shared/root'

const root = getProjectRoot()

const COPY_BY_LOCALE = {
  en: enQuirkCopy,
  'pt-BR': ptBRQuirkCopy,
  es: esQuirkCopy,
} as const satisfies Record<Locale, Record<string, QuirkCopy>>

function buildQuirk(base: (typeof quirksBase)[number], locale: Locale): Quirk {
  const copy = COPY_BY_LOCALE[locale][base.id]
  if (!copy) {
    throw new Error(`Missing ${locale} copy for quirk: ${base.id}`)
  }

  return { ...base, ...copy }
}

async function main() {
  loadEnv(root)

  const url = process.env.SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throw new Error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env')
  }

  const baseIds = quirksBase.map((quirk) => quirk.id).sort()
  const expectedIds = [...QUIRK_IDS].sort()
  if (baseIds.join(',') !== expectedIds.join(',')) {
    throw new Error('quirks.base.ts está desalinhado com QUIRK_IDS.')
  }

  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const quirkRows = quirksBase.map((quirk) => ({
    id: quirk.id,
    origin: quirk.origin,
    tier: quirk.tier,
    type: quirk.type,
    range: quirk.range,
    facets: quirk.facets,
    source: quirk.source ?? null,
    inspiration: quirk.inspiration ?? null,
  }))

  const translationRows = (Object.keys(COPY_BY_LOCALE) as Locale[]).flatMap((locale) =>
    quirksBase.map((base) => {
      const quirk = buildQuirk(base, locale)
      return {
        quirk_id: quirk.id,
        locale,
        name: quirk.name,
        description: quirk.description,
      }
    }),
  )

  const { error: quirkError } = await supabase.from('quirks').upsert(quirkRows, {
    onConflict: 'id',
  })
  if (quirkError) {
    throw new Error(`Seed quirks failed: ${quirkError.message}`)
  }

  const batchSize = 200
  for (let offset = 0; offset < translationRows.length; offset += batchSize) {
    const batch = translationRows.slice(offset, offset + batchSize)
    const { error } = await supabase
      .from('quirk_translations')
      .upsert(batch, { onConflict: 'quirk_id,locale' })

    if (error) {
      throw new Error(`Seed translations failed: ${error.message}`)
    }
  }

  console.log(
    `Seeded ${quirkRows.length} quirks and ${translationRows.length} translations into Supabase.`,
  )
  console.log(
    'Restart `pnpm dev` (or hard-refresh) so the catalog API picks up tier changes.',
  )
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
