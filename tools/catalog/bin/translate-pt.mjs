/**
 * Traduz descrições EN (manual-copy / Fandom) para PT-BR natural.
 * Requer OPENAI_API_KEY no .env
 *
 * Uso: node tools/catalog/bin/translate-pt.mjs
 * Depois: node tools/catalog/bin/build-catalog.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { isGenericDescription, isUsableCopy } from '../lib/copy-quality.mjs'
import { loadEnv } from '../lib/load-env.mjs'
import { CATALOG_OUTPUT, REPO_ROOT, SOURCES } from '../lib/paths.mjs'

const manualPath = join(SOURCES, 'manual-copy.json')
const BATCH_SIZE = 10
const DELAY_MS = 400

loadEnv(REPO_ROOT)

function loadQuirkIds() {
  const text = readFileSync(join(CATALOG_OUTPUT, 'quirk-ids.ts'), 'utf8')
  return [...text.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1])
}

async function probeOpenAI(apiKey) {
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  return res.ok
}

async function resolveOpenAiApiKey() {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY ausente no .env')
  }
  if (!(await probeOpenAI(apiKey))) {
    throw new Error('OPENAI_API_KEY inválida ou inacessível.')
  }
  return apiKey
}

async function callOpenAI(apiKey, userPrompt) {
  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini'
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.35,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You translate My Hero Academia quirk names and descriptions to natural Brazilian Portuguese for a fan app. Output strict JSON only.',
        },
        { role: 'user', content: userPrompt },
      ],
    }),
  })
  if (!res.ok) throw new Error(`OpenAI HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenAI resposta vazia')
  return JSON.parse(text)
}

function buildPrompt(batch) {
  return `Translate these MHA quirks to Brazilian Portuguese (pt-BR).

Rules:
- "name": common PT fan name when it exists (e.g. Explosion → Explosão, Earphone Jack → Plug de Ouvido), otherwise keep recognizable English name
- For "Control X" in English, use "Controle de X" in Portuguese (never "X de Controle")
- Prefer short natural titles (2–4 words); avoid word-for-word English order
- "description": 2–4 sentences, natural pt-BR, same facts as English, not a literal calque
- Keep power-scaling tone from the anime/manga
- Do not add meta commentary

Input:
${JSON.stringify(batch, null, 2)}

Reply ONLY with JSON:
{
  "items": [
    { "id": string, "name": string, "description": string }
  ]
}`
}

function validateItems(items, expectedIds) {
  if (!Array.isArray(items)) throw new Error('items não é array')
  const map = new Map()
  for (const item of items) {
    if (!expectedIds.has(item.id)) continue
    if (!item.name || !item.description) continue
    if (isGenericDescription(item.description)) continue
    if (item.description.length < 20) continue
    map.set(item.id, { name: item.name.trim(), description: item.description.trim() })
  }
  return map
}

async function translateBatch(apiKey, batch) {
  const prompt = buildPrompt(
    batch.map(({ id, en }) => ({ id, name: en.name, description: en.description })),
  )
  const expectedIds = new Set(batch.map((b) => b.id))

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const raw = await callOpenAI(apiKey, prompt)
      const items = raw.items ?? raw.translations ?? raw
      return validateItems(items, expectedIds)
    } catch (err) {
      if (attempt === 3) throw err
      console.warn(`  retry ${attempt}: ${err.message}`)
    }
  }
  return new Map()
}

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function main() {
  const manual = JSON.parse(readFileSync(manualPath, 'utf8'))
  manual.en ??= {}
  manual['pt-BR'] ??= {}

  const ids = loadQuirkIds()
  const pending = ids.filter((id) => {
    const en = manual.en[id]
    if (!isUsableCopy(en)) return false
    const pt = manual['pt-BR'][id]
    if (!isUsableCopy(pt)) return true
    return pt.description.trim() === en.description.trim()
  })

  console.log(`Traduzir ${pending.length} quirks para PT-BR…`)
  if (pending.length === 0) {
    console.log('Nada pendente.')
    return
  }

  const apiKey = await resolveOpenAiApiKey()
  console.log('Provedor: openai')

  let done = 0
  let failed = 0

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const chunkIds = pending.slice(i, i + BATCH_SIZE)
    const batch = chunkIds.map((id) => ({ id, en: manual.en[id] }))

    try {
      const translated = await translateBatch(apiKey, batch)
      for (const [id, copy] of translated) {
        manual['pt-BR'][id] = copy
        done++
      }
      failed += chunkIds.length - translated.size
    } catch (err) {
      failed += chunkIds.length
      console.warn(`  lote falhou: ${err.message}`)
    }

    const progress = Math.min(i + BATCH_SIZE, pending.length)
    process.stdout.write(`\r  ${progress}/${pending.length} (ok: ${done}, falhas: ${failed})`)
    writeFileSync(manualPath, `${JSON.stringify(manual, null, 2)}\n`)

    if (i + BATCH_SIZE < pending.length) await sleep(DELAY_MS)
  }

  console.log(`\nConcluído. Traduzidas: ${done}`)
  writeFileSync(manualPath, `${JSON.stringify(manual, null, 2)}\n`)
  console.log('Wrote tools/catalog/data/sources/manual-copy.json')
  console.log('Run: node tools/catalog/bin/build-catalog.mjs')
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
