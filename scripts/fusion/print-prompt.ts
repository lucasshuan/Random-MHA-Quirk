/**
 * Prints one production English fusion instruction prompt (no LLM call).
 * Usage: pnpm exec tsx scripts/fusion/print-prompt.ts
 */
import { buildFusionAgentInput } from '@/server/fusion/agent-input'
import { buildFusionEnglishInstructions } from '@/server/fusion/agents/instructions-en'
import type { FusionCatalogQuirk } from '@/server/fusion/catalog'

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
  facets: ['Enhancement'],
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

const input = buildFusionAgentInput(quirkA, quirkB, seed, priorVariants)
const prompt = buildFusionEnglishInstructions(input)
process.stdout.write(prompt)
