import { describe, expect, it } from 'vitest'
import {
  clampCenterToViewport,
  centeredTooltipShift,
  leftAlignedTooltipShift,
} from './clampTooltipPosition'

describe('clampTooltipPosition', () => {
  it('keeps centered tooltips inside the viewport', () => {
    expect(clampCenterToViewport(20, 80, 360, 12)).toBe(52)
    expect(clampCenterToViewport(340, 80, 360, 12)).toBe(308)
    expect(clampCenterToViewport(180, 80, 360, 12)).toBe(180)
  })

  it('shifts centered anchors when near screen edges', () => {
    expect(centeredTooltipShift({ left: 8, width: 48 }, 160, 360)).toBe(60)
    expect(centeredTooltipShift({ left: 304, width: 48 }, 160, 360)).toBe(-60)
  })

  it('shifts left-aligned tooltips inside the viewport', () => {
    expect(leftAlignedTooltipShift({ left: 4, width: 40 }, 120, 360, 12)).toBe(8)
    expect(leftAlignedTooltipShift({ left: 300, width: 40 }, 120, 360, 12)).toBe(-72)
  })
})
