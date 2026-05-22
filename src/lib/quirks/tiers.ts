import { QUIRK_TIERS, type QuirkTier } from '../types/quirk'

export const ALL_QUIRK_TIERS: QuirkTier[] = [...QUIRK_TIERS]

export function toggleTier(selected: QuirkTier[], tier: QuirkTier): QuirkTier[] {
  return selected.includes(tier)
    ? selected.filter((value) => value !== tier)
    : [...selected, tier]
}
