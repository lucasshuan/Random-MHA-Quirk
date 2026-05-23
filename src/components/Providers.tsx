'use client'

import type { ReactNode } from 'react'
import { useAppViewportHeight } from '@/hooks/useAppViewportHeight'
import { I18nProvider } from '@/i18n/I18nProvider'

function ViewportHeightSync({ children }: { children: ReactNode }) {
  useAppViewportHeight()
  return children
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ViewportHeightSync>{children}</ViewportHeightSync>
    </I18nProvider>
  )
}
