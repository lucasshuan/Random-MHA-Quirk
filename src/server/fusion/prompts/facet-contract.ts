import type { QuirkFacet, QuirkType } from '@/types/quirk'

const FACET_MECHANISM_HINTS: Record<QuirkFacet, string> = {
  Elemental: 'element/material/temperature tied to the effect',
  Psychic: 'mental, sensory, emotion, or perception influence — not generic mist',
  Enhancement: 'raw physical stat boost with a visible tell',
  Anthropomorphic: 'animal-like body traits or movement',
  Control: 'steering, shaping, or restraining the effect',
  Support: 'stabilizing, recovery, or protective utility tied to the same core effect',
  Defense: 'blocking, absorbing, or reducing incoming harm',
  Mobility: 'movement, repositioning, or travel change',
  Sensory: 'altered sight, hearing, tracking, or awareness',
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
): string {
  const lines = facets.map(
    (facet) => `- ${facet}: show ${formatFacetMechanismHint(facet, type)}`,
  )

  return `Facet contract (keep one central mechanism):
${lines.join('\n')}
Facet guidance: describe one core effect first. If there is a second facet, keep it as a light extension of the same effect, not a new subsystem.`
}
