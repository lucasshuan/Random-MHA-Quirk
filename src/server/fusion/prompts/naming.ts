import { hashSeed } from './seed-hash'
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
): SelectedFusionNameRegister {
  const rollKey = resolveRollKey(seed, parentA, parentB)
  const picked = REGISTER_DEFS[hashSeed(rollKey, 'name-register') % REGISTER_DEFS.length]
  return picked ?? REGISTER_DEFS[0]
}

export function formatFusionNamingBlock(
  seed: string,
  priorVariantNames: string[] = [],
  parentA?: string,
  parentB?: string,
): string {
  const register = selectFusionNameRegister(seed, parentA, parentB)
  const priorNames = [
    ...new Set(priorVariantNames.map((name) => name.trim()).filter(Boolean)),
  ]

  const priorBlock =
    priorNames.length === 0
      ? ''
      : `
Do not reuse or lightly rephrase these existing titles for this parent pair (pick a different joke/hook/register, not just a new adjective):
${priorNames.map((name) => `- ${name}`).join('\n')}`

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
- Avoid stiff or moody compounds like "Omni-Kinetic Field", "Corrosive Gale", "Primal Bastion", "Barkbound Reprisal", "Nightcord Cataclysm", "Greyward Gate", or "Graftmire". Prefer names a classmate could say out loud.${dramaticBlock}
- Canon-style reference names (any register): ${CANON_STYLE_NAMES.join(', ')}
- Examples in the ${register.key} register: ${register.examples.join(', ')}${nameSafetyBlock}${priorBlock}`
}
