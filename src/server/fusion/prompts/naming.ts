import { pickUniformFromHash } from './seed-hash'
import { fusionRollKey } from './roll-key'
import type { FusionPriorVariant } from '@/types/fusion'
import { mergeForbiddenFusionTitles } from '../prior-variants'

export type FusionNameRegister =
  | 'pun'
  | 'blunt'
  | 'dramatic'
  | 'absurd-long'
  | 'meme-adjacent'

export interface SelectedFusionNameRegister {
  key: FusionNameRegister
  instruction: string
  examples: string[]
}

const CANON_STYLE_NAMES = [
  'Pop Off',
  'Comic',
  'Meatball',
  'Beams From His Eyes',
  'Gigantic Spinning Flying Turtle',
  'Sugar Rush',
  'Brainwashing',
  'Zero Gravity',
]

const DRAMATIC_STEM_BAN =
  'Avoid generic fantasy stems: "Veil of ...", "Impenetrable ...", "Phase ...", "... Shroud", "Lasso of ...", "... Cataclysm", "... Ward", "... Mire", or invented moody compounds. Prefer canon-dramatic quirk titles (Hellflame, Foldabody), not RPG skill labels.'

const NAME_PUNCTUATION_RULE =
  'Question marks in en.name are exceptional: default to a non-question title. Use one ? only when the title is a naturally phrased, punny question whose joke is made relevant by the finished quirk mechanism. "Got Milk?" and "Who, Me?" are good models only when the new quirk makes that question unexpectedly apt. Never force a question or add ? merely for cadence, attitude, or meme flavor; choose a stronger non-question name instead. A single comma clause may sell spoken cadence unless the register is absurd-long. No exclamation marks, ellipses, or quotes in the title. en.description stays declarative (no rhetorical questions).'

const NAME_QUALITY_GATE =
  'Funny or unusual names must still have a clear joke, phrase twist, mental image, natural spoken cadence, or loose hint of the core mechanic. Do not approve names that only combine a random interjection with a mechanic noun, such as "Oops, Cushion", "Uh Oh, Shield", "Hey, Smoke", "Wow, Punch", or "Oops, Dome", unless the full phrase lands as a joke. Interjections or question phrases such as "Oops", "Uh Oh", "Well, Well, Well", "Who, Me?", or "Got Milk?" need a reason: a joke, reversal, personality, accident, catchphrase, or ironic effect grounded in the new mechanism. If a name would sound awkward when translated literally, prefer a cleaner pun, blunt nickname, or stronger visual phrase. Bad: "Oops, Cushion". Better: "Oops-Proof", "Crash Pad", "Soft Serve", "Bounce House", or "No Hard Feelings".'

const NAME_SELF_CHECK =
  'Before accepting en.name, ask: "Does this title sound like a real anime Quirk name, a joke that lands, or a phrase someone could actually say?" If no, replace the name once in the SAME selected register. Do not use a random interjection; make the replacement work through wordplay, cadence, image, irony, or direct simplicity.'

export const FUSION_NAME_REGISTER_KEYS = [
  'pun',
  'blunt',
  'dramatic',
  'absurd-long',
  'meme-adjacent',
] as const satisfies readonly FusionNameRegister[]

export function isFusionNameRegister(value: string): value is FusionNameRegister {
  return (FUSION_NAME_REGISTER_KEYS as readonly string[]).includes(value)
}

const REGISTER_DEFS: SelectedFusionNameRegister[] = [
  {
    key: 'pun',
    instruction:
      'Wordplay first: homophone, double meaning, or sound-alike joke. The pun can be subtle; it must land without reading the description.',
    examples: [
      'Sole Survivor',
      'Pane In The Glass',
      'Current Events',
      'Extend-o-Hair',
      'Gale Gale',
      'Leafipulation',
      'Bloodcurdle',
      'Fly Swatter',
      'Day Dream',
      'Copy, Paste',
    ],
  },
  {
    key: 'blunt',
    instruction:
      'Deadpan and plain: 1–3 everyday words, almost boring on purpose — like a nickname someone would actually say out loud.',
    examples: [
      'Comic',
      'Meatball',
      'Pop Off',
      'Zero Gravity',
      'Blast',
      'Decay',
      'Float',
      'Cement',
      'Tail',
      'Zoom',
      'Smoke',
      'Heal',
    ],
  },
  {
    key: 'dramatic',
    instruction:
      'Canon-style dramatic quirk title — bold and memorable like a published hero/villain quirk name, not generic dark-fantasy wallpaper.',
    examples: [
      'Hellflame',
      'Wave Motion',
      'Foldabody',
      'Heaven-Piercing Ice',
      'Detonation',
      'Dark Shadow',
      'Permeation',
      'Overhaul',
      'Chronostasis',
      'Rewind',
      'Blackwhip',
      'Explosion',
      'Erasure',
      'Bloodcurdle',
    ],
  },
  {
    key: 'absurd-long',
    instruction:
      'Ridiculously long or specific phrase — commit to the bit. 4+ words is fine if it stays funny or memorable. No more than 8 words.',
    examples: [
      'Gigantic Spinning Flying Turtle',
      'Beams From His Eyes',
      'Super Ultra Great Delicious All Time Best',
      'Wooden Swords From His Hands',
      'Attraction of Small Objects',
      'Shoulder-Mounted Jets',
      'Whole-Body Lens',
      'Half-Cold Half-Hot',
      'Lizard Tail Splitter',
    ],
  },
  {
    key: 'meme-adjacent',
    instruction:
      'Internet-plain, cheeky, or meme-adjacent — blunt humor, unexpected noun, or title that sounds like a running joke.',
    examples: [
      'Sugar Rush',
      'Brainwashing',
      'Navel Laser',
      'Tape',
      'Chest Hair',
      'Anivoice',
      'Good Ear',
      'Binging Ball',
      'Tongue Tank',
      'Day Dream',
      'Stress',
      'Sloshed',
      'Who, Me?',
    ],
  },
]

function resolveRollKey(seed: string, parentA?: string, parentB?: string): string {
  return fusionRollKey(seed, parentA, parentB)
}

export function selectFusionNameRegister(
  seed: string,
  parentA?: string,
  parentB?: string,
  attempt = 0,
): SelectedFusionNameRegister {
  const rollKey = resolveRollKey(seed, parentA, parentB)
  const offset = attempt % REGISTER_DEFS.length
  const rotated = [
    ...REGISTER_DEFS.slice(offset),
    ...REGISTER_DEFS.slice(0, offset),
  ]

  return pickUniformFromHash(rollKey, 'name-register', rotated)
}

export function formatFusionNamingBlock(
  seed: string,
  priorVariants: FusionPriorVariant[] = [],
  parentA?: string,
  parentB?: string,
  parentDisplayNames?: { a: string; b: string },
): string {
  const register = selectFusionNameRegister(seed, parentA, parentB)
  const priorList = priorVariants
    .map((variant) => ({
      name: variant.name.trim(),
      description: variant.description.trim(),
    }))
    .filter((variant) => variant.name && variant.description)

  const forbiddenNames = parentDisplayNames
    ? mergeForbiddenFusionTitles(
        parentDisplayNames.a,
        parentDisplayNames.b,
        priorList.map((variant) => variant.name),
      )
    : priorList.map((variant) => variant.name)

  const forbiddenNamesBlock =
    forbiddenNames.length === 0
      ? ''
      : `
- Not allowed names (do not use for en.name — parent catalog quirks and prior fusion variants): ${forbiddenNames.map((name) => `"${name}"`).join(', ')}`

  const priorBlock =
    priorList.length === 0
      ? ''
      : `
Existing variants for this parent pair — do not reuse these titles or lightly rephrase them; also avoid repeating the same core mechanism, activation loop, body tell, or situational niche (pick a different register AND a meaningfully different effect idea):
${priorList
  .map(
    (variant) =>
      `- "${variant.name}": ${variant.description}`,
  )
  .join('\n')}`

  const dramaticBlock =
    register.key === 'dramatic' ? `\n- ${DRAMATIC_STEM_BAN}` : ''

  const nameSafetyBlock =
    register.key === 'meme-adjacent'
      ? ''
      : `
- Name safety: avoid accidental double entendres, sexual innuendo, or awkward readings unless the joke is clearly intentional.`

  return `Naming (IMPORTANT — en.name uses a different voice than en.description):
- Target name register for this variant: ${register.key.toUpperCase()} — ${register.instruction}
- en.name MUST match this register even though en.description stays objective and encyclopedic.
- en.name must NOT read like a fantasy RPG skill, technical field label, or "[Parent theme adjective] + [Parent theme noun]" mashup.
- en.name may be only loosely related to the mechanism — canon names often joke first, explain second.
- Avoid stiff or moody compounds like "Omni-Kinetic Field", "Corrosive Gale", "Primal Bastion", "Barkbound Reprisal", "Nightcord Cataclysm", "Greyward Gate", or "Graftmire". Prefer names a classmate could say out loud.
- ${NAME_PUNCTUATION_RULE}${dramaticBlock}
- ${NAME_QUALITY_GATE}
- ${NAME_SELF_CHECK}
- Canon-style reference names (any register): ${CANON_STYLE_NAMES.join(', ')}
- Examples in the ${register.key} register: ${register.examples.join(', ')}${nameSafetyBlock}${forbiddenNamesBlock}${priorBlock}`
}
