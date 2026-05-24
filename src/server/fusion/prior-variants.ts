import type { FusionCatalogQuirk } from './catalog'
import { deriveFusionRollContext } from './prompts/roll-context'
import type { FusionPriorVariant, FusionRollMeta } from '@/types/fusion'
import { QUIRK_TIERS, type QuirkFacet, QuirkRange, QuirkTier, QuirkType } from '@/types/quirk'

export const MAX_PRIOR_VARIANTS = 12
/** Prior variants with descriptions shown in the fusion prompt (diversity guidance). */
export const MAX_PRIOR_VARIANTS_IN_PROMPT = 3
/** English titles listed in the fusion prompt as already taken for this parent pair. */
export const MAX_SIBLING_NAMES_IN_PROMPT = 10

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

/** Parent catalog names first, then sibling fusion titles (deduped, case-insensitive). */
export function mergeForbiddenFusionTitles(
  parentAName: string,
  parentBName: string,
  siblingTitles: readonly string[] = [],
): string[] {
  const seen = new Set<string>()
  const out: string[] = []

  const add = (name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return

    const key = normalizedVariantName(trimmed)
    if (seen.has(key)) return
    seen.add(key)
    out.push(trimmed)
  }

  add(parentAName)
  add(parentBName)
  for (const title of siblingTitles) add(title)
  return out
}

export function hasDuplicateFusionName(
  name: string,
  priorVariants: FusionPriorVariant[],
): boolean {
  const key = normalizedVariantName(name)
  return priorVariants.some((variant) => normalizedVariantName(variant.name) === key)
}

export function isSiblingNameTaken(
  name: string,
  takenNames: readonly string[],
): boolean {
  const key = normalizedVariantName(name)
  return takenNames.some((taken) => normalizedVariantName(taken) === key)
}

export function collectSiblingNames(
  rows: StoredPriorRow[],
  options?: { excludeKey?: string; limit?: number },
): string[] {
  const seen = new Set<string>()
  const names: string[] = []

  for (const row of rows) {
    if (options?.excludeKey && row.key === options.excludeKey) continue

    const name = row.en?.name?.trim()
    if (!name) continue

    const nameKey = normalizedVariantName(name)
    if (seen.has(nameKey)) continue
    seen.add(nameKey)
    names.push(name)
  }

  names.sort((a, b) => a.localeCompare(b))

  if (options?.limit === undefined) {
    return names
  }

  return names.slice(0, options.limit)
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
      row.tier && QUIRK_TIERS.includes(row.tier as QuirkTier)
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
  const limit = Math.min(
    options?.limit ?? MAX_PRIOR_VARIANTS_IN_PROMPT,
    MAX_PRIOR_VARIANTS_IN_PROMPT,
  )
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
      row.tier && QUIRK_TIERS.includes(row.tier as QuirkTier)
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
