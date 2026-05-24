import type { FusionCatalogQuirk } from '../catalog'
import { pickUniformFromHash } from './seed-hash'
import { fusionRollKey } from './roll-key'

export const FUSION_STRATEGY_KEYS = [
  'synergy',
  'dominant-a',
  'dominant-b',
  'facet-anchor',
  'body-weave',
  'emission-bridge',
  'range-meet',
  'oscillation',
  'byproduct',
  'failure-mode',
] as const

export type FusionStrategyKey = (typeof FUSION_STRATEGY_KEYS)[number]

export function isFusionStrategyKey(value: string): value is FusionStrategyKey {
  return (FUSION_STRATEGY_KEYS as readonly string[]).includes(value)
}

const RANGE_ORDER = ['Self', 'Contact', 'Short', 'Medium', 'Long', 'Area'] as const

const BODY_FACETS = new Set(['Anthropomorphic', 'Biological'])
const PROJECTION_FACETS = new Set(['Elemental', 'Construct', 'Emission'])

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
  'facet-anchor': {
    criteria: [
      'Use the shared facet as common ground, then state the distinct operation each parent contributes to the resulting NEW rule.',
      'A shared tag is not itself a mechanic and cannot excuse losing either parent essence or copying one parent alone.',
    ],
  },
  'body-weave': {
    criteria: [
      'The body trait or temporary form must cause a NEW effect, not reproduce one parent body plan unchanged with a metaphor.',
      'Any emitted or controlled material must visibly come from that body mechanism.',
    ],
  },
  'emission-bridge': {
    criteria: [
      'Define what is emitted and the exact change it causes on contact or within range.',
      'The emission must carry the other parent operation; a themed blast or pressure wave is not inheritance.',
    ],
  },
  'range-meet': {
    criteria: [
      'Change delivery distance only through one understandable rule; preserve the core operation from each parent.',
      'Do not replace a close-range parent with generic projectiles merely because the output range is longer.',
    ],
  },
  oscillation: {
    criteria: [
      'Both phases must be states of the same resource or mechanism, with a plain switch condition.',
      'The second phase spends, reverses, redirects, or exposes what the first phase produced; it is not a second kit.',
    ],
  },
  byproduct: {
    criteria: [
      'The secondary effect must be an inevitable fallout of the primary mechanism, not an added benefit.',
      'Keep both parent essences in the primary rule even when the byproduct is minor.',
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

function pickUniformStrategy(rollKey: string, eligible: StrategyDef[]): StrategyDef {
  return pickUniformFromHash(rollKey, 'strategy', eligible)
}

const STRATEGY_DEFS: StrategyDef[] = [
  {
    key: 'synergy',
    eligible: () => true,
    instruction: () =>
      'Fusion strategy — unified synergy: weave both parents into one coherent mechanism.',
  },
  {
    key: 'dominant-a',
    eligible: () => true,
    instruction: (_ctx, quirkA, quirkB) =>
      `Fusion strategy — parent A is dominant: ${quirkA.name}'s ${quirkA.type}/${quirkA.range} logic leads; ${quirkB.name} modifies, limits, or reshapes its expression.`,
  },
  {
    key: 'dominant-b',
    eligible: () => true,
    instruction: (_ctx, quirkA, quirkB) =>
      `Fusion strategy — parent B is dominant: ${quirkB.name}'s ${quirkB.type}/${quirkB.range} logic leads; ${quirkA.name} modifies, limits, or reshapes its expression.`,
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
      `Fusion strategy — range meet: parents differ in reach (${ctx.rangeA} vs ${ctx.rangeB}). Keep one core effect and one simple distance rule (stronger up close, weaker far away, or the opposite).`,
  },
  {
    key: 'oscillation',
    eligible: (ctx) =>
      !ctx.sameType &&
      !ctx.rangeGapLarge &&
      ctx.sharedFacets.length > 0 &&
      !(ctx.typeA === 'Mutant' && ctx.typeB === 'Mutant'),
    instruction: (_ctx, quirkA, quirkB) =>
      `Fusion strategy — oscillation: same Quirk with a brief delivery shift, not two separate kits. Default behavior stays unified; a short switch can echo ${quirkA.type} or ${quirkB.type} style with one clear cost.`,
  },
  {
    key: 'byproduct',
    eligible: (ctx) => ctx.sharedFacets.length > 0 && !ctx.rangeGapLarge,
    instruction: () =>
      'Fusion strategy — byproduct: one clear primary effect carries the design; any secondary effect is brief, minor fallout, not a free combat upgrade.',
  },
  {
    key: 'failure-mode',
    eligible: () => true,
    instruction: () =>
      'Fusion strategy — failure mode: incomplete genetic fusion, weaker or narrower than either parent. State what was lost, suppressed, or never expressed.',
  },
]

function buildSelectedStrategy(
  picked: StrategyDef,
  ctx: ParentFusionContext,
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
): SelectedFusionStrategy {
  return {
    key: picked.key,
    instruction: `${picked.instruction(ctx, quirkA, quirkB)}
${formatStrategyCoherenceGuidance(picked.key)}`,
  }
}

export function selectFusionStrategy(
  seed: string,
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
  options: FusionStrategySelectionOptions = {},
): SelectedFusionStrategy {
  const ctx = analyzeParentPair(quirkA, quirkB)
  const eligible = STRATEGY_DEFS.filter((def) => def.eligible(ctx))
  const rollKey = fusionRollKey(seed, quirkA.id, quirkB.id)
  const priorCounts = new Map<FusionStrategyKey, number>()

  for (const key of options.priorStrategyKeys ?? []) {
    if (!isFusionStrategyKey(key)) continue
    priorCounts.set(key, (priorCounts.get(key) ?? 0) + 1)
  }

  const lowestUseCount = Math.min(
    ...eligible.map((def) => priorCounts.get(def.key) ?? 0),
  )
  const leastUsed = eligible.filter(
    (def) => (priorCounts.get(def.key) ?? 0) === lowestUseCount,
  )
  const picked = pickUniformStrategy(rollKey, leastUsed)

  return buildSelectedStrategy(picked, ctx, quirkA, quirkB)
}

export function resolveFusionStrategyForKey(
  key: string,
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
): SelectedFusionStrategy {
  const ctx = analyzeParentPair(quirkA, quirkB)
  const picked = STRATEGY_DEFS.find(
    (def) => def.key === key && def.eligible(ctx),
  )

  if (!picked) {
    return selectFusionStrategy('fallback-strategy', quirkA, quirkB)
  }

  return buildSelectedStrategy(picked, ctx, quirkA, quirkB)
}
