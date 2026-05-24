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
