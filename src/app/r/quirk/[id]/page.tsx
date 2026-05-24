'use client'

import { Suspense, use } from 'react'
import { SharedResultApp } from '@/components/share/SharedResultApp'

function QuirkSharePageContent({ id }: { id: string }) {
  return <SharedResultApp mode="single" quirkId={id} />
}

export default function QuirkSharePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  return (
    <Suspense fallback={null}>
      <QuirkSharePageContent id={id} />
    </Suspense>
  )
}
