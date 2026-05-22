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
  onToggle: (value: T) => void
}

function CheckboxGroup<T extends string>({
  title,
  options,
  selected,
  onToggle,
}: CheckboxGroupProps<T>) {
  return (
    <fieldset className="filter-group">
      <legend>{title}</legend>
      <div className="check-grid">
        {options.map((option) => {
          const id = `${title}-${option}`
          return (
            <label key={option} htmlFor={id}>
              <input
                id={id}
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => onToggle(option)}
              />
              <span>{option}</span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

export function FilterPanel({ filters, onChange, onReset }: FilterPanelProps) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <h2>Filters</h2>
        <button type="button" onClick={onReset}>
          Reset
        </button>
      </div>

      <label className="search-input">
        <span>Search</span>
        <input
          type="search"
          placeholder="Name, effect, or facet"
          value={filters.query}
          onChange={(event) =>
            onChange({ ...filters, query: event.target.value })
          }
        />
      </label>

      <CheckboxGroup
        title="Origin"
        options={QUIRK_ORIGINS}
        selected={filters.origins}
        onToggle={(value) =>
          onChange({ ...filters, origins: toggleValue(filters.origins, value) })
        }
      />

      <CheckboxGroup
        title="Type"
        options={QUIRK_TYPES}
        selected={filters.types}
        onToggle={(value) =>
          onChange({ ...filters, types: toggleValue(filters.types, value) })
        }
      />

      <CheckboxGroup
        title="Range"
        options={QUIRK_RANGES}
        selected={filters.ranges}
        onToggle={(value) =>
          onChange({ ...filters, ranges: toggleValue(filters.ranges, value) })
        }
      />

      <CheckboxGroup
        title="Facets"
        options={QUIRK_FACETS}
        selected={filters.facets}
        onToggle={(value) =>
          onChange({ ...filters, facets: toggleValue(filters.facets, value) })
        }
      />
    </section>
  )
}

