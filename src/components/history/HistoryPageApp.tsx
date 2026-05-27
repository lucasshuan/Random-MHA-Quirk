'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FilterPanel, MANUAL_PICK_ORIGIN_OPTIONS } from '@/components/FilterPanel'
import { MinimalFrame } from '@/components/wizard/MinimalFrame'
import { useI18n } from '@/i18n/useI18n'
import type { Locale } from '@/i18n/types'
import { useMetaLabel } from '@/i18n/useMetaLabel'
import { translateMatches } from '@/i18n/translate'
import { fetchFusionFromCache } from '@/lib/fusion/api'
import { lookupFusion } from '@/lib/fusion/cache'
import {
  historyPathForEntry,
  historyShareHandoff,
  loadResultHistory,
  patchHybridHistoryFusion,
} from '@/lib/history/store'
import { saveShareResultHandoff } from '@/lib/share/share-result-handoff'
import {
  matchesHistoryFilters,
  matchesHistoryMode,
  primaryHistoryQuirk,
} from '@/lib/history/filters'
import type { HistoryModeFilter, ResultHistoryEntry } from '@/lib/history/types'
import { TierBadge } from '../TierScale'
import {
  countAdvancedFilterSelections,
  DEFAULT_QUIRK_FILTERS,
  type QuirkFilters,
  type QuirkType,
} from '@/types/quirk'

function toneClass(type: QuirkType): string {
  switch (type) {
    case 'Emitter':
      return 'quirk-card-type-emitter'
    case 'Transformation':
      return 'quirk-card-type-transformation'
    case 'Mutant':
      return 'quirk-card-type-mutant'
  }
}

function hybridHistoryDescription(
  entry: Extract<ResultHistoryEntry, { mode: 'hybrid' }>,
  locale: Locale,
): string | null {
  const fromPreview = entry.hybrid.fusion?.description?.trim()
  if (fromPreview) {
    return fromPreview
  }

  const fromCache = lookupFusion(
    entry.hybrid.parentA.id,
    entry.hybrid.parentB.id,
    entry.hybrid.seed,
    locale,
  )
  return fromCache?.description?.trim() || null
}

function entryDescription(
  entry: ResultHistoryEntry,
  locale: Locale,
  t: (key: string) => string,
  meta: ReturnType<typeof useMetaLabel>,
): string {
  if (entry.mode === 'single') {
    const { quirk } = entry.single
    return (
      quirk.description?.trim() ||
      `${meta.origin(quirk.origin)} · ${meta.range(quirk.range)}`
    )
  }

  const fusionDescription = hybridHistoryDescription(entry, locale)
  if (fusionDescription) {
    return fusionDescription
  }

  return t('history.hybridMissingDescription')
}

function hybridNeedsDescriptionHydration(
  entry: ResultHistoryEntry,
  locale: Locale,
): entry is Extract<ResultHistoryEntry, { mode: 'hybrid' }> {
  return entry.mode === 'hybrid' && !hybridHistoryDescription(entry, locale)
}

const DEFAULT_HISTORY_MODE_FILTER: HistoryModeFilter = {
  quirks: false,
  hybrids: false,
}

export function HistoryPageApp() {
  const router = useRouter()
  const { locale, t } = useI18n()
  const meta = useMetaLabel()
  const [filters, setFilters] = useState<QuirkFilters>({ ...DEFAULT_QUIRK_FILTERS })
  const [modeFilter, setModeFilter] = useState<HistoryModeFilter>({
    ...DEFAULT_HISTORY_MODE_FILTER,
  })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<QuirkFilters>({ ...DEFAULT_QUIRK_FILTERS })
  const [draftModeFilter, setDraftModeFilter] = useState<HistoryModeFilter>({
    ...DEFAULT_HISTORY_MODE_FILTER,
  })
  const [entries, setEntries] = useState<ResultHistoryEntry[]>([])

  const loadEntries = useCallback(() => {
    setEntries(loadResultHistory())
  }, [])

  useEffect(() => {
    loadEntries()
  }, [loadEntries])

  useEffect(() => {
    const onStorage = () => loadEntries()
    window.addEventListener('storage', onStorage)
    window.addEventListener('random-quirk-history-updated', onStorage)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('random-quirk-history-updated', onStorage)
    }
  }, [loadEntries])

  useEffect(() => {
    let cancelled = false
    const targets = entries.filter((entry) => hybridNeedsDescriptionHydration(entry, locale))
    if (targets.length === 0) {
      return
    }

    void (async () => {
      let updated = false

      for (const entry of targets) {
        if (cancelled) {
          return
        }

        try {
          const fusionEntry = await fetchFusionFromCache(
            entry.hybrid.parentA.id,
            entry.hybrid.parentB.id,
            entry.hybrid.seed,
          )
          if (!fusionEntry) {
            continue
          }

          patchHybridHistoryFusion(
            entry.hybrid.parentA.id,
            entry.hybrid.parentB.id,
            entry.hybrid.seed,
            fusionEntry,
            entry.locale,
          )
          updated = true
        } catch {
          // Skip entries that cannot be resolved from fusion cache.
        }
      }

      if (!cancelled && updated) {
        loadEntries()
      }
    })()

    return () => {
      cancelled = true
    }
  }, [entries, locale, loadEntries])

  const filteredEntries = useMemo(
    () =>
      entries.filter(
        (entry) =>
          matchesHistoryMode(entry, modeFilter) && matchesHistoryFilters(entry, filters),
      ),
    [entries, filters, modeFilter],
  )

  const activeFilterCount = useMemo(
    () => countAdvancedFilterSelections(filters, { includeTiers: true }),
    [filters],
  )

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    [locale],
  )

  const openFiltersModal = useCallback(() => {
    setDraftFilters({ ...filters })
    setDraftModeFilter({ ...modeFilter })
    setFiltersOpen(true)
  }, [filters, modeFilter])

  const dismissFiltersModal = useCallback(() => {
    setFiltersOpen(false)
  }, [])

  const applyDraftFilters = useCallback(() => {
    setFilters((current) => ({
      ...current,
      origins: draftFilters.origins,
      tiers: draftFilters.tiers,
      types: draftFilters.types,
      ranges: draftFilters.ranges,
      facets: draftFilters.facets,
    }))
    setModeFilter({ ...draftModeFilter })
    setFiltersOpen(false)
  }, [draftFilters, draftModeFilter])

  const toggleDraftModeKind = useCallback((kind: keyof HistoryModeFilter) => {
    setDraftModeFilter((current) => ({
      ...current,
      [kind]: !current[kind],
    }))
  }, [])

  const resetDraftFilters = useCallback(() => {
    setDraftFilters((current) => ({
      ...current,
      origins: [],
      tiers: [],
      types: [],
      ranges: [],
      facets: [],
    }))
  }, [])

  function goHome() {
    router.push('/')
  }

  return (
    <MinimalFrame
      canGoBack
      canRestart={false}
      onBack={goHome}
      onRestart={goHome}
    >
      <div className="simple-step history-step">
        <p className="app-mark">{t('history.mark')}</p>
        <h1>{t('history.title')}</h1>

        <section className="manual-pick-controls history-controls" aria-label={t('advanced.filters')}>
          <label className="search-input manual-search-input">
            <input
              type="search"
              placeholder={t('history.searchPlaceholder')}
              value={filters.query}
              onChange={(event) =>
                setFilters((current) => ({ ...current, query: event.target.value }))
              }
            />
          </label>
          <button
            type="button"
            className={`manual-filter-button${activeFilterCount > 0 ? ' manual-filter-button-has-count' : ''}`}
            onClick={openFiltersModal}
          >
            <span>{t('manualPick.advancedFilters')}</span>
            {activeFilterCount > 0 ? (
              <span className="manual-filter-count" aria-hidden="true">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </section>

        <div className="manual-pick-layout history-pick-layout">
          <section className="panel inner-scroll-panel manual-quirk-panel history-list-panel">
            <div className="manual-quirk-panel-heading">
              <span>{translateMatches(locale, filteredEntries.length)}</span>
            </div>
            {filteredEntries.length === 0 ? (
              <p className="mini-copy">{t('history.empty')}</p>
            ) : (
              <div className="history-entry-list">
                {filteredEntries.map((entry) => {
                const primary = primaryHistoryQuirk(entry)
                const detail = entryDescription(entry, locale, t, meta)
                const isHybrid = entry.mode === 'hybrid'

                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={[
                      'manual-quirk-card',
                      'history-entry-card',
                      toneClass(primary.type),
                      isHybrid ? 'history-entry-card-hybrid' : '',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    data-tier={primary.tier}
                    onClick={() => {
                      const path = historyPathForEntry(entry)
                      saveShareResultHandoff(path, historyShareHandoff(entry))
                      router.push(path)
                    }}
                  >
                    <span className="quirk-card-glow" aria-hidden="true" />
                    {isHybrid ? (
                      <span className="quirk-fusion-badge">
                        {t('fusion.badge')}
                      </span>
                    ) : null}
                    <p className="quirk-meta manual-quirk-meta">
                      <TierBadge tier={primary.tier} />
                      <span className="quirk-meta-sep" aria-hidden="true" />
                      <span className="quirk-meta-type">{meta.type(primary.type)}</span>
                    </p>
                    <h3 className="manual-quirk-name">{primary.name}</h3>
                    <p className="manual-quirk-description">{detail}</p>
                    <p className="history-entry-time">{dateFormatter.format(entry.createdAt)}</p>
                  </button>
                )
                })}
              </div>
            )}
          </section>
        </div>
      </div>

      {filtersOpen ? (
        <div className="quirk-pick-modal-backdrop" onClick={dismissFiltersModal}>
          <div
            className="manual-filter-modal"
            role="dialog"
            aria-modal="true"
            aria-label={t('advanced.filters')}
            onClick={(event) => event.stopPropagation()}
          >
            <FilterPanel
              filters={draftFilters}
              onChange={setDraftFilters}
              onReset={resetDraftFilters}
              showSearch={false}
              originOptions={MANUAL_PICK_ORIGIN_OPTIONS}
              showTiers
              resultKindFilter={{
                quirks: draftModeFilter.quirks,
                hybrids: draftModeFilter.hybrids,
                quirksLabel: t('history.filterQuirks'),
                hybridsLabel: t('history.filterHybrids'),
                ariaLabel: t('history.filterKind'),
                onToggle: toggleDraftModeKind,
              }}
            />
            <div className="manual-filter-modal-actions">
              <button
                type="button"
                className="manual-secondary-action"
                onClick={dismissFiltersModal}
              >
                {t('manualPick.cancel')}
              </button>
              <button
                type="button"
                className="big-action manual-confirm-action"
                onClick={applyDraftFilters}
              >
                {t('manualPick.filtersDone')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </MinimalFrame>
  )
}
