import {
  FUSION_DESCRIPTION_MAX_LENGTH,
  FUSION_DESCRIPTION_MIN_LENGTH,
  type FusionTranslationLocale,
} from '@/server/fusion/constants'
import type { QuirkFacet, QuirkRange, QuirkType } from '@/types/quirk'

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

export type QuirkLocaleAdaptationKind = 'fusion hybrid' | 'catalog original'

export interface QuirkLocaleAdaptationSource {
  name: string
  description: string
  type: QuirkType
  range: QuirkRange
  facets: readonly QuirkFacet[]
}

export function buildQuirkLocaleAdaptationInstructions(
  locale: FusionTranslationLocale,
  source: QuirkLocaleAdaptationSource,
  kind: QuirkLocaleAdaptationKind = 'catalog original',
): string {
  const config = LOCALE_RULES[locale]
  const { name, description, type, range, facets } = source

  return `Adapt this ${kind} My Hero Academia quirk into ${config.languageLabel} for a quirk encyclopedia app.

English source (canonical mechanics — do not change the effect model):
- name: ${name}
- description: ${description}
- type: ${type}
- range: ${range}
- facets: ${facets.join(', ')}

Your job is translation, but sometimes you need to adapt the name or description to fit the local context.

Rules:
- ${config.jsonKey}.name: ${config.nameRule}
- ${config.jsonKey}.description: 2–3 short sentences, ${FUSION_DESCRIPTION_MIN_LENGTH}–${FUSION_DESCRIPTION_MAX_LENGTH} characters
- Preserve the same mechanism, activation, limits, and tradeoffs as English — do not add or remove effects
- One individualidade/don only — never imply a second separate power
- If simple cognate exists and serves its purpose, use and prefer it over racking your brain to find a better translation (e.g. "Mago" for "Magician", "Cnidocito" for "Cnidocyte", etc.)
- If it's an existing proper noun, prefer using it as is (e.g. "Kitsune" for "Kitsune")
- ${config.termRule}
- ${config.toneHint}
- Do not mention English, translation, fusion, parents, or the source language

Return only JSON with key "${config.jsonKey}". No markdown.`
}

export function buildQuirkLocaleAdaptationBatchPrompt(
  locale: FusionTranslationLocale,
  entries: Array<QuirkLocaleAdaptationSource & { id: string }>,
  kind: QuirkLocaleAdaptationKind = 'catalog original',
): string {
  const config = LOCALE_RULES[locale]

  return `Adapt these ${kind} My Hero Academia quirks into ${config.languageLabel} for a quirk encyclopedia app.

Your job is translation, but sometimes you need to adapt the name or description to fit the local context.

Rules (every entry):
- name: ${config.nameRule}
- description: 2–3 short sentences, ${FUSION_DESCRIPTION_MIN_LENGTH}–${FUSION_DESCRIPTION_MAX_LENGTH} characters
- Preserve mechanism, activation, limits, and tradeoffs — do not add or remove effects
- If simple cognate exists and serves its purpose, use and prefer it over racking your brain to find a better translation (e.g. "Mago" for "Magician", "Cnidocito" for "Cnidocyte", etc.)
- If it's an existing proper noun, prefer using it as is (e.g. "Kitsune" for "Kitsune")
- ${config.termRule}
- ${config.toneHint}
- Do not mention English, translation, or the source language

English entries JSON:
${JSON.stringify(
  Object.fromEntries(
    entries.map(({ id, name, description, type, range, facets }) => [
      id,
      { name, description, type, range, facets },
    ]),
  ),
  null,
  2,
)}

Reply with ONLY valid JSON:
{
  "entries": {
    "<id>": { "name": string, "description": string }
  }
}`
}

export function sanitizeLocaleDescription(
  locale: FusionTranslationLocale,
  description: string,
): string {
  if (locale === 'es') {
    return description
      .replace(/\b[Gg]uirk\b/g, 'don')
      .replace(/\b[Pp]eculiaridad(?:es)?\b/g, 'don')
      .replace(/\b[Ii]ndividualidad(?:es)?\b/g, 'don')
  }

  if (locale === 'pt-BR') {
    return description
      .replace(/\b[Qq]uirk\b/g, 'individualidade')
      .replace(/\b[Pp]eculiaridade\b/g, 'individualidade')
  }

  return description
}

export function isForbiddenLocaleDescription(
  locale: FusionTranslationLocale,
  description: string,
): boolean {
  if (locale === 'es') {
    return /\b(quirk|peculiaridad|individualidad)\b/i.test(description)
  }
  if (locale === 'pt-BR') {
    return /\b(quirk|peculiaridade)\b/i.test(description)
  }
  return false
}
