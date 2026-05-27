import {
  FUSION_DESCRIPTION_MAX_LENGTH,
  FUSION_DESCRIPTION_MIN_LENGTH,
  type FusionTranslationLocale,
} from '@/server/fusion/constants'
import type { QuirkFacet, QuirkRange, QuirkType } from '@/types/quirk'

const SHARED_TONE_HINT =
  'Match official-style quirk entries: objective, vivid, anime encyclopedia voice'

const SHARED_NAME_RULE_FALLBACK =
  'Adapt the finished concept in the same name register. Prefer a natural native title, pun, or nickname over a word-for-word calque (e.g. "Mago" for "Magician", "Cnidocito" for "Cnidocyte", etc.).'

type LocaleRules = {
  languageLabel: string
  jsonKey: FusionTranslationLocale
  /** Preferred term for "Quirk" in prose in the target language. */
  quirkTerm: string
  /** Case-insensitive forbidden terms that should not appear in prose. */
  forbiddenTerms: readonly string[]
}

const LOCALE_RULES: Record<FusionTranslationLocale, LocaleRules> = {
  'pt-BR': {
    languageLabel: 'Brazilian Portuguese',
    jsonKey: 'pt-BR',
    quirkTerm: 'individualidade',
    forbiddenTerms: ['quirk', 'peculiaridade'],
  },
  es: {
    languageLabel: 'Spanish',
    jsonKey: 'es',
    quirkTerm: 'don',
    forbiddenTerms: ['quirk', 'peculiaridad', 'individualidad'],
  },
} as const

/** Shared rule: domain/context beats default dictionary glosses. */
const CONTEXT_MEANING_RULE =
  'Preserve meaning over literal glosses: pick the term native speakers would use in that domain (sports, medicine, mechanics, etc.). Read the full entry — name, description, type, range, and facets — before choosing a word (e.g. English "Goal" in a sports quirk → Portuguese "Gol", not "Objetivo").'

export type QuirkLocaleAdaptationKind = 'fusion hybrid' | 'catalog original'

export interface QuirkLocaleAdaptationSource {
  name: string
  description: string
  type: QuirkType
  range: QuirkRange
  facets: readonly QuirkFacet[]
}

export function buildQuirkLocaleAdaptationStaticInstructions(
  locale: FusionTranslationLocale,
  kind: QuirkLocaleAdaptationKind = 'catalog original',
): string {
  const config = LOCALE_RULES[locale]

  return `Adapt this ${kind} My Hero Academia quirk into ${config.languageLabel} for a quirk encyclopedia app.

  Your job is localization: preserve the finished concept, but adapt wording and title so they feel native in the target language.

  Rules:
  ${buildLocaleRulesBlock(locale, { keyPrefix: `${config.jsonKey}.` })}

  Return only JSON with key "${config.jsonKey}". No markdown.`
}

export function buildQuirkLocaleAdaptationStaticInstructionsAllLocales(
  locales: readonly FusionTranslationLocale[],
  kind: QuirkLocaleAdaptationKind = 'catalog original',
): string {
  const localeBlocks = locales.map((locale) => {
    const config = LOCALE_RULES[locale]
    return `### ${config.languageLabel} (${config.jsonKey})
${buildLocaleRulesBlock(locale, { keyPrefix: `${config.jsonKey}.` })}`
  })

  return `Adapt this ${kind} My Hero Academia quirk into multiple target languages for a quirk encyclopedia app.

Your job is localization: preserve the finished concept, but adapt wording and title so they feel native in each target language.

Rules (by locale):
${localeBlocks.join('\n\n')}

Return only JSON with keys: ${locales.map((l) => `"${l}"`).join(', ')}. No markdown.`
}

export function buildQuirkLocaleAdaptationDynamicSourceBlock(
  source: QuirkLocaleAdaptationSource,
): string {
  const { name, description, type, range, facets } = source

  return `English source (canonical mechanics — do not change the effect model):
  - name: ${name}
  - description: ${description}
  - type: ${type}
  - range: ${range}
  - facets: ${facets.join(', ')}`
}

export interface QuirkLocaleAdaptationNamingContext {
  /** Rolled name register key (pun/blunt/dramatic/...). */
  nameRegister: string
  /** Register-specific instruction used for the English generation step. */
  nameRegisterInstruction: string
  /** Example titles for the register (English). */
  nameExamples: readonly string[]
}

export function buildQuirkLocaleAdaptationDynamicNamingBlock(
  naming: QuirkLocaleAdaptationNamingContext | null | undefined,
): string {
  if (!naming) return ''
  const examples = naming.nameExamples.length > 0 ? naming.nameExamples.join(', ') : 'None.'
  return `\n\nName register (keep the same voice as English generation): ${naming.nameRegister}
- Instruction: ${naming.nameRegisterInstruction}
- Examples: ${examples}`
}

function buildLocaleRulesBlock(
  locale: FusionTranslationLocale,
  options: { keyPrefix?: string } = {},
): string {
  const config = LOCALE_RULES[locale]
  const keyPrefix = options.keyPrefix ?? ''
  const scoped = (key: 'name' | 'description') =>
    keyPrefix ? `${keyPrefix}${key}` : key

  const rules: string[] = [
    `${scoped('name')}: Follow the provided Name register instruction for this quirk. ${SHARED_NAME_RULE_FALLBACK}`,
    `${scoped('description')}: ${FUSION_DESCRIPTION_MIN_LENGTH}–${FUSION_DESCRIPTION_MAX_LENGTH} characters (hard server limit)`,
    'Preserve the same mechanism, activation, limits, and tradeoffs as English — do not add or remove effects',
    `One ${config.quirkTerm} only — never imply a second separate power`,
    'If simple cognate exists and serves its purpose, use and prefer it over racking your brain to find a better translation (e.g. "Mago" for "Magician", "Cnidocito" for "Cnidocyte", etc.)',
    CONTEXT_MEANING_RULE,
    `Use "${config.quirkTerm}" when referring to quirks in prose; never use ${config.forbiddenTerms
      .map((t) => `"${t}"`)
      .join(', ')}`,
    'If it\'s an existing proper noun, prefer using it as is (e.g. "Kitsune" for "Kitsune")',
    SHARED_TONE_HINT,
    'Do not mention English, translation, fusion, parents, or the source language',
    'Preserve the finished concept first, not the exact English wording',
    'Translate/adapt the name from the core idea of the quirk, not from isolated words',
    'Do not invent a new mechanism or reinterpret the quirk; only localize the already-created concept',
  ]

  return rules.map((line) => `- ${line}`).join('\n')
}

export function buildQuirkLocaleAdaptationInstructions(
  locale: FusionTranslationLocale,
  source: QuirkLocaleAdaptationSource,
  kind: QuirkLocaleAdaptationKind = 'catalog original',
): string {
  return `${buildQuirkLocaleAdaptationStaticInstructions(locale, kind)}

  ${buildQuirkLocaleAdaptationDynamicSourceBlock(source)}`
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
  ${buildLocaleRulesBlock(locale)}

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
  const config = LOCALE_RULES[locale]
  let out = description

  // Normalize forbidden quirk terms to the locale-preferred term (keep the rest as-is).
  // We special-case common Spanish plurals to preserve the "don" singular in prose.
  for (const term of config.forbiddenTerms) {
    const plural =
      term === 'peculiaridad'
        ? 'peculiaridades'
        : term === 'individualidad'
          ? 'individualidades'
          : undefined
    const pattern = plural
      ? new RegExp(`\\b(?:${term}|${plural})\\b`, 'gi')
      : new RegExp(`\\b${term}\\b`, 'gi')
    out = out.replace(pattern, config.quirkTerm)
  }

  return out
}

export function isForbiddenLocaleDescription(
  locale: FusionTranslationLocale,
  description: string,
): boolean {
  const config = LOCALE_RULES[locale]
  if (config.forbiddenTerms.length === 0) return false

  const parts = config.forbiddenTerms.map((t) => {
    if (t === 'peculiaridad') return '(?:peculiaridad|peculiaridades)'
    if (t === 'individualidad') return '(?:individualidad|individualidades)'
    return t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  })

  return new RegExp(`\\b(?:${parts.join('|')})\\b`, 'i').test(description)
}
