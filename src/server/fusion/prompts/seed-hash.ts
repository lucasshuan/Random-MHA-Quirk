export function hashSeed(seed: string, salt = ''): number {
  const input = salt ? `${seed}:${salt}` : salt
  let hash = 0
  for (const ch of input) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  }
  return hash
}

/** Deterministic uniform pick — each option has equal probability. */
export function pickUniformFromHash<T>(
  rollKey: string,
  salt: string,
  options: readonly T[],
): T {
  if (options.length === 0) {
    throw new Error('pickUniformFromHash: options must not be empty')
  }
  return options[hashSeed(rollKey, salt) % options.length] as T
}

/** Deterministic weighted pick; weights must be positive integers. */
export function pickWeightedFromHash<T extends { weight: number }>(
  rollKey: string,
  salt: string,
  options: readonly T[],
): T {
  if (options.length === 0) {
    throw new Error('pickWeightedFromHash: options must not be empty')
  }

  let totalWeight = 0
  for (const option of options) {
    if (!Number.isSafeInteger(option.weight) || option.weight <= 0) {
      throw new Error('pickWeightedFromHash: weights must be positive integers')
    }
    totalWeight += option.weight
  }

  let target = hashSeed(rollKey, salt) % totalWeight
  for (const option of options) {
    if (target < option.weight) return option
    target -= option.weight
  }

  return options[options.length - 1] as T
}
