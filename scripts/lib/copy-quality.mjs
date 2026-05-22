export const GENERIC_MARKER = 'Canonical quirk from the My Hero Academia universe'

export function isGenericDescription(description) {
  return !description || description.includes(GENERIC_MARKER)
}

export function isUsableCopy(copy) {
  return copy?.name && copy?.description && !isGenericDescription(copy.description)
}
