import type { ReactNode } from 'react'
import { LanguageSwitcher } from '../LanguageSwitcher'
import { useI18n } from '../../i18n/useI18n'

interface MinimalFrameProps {
  children: ReactNode
  canGoBack: boolean
  showRestart: boolean
  onBack: () => void
  onRestart: () => void
}

export function MinimalFrame({
  children,
  canGoBack,
  showRestart,
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
              title={t('nav.back')}
            >
              ←
            </button>
            {showRestart ? (
              <button
                type="button"
                className="icon-btn"
                onClick={onRestart}
                aria-label={t('nav.restart')}
                title={t('nav.restart')}
              >
                ⌂
              </button>
            ) : null}
          </div>
          <LanguageSwitcher />
        </div>
        <div className="minimal-screen">{children}</div>
      </section>
    </main>
  )
}

