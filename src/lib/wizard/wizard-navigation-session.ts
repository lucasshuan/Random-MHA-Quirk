import type {
  ResultMode,
  SimpleTypeChoice,
  WizardStep,
} from '@/lib/wizard/flow'
import type { QuirkFilters, QuirkTier } from '@/types/quirk'
import type { QuirkId } from '@/types/quirk-id'

const NAVIGATION_STORAGE_KEY = 'mha-quirk:wizard-navigation'
const RESTORE_STORAGE_KEY = 'mha-quirk:wizard-navigation-restore'

export type WizardPickPhase = 'type' | 'tier' | 'manual'
export type WizardTierEntrySource = 'type' | 'advanced'

export interface WizardNavigationSnapshot {
  returnStep: WizardStep
  mode: ResultMode
  filters: QuirkFilters
  resultBackStep: WizardStep
  pickPhase: WizardPickPhase
  pendingType: SimpleTypeChoice | null
  selectedTiers: QuirkTier[]
  tierSlideDirection: 'forward' | 'back'
  manualFilters: QuirkFilters
  hybridTypeStep: 0 | 1
  manualParentIds: [QuirkId | null, QuirkId | null]
  hybridTypes: [SimpleTypeChoice | null, SimpleTypeChoice | null]
  hybridSlotFilters: [QuirkFilters, QuirkFilters]
  hybridReachedSecondType: boolean
  tierEntrySource: WizardTierEntrySource
}

interface WizardNavigationRecord {
  sharePath: string
  snapshot: WizardNavigationSnapshot
  savedAt: number
}

function readNavigationRecord(): WizardNavigationRecord | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.sessionStorage.getItem(NAVIGATION_STORAGE_KEY)
    if (!raw) {
      return null
    }

    const parsed = JSON.parse(raw) as WizardNavigationRecord
    if (!parsed?.sharePath || !parsed.snapshot) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function saveWizardNavigationForShare(
  sharePath: string,
  snapshot: WizardNavigationSnapshot,
): void {
  if (typeof window === 'undefined') {
    return
  }

  const record: WizardNavigationRecord = {
    sharePath,
    snapshot,
    savedAt: Date.now(),
  }

  window.sessionStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(record))
}

export function matchWizardNavigationForShare(
  sharePath: string,
): WizardNavigationSnapshot | null {
  const record = readNavigationRecord()
  if (!record || record.sharePath !== sharePath) {
    return null
  }

  return record.snapshot
}

export function queueWizardNavigationRestore(snapshot: WizardNavigationSnapshot): void {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.setItem(RESTORE_STORAGE_KEY, JSON.stringify(snapshot))
}

export function consumeWizardNavigationRestore(): WizardNavigationSnapshot | null {
  if (typeof window === 'undefined') {
    return null
  }

  try {
    const raw = window.sessionStorage.getItem(RESTORE_STORAGE_KEY)
    if (!raw) {
      return null
    }

    window.sessionStorage.removeItem(RESTORE_STORAGE_KEY)
    return JSON.parse(raw) as WizardNavigationSnapshot
  } catch {
    return null
  }
}

export function clearWizardNavigationSession(): void {
  if (typeof window === 'undefined') {
    return
  }

  window.sessionStorage.removeItem(NAVIGATION_STORAGE_KEY)
  window.sessionStorage.removeItem(RESTORE_STORAGE_KEY)
}
