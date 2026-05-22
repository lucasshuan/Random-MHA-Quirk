import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Repository root (parent of `scripts/`). */
export function getProjectRoot(): string {
  return join(dirname(fileURLToPath(import.meta.url)), '..', '..')
}
