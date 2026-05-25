import { absoluteSiteUrl, SITE_LOGO_PATH, SITE_NAME, siteLogoUrl } from './site'

export function SiteJsonLd() {
  const url = absoluteSiteUrl('/')
  const payload = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${url}#website`,
        url,
        name: SITE_NAME,
        description:
          'Fan-made My Hero Academia quirk roller with solo rolls, hybrid AI fusions, and a searchable quirk database.',
        inLanguage: ['en', 'pt-BR', 'es'],
        publisher: { '@id': `${url}#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${url}#organization`,
        name: SITE_NAME,
        url,
        logo: siteLogoUrl(),
      },
      {
        '@type': 'WebApplication',
        '@id': `${url}#app`,
        name: SITE_NAME,
        url,
        applicationCategory: 'EntertainmentApplication',
        operatingSystem: 'Any',
        browserRequirements: 'Requires JavaScript',
        image: absoluteSiteUrl(SITE_LOGO_PATH),
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        description:
          'Roll random My Hero Academia quirks, browse the database, and generate hybrid fusions from two parent quirks.',
      },
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  )
}
