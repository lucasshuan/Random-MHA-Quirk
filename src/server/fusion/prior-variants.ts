import type { FusionCatalogQuirk } from './catalog'
import { deriveFusionRollContext } from './prompts/roll-context'
import type { FusionPriorVariant, FusionRollMeta } from '@/types/fusion'
import type { QuirkFacet, QuirkRange, QuirkTier, QuirkType } from '@/types/quirk'

export const MAX_PRIOR_VARIANTS = 12

export interface FusionPriorVariantMatch {
  tier: QuirkTier
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
  roll: FusionRollMeta
}

interface PriorVariantCandidate extends FusionPriorVariant {
  score: number
}

interface StoredPriorRow {
  key: string
  seed: string
  en: { name: string; description: string }
  type: string
  range: string
  facets: string[]
  tier: string | null
  roll: FusionRollMeta | null
}

function facetOverlap(a: QuirkFacet[], b: QuirkFacet[]): number {
  const setB = new Set(b)
  return a.filter((facet) => setB.has(facet)).length
}

function normalizedVariantName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase()
}

export function hasDuplicateFusionName(
  name: string,
  priorVariants: FusionPriorVariant[],
): boolean {
  const key = normalizedVariantName(name)
  return priorVariants.some((variant) => normalizedVariantName(variant.name) === key)
}

/** Higher score = roll parameters closer to the variant being generated. */
export function scorePriorVariantSimilarity(
  candidate: FusionPriorVariantMatch,
  target: FusionPriorVariantMatch,
): number {
  let score = 0
  if (candidate.roll.strategyKey === target.roll.strategyKey) score += 5
  if (candidate.roll.nameRegister === target.roll.nameRegister) score += 4
  if (candidate.roll.utilityNiche === target.roll.utilityNiche) score += 3
  if (candidate.roll.antiMashupRuleKey === target.roll.antiMashupRuleKey) score += 2
  if (candidate.type === target.type) score += 2
  if (candidate.range === target.range) score += 2
  if (candidate.tier === target.tier) score += 1
  score += facetOverlap(candidate.facets, target.facets)
  return score
}

function resolveCandidateMatch(
  row: StoredPriorRow,
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
  parsedRoll: FusionRollMeta | null,
  parsedTier: QuirkTier | null,
): FusionPriorVariantMatch | null {
  const ctx = deriveFusionRollContext(row.seed, quirkA, quirkB)
  return {
    tier: parsedTier ?? ctx.tier,
    type: (row.type as QuirkType) || ctx.outputRoll.type,
    range: (row.range as QuirkRange) || ctx.outputRoll.range,
    facets: (row.facets as QuirkFacet[])?.length
      ? (row.facets as QuirkFacet[])
      : ctx.outputRoll.facets,
    roll: parsedRoll ?? ctx.roll,
  }
}

export function pickPriorVariantsForPrompt(
  rows: StoredPriorRow[],
  target: FusionPriorVariantMatch,
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
  options?: { excludeKey?: string; limit?: number },
): FusionPriorVariant[] {
  const limit = Math.min(options?.limit ?? MAX_PRIOR_VARIANTS, MAX_PRIOR_VARIANTS)
  const seenNames = new Set<string>()
  const ranked: PriorVariantCandidate[] = []

  for (const row of rows) {
    if (options?.excludeKey && row.key === options.excludeKey) continue

    const name = row.en?.name?.trim()
    const description = row.en?.description?.trim()
    if (!name || !description) continue

    const nameKey = name.toLowerCase()
    if (seenNames.has(nameKey)) continue
    seenNames.add(nameKey)

    const tier =
      row.tier && ['S', 'A', 'B', 'C'].includes(row.tier)
        ? (row.tier as QuirkTier)
        : null

    const match = resolveCandidateMatch(row, quirkA, quirkB, row.roll, tier)
    if (!match) continue

    ranked.push({
      name,
      description,
      roll: match.roll,
      score: scorePriorVariantSimilarity(match, target),
    })
  }

  ranked.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))

  return ranked
    .slice(0, limit)
    .map(({ name, description, roll }) => ({ name, description, roll }))
}

export function pickSiblingVariantsForPrompt(
  rows: StoredPriorRow[],
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
  options?: { excludeKey?: string; limit?: number },
): FusionPriorVariant[] {
  const limit = Math.min(options?.limit ?? MAX_PRIOR_VARIANTS, MAX_PRIOR_VARIANTS)
  const seenNames = new Set<string>()
  const siblings: FusionPriorVariant[] = []

  for (const row of rows) {
    if (options?.excludeKey && row.key === options.excludeKey) continue

    const name = row.en?.name?.trim()
    const description = row.en?.description?.trim()
    if (!name || !description) continue

    const nameKey = normalizedVariantName(name)
    if (seenNames.has(nameKey)) continue
    seenNames.add(nameKey)

    const tier =
      row.tier && ['S', 'A', 'B', 'C'].includes(row.tier)
        ? (row.tier as QuirkTier)
        : null
    const match = resolveCandidateMatch(row, quirkA, quirkB, row.roll, tier)
    if (!match) continue

    siblings.push({ name, description, roll: match.roll })
  }

  return siblings
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, limit)
}
