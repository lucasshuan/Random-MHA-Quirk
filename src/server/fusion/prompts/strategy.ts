import type { FusionCatalogQuirk } from '../catalog'
import { pickUniformFromHash } from './seed-hash'
import { fusionRollKey } from './roll-key'

export const FUSION_STRATEGY_KEYS = [
  'synergy',
  'dominant-a',
  'dominant-b',
  'failure-mode',
] as const

export type FusionStrategyKey = (typeof FUSION_STRATEGY_KEYS)[number]

export function isFusionStrategyKey(value: string): value is FusionStrategyKey {
  return (FUSION_STRATEGY_KEYS as readonly string[]).includes(value)
}

const RANGE_ORDER = ['Self', 'Contact', 'Short', 'Medium', 'Long', 'Area'] as const

export interface ParentFusionContext {
  typeA: string
  typeB: string
  rangeA: string
  rangeB: string
  sameType: boolean
  sharedFacets: string[]
  rangeGapLarge: boolean
  commonPointLines: string[]
}

export interface SelectedFusionStrategy {
  key: FusionStrategyKey
  instruction: string
}

export interface FusionStrategySelectionOptions {
  priorStrategyKeys?: readonly string[]
}

interface StrategyCoherenceGuidance {
  criteria: string[]
}

const STRATEGY_COHERENCE_GUIDANCE: Record<
  FusionStrategyKey,
  StrategyCoherenceGuidance
> = {
  synergy: {
    criteria: [
      'Both parent essences must be indispensable parts of one NEW rule; removing either parent should break the concept.',
      'Combine operations, not just imagery, nouns, colors, or generic force.',
    ],
  },
  'dominant-a': {
    criteria: [
      'Parent A supplies the main operation readers immediately recognize.',
      'Parent B changes exactly one trigger, medium, output, or limitation of that operation; it cannot be decorative flavor.',
    ],
  },
  'dominant-b': {
    criteria: [
      'Parent B supplies the main operation readers immediately recognize.',
      'Parent A changes exactly one trigger, medium, output, or limitation of that operation; it cannot be decorative flavor.',
    ],
  },
  'failure-mode': {
    criteria: [
      'Choose one recognizable operational essence from each parent.',
      'Degrade scale, speed, reach, output, reliability, or versatility; never degrade recognizability.',
      'Name the missing capability through the narrower rule itself, rather than adding vague fatigue to an unrelated effect.',
    ],
  },
}

export function formatStrategyCoherenceGuidance(key: FusionStrategyKey): string {
  const guidance = STRATEGY_COHERENCE_GUIDANCE[key]
  return `Strategy-specific requirements (${key}):
${guidance.criteria.map((criterion) => `- ${criterion}`).join('\n')}`
}

function rangeIndex(range: string): number {
  const index = RANGE_ORDER.indexOf(range as (typeof RANGE_ORDER)[number])
  return index === -1 ? 2 : index
}

function intersectFacets(a: string[], b: string[]): string[] {
  const setB = new Set(b)
  return a.filter((facet) => setB.has(facet))
}

export function analyzeParentPair(
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
): ParentFusionContext {
  const sharedFacets = intersectFacets(quirkA.facets, quirkB.facets)
  const rangeGapLarge =
    Math.abs(rangeIndex(quirkA.range) - rangeIndex(quirkB.range)) >= 3

  const commonPointLines: string[] = [
    `Parent A: ${quirkA.type}, range ${quirkA.range}, facets [${quirkA.facets.join(', ')}]`,
    `Parent B: ${quirkB.type}, range ${quirkB.range}, facets [${quirkB.facets.join(', ')}]`,
  ]

  if (quirkA.type === quirkB.type) {
    commonPointLines.push(`Shared type: ${quirkA.type}`)
  } else {
    commonPointLines.push(`Different types: ${quirkA.type} vs ${quirkB.type} — fusion must reconcile one body plan`)
  }

  if (quirkA.range === quirkB.range) {
    commonPointLines.push(`Shared range: ${quirkA.range}`)
  } else if (rangeGapLarge) {
    commonPointLines.push(
      `Range gap: ${quirkA.range} vs ${quirkB.range} — address reach/body scale in one coherent rule`,
    )
  } else {
    commonPointLines.push(`Adjacent ranges: ${quirkA.range} and ${quirkB.range}`)
  }

  if (sharedFacets.length > 0) {
    commonPointLines.push(`Shared facets (strong anchor): ${sharedFacets.join(', ')}`)
  } else {
    commonPointLines.push(
      'No shared facets — invent a bridge theme that still respects both parents without literal mashup',
    )
  }

  return {
    typeA: quirkA.type,
    typeB: quirkB.type,
    rangeA: quirkA.range,
    rangeB: quirkB.range,
    sameType: quirkA.type === quirkB.type,
    sharedFacets,
    rangeGapLarge,
    commonPointLines,
  }
}

type StrategyDef = {
  key: FusionStrategyKey
  instruction: (
    quirkA: FusionCatalogQuirk,
    quirkB: FusionCatalogQuirk,
  ) => string
}

function pickUniformStrategy(rollKey: string, available: StrategyDef[]): StrategyDef {
  return pickUniformFromHash(rollKey, 'strategy', available)
}

const STRATEGY_DEFS: StrategyDef[] = [
  {
    key: 'synergy',
    instruction: () =>
      'Fusion strategy — unified synergy: weave both parents into one coherent mechanism.',
  },
  {
    key: 'dominant-a',
    instruction: (quirkA, quirkB) =>
      `Fusion strategy — parent A is dominant: ${quirkA.name}'s ${quirkA.type}/${quirkA.range} logic leads; ${quirkB.name} modifies, limits, or reshapes its expression.`,
  },
  {
    key: 'dominant-b',
    instruction: (quirkA, quirkB) =>
      `Fusion strategy — parent B is dominant: ${quirkB.name}'s ${quirkB.type}/${quirkB.range} logic leads; ${quirkA.name} modifies, limits, or reshapes its expression.`,
  },
  {
    key: 'failure-mode',
    instruction: () =>
      'Fusion strategy — failure mode: incomplete genetic fusion, weaker or narrower than either parent.',
  },
]

function buildSelectedStrategy(
  picked: StrategyDef,
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
): SelectedFusionStrategy {
  return {
    key: picked.key,
    instruction: `${picked.instruction(quirkA, quirkB)}
${formatStrategyCoherenceGuidance(picked.key)}`,
  }
}

export function selectFusionStrategy(
  seed: string,
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
  options: FusionStrategySelectionOptions = {},
): SelectedFusionStrategy {
  const rollKey = fusionRollKey(seed, quirkA.id, quirkB.id)
  const priorCounts = new Map<FusionStrategyKey, number>()

  for (const key of options.priorStrategyKeys ?? []) {
    if (!isFusionStrategyKey(key)) continue
    priorCounts.set(key, (priorCounts.get(key) ?? 0) + 1)
  }

  const lowestUseCount = Math.min(
    ...STRATEGY_DEFS.map((def) => priorCounts.get(def.key) ?? 0),
  )
  const leastUsed = STRATEGY_DEFS.filter(
    (def) => (priorCounts.get(def.key) ?? 0) === lowestUseCount,
  )
  const picked = pickUniformStrategy(rollKey, leastUsed)

  return buildSelectedStrategy(picked, quirkA, quirkB)
}

export function resolveFusionStrategyForKey(
  key: string,
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
): SelectedFusionStrategy {
  const picked = STRATEGY_DEFS.find((def) => def.key === key)

  if (!picked) {
    return selectFusionStrategy('fallback-strategy', quirkA, quirkB)
  }

  return buildSelectedStrategy(picked, quirkA, quirkB)
}
