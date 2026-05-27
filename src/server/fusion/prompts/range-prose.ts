import type { QuirkRange } from '@/types/quirk'

const RANGE_PROSE_HINTS: Record<QuirkRange, string> = {
  Self: 'manifests only through the user’s own body, mind, or internal state',
  Contact: 'requires direct touch or immediate physical interaction',
  Short: 'extends a small distance away from the user',
  Medium: 'operates comfortably beyond arm’s reach without covering large spaces',
  Long: 'can affect distant targets or locations far from the user',
  Area: 'influences a broad zone, field, or surrounding environment',
}

export function formatRangeProseBlock(range: QuirkRange): string {
  return `Range prose check: rolled range is ${range} — ${RANGE_PROSE_HINTS[range]}. en.description must match this band; do not describe a different reach.`
}
