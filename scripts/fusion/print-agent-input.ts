/**
 * Prints one FusionAgentInput JSON (no LLM call).
 * Usage: pnpm exec tsx scripts/fusion/print-agent-input.ts
 */
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildFusionAgentInput } from '@/server/fusion/agent-input'
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
    "Hardens any part of the user's body to rock-like durability for offense and defense.",
}

const seed = 'demo-prompt-review'
const priorVariants = [
  {
    name: 'Phase Shell',
    description:
      'The user can briefly turn their skin into a permeable shell that lets attacks pass through while keeping bones rigid.',
  },
]

const input = buildFusionAgentInput(quirkA, quirkB, seed, priorVariants)
const json = JSON.stringify(input, null, 2)

const root = getProjectRoot()
const outPath = join(root, 'scripts/fusion/sample-agent-input.json')
writeFileSync(outPath, json, 'utf8')
process.stdout.write(json)
