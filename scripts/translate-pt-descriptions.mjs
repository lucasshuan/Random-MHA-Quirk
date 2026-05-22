/**
 * Traduz descrições EN (manual-copy / Fandom) para PT-BR natural.
 * Requer OPENAI_API_KEY ou GEMINI_API_KEY no .env
 *
 * Uso: pnpm research:translate-pt
 * Depois: pnpm research:build-catalog
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isGenericDescription, isUsableCopy } from './lib/copy-quality.mjs'
import { loadEnv } from './lib/load-env.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const research = join(root, 'research')
const manualPath = join(research, 'manual-copy.json')
const BATCH_SIZE = 10
const DELAY_MS = 400

loadEnv(root)

function loadQuirkIds() {
  const text = readFileSync(join(root, 'src', 'data', 'quirk-ids.ts'), 'utf8')
  return [...text.matchAll(/'([a-z0-9-]+)'/g)].map((m) => m[1])
}

async function probeOpenAI(apiKey) {
  const res = await fetch('https://api.openai.com/v1/models', {
    headers: { Authorization: `Bearer ${apiKey}` },
  })
  return res.ok
}

async function probeGemini(apiKey) {
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}?key=${apiKey}`
  const res = await fetch(url)
  return res.ok
}

async function resolveProvider() {
  const pref = (process.env.FUSION_PROVIDER ?? 'auto').toLowerCase()
  const openai = process.env.OPENAI_API_KEY?.trim()
  const gemini = process.env.GEMINI_API_KEY?.trim()

  const tryOpenAI = async () => openai && (await probeOpenAI(openai)) && { name: 'openai', apiKey: openai }
  const tryGemini = async () => gemini && (await probeGemini(gemini)) && { name: 'gemini', apiKey: gemini }

  if (pref === 'openai') {
    const p = await tryOpenAI()
    if (p) return p
    throw new Error('OPENAI_API_KEY inválida ou inacessível.')
  }
  if (pref === 'gemini') {
    const p = await tryGemini()
    if (p) return p
    throw new Error('GEMINI_API_KEY inválida ou inacessível.')
  }

  const pOpen = await tryOpenAI()
  if (pOpen) return pOpen
  const pGem = await tryGemini()
  if (pGem) return pGem

  throw new Error(
    'Nenhuma API válida. Corrija OPENAI_API_KEY ou GEMINI_API_KEY no .env, ou rode: pnpm research:sync-pt',
  )
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

async function callGemini(apiKey, userPrompt) {
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.35,
        responseMimeType: 'application/json',
      },
    }),
  })
  if (!res.ok) throw new Error(`Gemini HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`)
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini resposta vazia')
  return JSON.parse(text)
}

function buildPrompt(batch) {
  return `Translate these MHA quirks to Brazilian Portuguese (pt-BR).

Rules:
- "name": common PT fan name when it exists (e.g. Explosion → Explosão), otherwise keep recognizable English name
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

async function translateBatch(provider, batch) {
  const prompt = buildPrompt(
    batch.map(({ id, en }) => ({ id, name: en.name, description: en.description })),
  )
  const expectedIds = new Set(batch.map((b) => b.id))

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const raw =
        provider.name === 'openai'
          ? await callOpenAI(provider.apiKey, prompt)
          : await callGemini(provider.apiKey, prompt)
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

  const provider = await resolveProvider()
  console.log(`Provedor: ${provider.name}`)

  let done = 0
  let failed = 0

  for (let i = 0; i < pending.length; i += BATCH_SIZE) {
    const chunkIds = pending.slice(i, i + BATCH_SIZE)
    const batch = chunkIds.map((id) => ({ id, en: manual.en[id] }))

    try {
      const translated = await translateBatch(provider, batch)
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
  console.log('Wrote research/manual-copy.json')
  console.log('Rode: pnpm research:build-catalog')
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
