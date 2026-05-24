import type { Locale } from '@/i18n/types'
import { fusionQuirkId } from '@/lib/fusion/keys'
import { shareHybridPath, shareQuirkPath } from '@/lib/share/paths'
import type { FusionCacheEntry } from '@/types/fusion'
import { fusionCopyForLocale } from '@/types/fusion'
import type { Quirk, QuirkId } from '@/types/quirk'
import type { ResultHistoryEntry, HistoryQuirkPreview } from './types'

const STORAGE_KEY = 'random-mha-quirk-history:v1'
const MAX_HISTORY_ENTRIES = 250

interface HistoryStorageShape {
  version: 1
  entries: ResultHistoryEntry[]
}

function isBrowser(): boolean {
  return typeof window !== 'undefined'
}

function safeReadStorage(): ResultHistoryEntry[] {
  if (!isBrowser()) {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as HistoryStorageShape
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.entries)) {
      return []
    }

    return parsed.entries
      .filter((entry) => entry && typeof entry === 'object')
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, MAX_HISTORY_ENTRIES)
  } catch {
    return []
  }
}

function safeWriteStorage(entries: ResultHistoryEntry[]): void {
  if (!isBrowser()) {
    return
  }

  const next: HistoryStorageShape = {
    version: 1,
    entries: entries.slice(0, MAX_HISTORY_ENTRIES),
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('random-quirk-history-updated'))
  } catch {
    // ignore storage errors
  }
}

function toPreview(
  quirk: Pick<Quirk, 'id' | 'name' | 'description' | 'origin' | 'tier' | 'type' | 'range' | 'facets'>,
): HistoryQuirkPreview {
  return {
    id: quirk.id,
    name: quirk.name,
    description: quirk.description,
    origin: quirk.origin,
    tier: quirk.tier,
    type: quirk.type,
    range: quirk.range,
    facets: quirk.facets,
  }
}

function toFusionPreview(entry: FusionCacheEntry, locale: Locale): HistoryQuirkPreview {
  const copy = fusionCopyForLocale(entry, locale)
  return {
    id: fusionQuirkId(entry.parents[0], entry.parents[1], entry.seed),
    name: copy.name,
    description: copy.description,
    origin: entry.origin,
    tier: entry.tier,
    type: entry.type,
    range: entry.range,
    facets: entry.facets,
  }
}

function searchTextForEntry(entry: ResultHistoryEntry): string {
  const quirks: HistoryQuirkPreview[] =
    entry.mode === 'single'
      ? [entry.single.quirk]
      : [entry.hybrid.fusion, entry.hybrid.parentA, entry.hybrid.parentB].filter(
          (quirk): quirk is HistoryQuirkPreview => Boolean(quirk),
        )

  return quirks
    .flatMap((quirk) => [
      quirk.name,
      quirk.description ?? '',
      quirk.type,
      quirk.range,
      quirk.origin,
      ...quirk.facets,
    ])
    .join(' ')
    .toLowerCase()
}

function withComputedSearch(entry: ResultHistoryEntry): ResultHistoryEntry {
  return { ...entry, searchText: searchTextForEntry(entry) }
}

export function loadResultHistory(): ResultHistoryEntry[] {
  return safeReadStorage()
}

export function clearResultHistory(): void {
  safeWriteStorage([])
}

export function historyPathForEntry(entry: ResultHistoryEntry): string {
  if (entry.mode === 'single') {
    return shareQuirkPath(entry.single.quirk.id)
  }

  return shareHybridPath(
    entry.hybrid.parentA.id,
    entry.hybrid.parentB.id,
    entry.hybrid.seed,
  )
}

export function pushSingleHistoryEntry(quirk: Quirk, locale: Locale): ResultHistoryEntry {
  const next = withComputedSearch({
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    locale,
    mode: 'single',
    single: {
      quirk: toPreview(quirk) as HistoryQuirkPreview & { id: QuirkId },
    },
    searchText: '',
  })

  const current = safeReadStorage()
  safeWriteStorage([next, ...current])
  return next
}

export function pushHybridHistoryEntry(
  parentA: Quirk,
  parentB: Quirk,
  seed: string,
  locale: Locale,
): ResultHistoryEntry {
  const next = withComputedSearch({
    id: crypto.randomUUID(),
    createdAt: Date.now(),
    locale,
    mode: 'hybrid',
    hybrid: {
      parentA: toPreview(parentA) as HistoryQuirkPreview & { id: QuirkId },
      parentB: toPreview(parentB) as HistoryQuirkPreview & { id: QuirkId },
      seed,
      fusion: null,
    },
    searchText: '',
  })

  const current = safeReadStorage()
  safeWriteStorage([next, ...current])
  return next
}

export function patchHybridHistoryFusion(
  parentA: QuirkId,
  parentB: QuirkId,
  seed: string,
  fusionEntry: FusionCacheEntry,
  locale: Locale,
): void {
  const current = safeReadStorage()
  const index = current.findIndex(
    (entry) =>
      entry.mode === 'hybrid' &&
      entry.hybrid.seed === seed &&
      entry.hybrid.parentA.id === parentA &&
      entry.hybrid.parentB.id === parentB,
  )
  if (index < 0) {
    return
  }

  const entry = current[index]
  if (entry.mode !== 'hybrid') {
    return
  }

  const nextEntry = withComputedSearch({
    ...entry,
    hybrid: {
      ...entry.hybrid,
      fusion: toFusionPreview(fusionEntry, locale),
    },
  })

  const next = [...current]
  next[index] = nextEntry
  safeWriteStorage(next)
}
