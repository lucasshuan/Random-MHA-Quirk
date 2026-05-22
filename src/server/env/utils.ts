export function requireOneOf(keys: string[], label: string): string[] {
  const found = keys.filter((k) => process.env[k]?.trim())
  if (found.length === 0) {
    throw new Error(
      `${label}: defina uma destas variáveis no .env — ${keys.join(', ')}`,
    )
  }
  return found
}
