import type { Locale } from '@/i18n/types'
import type { QuirkId } from './quirk'

export type FusionParentLabels = Partial<Record<QuirkId, Partial<Record<Locale, string>>>>
