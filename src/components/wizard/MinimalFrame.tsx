import type { ReactNode } from 'react'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { SocialLinks } from '../SocialLinks'
import { useI18n } from '../../i18n/useI18n'

interface MinimalFrameProps {
  children: ReactNode
  canGoBack: boolean
  canRestart: boolean
  onBack: () => void
  onRestart: () => void
}

export function MinimalFrame({
  children,
  canGoBack,
  canRestart,
  onBack,
  onRestart,
}: MinimalFrameProps) {
  const { t } = useI18n()

  return (
    <main className="minimal-shell">
      <section className="minimal-card">
        <div className="minimal-topbar">
          <div className="minimal-topbar-start">
            <button
              type="button"
              className="icon-btn"
              onClick={onBack}
              disabled={!canGoBack}
              aria-label={t('nav.back')}
              data-tooltip={t('nav.back')}
            >
              ←
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={onRestart}
              disabled={!canRestart}
              aria-label={t('nav.restart')}
              data-tooltip={t('nav.restart')}
            >
              ⌂
            </button>
          </div>
          <div className="minimal-topbar-end">
            <SocialLinks />
            <LanguageSwitcher />
          </div>
        </div>
        <div className="minimal-screen">{children}</div>
      </section>
    </main>
  )
}

