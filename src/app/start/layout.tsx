import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo/build-metadata'

export const metadata: Metadata = buildPageMetadata('start', '/start')

export default function StartLayout({ children }: { children: React.ReactNode }) {
  return children
}
