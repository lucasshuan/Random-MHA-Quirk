import type { MetadataRoute } from 'next'
import { absoluteSiteUrl } from '@/lib/seo/site'

export default function robots(): MetadataRoute.Robots {
  const base = absoluteSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/history', '/api/'],
    },
    sitemap: `${base}/sitemap.xml`,
    host: base,
  }
}
