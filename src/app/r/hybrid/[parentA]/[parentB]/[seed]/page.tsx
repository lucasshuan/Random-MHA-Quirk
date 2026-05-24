'use client'

import { Suspense, use } from 'react'
import { SharedResultApp } from '@/components/share/SharedResultApp'

function HybridSharePageContent({
  parentA,
  parentB,
  seed,
}: {
  parentA: string
  parentB: string
  seed: string
}) {
  return (
    <SharedResultApp
      mode="hybrid"
      parentA={parentA}
      parentB={parentB}
      seed={seed}
    />
  )
}

export default function HybridSharePage({
  params,
}: {
  params: Promise<{ parentA: string; parentB: string; seed: string }>
}) {
  const { parentA, parentB, seed } = use(params)
  return (
    <Suspense fallback={null}>
      <HybridSharePageContent parentA={parentA} parentB={parentB} seed={seed} />
    </Suspense>
  )
}
