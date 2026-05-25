import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo/build-metadata'

export const metadata: Metadata = buildPageMetadata('database', '/database')

export default function DatabaseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
