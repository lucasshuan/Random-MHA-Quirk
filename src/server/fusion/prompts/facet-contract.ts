import type { QuirkFacet, QuirkType } from '@/types/quirk'
import type { FusionCatalogQuirk } from '../catalog'

const FACET_MECHANISM_HINTS: Record<QuirkFacet, string> = {
  Elemental: 'element/material/temperature tied to the effect',
  Psychic: 'mental, sensory, emotion, or perception influence — not generic mist',
  Enhancement: 'direct increase to the user\'s physical capability',
  Anthropomorphic: 'a stable body trait explicitly supported by a parent, not invented animal anatomy',
  Control: 'direct manipulation of an existing material or explicitly produced effect',
  Mobility: 'movement, repositioning, or travel change',
  Sensory: 'awareness or feedback already supported by a parent mechanism, not an extra remote sense',
  Emission: 'something leaving the body as a projectile, beam, or burst',
  Biological: 'flesh, organs, fluids, or living tissue change',
  Stockpile:
    'a defined resource accumulated, then released or spent; transfer is optional',
}

const FACET_CLEAR_WORDING_MODELS: Record<QuirkFacet, readonly [string, string]> = {
  Elemental: [
    'The user exhales frost that freezes wet surfaces.',
    'The user sweats acid that corrodes touched metal.',
  ],
  Psychic: [
    'Eye contact makes the target forget the last sentence they heard.',
    'The user hears the thoughts of anyone holding their hand.',
  ],
  Enhancement: [
    'While active, the user\'s muscles grow denser, increasing physical strength.',
    'When struck, the user\'s skin hardens and becomes harder to damage.',
  ],
  Anthropomorphic: [
    'The user is born with gecko-like pads that cling to walls.',
    'The user is born with gills that extract oxygen from water.',
  ],
  Control: [
    'The user controls nearby liquid water.',
    'The user moves loose sand within sight.',
  ],
  Mobility: [
    'The user expels air from their soles to propel their body.',
    'The user becomes weightless while holding their breath.',
  ],
  Sensory: [
    'The user feels floor vibrations through bare feet.',
    'The user sees temperature differences.',
  ],
  Emission: [
    'Each clap emits a burst that pushes objects backward.',
    'The user spits ink that blinds anything it coats.',
  ],
  Biological: [
    'While active, the user secretes adhesive resin through their skin.',
    'The user grows bone blades from their forearms.',
  ],
  Stockpile: [
    'Each step stores kinetic force that the user can release in one burst.',
    'Through touch, the user steals remaining lifespan, stores it, and later transfers it.',
  ],
}

function formatFacetMechanismHint(
  facet: QuirkFacet,
  type?: QuirkType,
): string {
  if (type === 'Emitter' && facet === 'Anthropomorphic') {
    return 'animal-like shape, behavior, sound, or a minor body tell tied to the emitted effect - not a full body morph'
  }
  if (type === 'Emitter' && facet === 'Biological') {
    return 'organic secretion, living material, or a small output organ - not a full body transformation'
  }
  if (type === 'Mutant' && facet === 'Emission') {
    return 'something leaving a stable mutant organ or appendage, with production limits'
  }
  if (type === 'Transformation' && facet === 'Emission') {
    return 'something launched, shed, or released by the temporary changed form'
  }
  return FACET_MECHANISM_HINTS[facet]
}

export function formatFacetContractBlock(
  facets: QuirkFacet[],
  type?: QuirkType,
  parents: readonly FusionCatalogQuirk[] = [],
): string {
  const lines = facets.map(
    (facet) => {
      const [first, second] = FACET_CLEAR_WORDING_MODELS[facet]
      return `- ${facet}: show ${formatFacetMechanismHint(facet, type)}. Clear wording models: "${first}" / "${second}"`
    },
  )
  const sourceSummary =
    parents.length === 0
      ? ''
      : `\nSource-faithfulness gate: only express a facet through behavior already supported by these parent descriptions. A tag does not authorize new healing, analgesia, calming, remote senses, stat boosts, or animal anatomy.`

  return `Facet contract (keep one central mechanism):
${lines.join('\n')}
Facet guidance: describe one core effect first. Once the mechanism is clear, do not append arbitrary targets, tracking restrictions, or inferred uses just to add detail. Extra facets stay light extensions of that same effect, not separate subsystems. Rolled facets describe how the hybrid presents; they never replace either parent's recognizable operational essence. Clear wording models illustrate sentence clarity only; do not copy their effect unless supported by the source quirks.${sourceSummary}`
}
