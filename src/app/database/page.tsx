'use client'

import { DatabasePageApp } from '@/components/database/DatabasePageApp'
import { QuirksCatalogGate } from '@/components/QuirksCatalogGate'

export default function DatabasePage() {
  return (
    <QuirksCatalogGate>
      <DatabasePageApp />
    </QuirksCatalogGate>
  )
}
