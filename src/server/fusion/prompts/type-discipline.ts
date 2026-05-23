import type { QuirkType } from '@/types/quirk'

const TYPE_DISCIPLINE: Record<QuirkType, string[]> = {
  Emitter: [
    'Core model: the Quirk sends an effect outward from the body.',
    'Keep body changes minimal: activation tell or small output organ only.',
  ],
  Transformation: [
    'Core model: the Quirk temporarily changes the user while active.',
    'State what changes in the body and what returns to normal after use.',
  ],
  Mutant: [
    'Core model: the user has stable unusual anatomy from birth.',
    'Describe the permanent trait first, then what it does in action.',
  ],
}

export function formatTypeDisciplineBlock(type: QuirkType): string {
  return `Type discipline (${type} only):
${TYPE_DISCIPLINE[type].map((line) => `- ${line}`).join('\n')}`
}
