import {
  FUSION_DESCRIPTION_MAX_LENGTH,
  FUSION_DESCRIPTION_MIN_LENGTH,
} from '../constants'
import type { FusionTranslationRunContext } from './context'

const LOCALE_RULES = {
  'pt-BR': {
    languageLabel: 'Brazilian Portuguese',
    jsonKey: 'pt-BR',
    termRule:
      'Use "individualidade" when referring to quirks in prose; never use "Quirk", "quirk", or "Peculiaridade"',
    toneHint:
      'Match official-style quirk entries: objective, vivid, anime encyclopedia voice',
    nameRule:
      'Adapt the English name register (punny, blunt, dramatic, absurd-long, meme-adjacent). Prefer a local pun or nickname over a stiff literal translation.',
  },
  es: {
    languageLabel: 'Spanish',
    jsonKey: 'es',
    termRule:
      'Use "don" when referring to quirks in prose; never use "Quirk", "quirk", "Peculiaridad", or "individualidad"',
    toneHint:
      'Match official-style quirk entries: objective, vivid, anime encyclopedia voice',
    nameRule:
      'Adapt the English name register. Prefer a native pun or nickname over a word-for-word calque.',
  },
} as const

export function buildFusionTranslationInstructions({
  locale,
  source,
}: FusionTranslationRunContext): string {
  const { en, type, range, facets } = source
  const config = LOCALE_RULES[locale]

  return `Adapt this hybrid My Hero Academia quirk into ${config.languageLabel} for a quirk encyclopedia app.

English source (canonical mechanics — do not change the effect model):
- name: ${en.name}
- description: ${en.description}
- type: ${type}
- range: ${range}
- facets: ${facets.join(', ')}

Your job is ADAPTATION, not literal translation.

Rules:
- ${config.jsonKey}.name: ${config.nameRule}
- ${config.jsonKey}.description: 2–3 short sentences, ${FUSION_DESCRIPTION_MIN_LENGTH}–${FUSION_DESCRIPTION_MAX_LENGTH} characters
- Preserve the same mechanism, activation, limits, and tradeoffs as English — do not add or remove effects
- One Quirk only — never imply a second separate power
- ${config.termRule}
- ${config.toneHint}
- Do not mention English, translation, fusion, parents, or the source language

Return only JSON with key "${config.jsonKey}". No markdown.`
}
