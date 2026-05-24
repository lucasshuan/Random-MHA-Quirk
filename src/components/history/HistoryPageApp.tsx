'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { FilterPanel, MANUAL_PICK_ORIGIN_OPTIONS } from '@/components/FilterPanel'
import { MinimalFrame } from '@/components/wizard/MinimalFrame'
import { useI18n } from '@/i18n/useI18n'
import { useMetaLabel } from '@/i18n/useMetaLabel'
import { translateMatches } from '@/i18n/translate'
import { historyPathForEntry, loadResultHistory } from '@/lib/history/store'
import type { HistoryQuirkPreview, ResultHistoryEntry } from '@/lib/history/types'
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

function entryQuirks(entry: ResultHistoryEntry): HistoryQuirkPreview[] {
  if (entry.mode === 'single') {
    return [entry.single.quirk]
  }

  return [entry.hybrid.fusion, entry.hybrid.parentA, entry.hybrid.parentB].filter(
    (quirk): quirk is HistoryQuirkPreview => Boolean(quirk),
  )
}

function matchesFilters(entry: ResultHistoryEntry, filters: QuirkFilters): boolean {
  const query = filters.query.trim().toLowerCase()
  if (query && !entry.searchText.includes(query)) {
    return false
  }

  return entryQuirks(entry).some((quirk) => {
    if (filters.origins.length > 0 && !filters.origins.includes(quirk.origin)) {
      return false
    }
    if (filters.tiers.length > 0 && !filters.tiers.includes(quirk.tier)) {
      return false
    }
    if (filters.types.length > 0 && !filters.types.includes(quirk.type)) {
      return false
    }
    if (filters.ranges.length > 0 && !filters.ranges.includes(quirk.range)) {
      return false
    }
    if (filters.facets.length > 0 && !filters.facets.every((facet) => quirk.facets.includes(facet))) {
      return false
    }
    return true
  })
}

export function HistoryPageApp() {
  const router = useRouter()
  const { locale, t } = useI18n()
  const meta = useMetaLabel()
  const [filters, setFilters] = useState<QuirkFilters>({ ...DEFAULT_QUIRK_FILTERS })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draftFilters, setDraftFilters] = useState<QuirkFilters>({ ...DEFAULT_QUIRK_FILTERS })
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

  const filteredEntries = useMemo(
    () => entries.filter((entry) => matchesFilters(entry, filters)),
    [entries, filters],
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
    setFiltersOpen(true)
  }, [filters])

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
    setFiltersOpen(false)
  }, [draftFilters])

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
      showRestart={false}
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
                const primary =
                  entry.mode === 'single'
                    ? entry.single.quirk
                    : entry.hybrid.fusion ?? entry.hybrid.parentA
                const detail =
                  entry.mode === 'single'
                    ? `${meta.origin(entry.single.quirk.origin)} · ${meta.range(entry.single.quirk.range)}`
                    : `${entry.hybrid.parentA.name} + ${entry.hybrid.parentB.name}`

                return (
                  <button
                    key={entry.id}
                    type="button"
                    className={`manual-quirk-card history-entry-card ${toneClass(primary.type)}`}
                    data-tier={primary.tier}
                    onClick={() => router.push(historyPathForEntry(entry))}
                  >
                    <span className="quirk-card-glow" aria-hidden="true" />
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
