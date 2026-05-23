import type { FusionCatalogQuirk } from '../catalog'
import {
  FUSION_DESCRIPTION_MAX_LENGTH,
  FUSION_DESCRIPTION_MIN_LENGTH,
} from '../constants'
import { deriveFusionOutputFromSeed, type FusionOutputRoll } from './output'
import { selectFusionStrategy } from './strategy'

export function formatPriorVariantNamesBlock(priorVariantNames: string[]): string {
  const names = [
    ...new Set(priorVariantNames.map((name) => name.trim()).filter(Boolean)),
  ]
  if (names.length === 0) return ''

  return `
Existing fusion names for this parent pair (invent a clearly different en.name — be more creative; do not reuse or lightly rephrase these):
${names.map((name) => `- ${name}`).join('\n')}
`
}

export function buildFusionPrompt(
  quirkA: FusionCatalogQuirk,
  quirkB: FusionCatalogQuirk,
  seed: string,
  outputRoll: FusionOutputRoll = deriveFusionOutputFromSeed(seed),
  priorVariantNames: string[] = [],
): string {
  const formatParent = (q: FusionCatalogQuirk) =>
    `- ${q.name} (${q.id}): ${q.type}, range ${q.range}, facets [${q.facets.join(', ')}]. ${q.description}`
  const strategy = selectFusionStrategy(seed, quirkA, quirkB)
  const priorNamesBlock = formatPriorVariantNamesBlock(priorVariantNames)

  return `Create ONE original My Hero Academia-style fusion quirk from these two parent quirks.

${strategy.contextBlock}
${strategy.instruction}
${priorNamesBlock}
Required result mechanics (fixed for this variant — copy exactly into JSON; write en.description to fit this type, range, and facets):
- type: ${outputRoll.type}
- range: ${outputRoll.range}
- facets: [${outputRoll.facets.join(', ')}]

Parent quirks:
${formatParent(quirkA)}

${formatParent(quirkB)}

Rules:
- Invent a third mechanism that synergizes or clashes with BOTH source quirks — do NOT just concatenate names or effects.
- Not a canon character quirk; this is a fan hybrid quirk (origin will be ORIGINAL).
- MHA singularity: the user is born with exactly ONE Quirk — this entry IS that entire Quirk, not an add-on, gadget, or mode layered on top of some other power. Never write as if they have "their quirk" plus this effect, or that they "lose/can't use their (own) quirk" while doing part of it. Tradeoffs are limits of this same ability only (stamina, focus, range, cooldown, body strain). Suppressing or affecting other people's quirks is fine; do not imply the user normally has multiple quirks besides this one.
- Still, that single Quirk may include two or more distinct effects that belong together (e.g. Shoto Todoroki's Half-Cold Half-Hot: ice and fire from one birth Quirk). Describe multiple effects as facets of the same Quirk, not as separate quirks or as temporarily shutting off "their real quirk" to use one branch.
- Do not change type, range, or facets from the required result mechanics above — only invent name and description.
- en.description: 2–4 sentences, ${FUSION_DESCRIPTION_MIN_LENGTH}–${FUSION_DESCRIPTION_MAX_LENGTH} characters (count includes spaces and punctuation), objective, vivid, anime tone, self-contained, focused on the resulting quirk only
- Follow the fusion strategy above for how the two parents combine; do not ignore it for a generic literal merge of both effects.
- Assume the reader only imagines an ordinary human at first and knows nothing about the source quirks. Explain the quirk from zero: what appears on or changes in the body, how it activates, what it lets the user do, and what visible behavior others would notice.
- If the quirk changes anatomy or makes the user animal-like, monstrous, inorganic, elemental, or otherwise not fully human, state that clearly in the description. Mention major visual traits, altered senses or movement, and whether the change is permanent, triggered, or partial.
- If the user still looks human, say what subtle or overt signs reveal the quirk when active, such as eyes, skin, posture, aura, emitted material, sound, temperature, or motion.
- Pick one clear effect model and commit to it: effects stay on the body, detach and travel, reshape the body, project outward without leaving the skin, or alter the environment. Do not mix incompatible models in one sentence (e.g. attached nodes that also ambiguously "rocket forward" without saying whether they leave the body).
- State what moves and where: if something launches, detaches, stays attached, or only a blast/aura/shockwave travels outward. If parts regrow, burn out, or are one-use, say so briefly.
- Use plain action words (grow, burst, launch, shed, propel, coat, emit). Avoid vague physics jargon (acceleration, velocity, kinetic, manipulate force) unless you immediately spell out what the reader sees.
- Do not repeat activation signs already stated earlier in the same description.
- Tradeoff quality bar: avoid generic "uses stamina" alone. Include at least one concrete constraint (startup delay, anchor requirement, cooldown window, recoil/self-risk, fixed radius, reduced precision while active, charge cap, environmental dependence, or one-branch-at-a-time focus lock).
- Write ONLY about the new hybrid quirk. Do not refer to the source quirks by name (${quirkA.name}, ${quirkB.name}), id (${quirkA.id}, ${quirkB.id}), or as separate quirks — no "fusion", "combination", "based on", "inspired by", "inherits from", or "merges X with Y"
- Normal vocabulary is fine even when it overlaps a parent name (e.g. English "power" in "raw power" is allowed; do not capitalize it or use it as the parent quirk's proper name)
- Describe the resulting quirk in an encyclopedia-like tone: mechanism, activation, behavior, limits/tradeoffs
- en.name: Quirk names are preferably not rigid or inflexible: they can be funny, tongue-in-cheek, blunt, dramatic, punny, really short, really long or meme-adjacent — like canon examples (Pop Off, Comic, Meatball, Beams From His Eyes, Gigantic Spinning Flying Turtle, etc.) — as long as they still sound like a quirk name in the setting. Avoid stiff technical labels (e.g. "Omni-Kinetic Field"), always think of creative out-of-the-box names.
- Name anti-template rule: avoid repeating generic stems such as "Corrosive", "Verdant", "Feral", "Savage", "X Blast", "X Shield", "X Fortress" unless truly unavoidable; prefer a distinct hook or image-first title.

Reply with ONLY valid JSON (no markdown):
{
  "en": { "name": string, "description": string },
  "type": string,
  "range": string,
  "facets": string[]
}`
}
