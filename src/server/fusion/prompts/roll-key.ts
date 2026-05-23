function sortedParentPairKey(parentA: string, parentB: string): string {
  return parentA < parentB ? `${parentA}+${parentB}` : `${parentB}+${parentA}`
}

export function fusionRollKey(seed: string, parentA?: string, parentB?: string): string {
  if (!parentA || !parentB) return seed
  return `${sortedParentPairKey(parentA, parentB)}:${seed}`
}
