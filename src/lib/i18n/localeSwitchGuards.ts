import type { Locale } from '@/i18n/types'

export type LocaleSwitchGuard = (locale: Locale) => void | Promise<void>

const guards = new Set<LocaleSwitchGuard>()

export function registerLocaleSwitchGuard(guard: LocaleSwitchGuard): () => void {
  guards.add(guard)
  return () => {
    guards.delete(guard)
  }
}

export async function runLocaleSwitchGuards(locale: Locale): Promise<void> {
  await Promise.all([...guards].map((guard) => guard(locale)))
}
