import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo/build-metadata'

export const metadata: Metadata = buildPageMetadata('history', '/history', 'en', {
  robots: { index: false, follow: false },
})

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
