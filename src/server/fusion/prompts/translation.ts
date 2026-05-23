import {
  FUSION_DESCRIPTION_MAX_LENGTH,
  FUSION_DESCRIPTION_MIN_LENGTH,
} from '../constants'
import type { FusionTranslationLocale } from '../constants'
import type { ValidatedEnglishFusionPayload } from '../validate'

const LOCALE_PROMPT_CONFIG: Record<
  FusionTranslationLocale,
  {
    languageLabel: string
    jsonKey: FusionTranslationLocale
    nameField: string
    descriptionField: string
    toneHint: string
    termRule: string
    forbiddenTerms: string
  }
> = {
  'pt-BR': {
    languageLabel: 'Brazilian Portuguese',
    jsonKey: 'pt-BR',
    nameField: 'pt-BR.name',
    descriptionField: 'pt-BR.description',
    toneHint:
      'Match official-style quirk entries: objective, vivid, anime encyclopedia voice (similar to "Permite ao usuário…" / "O usuário pode…" when it fits)',
    termRule:
      'Use "individualidade" when referring to quirks in prose; never use "Quirk", "quirk", or "Peculiaridade"',
    forbiddenTerms: '"Quirk", "quirk", or "Peculiaridade"',
  },
  es: {
    languageLabel: 'Spanish',
    jsonKey: 'es',
    nameField: 'es.name',
    descriptionField: 'es.description',
    toneHint:
      'Match official-style quirk entries: objective, vivid, anime encyclopedia voice (similar to "Permite al usuario…" / "El usuario puede…" when it fits)',
    termRule:
      'Use "don" when referring to quirks in prose; never use "Quirk", "quirk", "Peculiaridad", or "individualidad"',
    forbiddenTerms: '"Quirk", "quirk", "Peculiaridad", or "individualidad"',
  },
}

export function buildFusionTranslationPrompt(
  english: ValidatedEnglishFusionPayload,
  targetLocale: FusionTranslationLocale,
): string {
  const { en, type, range, facets } = english
  const config = LOCALE_PROMPT_CONFIG[targetLocale]

  return `Localize this hybrid My Hero Academia quirk into ${config.languageLabel} for a quirk encyclopedia app.

English source (canonical — do not change the mechanics):
- name: ${en.name}
- description: ${en.description}
- type: ${type}
- range: ${range}
- facets: ${facets.join(', ')}

Your job is ADAPTATION, not translation. Write as if the quirk were authored directly in ${config.languageLabel} for anime fans.

Rules:
- ${config.nameField}: Match the English name's register (punny, blunt, dramatic, absurd-long, or meme-adjacent). ADAPTATION, not literal translation: if a local pun, joke, or sharper nickname works better than mirroring the English title, use it (wordplay that only lands in ${config.languageLabel} is encouraged). Do not flatten a funny English title into a stiff literal compound. Do not transliterate word-for-word unless it already sounds right to fans
- ${config.descriptionField}: 2–4 sentences, ${FUSION_DESCRIPTION_MIN_LENGTH}–${FUSION_DESCRIPTION_MAX_LENGTH} characters (count includes spaces and punctuation)
- Preserve the same mechanism, activation, body changes, what moves where, limits, and tradeoffs as the English text — do not add, remove, or soften effects
- Preserve variant identity: keep the same fusion strategy and body/emission/range logic implied by the English. Do not flatten it into a generic all-rounder during localization.
- MHA singularity: the user has only ONE Quirk — this entry is that whole Quirk. Never imply a second separate power or that they "lose their quirk" while using part of it; rephrase bad English into limits of the same ability if needed
- That one Quirk may still have multiple linked effects (like Half-Cold Half-Hot); keep them as branches of the same Quirk, not separate quirks
- ${config.toneHint}
- Assume the reader imagines an ordinary human first; keep every visual and behavioral detail clear
- ${config.termRule}
- Prefer natural word choices over calques (avoid stiff literal renderings of English idioms or physics jargon)
- If the English used vague wording, clarify what the reader actually sees — still without changing the effect model
- Do not mention English, translation, fusion, parents, or the source language
- Name anti-template rule: avoid defaulting to repetitive local equivalents of generic stems like "Corrosive/Feral/Verdant + Noun"; prefer a distinct, memorable hook that sounds native in ${config.languageLabel}.

Reply with ONLY valid JSON (no markdown):
{
  "${config.jsonKey}": { "name": string, "description": string }
}`
}
