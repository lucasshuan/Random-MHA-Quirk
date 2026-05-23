import type { QuirkFacet, QuirkType } from '@/types/quirk'
import type { FusionCatalogQuirk } from '../catalog'

const FACET_MECHANISM_HINTS: Record<QuirkFacet, string> = {
  Elemental: 'element/material/temperature tied to the effect',
  Psychic: 'mental, sensory, emotion, or perception influence — not generic mist',
  Enhancement: 'raw physical stat boost with a visible tell',
  Anthropomorphic: 'a stable body trait explicitly supported by a parent, not invented animal anatomy',
  Control: 'steering, shaping, or restraining the effect',
  Support: 'practical aid from the core effect; do not invent healing, pain relief, calming, or buffs',
  Defense: 'blocking, absorbing, or reducing incoming harm',
  Mobility: 'movement, repositioning, or travel change',
  Sensory: 'awareness or feedback already supported by a parent mechanism, not an extra remote sense',
  Construct: 'built or grown objects/structures from the quirk',
  Emission: 'something leaving the body as a projectile, beam, or burst',
  Biological: 'flesh, organs, fluids, or living tissue change',
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
    (facet) => `- ${facet}: show ${formatFacetMechanismHint(facet, type)}`,
  )
  const sourceSummary =
    parents.length === 0
      ? ''
      : `\nSource-faithfulness gate: only express a facet through behavior already supported by these parent descriptions. A tag does not authorize new healing, analgesia, calming, remote senses, stat boosts, or animal anatomy.`

  return `Facet contract (keep one central mechanism):
${lines.join('\n')}
Facet guidance: describe one core effect first. If there is a second facet, keep it as a light extension of the same effect, not a new subsystem.${sourceSummary}`
}
