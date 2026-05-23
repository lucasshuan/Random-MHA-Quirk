import { useState, type ReactNode } from 'react'
import { useI18n } from '../i18n/useI18n'
import { useMetaLabel } from '../i18n/useMetaLabel'
import {
  TYPE_FILTER_TONE_CLASS,
  TIER_FILTER_TONE_CLASS,
} from '@/lib/quirks/filter-tones'
import {
  CANONICAL_QUIRK_ORIGINS,
  QUIRK_FACETS,
  QUIRK_ORIGINS,
  QUIRK_RANGES,
  QUIRK_TIERS,
  QUIRK_TYPES,
  tierBadgeGlyph,
  type QuirkFilters,
  type QuirkOrigin,
  type QuirkTier,
} from '../types/quirk'

export interface FilterPanelProps {
  filters: QuirkFilters
  onChange: (nextFilters: QuirkFilters) => void
  onReset: () => void
  showSearch?: boolean
  /** Default: canonical series only. Manual pick passes full `QUIRK_ORIGINS`. */
  originOptions?: readonly QuirkOrigin[]
  /** Tier toggles (manual pick advanced filters only). */
  showTiers?: boolean
}

function toggleValue<T extends string>(items: T[], value: T): T[] {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value]
}

interface CheckboxGroupProps<T extends string> {
  title: string
  options: readonly T[]
  selected: T[]
  labelFor: (value: T) => string
  onToggle: (value: T) => void
  toneClass?: (value: T) => string | undefined
  renderLabel?: (value: T) => ReactNode
}

function CheckboxGroup<T extends string>({
  title,
  options,
  selected,
  labelFor,
  onToggle,
  toneClass,
  renderLabel,
}: CheckboxGroupProps<T>) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <section className={`filter-group ${isOpen ? 'filter-group-open' : ''}`}>
      <button
        type="button"
        className="filter-group-trigger"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        {selected.length > 0 ? <strong>{selected.length}</strong> : null}
      </button>
      {isOpen ? (
        <div className="check-grid">
          {options.map((option) => {
            const isSelected = selected.includes(option)
            const tone = toneClass?.(option)
            return (
              <button
                key={option}
                type="button"
                className={[
                  'filter-toggle',
                  tone ? 'filter-toggle-toned' : '',
                  tone ?? '',
                  isSelected ? 'filter-toggle-active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onToggle(option)}
                aria-pressed={isSelected}
                aria-label={labelFor(option)}
              >
                <span>{renderLabel ? renderLabel(option) : labelFor(option)}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

export function FilterPanel({
  filters,
  onChange,
  onReset,
  showSearch = true,
  originOptions = CANONICAL_QUIRK_ORIGINS,
  showTiers = false,
}: FilterPanelProps) {
  const { t } = useI18n()
  const meta = useMetaLabel()

  return (
    <section className="panel inner-scroll-panel">
      <div className="panel-heading">
        <h2>{t('advanced.filters')}</h2>
        <button type="button" onClick={onReset}>
          {t('advanced.reset')}
        </button>
      </div>

      {showSearch ? (
        <label className="search-input">
          <span>{t('advanced.search')}</span>
          <input
            type="search"
            placeholder={t('advanced.searchPlaceholder')}
            value={filters.query}
            onChange={(event) =>
              onChange({ ...filters, query: event.target.value })
            }
          />
        </label>
      ) : null}

      <CheckboxGroup
        title={t('advanced.origin')}
        options={originOptions}
        selected={filters.origins}
        labelFor={meta.origin}
        onToggle={(value) =>
          onChange({ ...filters, origins: toggleValue(filters.origins, value) })
        }
      />

      {showTiers ? (
        <CheckboxGroup
          title={t('advanced.tier')}
          options={QUIRK_TIERS}
          selected={filters.tiers}
          labelFor={meta.tier}
          toneClass={(tier) => TIER_FILTER_TONE_CLASS[tier as QuirkTier]}
          renderLabel={(tier) => tierBadgeGlyph(tier as QuirkTier)}
          onToggle={(value) =>
            onChange({
              ...filters,
              tiers: toggleValue(filters.tiers, value as QuirkTier),
            })
          }
        />
      ) : null}

      <CheckboxGroup
        title={t('advanced.type')}
        options={QUIRK_TYPES}
        selected={filters.types}
        labelFor={meta.type}
        toneClass={(type) => TYPE_FILTER_TONE_CLASS[type]}
        onToggle={(value) =>
          onChange({ ...filters, types: toggleValue(filters.types, value) })
        }
      />

      <CheckboxGroup
        title={t('advanced.range')}
        options={QUIRK_RANGES}
        selected={filters.ranges}
        labelFor={meta.range}
        onToggle={(value) =>
          onChange({ ...filters, ranges: toggleValue(filters.ranges, value) })
        }
      />

      <CheckboxGroup
        title={t('advanced.facets')}
        options={QUIRK_FACETS}
        selected={filters.facets}
        labelFor={meta.facet}
        onToggle={(value) =>
          onChange({ ...filters, facets: toggleValue(filters.facets, value) })
        }
      />
    </section>
  )
}

/** Full origin list including fan ORIGINAL catalog entries (manual pick). */
export const MANUAL_PICK_ORIGIN_OPTIONS = QUIRK_ORIGINS
