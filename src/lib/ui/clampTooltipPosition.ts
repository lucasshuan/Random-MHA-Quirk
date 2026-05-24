export const TOOLTIP_VIEWPORT_PAD = 12

export type TooltipAnchorRect = Pick<DOMRect, 'left' | 'width'>

export function clampCenterToViewport(
  centerX: number,
  width: number,
  viewportWidth = typeof window === 'undefined' ? 0 : window.innerWidth,
  pad = TOOLTIP_VIEWPORT_PAD,
): number {
  if (viewportWidth <= 0 || width <= 0) {
    return centerX
  }

  const half = width / 2
  const minCenter = pad + half
  const maxCenter = viewportWidth - pad - half
  return Math.min(Math.max(centerX, minCenter), maxCenter)
}

export function centeredTooltipShift(
  anchorRect: TooltipAnchorRect,
  tooltipWidth: number,
  viewportWidth?: number,
): number {
  const center = anchorRect.left + anchorRect.width / 2
  const clampedCenter = clampCenterToViewport(center, tooltipWidth, viewportWidth)
  return clampedCenter - center
}

export function leftAlignedTooltipShift(
  anchorRect: TooltipAnchorRect,
  tooltipWidth: number,
  viewportWidth = typeof window === 'undefined' ? 0 : window.innerWidth,
  pad = TOOLTIP_VIEWPORT_PAD,
): number {
  if (viewportWidth <= 0 || tooltipWidth <= 0) {
    return 0
  }

  let left = anchorRect.left
  if (left < pad) {
    left = pad
  }
  if (left + tooltipWidth > viewportWidth - pad) {
    left = viewportWidth - pad - tooltipWidth
  }
  return left - anchorRect.left
}

interface TooltipMeasureOptions {
  text: string
  maxWidthPx: number
  fontSize: string
  fontWeight: string
  letterSpacing?: string
  textTransform?: string
  paddingX: number
  paddingY: number
}

let sharedProbe: HTMLSpanElement | null = null

function getProbe(): HTMLSpanElement {
  if (!sharedProbe) {
    sharedProbe = document.createElement('span')
    sharedProbe.setAttribute('aria-hidden', 'true')
    Object.assign(sharedProbe.style, {
      position: 'fixed',
      left: '-9999px',
      top: '0',
      visibility: 'hidden',
      pointerEvents: 'none',
      whiteSpace: 'normal',
      lineHeight: '1.25',
      border: '0',
      boxSizing: 'border-box',
    })
    document.body.appendChild(sharedProbe)
  }
  return sharedProbe
}

export function measureTooltipTextWidth(options: TooltipMeasureOptions): number {
  const probe = getProbe()
  probe.textContent = options.text
  probe.style.maxWidth = `${options.maxWidthPx}px`
  probe.style.fontSize = options.fontSize
  probe.style.fontWeight = options.fontWeight
  probe.style.letterSpacing = options.letterSpacing ?? '0.01em'
  probe.style.textTransform = options.textTransform ?? 'none'
  probe.style.padding = `${options.paddingY}px ${options.paddingX}px`
  return probe.getBoundingClientRect().width
}

export function measureDataTooltipWidth(el: HTMLElement): number {
  const text = el.getAttribute('data-tooltip')
  if (!text) {
    return 0
  }

  if (el.classList.contains('chip-facet')) {
    return measureTooltipTextWidth({
      text,
      maxWidthPx: Math.min(260, window.innerWidth - 40),
      fontSize: '0.7rem',
      fontWeight: '700',
      paddingX: 9.28,
      paddingY: 5.44,
    })
  }

  return measureTooltipTextWidth({
    text,
    maxWidthPx: Math.min(220, window.innerWidth * 0.7),
    fontSize: '0.68rem',
    fontWeight: '900',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    paddingX: 9.28,
    paddingY: 5.44,
  })
}
