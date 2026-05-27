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
  criteria: (
    quirkA: FusionCatalogQuirk,
    quirkB: FusionCatalogQuirk,
  ) => string[]
}

const STRATEGY_COHERENCE_GUIDANCE: Record<
  FusionStrategyKey,
  StrategyCoherenceGuidance
> = {
  synergy: {
    criteria: (quirkA, quirkB) => [
      `Treat ${quirkA.name} and ${quirkB.name} as ingredients for one new Quirk, not as two powers sharing space.`,
      `Prefer a clean third concept when ${quirkA.name} and ${quirkB.name} naturally imply one: an organism, material, reaction, device, phenomenon, mythic form, sport, or other recognizable derivative.`,
      `Do not force ${quirkA.name} or ${quirkB.name} key nouns into the final name when a clearer derived name fits better.`,
    ],
  },

  'dominant-a': {
    criteria: (quirkA, quirkB) => [
      `${quirkA.name} should be the clearest parent in the final Quirk.`,
      `${quirkB.name} should reshape ${quirkA.name} into a new form, medium, behavior, weakness, or expression, not merely decorate it.`,
      `Let ${quirkA.name} evolve into a fitting third concept through ${quirkB.name}'s influence, rather than staying as a literal version of ${quirkA.name}.`,
    ],
  },

  'dominant-b': {
    criteria: (quirkA, quirkB) => [
      `${quirkB.name} should be the clearest parent in the final Quirk.`,
      `${quirkA.name} should reshape ${quirkB.name} into a new form, medium, behavior, weakness, or expression, not merely decorate it.`,
      `Let ${quirkA.name} evolve into a fitting third concept through ${quirkB.name}'s influence, rather than staying as a literal version of ${quirkA.name}.`,
    ],
  },

  'failure-mode': {
    criteria: (quirkA, quirkB) => [
      `The result should still be recognizably descended from both ${quirkA.name} and ${quirkB.name}.`,
      `Make the fusion incomplete, unstable, narrow, weaker, stranger, or harder to use because the two inheritances did not settle cleanly.`,
      `The flaw should come from the tension between ${quirkA.name} and ${quirkB.name}, not from generic fatigue or random backlash.`,
      `A third concept is allowed, but it should feel like a damaged, partial, or malformed version of what ${quirkA.name} and ${quirkB.name} could have become.`,
    ],
  },
}

export function formatStrategyCoherenceGuidance(
  key: FusionStrategyKey,
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
): string {
  const guidance = STRATEGY_COHERENCE_GUIDANCE[key]
  return `Strategy-specific requirements (${key}):
${guidance.criteria(quirkA, quirkB).map((criterion) => `- ${criterion}`).join('\n')}`
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
    `${quirkA.name}: type ${quirkA.type}, range ${quirkA.range}, facets [${quirkA.facets.join(', ')}]`,
    `${quirkB.name}: type ${quirkB.type}, range ${quirkB.range}, facets [${quirkB.facets.join(', ')}]`,
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
      'Fusion style — blended inheritance: create one natural Quirk that feels born from both parents.',
  },
  {
    key: 'dominant-a',
    instruction: (quirkA, quirkB) =>
      `Fusion style — ${quirkA.name} leads: the child mostly inherits ${quirkA.name}'s feel, while ${quirkB.name} reshapes how it appears, behaves, or fails.`,
  },
  {
    key: 'dominant-b',
    instruction: (quirkA, quirkB) =>
      `Fusion style — ${quirkB.name} leads: the child mostly inherits ${quirkB.name}'s feel, while ${quirkA.name} reshapes how it appears, behaves, or fails.`,
  },
  {
    key: 'failure-mode',
    instruction: () =>
      'Fusion style — imperfect inheritance: create a flawed, partial, or unstable Quirk descended from both parents.',
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
${formatStrategyCoherenceGuidance(picked.key, quirkA, quirkB)}`,
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
