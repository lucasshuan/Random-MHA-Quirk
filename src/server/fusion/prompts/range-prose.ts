import type { QuirkRange } from '@/types/quirk'

const RANGE_PROSE_HINTS: Record<QuirkRange, string> = {
  Self: 'effects stay on the user only — no ranged strikes or distant targets',
  Contact: 'touch or immediate grappling distance only',
  Short: 'a few meters — close-quarters, not across a field',
  Medium: 'mid-distance — not self-only and not battlefield-wide',
  Long: 'far reach across open space — not touch-only',
  Area: 'wide zone or battlefield footprint — not single-target contact only',
}

export function formatRangeProseBlock(range: QuirkRange): string {
  return `Range prose check: rolled range is ${range} — ${RANGE_PROSE_HINTS[range]}. en.description must match this band; do not describe a different reach.`
}
