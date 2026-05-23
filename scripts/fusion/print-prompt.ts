/**
 * Prints one fusion user prompt (no LLM call).
 * Usage: pnpm exec tsx scripts/fusion/print-prompt.ts
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildFusionPrompt, deriveFusionRollContext } from '@/server/fusion/prompts/english'
import type { FusionCatalogQuirk } from '@/server/fusion/catalog'
import { getProjectRoot } from '../_shared/root'

const quirkA: FusionCatalogQuirk = {
  id: 'permeation',
  name: 'Permeation',
  origin: 'BNHA',
  tier: 'A',
  type: 'Emitter',
  range: 'Short',
  facets: ['Mobility'],
  description:
    'Allows the user to phase their body through solid matter, including walls and the ground, by making their molecules spread apart.',
}

const quirkB: FusionCatalogQuirk = {
  id: 'hardening',
  name: 'Hardening',
  origin: 'BNHA',
  tier: 'B',
  type: 'Transformation',
  range: 'Contact',
  facets: ['Defense', 'Enhancement'],
  description:
    'Hardens any part of the user\'s body to rock-like durability for offense and defense.',
}

const seed = 'demo-prompt-review'
const priorVariants = [
  {
    name: 'Phase Shell',
    description:
      'The user can briefly turn their skin into a permeable shell that lets attacks pass through while keeping bones rigid.',
  },
]
const rollContext = deriveFusionRollContext(seed, quirkA, quirkB, priorVariants)

const prompt = buildFusionPrompt(quirkA, quirkB, seed, priorVariants, rollContext)

const root = getProjectRoot()
const outPath = join(root, 'scripts/fusion/sample-prompt.txt')
writeFileSync(outPath, prompt, 'utf8')
process.stdout.write(prompt)
