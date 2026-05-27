'use client'

import { useRouter } from 'next/navigation'
import { LuHistory, LuLayoutGrid, LuSparkles } from 'react-icons/lu'
import { MinimalFrame } from '@/components/wizard/MinimalFrame'
import { BrandMark } from '@/components/wizard/BrandMark'
import { useHasResultHistory } from '@/hooks/useHasResultHistory'
import { useI18n } from '@/i18n/useI18n'
import {
  preloadQuirksForDatabase,
  preloadQuirksForWizard,
} from '@/lib/quirks/route-preload'

export default function HomePage() {
  const router = useRouter()
  const { locale, t } = useI18n()
  const hasHistory = useHasResultHistory()

  return (
    <MinimalFrame
      canGoBack={false}
      canRestart={false}
      onBack={() => router.push('/')}
      onRestart={() => router.push('/')}
    >
      <div className="simple-step start-step home-step">
        <BrandMark />
        <h1>{t('start.title')}</h1>
        <div className="start-step-actions">
          <button
            type="button"
            className="big-action big-action-with-icon start-step-primary-action"
            onMouseEnter={() => preloadQuirksForWizard(locale)}
            onFocus={() => preloadQuirksForWizard(locale)}
            onClick={() => router.push('/start')}
          >
            <LuSparkles aria-hidden="true" />
            <span>{t('start.action')}</span>
          </button>
          <div className="start-step-secondary-actions">
            <button
              type="button"
              className="big-action secondary-big-action big-action-with-icon"
              onMouseEnter={() => preloadQuirksForDatabase(locale)}
              onFocus={() => preloadQuirksForDatabase(locale)}
              onClick={() => router.push('/database')}
            >
              <LuLayoutGrid aria-hidden="true" />
              <span>{t('start.viewAllQuirks')}</span>
            </button>
            <button
              type="button"
              className="big-action secondary-big-action big-action-with-icon"
              disabled={!hasHistory}
              onClick={() => router.push('/history')}
            >
              <LuHistory aria-hidden="true" />
              <span>{t('start.previousResults')}</span>
            </button>
          </div>
        </div>
      </div>
    </MinimalFrame>
  )
}
