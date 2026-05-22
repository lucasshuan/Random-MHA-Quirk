export function sortedParentPair(a, b) {
  return a < b ? [a, b] : [b, a]
}

export function fusionPairKey(a, b) {
  const [left, right] = sortedParentPair(a, b)
  return `${left}+${right}`
}

export function fusionCacheKey(a, b, seed) {
  return `${fusionPairKey(a, b)}:${seed}`
}
