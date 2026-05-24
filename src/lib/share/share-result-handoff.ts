import type { HybridRollResult } from '@/types/fusion'
import type { Quirk } from '@/types/quirk'

const STORAGE_KEY = 'mha-quirk:share-result-handoff'

export type ShareResultHandoff = Quirk | HybridRollResult

export interface ConsumedShareResultHandoff {
  result: ShareResultHandoff
  animateEntrance: boolean
}

interface ShareResultHandoffRecord {
  sharePath: string
  result: ShareResultHandoff
  animateEntrance: boolean
  savedAt: number
}

function isQuirk(value: unknown): value is Quirk {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Quirk).id === 'string' &&
    typeof (value as Quirk).name === 'string'
  )
}

function isHybridRollResult(value: unknown): value is HybridRollResult {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  const candidate = value as HybridRollResult
  return (
    Array.isArray(candidate.parents) &&
    candidate.parents.length === 2 &&
    isQuirk(candidate.parents[0]) &&
    isQuirk(candidate.parents[1]) &&
    typeof candidate.seed === 'string'
  )
}

function isShareResultHandoff(value: unknown): value is ShareResultHandoff {
  return isQuirk(value) || isHybridRollResult(value)
}

export function saveShareResultHandoff(
  sharePath: string,
  result: ShareResultHandoff,
  options?: { animateEntrance?: boolean },
): void {
  if (typeof window === 'undefined') {
    return
  }

  const record: ShareResultHandoffRecord = {
    sharePath,
    result,
    animateEntrance: options?.animateEntrance ?? true,
    savedAt: Date.now(),
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record))
}

export function consumeShareResultHandoff(
  sharePath: string,
): ConsumedShareResultHandoff | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    window.sessionStorage.removeItem(STORAGE_KEY)

    const parsed = JSON.parse(raw) as ShareResultHandoffRecord
    if (!parsed?.sharePath || parsed.sharePath !== sharePath) {
      return null
    }

    if (!isShareResultHandoff(parsed.result)) {
      return null
    }

    return {
      result: parsed.result,
      animateEntrance: parsed.animateEntrance !== false,
    }
  } catch {
    return null
  }
}

export function clearShareResultHandoff(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(STORAGE_KEY)
}
