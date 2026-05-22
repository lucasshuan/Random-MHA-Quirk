import { randomBytes } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fusionCacheKey, sortedParentPair } from './fusion-key.mjs'
import { loadEnv, requireOneOf } from './load-env.mjs'
import { getQuirkById, loadQuirksCatalog } from './load-quirks.mjs'

export const QUIRK_TYPES = ['Emitter', 'Transformation', 'Mutant']
export const QUIRK_RANGES = ['Self', 'Contact', 'Short', 'Medium', 'Long', 'Area']
export const QUIRK_FACETS = [
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

export function fusionCachePath(root) {
  return join(root, 'src', 'data', 'fusion-cache.json')
}

export function loadFusionCache(root) {
  const cachePath = fusionCachePath(root)
  if (!existsSync(cachePath)) {
    return { version: 1, entries: [] }
  }
  return JSON.parse(readFileSync(cachePath, 'utf8'))
}

export function saveFusionCache(root, cache) {
  writeFileSync(fusionCachePath(root), `${JSON.stringify(cache, null, 2)}\n`)
}

export function defaultFusionSeed() {
  return randomBytes(4).toString('hex')
}

export function validateFusionPayload(raw) {
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

export function buildFusionPrompt(quirkA, quirkB, seed) {
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

export function resolveFusionProvider() {
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
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
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

export async function generateWithLlm(userPrompt) {
  const provider = resolveFusionProvider()
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
    }
  }

  throw new Error('Falha ao gerar fusão.')
}

/**
 * Gera (ou lê do cache) uma fusão. Retorna entrada completa do cache.
 */
export async function generateFusionEntry({
  root,
  idA,
  idB,
  seed,
  force = false,
}) {
  loadEnv(root)
  const src = join(root, 'src')
  const catalog = loadQuirksCatalog(src)

  const quirkA = getQuirkById(catalog, idA)
  const quirkB = getQuirkById(catalog, idB)
  if (!quirkA) throw new Error(`Quirk não encontrada: ${idA}`)
  if (!quirkB) throw new Error(`Quirk não encontrada: ${idB}`)
  if (idA === idB) throw new Error('Escolha duas quirks diferentes.')

  const parents = sortedParentPair(idA, idB)
  const key = fusionCacheKey(parents[0], parents[1], seed)

  const cache = loadFusionCache(root)
  const existing = cache.entries.find((e) => e.key === key)
  if (existing && !force) {
    return { entry: existing, cached: true }
  }

  const payload = await generateWithLlm(buildFusionPrompt(quirkA, quirkB, seed))
  const entry = { key, parents, seed, ...payload }

  if (existing) {
    cache.entries = cache.entries.map((e) => (e.key === key ? entry : e))
  } else {
    cache.entries.push(entry)
  }

  saveFusionCache(root, cache)
  return { entry, cached: false }
}
