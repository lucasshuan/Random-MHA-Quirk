export function hashSeed(seed: string, salt = ''): number {
  const input = salt ? `${seed}:${salt}` : seed
  let hash = 0
  for (const ch of input) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  }
  return hash
}
