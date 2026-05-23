import type { QuirkType } from '@/types/quirk'

const TYPE_DISCIPLINE: Record<QuirkType, string[]> = {
  Emitter: [
    'Core model: the Quirk sends an effect outward from the body.',
    'An Emitter may be passive or reactive; it does not need a beam, projectile, or shot.',
    'Keep body changes minimal: activation tell or small output organ only.',
    'Clear wording models: "Any lie the user hears appears as colored smoke." / "The user releases heat from their palms that softens touched metal."',
  ],
  Transformation: [
    'Core model: the Quirk temporarily changes the user while active.',
    'State what changes in the body and what returns to normal after use.',
    'Clear wording models: "While active, the user converts their skin into adhesive mud." / "While active, the user turns their arms into flexible rubber."',
  ],
  Mutant: [
    'Core model: the user has stable unusual anatomy from birth.',
    'Describe the permanent trait first, then what it does in action.',
    'Clear wording models: "The user is born with glass wings that reflect light-based attacks." / "The user is born with antennae that detect nearby vibrations."',
  ],
}

export function formatTypeDisciplineBlock(type: QuirkType): string {
  return `Type discipline (${type} only):
${TYPE_DISCIPLINE[type].map((line) => `- ${line}`).join('\n')}
- Clear wording models illustrate sentence clarity only; do not copy their effect unless supported by the source quirks.`
}
