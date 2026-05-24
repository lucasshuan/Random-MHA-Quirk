import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_QUIRK_FILTERS } from '@/types/quirk'
import {
  clearWizardNavigationSession,
  consumeWizardNavigationRestore,
  matchWizardNavigationForShare,
  queueWizardNavigationRestore,
  saveWizardNavigationForShare,
  type WizardNavigationSnapshot,
} from './wizard-navigation-session'

const sessionStore = new Map<string, string>()

const snapshot: WizardNavigationSnapshot = {
  returnStep: 'type',
  mode: 'hybrid',
  filters: DEFAULT_QUIRK_FILTERS,
  resultBackStep: 'type',
  pickPhase: 'type',
  pendingType: null,
  selectedTiers: ['S', 'A', 'B', 'C'],
  tierSlideDirection: 'forward',
  manualFilters: DEFAULT_QUIRK_FILTERS,
  hybridTypeStep: 1,
  manualParentIds: [null, null],
  hybridTypes: ['Emitter', null],
  hybridSlotFilters: [DEFAULT_QUIRK_FILTERS, DEFAULT_QUIRK_FILTERS],
  hybridReachedSecondType: true,
  tierEntrySource: 'type',
}

describe('wizard-navigation-session', () => {
  beforeEach(() => {
    sessionStore.clear()
    const storage = {
      getItem: (key: string) => sessionStore.get(key) ?? null,
      setItem: (key: string, value: string) => {
        sessionStore.set(key, value)
      },
      removeItem: (key: string) => {
        sessionStore.delete(key)
      },
    }
    vi.stubGlobal('window', { sessionStorage: storage })
    vi.stubGlobal('sessionStorage', storage)
  })

  afterEach(() => {
    clearWizardNavigationSession()
    vi.unstubAllGlobals()
  })

  it('matches saved share path and restores once', () => {
    const path = '/r/hybrid/emitter-a/emitter-b/seed1'
    saveWizardNavigationForShare(path, snapshot)

    expect(matchWizardNavigationForShare(path)).toEqual(snapshot)
    expect(matchWizardNavigationForShare('/r/hybrid/other/other/seed1')).toBeNull()

    queueWizardNavigationRestore(snapshot)
    expect(consumeWizardNavigationRestore()).toEqual(snapshot)
    expect(consumeWizardNavigationRestore()).toBeNull()
  })
})
