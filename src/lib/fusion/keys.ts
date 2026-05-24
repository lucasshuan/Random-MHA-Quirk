import type { QuirkId } from '@/types/quirk-id'

/** Par canônico: ids ordenados, independente da ordem do sorteio. */
export function sortedParentPair(a: QuirkId, b: QuirkId): [QuirkId, QuirkId] {
  return a < b ? [a, b] : [b, a]
}

export function fusionPairKey(a: QuirkId, b: QuirkId): string {
  const [left, right] = sortedParentPair(a, b)
  return `${left}+${right}`
}

export function fusionCacheKey(a: QuirkId, b: QuirkId, seed: string): string {
  return `${fusionPairKey(a, b)}:${seed}`
}

export function fusionQuirkId(a: QuirkId, b: QuirkId, seed: string): string {
  return `fusion:${fusionCacheKey(a, b, seed)}`
}

export function randomFusionSeed(): string {
  const bytes = new Uint8Array(16)
  globalThis.crypto.getRandomValues(bytes)
  return Array.from(bytes, (value) => value.toString(16).padStart(2, '0')).join('')
}
