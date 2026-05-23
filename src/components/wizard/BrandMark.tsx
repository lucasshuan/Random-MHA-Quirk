import { useI18n } from '../../i18n/useI18n'

export function BrandMark() {
  const { t } = useI18n()

  return (
    <div className="brand-mark" aria-label={t('brand.title')}>
      <img src="/mha-logo.webp" alt={t('brand.logoAlt')} className="brand-logo" />
      <span className="brand-text">{t('brand.title')}</span>
    </div>
  )
}
