import { useEffect } from 'react'
import {
  centeredTooltipShift,
  leftAlignedTooltipShift,
  measureDataTooltipWidth,
} from '@/lib/ui/clampTooltipPosition'

function applyShift(el: HTMLElement, shiftX: number) {
  if (Math.abs(shiftX) < 0.5) {
    el.style.removeProperty('--tooltip-shift-x')
    return
  }
  el.style.setProperty('--tooltip-shift-x', `${shiftX}px`)
}

function clampDataTooltip(el: HTMLElement) {
  const width = measureDataTooltipWidth(el)
  if (width <= 0) {
    return
  }

  const rect = el.getBoundingClientRect()
  const shiftX = el.classList.contains('chip-facet')
    ? leftAlignedTooltipShift(rect, width)
    : centeredTooltipShift(rect, width)

  applyShift(el, shiftX)
}

function clampTierTip(wrap: HTMLElement) {
  const tip = wrap.querySelector<HTMLElement>('.tier-toggle-tip')
  if (!tip) {
    return
  }

  const width = tip.getBoundingClientRect().width
  if (width <= 0) {
    return
  }

  const rect = wrap.getBoundingClientRect()
  const shiftX = centeredTooltipShift(rect, width)
  applyShift(tip, shiftX)
}

function clampFromTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return
  }

  const tooltipEl = target.closest<HTMLElement>('[data-tooltip]')
  if (tooltipEl) {
    clampDataTooltip(tooltipEl)
  }

  const tierWrap = target.closest<HTMLElement>('.tier-toggle-wrap')
  if (tierWrap) {
    clampTierTip(tierWrap)
  }
}

function clearFromTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return
  }

  target.closest<HTMLElement>('[data-tooltip]')?.style.removeProperty('--tooltip-shift-x')
  target.closest<HTMLElement>('.tier-toggle-wrap')
    ?.querySelector<HTMLElement>('.tier-toggle-tip')
    ?.style.removeProperty('--tooltip-shift-x')
}

export function useTooltipViewportClamp() {
  useEffect(() => {
    const handleShow = (event: Event) => {
      clampFromTarget(event.target)
    }

    const handleHide = (event: Event) => {
      clearFromTarget(event.target)
    }

    const handleTouch = (event: Event) => {
      window.requestAnimationFrame(() => clampFromTarget(event.target))
    }

    const handleResize = () => {
      document.querySelectorAll<HTMLElement>('[data-tooltip]:hover').forEach(clampDataTooltip)
      document.querySelectorAll<HTMLElement>('.tier-toggle-wrap:hover').forEach(clampTierTip)
    }

    document.addEventListener('mouseover', handleShow, true)
    document.addEventListener('focusin', handleShow, true)
    document.addEventListener('touchstart', handleTouch, { capture: true, passive: true })
    document.addEventListener('mouseout', handleHide, true)
    document.addEventListener('focusout', handleHide, true)
    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('mouseover', handleShow, true)
      document.removeEventListener('focusin', handleShow, true)
      document.removeEventListener('touchstart', handleTouch, true)
      document.removeEventListener('mouseout', handleHide, true)
      document.removeEventListener('focusout', handleHide, true)
      window.removeEventListener('resize', handleResize)
    }
  }, [])
}
