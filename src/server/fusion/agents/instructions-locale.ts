import { buildQuirkLocaleAdaptationInstructions } from '@/server/quirks/locale-adaptation'
import type { FusionTranslationRunContext } from './context'

export function buildFusionTranslationInstructions({
  locale,
  source,
}: FusionTranslationRunContext): string {
  const { en, type, range, facets } = source

  return buildQuirkLocaleAdaptationInstructions(
    locale,
    {
      name: en.name,
      description: en.description,
      type,
      range,
      facets,
    },
    'fusion hybrid',
  )
}
