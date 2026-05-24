import { FaGithub } from 'react-icons/fa6'
import { SiKofi } from 'react-icons/si'
import { useI18n } from '../i18n/useI18n'

const GITHUB_URL = 'https://github.com/lucasshuan/Random-MHA-Quirk'
const KOFI_URL = 'https://ko-fi.com/nobelven'

export function SocialLinks() {
  const { t } = useI18n()

  return (
    <div className="social-links" role="group" aria-label="Project links">
      <a
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="social-btn social-btn-github"
        aria-label={t('nav.viewSource')}
        data-tooltip={t('nav.viewSource')}
      >
        <FaGithub aria-hidden="true" />
      </a>
      <a
        href={KOFI_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="social-btn social-btn-kofi"
        aria-label={t('nav.buyCoffee')}
        data-tooltip={t('nav.buyCoffee')}
      >
        <SiKofi aria-hidden="true" />
      </a>
    </div>
  )
}
