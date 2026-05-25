import {
  isFusionAntiMashupRuleKey,
  resolveAntiMashupRuleKey,
  type FusionAntiMashupRuleKey,
} from './prompts/anti-mashup'
import { isFusionStrategyKey } from './prompts/strategy'
import type { FusionRollMeta } from '@/types/fusion'

function resolveAntiMashupRuleKeyFromLegacy(
  strategyKey: string,
  legacyRule?: string,
): FusionAntiMashupRuleKey {
  if (legacyRule?.includes('failure-mode is reduced-potential')) {
    return 'failure-reduced'
  }
  if (legacyRule?.includes('one coherent mechanism')) {
    return 'coherent-loop'
  }
  if (isFusionStrategyKey(strategyKey)) {
    return resolveAntiMashupRuleKey(strategyKey)
  }
  return 'modifier-cost'
}

/** Normalizes roll JSON from Supabase (supports legacy antiMashupRule text). */
export function parseFusionRollMeta(raw: unknown): FusionRollMeta | null {
  if (!raw || typeof raw !== 'object') return null
  const record = raw as Record<string, unknown>
  const strategyKey =
    typeof record.strategyKey === 'string' ? record.strategyKey.trim() : ''
  const nameRegister =
    typeof record.nameRegister === 'string' ? record.nameRegister.trim() : ''

  const keyFromField =
    typeof record.antiMashupRuleKey === 'string'
      ? record.antiMashupRuleKey.trim()
      : ''
  const legacyRule =
    typeof record.antiMashupRule === 'string' ? record.antiMashupRule.trim() : ''

  const antiMashupRuleKey = isFusionAntiMashupRuleKey(keyFromField)
    ? keyFromField
    : legacyRule
      ? resolveAntiMashupRuleKeyFromLegacy(strategyKey, legacyRule)
      : isFusionStrategyKey(strategyKey)
        ? resolveAntiMashupRuleKey(strategyKey)
        : null

  if (!strategyKey || !nameRegister || !antiMashupRuleKey) {
    return null
  }

  return { strategyKey, nameRegister, antiMashupRuleKey }
}
