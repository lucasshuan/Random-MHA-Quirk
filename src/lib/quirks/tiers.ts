import { QUIRK_DISPLAY_TIERS, QUIRK_TIERS, type QuirkTier } from '@/types/quirk'

export const ALL_QUIRK_TIERS: QuirkTier[] = [...QUIRK_TIERS]

/** Tier picker default: S–C on, Ω (Special) off. */
export const DEFAULT_SELECTED_TIERS: QuirkTier[] = [...QUIRK_DISPLAY_TIERS]

export function toggleTier(selected: QuirkTier[], tier: QuirkTier): QuirkTier[] {
  return selected.includes(tier)
    ? selected.filter((value) => value !== tier)
    : [...selected, tier]
}
