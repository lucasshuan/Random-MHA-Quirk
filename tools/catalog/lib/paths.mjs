import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const toolRoot = join(dirname(fileURLToPath(import.meta.url)), '..')

export const REPO_ROOT = join(toolRoot, '..', '..')
export const SRC = join(REPO_ROOT, 'src')
export const SOURCES = join(toolRoot, 'data', 'sources')
export const WIKI = join(toolRoot, 'data', 'wiki')
export const GENERATED = join(toolRoot, 'data', 'generated')
/** Authoring catalog (not used at runtime; seed via pnpm quirks:seed). */
export const CATALOG_OUTPUT = join(toolRoot, 'output')
export const CATALOG_COPY = join(CATALOG_OUTPUT, 'copy')
