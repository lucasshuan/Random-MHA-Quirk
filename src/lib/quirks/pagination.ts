export const QUIRK_LIST_PAGE_SIZE = 30

export function parsePageParam(value: string | null): number {
  const parsed = Number.parseInt(value ?? '1', 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1
  }
  return parsed
}

export function parsePageSizeParam(
  value: string | null,
  max = QUIRK_LIST_PAGE_SIZE,
): number {
  const parsed = Number.parseInt(value ?? String(max), 10)
  if (!Number.isFinite(parsed) || parsed < 1) {
    return max
  }
  return Math.min(parsed, max)
}

export function paginateSlice<T>(
  items: T[],
  page: number,
  pageSize: number,
): { slice: T[]; total: number; page: number; pageSize: number; pageCount: number } {
  const total = items.length
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  const safePage = Math.min(page, pageCount)
  const start = (safePage - 1) * pageSize
  const slice = items.slice(start, start + pageSize)

  return { slice, total, page: safePage, pageSize, pageCount }
}

export function listRangeLabel(
  page: number,
  pageSize: number,
  total: number,
): { from: number; to: number } {
  if (total === 0) {
    return { from: 0, to: 0 }
  }
  const from = (page - 1) * pageSize + 1
  const to = Math.min(page * pageSize, total)
  return { from, to }
}
