import { useId, type CSSProperties, type ReactNode } from 'react'

export type SegmentTabItem<T extends string> = {
  id: T
  label: string
}

type SegmentTabsProps<T extends string> = {
  tabs: ReadonlyArray<SegmentTabItem<T>>
  value: T
  onChange: (id: T) => void
  ariaLabel: string
  className?: string
  panelClassName?: string
  /** Rendered between the tab list and the active panel (e.g. shared toolbar). */
  between?: ReactNode
  children: ReactNode | ((activeTab: T) => ReactNode)
}

export function SegmentTabs<T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
  className,
  panelClassName,
  between,
  children,
}: SegmentTabsProps<T>) {
  const tablistId = useId()
  const panelId = useId()

  const activeTab = tabs.find((tab) => tab.id === value) ?? tabs[0]
  const panel =
    typeof children === 'function' ? children(value) : children

  return (
    <>
      <div
        className={className ?? 'segment-tabs'}
        role="tablist"
        aria-label={ariaLabel}
        id={tablistId}
        style={{ '--segment-tab-count': tabs.length } as CSSProperties}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === value

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${tablistId}-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`${panelId}-${tab.id}`}
              className={`segment-tab ${isActive ? 'segment-tab-active' : ''}`}
              onClick={() => onChange(tab.id)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {between}

      <div
        className={panelClassName ?? 'segment-tab-panel'}
        role="tabpanel"
        id={`${panelId}-${activeTab.id}`}
        aria-labelledby={`${tablistId}-${activeTab.id}`}
      >
        {panel}
      </div>
    </>
  )
}
