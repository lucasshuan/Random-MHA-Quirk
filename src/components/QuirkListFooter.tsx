'use client'

import {
  LuChevronLeft,
  LuChevronRight,
  LuChevronsLeft,
  LuChevronsRight,
} from 'react-icons/lu'
import { useI18n } from '@/i18n/useI18n'
import { listRangeLabel } from '@/lib/quirks/pagination'

interface QuirkListFooterProps {
  total: number
  page: number
  pageSize: number
  pageCount: number
  onPageChange: (page: number) => void
  onPrefetchPage?: (page: number) => void
}

export function QuirkListFooter({
  total,
  page,
  pageSize,
  pageCount,
  onPageChange,
  onPrefetchPage,
}: QuirkListFooterProps) {
  const { t } = useI18n()
  const { from, to } = listRangeLabel(page, pageSize, total)
  const canFirst = page > 1
  const canPrev = page > 1
  const canNext = page < pageCount
  const canLast = page < pageCount

  return (
    <div className="manual-quirk-panel-footer">
      <span className="manual-quirk-panel-count">
        {total === 0
          ? t('pagination.none')
          : t('pagination.showing', { from, to, total })}
      </span>
      {pageCount > 1 ? (
        <nav className="manual-quirk-pagination" aria-label={t('pagination.nav')}>
          <button
            type="button"
            className="manual-quirk-page-btn"
            disabled={!canFirst}
            onMouseEnter={() => onPrefetchPage?.(1)}
            onFocus={() => onPrefetchPage?.(1)}
            onClick={() => onPageChange(1)}
            aria-label={t('pagination.first')}
          >
            <LuChevronsLeft aria-hidden="true" />
          </button>
          <button
            type="button"
            className="manual-quirk-page-btn"
            disabled={!canPrev}
            onMouseEnter={() => onPrefetchPage?.(page - 1)}
            onFocus={() => onPrefetchPage?.(page - 1)}
            onClick={() => onPageChange(page - 1)}
            aria-label={t('pagination.prev')}
          >
            <LuChevronLeft aria-hidden="true" />
          </button>
          <span className="manual-quirk-page-indicator" aria-live="polite">
            {t('pagination.page', { page, pageCount })}
          </span>
          <button
            type="button"
            className="manual-quirk-page-btn"
            disabled={!canNext}
            onMouseEnter={() => onPrefetchPage?.(page + 1)}
            onFocus={() => onPrefetchPage?.(page + 1)}
            onClick={() => onPageChange(page + 1)}
            aria-label={t('pagination.next')}
          >
            <LuChevronRight aria-hidden="true" />
          </button>
          <button
            type="button"
            className="manual-quirk-page-btn"
            disabled={!canLast}
            onMouseEnter={() => onPrefetchPage?.(pageCount)}
            onFocus={() => onPrefetchPage?.(pageCount)}
            onClick={() => onPageChange(pageCount)}
            aria-label={t('pagination.last')}
          >
            <LuChevronsRight aria-hidden="true" />
          </button>
        </nav>
      ) : null}
    </div>
  )
}
