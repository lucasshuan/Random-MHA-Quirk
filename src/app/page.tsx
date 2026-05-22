'use client'

import { QuirksCatalogGate } from '@/components/QuirksCatalogGate'
import { WizardApp } from '@/components/WizardApp'

export default function HomePage() {
  return (
    <QuirksCatalogGate>
      <WizardApp />
    </QuirksCatalogGate>
  )
}
