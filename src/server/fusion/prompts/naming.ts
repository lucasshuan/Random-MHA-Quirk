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

export const FUSION_NAMING_RULES = [
  'The title should capture the cleanest core concept of the quirk, not every operational detail.',
  'Prefer concept-first naming: if the quirk naturally resolves into a recognizable derived concept, organism, phenomenon, material, reaction, machine, or mythic form, title that concept directly.',
  'Do not force parent keywords into en.name when a cleaner inherited concept exists.',
  'The best titles usually describe the resulting idea, not the exact mechanism.',
  'Keep en.description objective and encyclopedic; use en.name for the selected title voice.',
  'The title must fit a NEW birth Quirk — not a parent name with one swapped word. Prefer evolved or resolved concepts over literal parent recombinations.',
  'Before finalizing en.name, ask: "Does this sound like the cleanest and most memorable expression of the concept in the selected register, given the naming strategy and parents?" If no, replace it.',]

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
      'Wordplay first: homophone, double meaning, or sound-alike joke. The pun can be subtle; it must land without reading the description. A question title is exceptional: use one ? only for a naturally phrased pun made apt by the finished mechanism, such as "Got Milk?" when relevant; otherwise choose a non-question pun. Do not use random interjection + mechanic noun as a substitute for a joke.',
    examples: [
      'Sole Survivor',
      'Pane In The Glass',
      'Current Events',
      'Got Milk?',
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
      'Ridiculously long or specific phrase — commit to the bit. 4+ words is fine if it stays funny or memorable. No more than 8 words. The specific phrase must itself create the memorable image; do not bolt random joke words onto a mechanism.',
    examples: [
      'Gigantic Spinning Flying Turtle',
      'Beams From His Eyes',
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
      'Internet-plain, cheeky, or meme-adjacent — blunt humor, unexpected noun, or title that sounds like a running joke. A question title is exceptional: use one ? only for a naturally phrased joke made apt by the finished mechanism, such as "Who, Me?" when relevant; otherwise choose a non-question title. The humor must come from a phrase twist or mental image, not random interjection + mechanic noun.',
    examples: [
      'Sugar Rush',
      'Chest Hair',
      'Binging Ball',
      'Stress',
      'Sloshed',
      'Who, Me?',
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
