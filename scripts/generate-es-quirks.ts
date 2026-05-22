/**
 * Generates tools/catalog/output/copy/es.locale.ts from English copy via LLM adaptation.
 *
 * Usage:
 *   pnpm quirks:generate-es
 *   pnpm quirks:generate-es -- --batch-size 20
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { QUIRK_IDS } from '../tools/catalog/output/quirk-ids'
import { enQuirkCopy } from '../tools/catalog/output/copy/en'
import { loadEnv } from '../src/server/env/load'
import type { QuirkCopy } from '../src/types/quirk'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

const CHECKPOINT_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '.cache',
  'es-quirks-partial.json',
)

function parseArgs(argv: string[]) {
  let batchSize = 25
  let resume = false
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--batch-size') {
      batchSize = Number(argv[++i] ?? batchSize)
    } else if (argv[i] === '--resume') {
      resume = true
    }
  }
  return {
    batchSize: Number.isFinite(batchSize) && batchSize > 0 ? batchSize : 25,
    resume,
  }
}

function isForbiddenEsDescription(description: string): boolean {
  return /\b(quirk|peculiaridad|individualidad)\b/i.test(description)
}

function sanitizeEsDescription(description: string): string {
  return description
    .replace(/\b[Gg]uirk\b/g, 'don')
    .replace(/\b[Pp]eculiaridad(?:es)?\b/g, 'don')
    .replace(/\b[Ii]ndividualidad(?:es)?\b/g, 'don')
}

function escapeTsString(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
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
        temperature: 0.4,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You adapt My Hero Academia quirk encyclopedia entries into natural Spanish. Prioritize adaptation over literal translation. Output strict JSON only.',
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
    return JSON.parse(text).quirks as Record<string, QuirkCopy>
  }

  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${provider.apiKey}`
  const system =
    'You adapt My Hero Academia quirk encyclopedia entries into natural Spanish. Prioritize adaptation over literal translation. Output strict JSON only.'

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: `${system}\n\n${prompt}` }] }],
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
  return JSON.parse(text).quirks as Record<string, QuirkCopy>
}

function loadCheckpoint(): Record<string, QuirkCopy> {
  if (!existsSync(CHECKPOINT_PATH)) return {}
  return JSON.parse(readFileSync(CHECKPOINT_PATH, 'utf8')) as Record<string, QuirkCopy>
}

function saveCheckpoint(copy: Record<string, QuirkCopy>): void {
  mkdirSync(dirname(CHECKPOINT_PATH), { recursive: true })
  writeFileSync(CHECKPOINT_PATH, JSON.stringify(copy, null, 2), 'utf8')
}

async function translateBatchWithRetry(
  batch: Array<{ id: string; copy: QuirkCopy }>,
): Promise<Record<string, QuirkCopy>> {
  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const strict =
        attempt > 1
          ? '\nIMPORTANT: Never use the words Quirk, quirk, Peculiaridad, peculiaridad, individualidad, or Individualidad. Use "don" instead when needed.\n'
          : ''

      const translated = await callLlm(buildBatchPrompt(batch) + strict)
      const normalized: Record<string, QuirkCopy> = {}

      for (const { id } of batch) {
        const entry = translated[id]
        if (!entry?.name || !entry?.description) {
          throw new Error(`Lote inválido: falta entrada para ${id}`)
        }

        const description = sanitizeEsDescription(entry.description.trim())
        if (isForbiddenEsDescription(description)) {
          throw new Error(`Descrição ES inválida para ${id} (termo proibido).`)
        }

        normalized[id] = {
          name: entry.name.trim(),
          description,
        }
      }

      return normalized
    } catch (err) {
      if (attempt === maxAttempts) throw err
    }
  }

  throw new Error(`Falha ao traduzir lote após ${maxAttempts} tentativas.`)
}

function buildBatchPrompt(
  batch: Array<{ id: string; copy: QuirkCopy }>,
): string {
  const payload = Object.fromEntries(
    batch.map(({ id, copy }) => [id, copy]),
  )

  return `Adapt these My Hero Academia quirk entries into Spanish for a quirk encyclopedia app.

Rules:
- ADAPTATION, not word-for-word translation; write as if authored in Spanish for anime fans
- Preserve mechanics and limits; do not add or remove effects
- Use "don" in prose when referring to quirks; never "Quirk", "quirk", "Peculiaridad", or "individualidad"
- Tone similar to "Permite al usuario…" / "El usuario puede…"
- Keep names punchy and natural in Spanish

English entries JSON:
${JSON.stringify(payload, null, 2)}

Reply with ONLY valid JSON:
{
  "quirks": {
    "<id>": { "name": string, "description": string }
  }
}`
}

function renderEsFile(copy: Record<string, QuirkCopy>): string {
  const lines = [
    "import type { QuirkCopy } from '../../../../src/types/quirk'",
    "import type { QuirkId } from '../quirk-ids'",
    '',
    'export const esQuirkCopy = {',
  ]

  for (const id of QUIRK_IDS) {
    const entry = copy[id]
    if (!entry) {
      throw new Error(`Tradução ausente para o id: ${id}`)
    }

    lines.push(`  '${id}': {`)
    lines.push(`    name: '${escapeTsString(entry.name)}',`)
    lines.push(`    description: '${escapeTsString(entry.description)}',`)
    lines.push('  },')
  }

  lines.push('} satisfies Record<QuirkId, QuirkCopy>')
  lines.push('')
  return lines.join('\n')
}

async function main() {
  loadEnv(root)
  const { batchSize, resume } = parseArgs(process.argv.slice(2))
  const result: Record<string, QuirkCopy> = resume ? loadCheckpoint() : {}

  for (let offset = 0; offset < QUIRK_IDS.length; offset += batchSize) {
    const ids = QUIRK_IDS.slice(offset, offset + batchSize).filter((id) => !result[id])
    if (ids.length === 0) continue

    const batch = ids.map((id) => ({ id, copy: enQuirkCopy[id] }))
    const translated = await translateBatchWithRetry(batch)

    Object.assign(result, translated)
    saveCheckpoint(result)

    console.log(`Traduzidos ${Object.keys(result).length}/${QUIRK_IDS.length}`)
  }

  const outPath = join(root, 'tools/catalog/output/copy/es.locale.ts')
  writeFileSync(outPath, renderEsFile(result), 'utf8')
  console.log(`Escrito: ${outPath}`)
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err)
  process.exit(1)
})
