import type { FusionCatalogQuirk } from '../catalog'
import { hashSeed } from './seed-hash'
import { fusionRollKey } from './roll-key'

export type FusionStrategyKey =
  | 'synergy'
  | 'dominant-a'
  | 'dominant-b'
  | 'facet-anchor'
  | 'body-weave'
  | 'emission-bridge'
  | 'range-meet'
  | 'oscillation'
  | 'byproduct'
  | 'failure-mode'

const RANGE_ORDER = ['Self', 'Contact', 'Short', 'Medium', 'Long', 'Area'] as const

const BODY_FACETS = new Set(['Anthropomorphic', 'Biological'])
const PROJECTION_FACETS = new Set(['Elemental', 'Emission', 'Construct'])

export interface ParentFusionContext {
  typeA: string
  typeB: string
  rangeA: string
  rangeB: string
  facetsA: string[]
  facetsB: string[]
  sameType: boolean
  sameRange: boolean
  sharedFacets: string[]
  rangeGapLarge: boolean
  hasMutant: boolean
  hasEmitter: boolean
  commonPointLines: string[]
}

export interface SelectedFusionStrategy {
  key: FusionStrategyKey
  instruction: string
  contextBlock: string
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
    facetsA: quirkA.facets,
    facetsB: quirkB.facets,
    sameType: quirkA.type === quirkB.type,
    sameRange: quirkA.range === quirkB.range,
    sharedFacets,
    rangeGapLarge,
    hasMutant: quirkA.type === 'Mutant' || quirkB.type === 'Mutant',
    hasEmitter: quirkA.type === 'Emitter' || quirkB.type === 'Emitter',
    commonPointLines,
  }
}

type StrategyDef = {
  key: FusionStrategyKey
  eligible: (ctx: ParentFusionContext) => boolean
  instruction: (
    ctx: ParentFusionContext,
    quirkA: FusionCatalogQuirk,
    quirkB: FusionCatalogQuirk,
  ) => string
}

const NICHE_STRATEGY_KEYS = new Set<FusionStrategyKey>(['byproduct', 'failure-mode'])
const NICHE_BOOST_THRESHOLD = 6
const NICHE_BOOST_COPIES = 4

function pickWeightedStrategy(rollKey: string, eligible: StrategyDef[]): StrategyDef {
  const weighted: StrategyDef[] = []

  for (const def of eligible) {
    weighted.push(def)
    if (
      eligible.length >= NICHE_BOOST_THRESHOLD &&
      NICHE_STRATEGY_KEYS.has(def.key)
    ) {
      for (let i = 0; i < NICHE_BOOST_COPIES; i++) weighted.push(def)
    }
  }

  return weighted[hashSeed(rollKey, 'strategy') % weighted.length] ?? eligible[0]
}

function appendStrategyGuidance(key: FusionStrategyKey, instruction: string): string {
  if (key === 'byproduct') {
    return `${instruction} The primary fantasy must stay narrow or awkward — the secondary byproduct is not a free combat upgrade.`
  }
  if (key === 'failure-mode') {
    return `${instruction} State what was lost, suppressed, or never expressed — do not word around the cap to restore either parent's full fantasy.`
  }
  return instruction
}

const STRATEGY_DEFS: StrategyDef[] = [
  {
    key: 'synergy',
    eligible: () => true,
    instruction: () =>
      'Fusion strategy — unified synergy: weave both parents into ONE coherent mechanism (one birth Quirk, one core idea). Do not present two separate powers stapled together.',
  },
  {
    key: 'dominant-a',
    eligible: () => true,
    instruction: (_ctx, quirkA, quirkB) =>
      `Fusion strategy — parent A is dominant and leads: ${quirkA.name}'s ${quirkA.type}/${quirkA.range} logic is the main engine; ${quirkB.name} only subtly modifies, limits, or reshapes how that engine expresses.`,
  },
  {
    key: 'dominant-b',
    eligible: () => true,
    instruction: (_ctx, quirkA, quirkB) =>
      `Fusion strategy — parent B is dominant and leads: ${quirkB.name}'s ${quirkB.type}/${quirkB.range} logic is the main engine; ${quirkA.name} only subtly modifies, limits, or reshapes how that engine expresses.`,
  },
  {
    key: 'facet-anchor',
    eligible: (ctx) => ctx.sharedFacets.length > 0,
    instruction: (ctx) =>
      `Fusion strategy — facet anchor: build the hybrid around the shared facet(s) [${ctx.sharedFacets.join(', ')}] as the common point; both parents should feed that theme, not compete for attention.`,
  },
  {
    key: 'body-weave',
    eligible: (ctx) =>
      ctx.hasMutant ||
      ctx.typeA === 'Transformation' ||
      ctx.typeB === 'Transformation' ||
      ctx.sharedFacets.some((f) => BODY_FACETS.has(f)) ||
      (ctx.facetsA.some((f) => BODY_FACETS.has(f)) &&
        ctx.facetsB.some((f) => BODY_FACETS.has(f))),
    instruction: (ctx) =>
      `Fusion strategy — body weave: the hybrid is body-first (${ctx.hasMutant ? 'Mutant' : 'Transformation/biological'} DNA). Focus on anatomy, skin, limbs, permanent or triggered form changes, and what stays on the user vs what leaves the body.`,
  },
  {
    key: 'emission-bridge',
    eligible: (ctx) =>
      ctx.hasEmitter ||
      ctx.sharedFacets.some((f) => PROJECTION_FACETS.has(f)) ||
      rangeIndex(ctx.rangeA) >= 4 ||
      rangeIndex(ctx.rangeB) >= 4,
    instruction: (ctx) =>
      `Fusion strategy — emission bridge: the hybrid projects outward (${ctx.hasEmitter ? 'Emitter' : 'long-range/projection'} DNA). State clearly what detaches, travels, coats, or hits at distance vs what remains on the body.`,
  },
  {
    key: 'range-meet',
    eligible: (ctx) => !ctx.sameRange,
    instruction: (ctx) =>
      `Fusion strategy — range meet: parents differ in reach (${ctx.rangeA} vs ${ctx.rangeB}). The hybrid needs one explicit rule for how close vs far effects work (e.g. stronger at one band, shape change by distance, or cost to extend).`,
  },
  {
    key: 'oscillation',
    eligible: (ctx) => !ctx.sameType && !(ctx.typeA === 'Mutant' && ctx.typeB === 'Mutant'),
    instruction: (_ctx, quirkA, quirkB) =>
      `Fusion strategy — oscillation: same Quirk, two modes (not two quirks). One mode echoes ${quirkA.type} behavior, the other ${quirkB.type}; switching has a concrete cost.`,
  },
  {
    key: 'byproduct',
    eligible: () => true,
    instruction: () =>
      'Fusion strategy — byproduct: one clear primary effect carries the design, plus a secondary odd or niche effect (situational, awkward, or subtle).',
  },
  {
    key: 'failure-mode',
    eligible: () => true,
    instruction: () =>
      'Fusion strategy — failure mode: incomplete genetic fusion — the birth Quirk is weaker or narrower than either parent (less reach, output, reliability, or scope). One parent\'s core barely survives; the other shows up only as loss, friction, or a hard cap — never both parents\' kits at usable strength.',
  },
]

export function selectFusionStrategy(
  seed: string,
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
): SelectedFusionStrategy {
  const ctx = analyzeParentPair(quirkA, quirkB)
  const eligible = STRATEGY_DEFS.filter((def) => def.eligible(ctx))
  const rollKey = fusionRollKey(seed, quirkA.id, quirkB.id)
  const picked = pickWeightedStrategy(rollKey, eligible)

  const contextBlock = [
    'Parent fusion context (informs strategy — do not quote parent names in the final description):',
    ...ctx.commonPointLines.map((line) => `- ${line}`),
  ].join('\n')

  const instruction = appendStrategyGuidance(
    picked.key,
    picked.instruction(ctx, quirkA, quirkB),
  )

  return {
    key: picked.key,
    instruction,
    contextBlock,
  }
}
