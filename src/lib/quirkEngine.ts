import type { Quirk, QuirkFilters } from '../types/quirk'

export function applyFilters(quirks: Quirk[], filters: QuirkFilters): Quirk[] {
  const query = filters.query.trim().toLowerCase()

  return quirks.filter((quirk) => {
    if (filters.origins.length > 0 && !filters.origins.includes(quirk.origin)) {
      return false
    }

    if (filters.types.length > 0 && !filters.types.includes(quirk.type)) {
      return false
    }

    if (filters.ranges.length > 0 && !filters.ranges.includes(quirk.range)) {
      return false
    }

    if (
      filters.facets.length > 0 &&
      !filters.facets.every((facet) => quirk.facets.includes(facet))
    ) {
      return false
    }

    if (!query) {
      return true
    }

    const searchable = `${quirk.name} ${quirk.description} ${quirk.facets.join(' ')}`
      .toLowerCase()
      .trim()

    return searchable.includes(query)
  })
}

export function pickRandom<T>(items: T[]): T | null {
  if (items.length === 0) {
    return null
  }

  const index = Math.floor(Math.random() * items.length)
  return items[index]
}

export function pickTwoDistinctRandom<T>(items: T[]): [T, T] | null {
  if (items.length < 2) {
    return null
  }

  const firstIndex = Math.floor(Math.random() * items.length)
  let secondIndex = Math.floor(Math.random() * items.length)

  while (secondIndex === firstIndex) {
    secondIndex = Math.floor(Math.random() * items.length)
  }

  return [items[firstIndex], items[secondIndex]]
}

