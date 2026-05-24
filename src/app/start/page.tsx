'use client'

import { useRouter } from 'next/navigation'
import { WizardApp } from '@/components/WizardApp'

export default function StartPage() {
  const router = useRouter()

  return <WizardApp initialStep="mode" onExitStart={() => router.push('/')} />
}
