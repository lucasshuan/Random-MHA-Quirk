'use client'

import { useEffect } from 'react'
import {
  registerLocaleSwitchGuard,
  type LocaleSwitchGuard,
} from '@/lib/i18n/localeSwitchGuards'

export function useLocaleSwitchGuard(guard: LocaleSwitchGuard): void {
  useEffect(() => registerLocaleSwitchGuard(guard), [guard])
}
