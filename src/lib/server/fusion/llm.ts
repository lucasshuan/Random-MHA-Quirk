import { requireOneOf } from '@/lib/server/env-utils'
import { validateFusionPayload, type ValidatedFusionPayload } from './validate'

function resolveFusionProvider(): { name: 'openai' | 'gemini'; apiKey: string } {
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
  throw new Error('Nenhum provedor LLM configurado.')
}

async function callOpenAI(apiKey: string, userPrompt: string): Promise<unknown> {
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

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenAI retornou resposta vazia.')
  return JSON.parse(text)
}

async function callGemini(apiKey: string, userPrompt: string): Promise<unknown> {
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

  const data = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>
  }
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini retornou resposta vazia.')
  return JSON.parse(text)
}

export async function generateWithLlm(userPrompt: string): Promise<ValidatedFusionPayload> {
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
