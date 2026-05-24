import { pickWeightedFromHash } from './seed-hash'
import { fusionRollKey } from './roll-key'

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

export interface FusionNameRegisterDefinition extends SelectedFusionNameRegister {
  weight: number
}

export const FUSION_CANON_NAME_REFERENCES = [
  'Pop Off',
  'Comic',
  'Meatball',
  'Beams From His Eyes',
  'Gigantic Spinning Flying Turtle',
  'Sugar Rush',
  'Brainwashing',
  'Zero Gravity',
]

export const FUSION_NAMING_RULES = [
  'Write en.name only after en.description — the title must give a clear idea of what the quirk does even if it is a pun, joke, or absurd-long register.',
  'en.name uses a different voice than en.description — joke or cadence in the title, encyclopedic body text.',
  'en.name must NOT read like a fantasy RPG skill, technical field label, or "[Parent theme adjective] + [Parent theme noun]" mashup.',
  'The title must fit a NEW birth Quirk — not a parent name with one swapped word (e.g. Parent "Foldabody" -> "Telescopic Fold" when the description is still just that parent).',
  'Question marks in en.name are exceptional: default to a non-question title. Use one ? only when the title is a naturally phrased, punny question whose joke is made relevant by the finished quirk mechanism. "Got Milk?" and "Who, Me?" are good models only when the new quirk makes that question unexpectedly apt. Never force a question or add ? merely for cadence, attitude, or meme flavor; choose a stronger non-question name instead.',
  'Other punctuation in en.name: one comma clause may sell spoken cadence unless register is absurd-long. No exclamation marks, ellipses, or quotes in the title.',
  'Funny names must still land as a joke, phrase twist, mental image, or spoken cadence — not random interjection + mechanic noun (e.g. avoid "Oops, Cushion" unless the full phrase is the joke).',
  'Before finalizing en.name, ask: "Does this sound like a real anime Quirk title or a phrase someone could say?" If no, replace once in the SAME name register.',
]

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

export const REGISTER_DEFS = [
  {
    key: 'pun',
    weight: 26,
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
    weight: 26,
    instruction:
      'Deadpan and plain: 1–3 everyday words, almost boring on purpose — like a nickname someone would actually say out loud.',
    examples: [
      'Comic',
      'Meatball',
      'Dog',
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
    weight: 26,
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
    ],
  },
  {
    key: 'absurd-long',
    weight: 11,
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
    weight: 11,
    instruction:
      'Internet-plain, cheeky, or meme-adjacent — blunt humor, unexpected noun, or title that sounds like a running joke.',
    examples: [
      'Sugar Rush',
      'Chest Hair',
      'Binging Ball',
      'Stress',
      'Sloshed',
      'Hula Hoop',
      'Pop Off',
      'Day Dream',
      'Big Monkey',
      'Playtime',
      'Squirmy Fingers',
    ],
  },
] satisfies FusionNameRegisterDefinition[]

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
  const initial = pickWeightedFromHash(rollKey, 'name-register', REGISTER_DEFS)
  const initialIndex = REGISTER_DEFS.indexOf(initial)
  const offset = attempt % REGISTER_DEFS.length

  return REGISTER_DEFS[(initialIndex + offset) % REGISTER_DEFS.length]!
}
