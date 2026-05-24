'use client'

import { useRouter } from 'next/navigation'
import { QuirksCatalogGate } from '@/components/QuirksCatalogGate'
import { WizardApp } from '@/components/WizardApp'

export default function StartPage() {
  const router = useRouter()

  return (
    <QuirksCatalogGate>
      <WizardApp initialStep="mode" onExitStart={() => router.push('/')} />
    </QuirksCatalogGate>
  )
}
