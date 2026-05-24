/**
 * Fills pt-BR and es copy in tools/catalog/data/originals.json via LLM adaptation.
 * Uses the same locale rules as fusion hybrid translation.
 *
 * Usage:
 *   pnpm quirks:translate-originals
 *   pnpm quirks:translate-originals -- --locale pt-BR
 *   pnpm quirks:translate-originals -- --force
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  FUSION_TRANSLATION_LOCALES,
  type FusionTranslationLocale,
} from '../../src/server/fusion/constants'
import { loadEnv } from '../../src/server/env/load'
import {
  buildQuirkLocaleAdaptationBatchPrompt,
  isForbiddenLocaleDescription,
  sanitizeLocaleDescription,
} from '../../src/server/quirks/locale-adaptation'
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
const CHECKPOINT_DIR = join(root, '.cache')

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

function parseArgs(argv: string[]) {
  let locale: FusionTranslationLocale | null = null
  let force = false
  let batchSize = 6

  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--locale') {
      locale = argv[++i] as FusionTranslationLocale
    } else if (argv[i] === '--force') {
      force = true
    } else if (argv[i] === '--batch-size') {
      batchSize = Number(argv[++i] ?? batchSize)
    }
  }

  const locales = locale ? [locale] : [...FUSION_TRANSLATION_LOCALES]
  for (const item of locales) {
    if (!FUSION_TRANSLATION_LOCALES.includes(item)) {
      throw new Error(`Locale inválido: ${item}`)
    }
  }

  return {
    locales,
    force,
    batchSize: Number.isFinite(batchSize) && batchSize > 0 ? batchSize : 6,
  }
}

function loadOriginals(): OriginalSeedRow[] {
  const raw = readFileSync(ORIGINALS_PATH, 'utf8')
  const rows = JSON.parse(raw) as OriginalSeedRow[]
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error(`No rows in ${ORIGINALS_PATH}`)
  }
  return rows
}

function saveOriginals(rows: OriginalSeedRow[]): void {
  writeFileSync(ORIGINALS_PATH, `${JSON.stringify(rows, null, 2)}\n`, 'utf8')
}

function checkpointPath(locale: FusionTranslationLocale): string {
  return join(CHECKPOINT_DIR, `originals-${locale}.json`)
}

function loadCheckpoint(
  locale: FusionTranslationLocale,
): Record<string, QuirkCopy> {
  const path = checkpointPath(locale)
  if (!existsSync(path)) return {}
  return JSON.parse(readFileSync(path, 'utf8')) as Record<string, QuirkCopy>
}

function saveCheckpoint(
  locale: FusionTranslationLocale,
  copy: Record<string, QuirkCopy>,
): void {
  mkdirSync(CHECKPOINT_DIR, { recursive: true })
  writeFileSync(checkpointPath(locale), JSON.stringify(copy, null, 2), 'utf8')
}

function resolveProvider(): { name: 'openai' | 'gemini'; apiKey: string } {
  const pref = (process.env.FUSION_PROVIDER ?? 'auto').toLowerCase()
  const openai = process.env.OPENAI_API_KEY?.trim()
  const gemini = process.env.GEMINI_API_KEY?.trim()

  if (pref === 'openai' && openai) return { name: 'openai', apiKey: openai }
  if (pref === 'gemini' && gemini) return { name: 'gemini', apiKey: gemini }
  if (openai) return { name: 'openai', apiKey: openai }
  if (gemini) return { name: 'gemini', apiKey: gemini }

  throw new Error('Defina OPENAI_API_KEY ou GEMINI_API_KEY no .env')
}

async function callLlm(prompt: string): Promise<Record<string, QuirkCopy>> {
  const provider = resolveProvider()

  if (provider.name === 'openai') {
    const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini'
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You translate My Hero Academia quirk encyclopedia entries. Prioritize adaptation over literal translation; choose terms by domain context, not default dictionary glosses. Output strict JSON only.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!res.ok) {
      throw new Error(`OpenAI HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`)
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>
    }
    const text = data.choices?.[0]?.message?.content
    if (!text) throw new Error('OpenAI retornou resposta vazia.')
    const parsed = JSON.parse(text) as {
      entries?: Record<string, QuirkCopy>
    }
    return parsed.entries ?? {}
  }

  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${provider.apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `${'You translate My Hero Academia quirk encyclopedia entries. Prioritize adaptation over literal translation; choose terms by domain context, not default dictionary glosses. Output strict JSON only.'}\n\n${prompt}`,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 400)}`)
  }

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini retornou resposta vazia.')
  const parsed = JSON.parse(text) as { entries?: Record<string, QuirkCopy> }
  return parsed.entries ?? {}
}

async function translateBatchWithRetry(
  locale: FusionTranslationLocale,
  batch: OriginalSeedRow[],
): Promise<Record<string, QuirkCopy>> {
  const maxAttempts = 3
  const prompt = buildQuirkLocaleAdaptationBatchPrompt(
    locale,
    batch.map((row) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      type: row.type,
      range: row.range,
      facets: row.facets,
    })),
  )

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const strict =
        attempt > 1
          ? locale === 'es'
            ? '\nIMPORTANT: Never use Quirk, quirk, Peculiaridad, or individualidad in descriptions. Use "don".\n'
            : '\nIMPORTANT: Never use Quirk or Peculiaridade in descriptions. Use "individualidade".\n'
          : ''

      const translated = await callLlm(prompt + strict)
      const normalized: Record<string, QuirkCopy> = {}

      for (const row of batch) {
        const entry = translated[row.id]
        if (!entry?.name || !entry?.description) {
          throw new Error(`Lote inválido: falta entrada para ${row.id}`)
        }

        const description = sanitizeLocaleDescription(
          locale,
          entry.description.trim(),
        )
        if (isForbiddenLocaleDescription(locale, description)) {
          throw new Error(`Descrição inválida para ${row.id} (termo proibido).`)
        }

        normalized[row.id] = {
          name: entry.name.trim(),
          description,
        }
      }

      return normalized
    } catch (err) {
      if (attempt === maxAttempts) throw err
    }
  }

  throw new Error(`Falha ao adaptar lote (${locale}) após ${maxAttempts} tentativas.`)
}

async function main() {
  loadEnv(root)
  const { locales, force, batchSize } = parseArgs(process.argv.slice(2))
  const rows = loadOriginals()

  for (const locale of locales) {
    const checkpoint = loadCheckpoint(locale)
    const pending = rows.filter((row) => force || !row.copy?.[locale])

    if (pending.length === 0) {
      console.log(`[${locale}] Nada pendente.`)
      continue
    }

    console.log(`[${locale}] Adaptando ${pending.length} originals…`)

    for (let offset = 0; offset < pending.length; offset += batchSize) {
      const batch = pending.slice(offset, offset + batchSize)
      const translated = await translateBatchWithRetry(locale, batch)
      Object.assign(checkpoint, translated)
      saveCheckpoint(locale, checkpoint)
      console.log(
        `[${locale}] ${Math.min(offset + batch.length, pending.length)}/${pending.length}`,
      )
    }

    for (const row of rows) {
      const entry = checkpoint[row.id]
      if (!entry) continue
      row.copy ??= {}
      row.copy[locale] = entry
    }
  }

  saveOriginals(rows)
  console.log(`Wrote ${ORIGINALS_PATH}`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
