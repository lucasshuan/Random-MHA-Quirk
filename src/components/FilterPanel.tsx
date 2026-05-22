import { useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import { useMetaLabel } from '../i18n/useMetaLabel'
import {
  QUIRK_FACETS,
  QUIRK_ORIGINS,
  QUIRK_RANGES,
  QUIRK_TYPES,
  type QuirkFilters,
} from '../types/quirk'

interface FilterPanelProps {
  filters: QuirkFilters
  onChange: (nextFilters: QuirkFilters) => void
  onReset: () => void
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
}

function CheckboxGroup<T extends string>({
  title,
  options,
  selected,
  labelFor,
  onToggle,
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
            return (
              <button
                key={option}
                type="button"
                className={`filter-toggle ${isSelected ? 'filter-toggle-active' : ''}`}
                onClick={() => onToggle(option)}
                aria-pressed={isSelected}
              >
                <span>{labelFor(option)}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

export function FilterPanel({ filters, onChange, onReset }: FilterPanelProps) {
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

      <CheckboxGroup
        title={t('advanced.origin')}
        options={QUIRK_ORIGINS}
        selected={filters.origins}
        labelFor={meta.origin}
        onToggle={(value) =>
          onChange({ ...filters, origins: toggleValue(filters.origins, value) })
        }
      />

      <CheckboxGroup
        title={t('advanced.type')}
        options={QUIRK_TYPES}
        selected={filters.types}
        labelFor={meta.type}
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
