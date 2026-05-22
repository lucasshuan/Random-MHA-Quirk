import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Carrega variáveis de .env e .env.local (local sobrescreve).
 * Não sobrescreve variáveis já definidas no processo.
 */
export function loadEnv(root) {
  for (const name of ['.env', '.env.local']) {
    const path = join(root, name)
    if (!existsSync(path)) continue

    const lines = readFileSync(path, 'utf8').split('\n')
    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith('#')) continue

      const eq = trimmed.indexOf('=')
      if (eq === -1) continue

      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }

      if (process.env[key] === undefined) {
        process.env[key] = value
      }
    }
  }
}

export function requireOneOf(keys, label) {
  const found = keys.filter((k) => process.env[k]?.trim())
  if (found.length === 0) {
    throw new Error(
      `${label}: defina uma destas variáveis no .env — ${keys.join(', ')}`,
    )
  }
  return found
}
