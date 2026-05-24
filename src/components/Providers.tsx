'use client'

import type { ReactNode } from 'react'
import { QuirksRoutePreloader } from '@/components/QuirksRoutePreloader'
import { useAppViewportHeight } from '@/hooks/useAppViewportHeight'
import { useTooltipViewportClamp } from '@/hooks/useTooltipViewportClamp'
import { I18nProvider } from '@/i18n/I18nProvider'

function ViewportHeightSync({ children }: { children: ReactNode }) {
  useAppViewportHeight()
  useTooltipViewportClamp()
  return children
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <ViewportHeightSync>
        <QuirksRoutePreloader />
        {children}
      </ViewportHeightSync>
    </I18nProvider>
  )
}
