import {
  buildQuirkLocaleAdaptationDynamicSourceBlock,
  buildQuirkLocaleAdaptationDynamicNamingBlock,
  buildQuirkLocaleAdaptationStaticInstructions,
  buildQuirkLocaleAdaptationStaticInstructionsAllLocales,
} from '@/server/quirks/locale-adaptation'
import type { FusionTranslationAllRunContext, FusionTranslationRunContext } from './context'
import { FUSION_TRANSLATION_LOCALES } from '../constants'

export function buildFusionTranslationInstructions({
  locale,
  source,
}: FusionTranslationRunContext): string {
  const { en, type, range, facets } = source

  return `${buildQuirkLocaleAdaptationStaticInstructions(locale, 'fusion hybrid')}

${buildQuirkLocaleAdaptationDynamicSourceBlock({
  name: en.name,
  description: en.description,
  type,
  range,
  facets,
})}`
}

export function buildFusionTranslationStaticInstructions(
  locale: FusionTranslationRunContext['locale'],
): string {
  return buildQuirkLocaleAdaptationStaticInstructions(locale, 'fusion hybrid')
}

export function buildFusionTranslationStaticInstructionsAllLocales(): string {
  return buildQuirkLocaleAdaptationStaticInstructionsAllLocales(
    FUSION_TRANSLATION_LOCALES,
    'fusion hybrid',
  )
}

export function buildFusionTranslationDynamicSourceBlock(
  source: FusionTranslationRunContext['source'],
): string {
  const { en, type, range, facets } = source
  return buildQuirkLocaleAdaptationDynamicSourceBlock({
    name: en.name,
    description: en.description,
    type,
    range,
    facets,
  })
}

export function buildFusionTranslationDynamicPromptAllLocales(
  source: FusionTranslationAllRunContext['source'],
  naming: FusionTranslationAllRunContext['naming'],
): string {
  return `${buildFusionTranslationDynamicSourceBlock(source)}${buildQuirkLocaleAdaptationDynamicNamingBlock(
    naming,
    FUSION_TRANSLATION_LOCALES,
  )}`
}
