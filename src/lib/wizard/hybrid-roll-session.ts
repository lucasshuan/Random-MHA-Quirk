import type { QuirkFilters } from '@/types/quirk'
import type { QuirkId } from '@/types/quirk-id'

const STORAGE_KEY = 'mha-quirk:hybrid-roll-session'

export interface HybridRollSessionSettings {
  slotFilters: [QuirkFilters, QuirkFilters]
  manualParentIds: [QuirkId | null, QuirkId | null]
}

interface HybridRollSessionRecord extends HybridRollSessionSettings {
  parentA: QuirkId
  parentB: QuirkId
  seed: string
  savedAt: number
}

function readRecord(): HybridRollSessionRecord | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as HybridRollSessionRecord
    if (
      !parsed ||
      typeof parsed.parentA !== 'string' ||
      typeof parsed.parentB !== 'string' ||
      typeof parsed.seed !== 'string' ||
      !Array.isArray(parsed.slotFilters) ||
      parsed.slotFilters.length !== 2 ||
      !Array.isArray(parsed.manualParentIds) ||
      parsed.manualParentIds.length !== 2
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function saveHybridRollSession(
  parentA: QuirkId,
  parentB: QuirkId,
  seed: string,
  settings: HybridRollSessionSettings,
): void {
  if (typeof window === 'undefined') {
    return
  }

  const record: HybridRollSessionRecord = {
    parentA,
    parentB,
    seed,
    slotFilters: settings.slotFilters,
    manualParentIds: settings.manualParentIds,
    savedAt: Date.now(),
  }

  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(record))
}

export function matchHybridRollSession(
  parentA: QuirkId,
  parentB: QuirkId,
  seed: string,
): HybridRollSessionSettings | null {
  const record = readRecord()
  if (!record) {
    return null
  }

  if (record.parentA !== parentA || record.parentB !== parentB || record.seed !== seed) {
    return null
  }

  return {
    slotFilters: record.slotFilters,
    manualParentIds: record.manualParentIds,
  }
}

export function clearHybridRollSession(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(STORAGE_KEY)
}
