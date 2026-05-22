/**
 * Traduz manual.en → manual.pt-BR via MyMemory (grátis, sem API key).
 * Para qualidade máxima depois: node tools/catalog/bin/translate-pt.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { isUsableCopy } from '../lib/copy-quality.mjs'
import { SOURCES } from '../lib/paths.mjs'

const manualPath = join(SOURCES, 'manual-copy.json')
const DELAY_MS = Number(process.env.SYNC_PT_DELAY_MS ?? 1200)

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function translateText(text, attempt = 1) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|pt-BR`
  const res = await fetch(url)
  if (res.status === 429 && attempt < 6) {
    await sleep(2500 * attempt)
    return translateText(text, attempt + 1)
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  const out = data.responseData?.translatedText?.trim()
  if (!out || out.toUpperCase().includes('MYMEMORY WARNING')) {
    throw new Error(data.responseData?.translatedText ?? 'tradução inválida')
  }
  return out
}

async function translateName(name) {
  try {
    return await translateText(name)
  } catch {
    return name
  }
}

async function main() {
  const manual = JSON.parse(readFileSync(manualPath, 'utf8'))
  manual.en ??= {}
  manual['pt-BR'] ??= {}

  const pending = Object.keys(manual.en).filter((id) => {
    const en = manual.en[id]
    if (!isUsableCopy(en)) return false
    const pt = manual['pt-BR'][id]
    if (!isUsableCopy(pt)) return true
    return pt.description.trim() === en.description.trim()
  })

  console.log(`Traduzindo ${pending.length} quirks (MyMemory)…`)

  let done = 0
  let failed = 0

  for (let i = 0; i < pending.length; i++) {
    const id = pending[i]
    const en = manual.en[id]

    try {
      const [name, description] = await Promise.all([
        translateName(en.name),
        translateText(en.description),
      ])
      manual['pt-BR'][id] = { name, description }
      done++
    } catch (err) {
      manual['pt-BR'][id] = { name: en.name, description: en.description }
      failed++
      if (failed <= 3) console.warn(`  ${id}: ${err.message}`)
    }

    if ((i + 1) % 10 === 0 || i === pending.length - 1) {
      process.stdout.write(`\r  ${i + 1}/${pending.length} (ok: ${done}, fallback EN: ${failed})`)
    }

    if (i < pending.length - 1) await sleep(DELAY_MS)
  }

  console.log('\nSalvando manual-copy.json…')
  writeFileSync(manualPath, `${JSON.stringify(manual, null, 2)}\n`)
  console.log('Run: node tools/catalog/bin/build-catalog.mjs')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
