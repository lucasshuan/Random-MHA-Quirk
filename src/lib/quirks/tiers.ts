import {
  DEFAULT_TIER_PICKER_SELECTION,
  QUIRK_TIERS,
  type QuirkTier,
} from '@/types/quirk'

export const ALL_QUIRK_TIERS: QuirkTier[] = [...QUIRK_TIERS]

/** Tier picker default: S–C on; Ω (Special) and D (gag) off. */
export const DEFAULT_SELECTED_TIERS: QuirkTier[] = [...DEFAULT_TIER_PICKER_SELECTION]

export function toggleTier(selected: QuirkTier[], tier: QuirkTier): QuirkTier[] {
  return selected.includes(tier)
    ? selected.filter((value) => value !== tier)
    : [...selected, tier]
}
