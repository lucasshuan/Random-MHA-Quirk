import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearHybridRollSession,
  matchHybridRollSession,
  saveHybridRollSession,
} from './hybrid-roll-session'
import { DEFAULT_QUIRK_FILTERS } from '@/types/quirk'

const sessionStore = new Map<string, string>()

const defaultSettings = {
  slotFilters: [
    { ...DEFAULT_QUIRK_FILTERS, types: ['Emitter'] },
    { ...DEFAULT_QUIRK_FILTERS, types: ['Mutant'] },
  ] as [typeof DEFAULT_QUIRK_FILTERS, typeof DEFAULT_QUIRK_FILTERS],
  manualParentIds: [null, null] as [null, null],
}

describe('hybrid-roll-session', () => {
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
    clearHybridRollSession()
    vi.unstubAllGlobals()
  })

  it('matches saved hybrid route', () => {
    saveHybridRollSession('quirk-a', 'quirk-b', 'seed-1', defaultSettings)

    expect(matchHybridRollSession('quirk-a', 'quirk-b', 'seed-1')).toEqual(
      defaultSettings,
    )
  })

  it('returns null when route does not match', () => {
    saveHybridRollSession('quirk-a', 'quirk-b', 'seed-1', defaultSettings)

    expect(matchHybridRollSession('quirk-a', 'quirk-b', 'seed-2')).toBeNull()
    expect(matchHybridRollSession('quirk-x', 'quirk-b', 'seed-1')).toBeNull()
  })
})
