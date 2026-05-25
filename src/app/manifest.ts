import type { MetadataRoute } from 'next'
import { SITE_LOGO_PATH, SITE_NAME } from '@/lib/seo/site'
import { getPageSeoCopy } from '@/lib/seo/copy'

export default function manifest(): MetadataRoute.Manifest {
  const { description } = getPageSeoCopy('home', 'en')

  return {
    name: SITE_NAME,
    short_name: 'MHA Quirk',
    description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0f1419',
    theme_color: '#ff5e5b',
    orientation: 'portrait',
    icons: [
      {
        src: SITE_LOGO_PATH,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: SITE_LOGO_PATH,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
