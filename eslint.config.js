import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { FlatCompat } from '@eslint/eslintrc'
import { defineConfig, globalIgnores } from 'eslint/config'

const compat = new FlatCompat({
  baseDirectory: dirname(fileURLToPath(import.meta.url)),
})

export default defineConfig([
  globalIgnores(['.next', 'node_modules', 'dist']),
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
])
