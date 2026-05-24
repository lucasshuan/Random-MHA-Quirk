import type { FusionPriorVariant } from './fusion'
import type { QuirkFacet, QuirkOrigin, QuirkRange, QuirkTier, QuirkType } from './quirk'

/** One parent quirk as sent to the fusion agent (English catalog fields). */
export interface FusionAgentParent {
  id: string
  name: string
  tier: QuirkTier
  type: QuirkType
  range: QuirkRange
  facets: QuirkFacet[]
  description: string
}

/** Request-specific payload rendered into the English fusion agent instructions. */
export interface FusionAgentInput {
  meta: {
    seed: string
    /** Sorted `parentA+parentB` key for tracing. */
    pairKey: string
    /** 0-based name-dedup attempt when prior variants already include rejected names. */
    attempt: number
  }
  parents: [FusionAgentParent, FusionAgentParent]
  /** Server-fixed mechanics — model must echo exactly in output. */
  mechanics: {
    type: QuirkType
    range: QuirkRange
    facets: QuirkFacet[]
    origin: QuirkOrigin
  }
  roll: {
    strategyKey: string
    strategyInstruction: string
    antiMashupRule: string
    antiMashupExample: string
    nameRegister: string
    nameRegisterInstruction: string
    nameExamples: string[]
    utilityNudge: string
  }
  constraints: {
    descriptionMinLength: number
    descriptionMaxLength: number
    typeDiscipline: string[]
    facetContract: string
    rangeProse: string
    siblingDiversityRequired: boolean
  }
  priorVariants: FusionPriorVariant[]
  /** English titles already used for this parent pair (shown in prompt; up to 10). */
  takenTitles: string[]
}
