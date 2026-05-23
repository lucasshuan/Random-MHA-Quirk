'use client'

import { useEffect } from 'react'

/** Keeps `--app-height` in sync with the visible viewport (mobile URL bar, rotation). */
export function useAppViewportHeight() {
  useEffect(() => {
    const sync = () => {
      const height = window.visualViewport?.height ?? window.innerHeight
      document.documentElement.style.setProperty('--app-height', `${Math.round(height)}px`)
    }

    sync()
    window.addEventListener('resize', sync)
    window.addEventListener('orientationchange', sync)
    window.visualViewport?.addEventListener('resize', sync)

    return () => {
      window.removeEventListener('resize', sync)
      window.removeEventListener('orientationchange', sync)
      window.visualViewport?.removeEventListener('resize', sync)
    }
  }, [])
}
