import type { MetadataRoute } from 'next'
import { absoluteSiteUrl } from '@/lib/seo/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = absoluteSiteUrl()
  const now = new Date()

  return [
    {
      url: base,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${base}/start`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${base}/database`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
  ]
}
