# Fusion Generation Evaluation - 2026-05-23

## 1. Test setup

The requested procedure conflicts with its required output format: it first requests 4 pairs with 3 results each, but later requires 5 pairs with 4 fusions each. This test uses the larger, explicitly reportable sample: 5 new pairs x 4 generated variants = 20 fusions.

Method: each result was generated live through the current English benchmark path used by `scripts/fusion/benchmark.ts`: catalog lookup, deterministic output roll, strategy selection, naming-register selection, existing-pair-name lookup, `buildFusionPrompt`, LLM generation, and payload validation. The fixed seeds were `eval-s1`, `eval-s2`, `eval-s3`, and `eval-s4`. Existing benchmark pairings were excluded.

Selected pairs:

1. Mushroom + Invisibility
2. Compress + Engine
3. Rewind + Vines
4. Softening + Voice
5. Poltergeist + Steel

The 20 raw live results were retained outside the repository in the temporary output `fusion-evaluation-2026-05-23.json`.

## 2. Generated fusions and evaluations

### Pair: Mushroom + Invisibility

#### Fusion 1

Name: Hide 'n' Spore

Description summary: A permanent fungal coat cushions impacts and refracts light enough to blur the user's outline.

Grades:
- Naming: 8
- Creativity: 7
- Balance: 7
- Mechanical sense: 7
- Simplicity: 6
- Anime tone: 8
- Fun factor: 7
- Source Quirk integration: 7

Analysis: Both sources are visible through fungal growth and light refraction, and the defensive cloak is readable. It is slightly overbuilt: absorbing attacks, concealment, impact activation, stamina loss, and residue compete for attention, and the 301-character text exceeds the target.

#### Fusion 2

Name: Tiny Fungus That Lies To Your Eyes

Description summary: Contact-delivered spores bloom into filaments that briefly distort a target's vision and space perception.

Grades:
- Naming: 7
- Creativity: 7
- Balance: 7
- Mechanical sense: 5
- Simplicity: 3
- Anime tone: 6
- Fun factor: 6
- Source Quirk integration: 5

Analysis: The fungus inheritance is clear, but Invisibility is translated into hallucination and spatial distortion rather than refraction or concealment. At 412 characters, with multiple timing and incapability clauses, it reads like an ability specification instead of a Quirk entry.

#### Fusion 3

Name: Spectral Cap

Description summary: Fungal membranes and filaments cloak covered limbs or draped surfaces with patchy transparency.

Grades:
- Naming: 8
- Creativity: 7
- Balance: 7
- Mechanical sense: 6
- Simplicity: 4
- Anime tone: 7
- Fun factor: 7
- Source Quirk integration: 8

Analysis: This is a plausible stealth-oriented hybrid with recognizable parent traits. The description stretches its Mutant core into projected medium-range filaments, then adds motion failure, dizziness, and dehydration; it is substantially less simple than its premise.

#### Fusion 4

Name: Now You See Spore

Description summary: Emitted spores settle on surfaces and scatter light to create short-lived invisible patches.

Grades:
- Naming: 9
- Creativity: 8
- Balance: 8
- Mechanical sense: 8
- Simplicity: 6
- Anime tone: 9
- Fun factor: 8
- Source Quirk integration: 9

Analysis: The environmental camouflage field is the clearest interpretation of the pair and leaves room for inventive applications. The final sentence unnecessarily adds the user's own flickering invisibility, making a clean surface-cloaking Quirk less focused.

Pair-level analysis:
- Intra-pair diversity: 7/10. Defensive coat, perception sabotage, draped concealment, and environmental camouflage are distinct uses, although three are variants of spore-based hiding and three selected `failure-mode`.
- Best fusion: Now You See Spore.
- Weakest fusion: Tiny Fungus That Lies To Your Eyes.
- Repeated patterns: Spores plus visual concealment; weakened/short-lived limitation clauses.
- What should improve: Keep the visual-scattering mechanism and remove auxiliary self-invisibility or hallucination systems.

### Pair: Compress + Engine

#### Fusion 1

Name: Squeeze 'n Zoom

Description summary: A compact, engine-powered body curls into a dense ball to roll rapidly and squeeze through gaps.

Grades:
- Naming: 8
- Creativity: 7
- Balance: 8
- Mechanical sense: 7
- Simplicity: 6
- Anime tone: 8
- Fun factor: 8
- Source Quirk integration: 7

Analysis: The rolling mobility idea is legible and suitably playful. Requiring solid touch to compress the user's own Mutant body is an unexplained carryover from Compress, and the cooldown/dizziness detail adds length without defining the fantasy.

#### Fusion 2

Name: Whole-Body Marble Roll And Rocketing Stomp

Description summary: Engine anatomy compacts the legs and lower torso into a dense core for short rocket-like rolls.

Grades:
- Naming: 6
- Creativity: 7
- Balance: 8
- Mechanical sense: 7
- Simplicity: 6
- Anime tone: 7
- Fun factor: 7
- Source Quirk integration: 7

Analysis: It is comprehensible and modest in scale, with a useful mobility identity rather than an oversized combat kit. It is still very close to Fusion 1, and the title is descriptive rather than memorable.

#### Fusion 3

Name: Marble Dash

Description summary: Palm-made marble nodes compress a few meters of space and release it as a directed dash.

Grades:
- Naming: 8
- Creativity: 8
- Balance: 6
- Mechanical sense: 4
- Simplicity: 5
- Anime tone: 7
- Fun factor: 7
- Source Quirk integration: 5

Analysis: This offers a different delivery method, but it invents spatial compression rather than Compress's shrinking of touched targets. Engine becomes an abstract movement result instead of biological propulsion, so the parent integration is weak despite a neat mobility concept.

#### Fusion 4

Name: Pocket Rocket

Description summary: A body with collapsible internal mass compresses into a leg-driven thrust core for rolling bursts.

Grades:
- Naming: 9
- Creativity: 6
- Balance: 8
- Mechanical sense: 7
- Simplicity: 7
- Anime tone: 8
- Fun factor: 8
- Source Quirk integration: 7

Analysis: This is the best named and easiest to remember of the rolling-body variants. Its function is clear, but mechanically it nearly duplicates Fusions 1 and 2 rather than opening another interpretation such as carried storage, ejecting compressed objects, or rescue utility.

Pair-level analysis:
- Intra-pair diversity: 5/10. Three fusions are compact-body engine rolls; the fourth is a dash node that loses source fidelity.
- Best fusion: Pocket Rocket.
- Weakest fusion: Marble Dash.
- Repeated patterns: Marble-like body cores, forward propulsion, dizziness or cooldown.
- What should improve: Force at least one non-self-mobility interpretation for this pair and forbid more than one compact-body rolling variant.

### Pair: Rewind + Vines

#### Fusion 1

Name: Memory Hair

Description summary: Living vine hair senses and records nearby biological states, then rolls bodies back across an area.

Grades:
- Naming: 7
- Creativity: 8
- Balance: 3
- Mechanical sense: 4
- Simplicity: 4
- Anime tone: 7
- Fun factor: 6
- Source Quirk integration: 8

Analysis: The sources are integrated through living hair that delivers regression, but passive biological archiving plus area-wide reversal is much stronger and more complex than either a simple utility Quirk or a readable limitation. It feels like a high-tier special technique rather than one core function.

#### Fusion 2

Name: Root Cause

Description summary: Tendrils grip living tissue and locally regress it to a previous biological state.

Grades:
- Naming: 9
- Creativity: 6
- Balance: 6
- Mechanical sense: 8
- Simplicity: 7
- Anime tone: 8
- Fun factor: 7
- Source Quirk integration: 8

Analysis: The name is strong and the contact rule makes the power immediately understandable. It remains very close to "Rewind delivered by vines," and local tissue regression can still be extremely powerful without a narrower stated use or cap.

#### Fusion 3

Name: Living Thorn-Hair That Patches Old Wounds

Description summary: Thorny vine hair contacts living tissue to restore recent shallow damage.

Grades:
- Naming: 7
- Creativity: 7
- Balance: 8
- Mechanical sense: 8
- Simplicity: 9
- Anime tone: 8
- Fun factor: 8
- Source Quirk integration: 9

Analysis: This is a strong example of a modest support-focused hybrid. It inherits both sources, limits itself to recent shallow repair, stays below 280 characters, and gives the user applications to imagine rather than listing them.

#### Fusion 4

Name: Undoing Briar

Description summary: Thin thorned tendrils press against tissue to apply a shallow, short-term biological rollback.

Grades:
- Naming: 9
- Creativity: 6
- Balance: 8
- Mechanical sense: 8
- Simplicity: 7
- Anime tone: 8
- Fun factor: 7
- Source Quirk integration: 8

Analysis: It is controlled, readable, and plausibly balanced, with a clear contact mechanism. It substantially repeats Fusion 2 and uses two sentences to restate its short reach and shallow effect.

Pair-level analysis:
- Intra-pair diversity: 6/10. A risky area/sensory version and a good healing version appear, but two variants are nearly the same contact rollback.
- Best fusion: Living Thorn-Hair That Patches Old Wounds.
- Weakest fusion: Memory Hair.
- Repeated patterns: Tendril contact plus tissue rollback; shallow/short-lived limitations.
- What should improve: Preserve the supportive narrow design and disallow unbounded area Rewind or duplicate contact-regression variants.

### Pair: Softening + Voice

#### Fusion 1

Name: Soggy Songs That Turn Stuff To Slime

Description summary: Sustained singing turns nearby solids into sticky semi-liquid material, with pitch shaping the spread.

Grades:
- Naming: 8
- Creativity: 7
- Balance: 7
- Mechanical sense: 8
- Simplicity: 7
- Anime tone: 8
- Fun factor: 8
- Source Quirk integration: 9

Analysis: This is easy to picture, suitably odd, and naturally combines both sources. The pitch/thickness control is optional extra precision, but it does not overwhelm the central effect and the description remains within the target length.

#### Fusion 2

Name: Melt Song

Description summary: Directed vocal pulses turn struck mid-range solid surfaces into viscous semi-liquid patches.

Grades:
- Naming: 8
- Creativity: 6
- Balance: 7
- Mechanical sense: 8
- Simplicity: 6
- Anime tone: 8
- Fun factor: 7
- Source Quirk integration: 9

Analysis: A mechanically sensible, concise-in-concept version that repeats Fusion 1 with a more direct blast shape. "Strip cohesion" and the cone/range restatement make the text more technical and longer than needed.

#### Fusion 3

Name: Soft Shout

Description summary: A temporary animal-like throat emits a wide vocal softening field over solid terrain.

Grades:
- Naming: 7
- Creativity: 7
- Balance: 5
- Mechanical sense: 5
- Simplicity: 5
- Anime tone: 6
- Fun factor: 6
- Source Quirk integration: 7

Analysis: It follows its forced Transformation/Anthropomorphic roll rather than the most natural parent logic: the padded limbs do not contribute to vocal softening. A broad area field risks excessive terrain control and is less clean than the direct song variants.

#### Fusion 4

Name: Shoutpaste

Description summary: Permanent vocal glands launch sound-shaped paste blobs that soften solid surfaces they strike.

Grades:
- Naming: 9
- Creativity: 9
- Balance: 8
- Mechanical sense: 7
- Simplicity: 8
- Anime tone: 9
- Fun factor: 9
- Source Quirk integration: 9

Analysis: This is a distinctive utility/environmental interpretation, with a concrete output and readable limitation. "Constantly grows" is an awkward way to describe stable Mutant glands, but it is otherwise the sample's strongest combination of clarity and personality.

Pair-level analysis:
- Intra-pair diversity: 6/10. Three variants are voice waves that soften terrain; Shoutpaste creates the needed material-delivery twist.
- Best fusion: Shoutpaste.
- Weakest fusion: Soft Shout.
- Repeated patterns: Sonic softening, throat strain, semi-liquid terrain.
- What should improve: Retain one direct sonic version and one material version; avoid forced anatomy unless it changes the core mechanic.

### Pair: Poltergeist + Steel

#### Fusion 1

Name: Irony

Description summary: Detachable steel skin flakes become steerable long-range metal projectiles.

Grades:
- Naming: 10
- Creativity: 8
- Balance: 8
- Mechanical sense: 7
- Simplicity: 7
- Anime tone: 9
- Fun factor: 8
- Source Quirk integration: 8

Analysis: The pun is excellent and the guided shed-metal loop makes both sources visible. It is combat-forward and overshoots the length target, but the restricted flake output prevents it from becoming generic unrestricted telekinesis.

#### Fusion 2

Name: Whole-Body Clanking Push And Shove

Description summary: A heavy steel form emits pulses that throw loose objects around a broad area.

Grades:
- Naming: 6
- Creativity: 6
- Balance: 7
- Mechanical sense: 6
- Simplicity: 7
- Anime tone: 7
- Fun factor: 7
- Source Quirk integration: 6

Analysis: The steel transformation and reduced fine control are readable, but shock-pulses replace Poltergeist's object-moving principle with a generic area shove. It is usable, though not a particularly faithful or memorable fusion.

#### Fusion 3

Name: Iron Marionette

Description summary: A living-metal form grows animated metal constructs that act as remote limbs and shields.

Grades:
- Naming: 8
- Creativity: 8
- Balance: 7
- Mechanical sense: 8
- Simplicity: 6
- Anime tone: 8
- Fun factor: 8
- Source Quirk integration: 8

Analysis: Animated metal constructs are a coherent interpretation of telekinetic steel and allow non-projectile uses. The durability boost, remote constructs, distance weakness, heaviness, and fatigue make it more loaded than necessary.

#### Fusion 4

Name: Cast Off

Description summary: Temporary steel body plates detach as medium-range projectiles and reattach when use ends.

Grades:
- Naming: 8
- Creativity: 7
- Balance: 8
- Mechanical sense: 7
- Simplicity: 8
- Anime tone: 8
- Fun factor: 8
- Source Quirk integration: 5

Analysis: It is compact and easy to imagine, but launching plates does not clearly require the Poltergeist parent; the return is automatic rather than an expressed control mechanism. It reads well as a Steel variant, less well as a fusion.

Pair-level analysis:
- Intra-pair diversity: 7/10. Guided flakes, object-shoving armor, construct limbs, and detachable plates differ in manifestation, although all lean combat-forward.
- Best fusion: Irony.
- Weakest fusion: Whole-Body Clanking Push And Shove.
- Repeated patterns: Metal projection, fatigue, armor-to-projectile conversion.
- What should improve: Add one defensive or utility telekinetic-metal interpretation and require the control trait to be explicit.

## 3. Summary table

Overall score is the mean of each fusion's eight requested per-fusion grades.

| Pair | Fusion name | One-line description summary | Overall |
| --- | --- | --- | ---: |
| Mushroom + Invisibility | Hide 'n' Spore | Fungal impact cloak blurs the user's outline. | 7.13 |
| Mushroom + Invisibility | Tiny Fungus That Lies To Your Eyes | Contact spores distort vision and space. | 5.75 |
| Mushroom + Invisibility | Spectral Cap | Fungal membranes drape objects in patchy transparency. | 6.75 |
| Mushroom + Invisibility | Now You See Spore | Spores create short-lived invisible surface patches. | 8.13 |
| Compress + Engine | Squeeze 'n Zoom | Compact ball-body rolls with biological engines. | 7.38 |
| Compress + Engine | Whole-Body Marble Roll And Rocketing Stomp | Dense leg core enables short rocket rolls. | 6.88 |
| Compress + Engine | Marble Dash | Marble nodes compress distance into dashes. | 6.25 |
| Compress + Engine | Pocket Rocket | Internal compression fuels forward body thrust. | 7.50 |
| Rewind + Vines | Memory Hair | Vine hair archives and area-rewinds biology. | 5.88 |
| Rewind + Vines | Root Cause | Gripping tendrils locally regress living tissue. | 7.38 |
| Rewind + Vines | Living Thorn-Hair That Patches Old Wounds | Thorn hair restores recent shallow wounds. | 8.00 |
| Rewind + Vines | Undoing Briar | Contact briars impose a shallow rollback. | 7.63 |
| Softening + Voice | Soggy Songs That Turn Stuff To Slime | Singing liquefies and shapes nearby solids. | 7.75 |
| Softening + Voice | Melt Song | Directed sonic bursts soften struck surfaces. | 7.38 |
| Softening + Voice | Soft Shout | Transformed throat projects a wide softening field. | 6.00 |
| Softening + Voice | Shoutpaste | Vocal glands fire material-softening paste. | 8.50 |
| Poltergeist + Steel | Irony | Steerable steel skin flakes fly at long range. | 8.13 |
| Poltergeist + Steel | Whole-Body Clanking Push And Shove | Steel form hurls loose objects with pulses. | 6.50 |
| Poltergeist + Steel | Iron Marionette | Living-metal constructs act as remote limbs. | 7.63 |
| Poltergeist + Steel | Cast Off | Steel body plates launch and later reattach. | 7.38 |

## 4. Average scores

The first ten averages are across the 20 fusions. Diversity is scored across pairs rather than per individual fusion: intra-pair diversity is the mean of the five pair assessments; inter-pair diversity is the comparative set-level score.

| Dimension | Score / 10 |
| --- | ---: |
| Naming | 7.95 |
| Creativity | 7.10 |
| Intra-pair diversity | 6.20 |
| Inter-pair diversity | 7.40 |
| Balance | 7.05 |
| Mechanical sense | 6.75 |
| Simplicity | 6.20 |
| Anime tone | 7.70 |
| Fun factor | 7.35 |
| Source Quirk integration | 7.45 |
| Practical readability | 6.20 |
| User creativity space | 7.05 |

## 5. Diversity analysis

Inter-pair separation is good enough: camouflage spores, rolling propulsion, biological repair, sound-softened terrain, and animated metal each read as distinct families. The system also produced one genuinely good supportive result (`Living Thorn-Hair That Patches Old Wounds`) and one unusual utility/environmental result (`Shoutpaste`), so it is not exclusively optimizing for combat.

Intra-pair diversity is materially weaker. `Compress + Engine` produced three compressed rolling bodies. `Softening + Voice` produced three direct sonic-softening powers. `Rewind + Vines` produced two near-duplicate contact rollbacks. Names vary substantially more reliably than core mechanics.

Observed roll distribution supports that finding: strategies were `failure-mode` 7 times, `emission-bridge` 5, `dominant-a` 2, `dominant-b` 2, `synergy` 2, `byproduct` 1, and `range-meet` 1; no `facet-anchor`, `body-weave`, or `oscillation` result occurred. Output type variety was acceptable (`Emitter` 8, `Mutant` 8, `Transformation` 4), but type variation sometimes changed anatomy without creating a better conceptual variant.

Strongest patterns:

- Naming is generally memorable and MHA-toned, especially `Irony`, `Now You See Spore`, `Root Cause`, `Pocket Rocket`, and `Shoutpaste`.
- Several fusions use one readable causal loop: emitted spores hide surfaces, voice softens matter, thorn hair patches wounds, metal flakes are guided.
- Non-combat utility can emerge when the output roll and parent logic align.

Weakest patterns:

- Similar mechanics repeat within a pair while superficial anatomy or name registers change.
- `failure-mode` often adds explanatory limitation clauses instead of generating a genuinely different, simpler Quirk.
- Generic drawbacks recur: fatigue, dizziness, cooldown, throat strain, and reduced range.
- Forced facets can create extra machinery: psychic fungal hallucinations, padded vocal limbs, or defense armor on a concealment concept.

## 6. Mechanical sense analysis

The strongest mechanics arise when both parent traits collapse into one action: spores scatter light, vocal output softens solids, vine contact repairs a recent wound, or controllable metal flakes move at range. These are understandable after one reading and invite applications without spelling out tactics.

The weakest outputs either drift from a source or escalate beyond a clear core. `Marble Dash` changes object compression into compressed space. `Memory Hair` adds recording, sensing, area delivery, and biological rollback in one package, becoming both unclear and overpowered. `Soft Shout` acquires padded limbs only to satisfy an anatomy facet. `Cast Off` sheds steel plates but never clearly uses telekinetic control.

Balance is mostly reasonable because outputs frequently include scope limits, touch requirements, or fatigue. However, the system should not treat a listed drawback as sufficient balance when the base effect is too broad: area biological rollback remains excessive even when tiring.

## 7. Simplicity analysis

Only 4 of 20 descriptions complied with the configured 280-character maximum. The descriptions ranged from 233 to 412 characters. This directly depresses readability: many otherwise sound premises acquire activation detail, multiple limitations, type justification, and repeated range statements.

The current compactness request is a soft prompt instruction only. `validateEnglishFusionPayload` intentionally never rejects text for length or wording, so overlong results pass unchanged. The system is now asking for compact entries, but it does not enforce the quality that the test is evaluating.

The best short result, `Shoutpaste`, demonstrates the target form: output, effect, and one cost. By contrast, `Tiny Fungus That Lies To Your Eyes` spends text explaining contact, sprouting delay, two perception effects, unavailable full mushrooms, unavailable true invisibility, and dizziness.

## 8. Anime tone and fun analysis

The naming system is currently the strongest part of generation. Blunt, punny, and deliberately long titles prevent most results from falling into fantasy-RPG naming; only a few long names feel merely literal. Most powers could plausibly appear in an MHA-style classroom or side-character encounter.

Fun falls when a good visual hook is replaced by clinical rules or repeated combat framing. `Shoutpaste`, `Now You See Spore`, `Irony`, and the shallow wound-patching thorn hair feel playful and usable. Memory-recording area rewind and abstract space-compression nodes feel more like system-designed abilities than character powers.

## 9. Prompt and strategy improvement analysis

The current prompt is moving toward the right target by specifying one core mechanism, two or three sentences, direct verbs, and optional simple drawbacks. The generated evidence shows the following remaining causes of quality loss:

1. Length is unenforced. `FUSION_DESCRIPTION_MAX_LENGTH` is 280, but validation explicitly accepts any nonempty description.
2. The benchmark records a `utilityNiche`, but `buildFusionPrompt` no longer inserts `selectFusionUtilityNudge(...).line`; the selected simplicity/utility nudge has no effect on generation.
3. The utility selector itself now describes wording discipline rather than outcome roles. It cannot induce supportive, sensory, mobility, environmental, odd, or low-powered varieties.
4. Strategy weighting allows concentration: 12 of 20 results landed in `failure-mode` or `emission-bridge`. This repeatedly encourages weak/capped clauses or projected outputs.
5. Random output facets may be technically compatible with a type but poorly aligned with the actual parent pair, forcing unnecessary mechanics to satisfy the rolled label.
6. "Invent a third mechanism" can cause drift when a clean single consequence of both sources would be better.

How the generation prompt can improve:

- Replace the unused nudge with one injected variant intent per result: `simple direct`, `utility/support`, `movement/sensory/environmental`, or `odd limitation`. Ask it to shape the core function, not add tactics.
- State: "A direct, narrow inheritance is preferred over a new subsystem. Do not invent physics, hallucination, recording, armor, or projectiles unless required by the parent traits and selected intent."
- Request at most two sentences and one optional limit; forbid explaining what parent powers the result lacks.
- Ask for one visible manifestation only when it clarifies the function.

How the fusion strategy can be simplified:

- Plan four variants per pair deliberately rather than drawing four independent weighted strategies: one straightforward hybrid, one non-combat/utility interpretation, one changed delivery form, and one narrower or strange limitation.
- Limit `failure-mode` to at most one result per pair and `emission-bridge` to at most one unless a parent is inherently projection-only.
- Select type/range/facets after the variant intent, or reject rolls that require unrelated secondary features.
- Require an explicit parent-trait check: one short phrase proving each source contributes to the same main action.

What should be removed, reduced, rewritten, or constrained:

- Remove or rewrite the unconditional "third mechanism" instruction.
- Remove duplicated limitation language in `failure-mode`; a cap should be one clause, not a justification paragraph.
- Reduce generic fatigue/cooldown defaults; allow a Quirk to be limited simply by reach, contact, duration, or output material.
- Constrain overbroad biological rollback, terrain-wide alteration, and generic guided projectile defaults unless selected as the single central premise.
- Enforce description length in validation with one retry or truncate/regenerate rather than accepting overlong entries.

## 10. Final recommendations

1. Wire a real, role-oriented variant intent into `buildFusionPrompt` and ensure four siblings for a pair receive different intents.
2. Enforce the description character cap; target 140-240 characters and reject results above 280.
3. Cap repeated strategies per parent pair and rebalance away from repeated `failure-mode` and projected-output results.
4. Make type/facet rolls subordinate to parent compatibility and intended function, not a reason to invent extra anatomy or effects.
5. Prefer a single vivid verb and visible hook over technical explanations, explicit tactical use cases, or stacked drawback chains.
6. Retest with the same five pairs after prompt changes and compare duplicate-mechanic rate, length compliance, support/utility representation, and average simplicity/readability scores.
