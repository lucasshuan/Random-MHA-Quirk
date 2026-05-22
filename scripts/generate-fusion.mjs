/**
 * Gera uma fusão (híbrido) via LLM e grava em src/data/fusion-cache.json.
 *
 * Uso:
 *   pnpm fusion:generate -- --a acid --b explosion
 *   pnpm fusion:generate -- --a acid --b explosion --seed k7x2m9
 *   pnpm fusion:generate -- --random
 *
 * Env (.env na raiz): ver .env.example
 */
import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { fusionCacheKey, sortedParentPair } from './lib/fusion-key.mjs'
import { loadEnv, requireOneOf } from './lib/load-env.mjs'
import { getQuirkById, loadQuirksCatalog } from './lib/load-quirks.mjs'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'src')
const cachePath = join(src, 'data', 'fusion-cache.json')

const QUIRK_TYPES = ['Emitter', 'Transformation', 'Mutant']
const QUIRK_RANGES = ['Self', 'Contact', 'Short', 'Medium', 'Long', 'Area']
const QUIRK_FACETS = [
  'Elemental',
  'Psychic',
  'Enhancement',
  'Anthropomorphic',
  'Control',
  'Support',
  'Defense',
  'Mobility',
  'Sensory',
  'Construct',
  'Emission',
  'Biological',
]

loadEnv(root)

function parseArgs(argv) {
  const args = { a: null, b: null, seed: null, random: false, force: false }
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]
    if (token === '--random') args.random = true
    else if (token === '--force') args.force = true
    else if (token === '--a') args.a = argv[++i]
    else if (token === '--b') args.b = argv[++i]
    else if (token === '--seed') args.seed = argv[++i]
  }
  return args
}

function defaultSeed() {
  return randomBytes(4).toString('hex')
}

function loadCache() {
  if (!existsSync(cachePath)) {
    return { version: 1, entries: [] }
  }
  return JSON.parse(readFileSync(cachePath, 'utf8'))
}

function saveCache(cache) {
  writeFileSync(cachePath, `${JSON.stringify(cache, null, 2)}\n`)
}

function validateFusionPayload(raw) {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Resposta LLM não é um objeto JSON.')
  }

  for (const locale of ['en', 'pt-BR']) {
    const block = raw[locale]
    if (!block?.name || typeof block.name !== 'string' || block.name.length < 2) {
      throw new Error(`Campo ${locale}.name inválido.`)
    }
    if (!block?.description || typeof block.description !== 'string' || block.description.length < 20) {
      throw new Error(`Campo ${locale}.description inválido.`)
    }
  }

  if (!QUIRK_TYPES.includes(raw.type)) {
    throw new Error(`type inválido: ${raw.type}`)
  }
  if (!QUIRK_RANGES.includes(raw.range)) {
    throw new Error(`range inválido: ${raw.range}`)
  }
  if (!Array.isArray(raw.facets) || raw.facets.length === 0) {
    throw new Error('facets deve ser um array não vazio.')
  }
  for (const facet of raw.facets) {
    if (!QUIRK_FACETS.includes(facet)) {
      throw new Error(`facet inválida: ${facet}`)
    }
  }

  return {
    en: { name: raw.en.name.trim(), description: raw.en.description.trim() },
    'pt-BR': { name: raw['pt-BR'].name.trim(), description: raw['pt-BR'].description.trim() },
    type: raw.type,
    range: raw.range,
    facets: [...new Set(raw.facets)],
    origin: 'ORIGINAL',
  }
}

function buildPrompt(quirkA, quirkB, seed) {
  const formatParent = (q) =>
    `- ${q.name} (${q.id}): ${q.type}, range ${q.range}, facets [${q.facets.join(', ')}]. ${q.description}`

  return `Create ONE original My Hero Academia-style fusion quirk from these two parent quirks.
Variant seed: "${seed}" — use it to make this variant distinct from obvious merges or name mashups.

Parent quirks:
${formatParent(quirkA)}

${formatParent(quirkB)}

Rules:
- Invent a third mechanism that synergizes or clashes with BOTH parents — do NOT just concatenate names or effects.
- Not a canon character quirk; this is a fan fusion (origin will be ORIGINAL).
- type must be one of: Emitter, Transformation, Mutant
- range must be one of: Self, Contact, Short, Medium, Long, Area
- facets: 1–4 values from: ${QUIRK_FACETS.join(', ')}
- en.description and pt-BR.description: 2–4 sentences each, vivid, anime tone
- pt-BR must read naturally in Brazilian Portuguese (not a literal calque of English)
- Creative names in each language (adapted, not transliterated unless it fits)

Reply with ONLY valid JSON (no markdown):
{
  "en": { "name": string, "description": string },
  "pt-BR": { "name": string, "description": string },
  "type": string,
  "range": string,
  "facets": string[]
}`
}

function resolveProvider() {
  const pref = (process.env.FUSION_PROVIDER ?? 'auto').toLowerCase()
  const openai = process.env.OPENAI_API_KEY?.trim()
  const gemini = process.env.GEMINI_API_KEY?.trim()

  if (pref === 'openai') {
    if (!openai) throw new Error('FUSION_PROVIDER=openai mas OPENAI_API_KEY está vazio.')
    return { name: 'openai', apiKey: openai }
  }
  if (pref === 'gemini') {
    if (!gemini) throw new Error('FUSION_PROVIDER=gemini mas GEMINI_API_KEY está vazio.')
    return { name: 'gemini', apiKey: gemini }
  }

  if (openai) return { name: 'openai', apiKey: openai }
  if (gemini) return { name: 'gemini', apiKey: gemini }

  requireOneOf(['OPENAI_API_KEY', 'GEMINI_API_KEY'], 'Fusão LLM')
  return null
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
      temperature: Number(process.env.FUSION_TEMPERATURE ?? 0.9),
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You design creative My Hero Academia fusion quirks. Output strict JSON only.',
        },
        { role: 'user', content: userPrompt },
      ],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenAI HTTP ${res.status}: ${err.slice(0, 400)}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenAI retornou resposta vazia.')
  return JSON.parse(text)
}

async function callGemini(apiKey, userPrompt) {
  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-2.0-flash'
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: Number(process.env.FUSION_TEMPERATURE ?? 0.9),
        responseMimeType: 'application/json',
      },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini HTTP ${res.status}: ${err.slice(0, 400)}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini retornou resposta vazia.')
  return JSON.parse(text)
}

async function generateWithLlm(userPrompt) {
  const provider = resolveProvider()
  const maxAttempts = 3

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const raw =
        provider.name === 'openai'
          ? await callOpenAI(provider.apiKey, userPrompt)
          : await callGemini(provider.apiKey, userPrompt)
      return validateFusionPayload(raw)
    } catch (err) {
      if (attempt === maxAttempts) throw err
      console.warn(`  Tentativa ${attempt} falhou (${err.message}). Retentando…`)
    }
  }

  throw new Error('Falha ao gerar fusão.')
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const catalog = loadQuirksCatalog(src)

  let idA = args.a
  let idB = args.b

  if (args.random) {
    if (catalog.length < 2) throw new Error('Catálogo insuficiente.')
    const i = Math.floor(Math.random() * catalog.length)
    let j = Math.floor(Math.random() * catalog.length)
    while (j === i) j = Math.floor(Math.random() * catalog.length)
    idA = catalog[i].id
    idB = catalog[j].id
  }

  if (!idA || !idB) {
    console.error('Uso: pnpm fusion:generate -- --a <id> --b <id> [--seed <seed>] [--force]')
    console.error('     pnpm fusion:generate -- --random [--seed <seed>]')
    process.exit(1)
  }

  const quirkA = getQuirkById(catalog, idA)
  const quirkB = getQuirkById(catalog, idB)
  if (!quirkA) throw new Error(`Quirk não encontrada: ${idA}`)
  if (!quirkB) throw new Error(`Quirk não encontrada: ${idB}`)
  if (idA === idB) throw new Error('Escolha duas quirks diferentes.')

  const seed = args.seed ?? defaultSeed()
  const parents = sortedParentPair(idA, idB)
  const key = fusionCacheKey(parents[0], parents[1], seed)

  const cache = loadCache()
  const existing = cache.entries.find((e) => e.key === key)
  if (existing && !args.force) {
    console.log(`Já existe no cache: ${key}`)
    console.log(`  EN: ${existing.en.name}`)
    console.log('Use --force para regenerar.')
    return
  }

  const provider = resolveProvider()
  console.log(`Gerando fusão [${provider.name}] ${parents[0]} + ${parents[1]} (seed: ${seed})…`)

  const payload = await generateWithLlm(buildPrompt(quirkA, quirkB, seed))

  const entry = {
    key,
    parents,
    seed,
    ...payload,
  }

  if (existing) {
    cache.entries = cache.entries.map((e) => (e.key === key ? entry : e))
  } else {
    cache.entries.push(entry)
  }

  saveCache(cache)
  console.log(`Salvo: ${cachePath}`)
  console.log(`  key: ${key}`)
  console.log(`  EN: ${entry.en.name}`)
  console.log(`  PT: ${entry['pt-BR'].name}`)
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
