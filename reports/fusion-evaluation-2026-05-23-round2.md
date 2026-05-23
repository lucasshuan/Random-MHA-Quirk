# Fusion Generation Evaluation - 2026-05-23 - Fresh Sample 2

## 1. Test setup

The requested procedure conflicts with its later required output structure: it first asks for 4 pairs x 3 results (12 fusions), then requires 5 pairs x 4 fusions. This evaluation follows the larger final structure: 5 new pairs x 4 variants = 20 generated fusions.

`ARCHITECTURE.md` and `CONTEXT.md`, which were requested as prerequisite project guidance, are not present at the supplied repository root or in the scanned workspace.

Method: each English result was generated live through the current benchmark-equivalent path: catalog lookup, deterministic output roll, strategy and name-register selection, prior-variant lookup, `buildFusionPrompt`, configured LLM generation, and `validateEnglishFusionPayload`. Seeds were `eval2-s1`, `eval2-s2`, `eval2-s3`, and `eval2-s4`. None of these pairings appears in the committed evaluation reports or benchmark fixtures. Raw results were retained outside the repository in `C:\Users\Jean\AppData\Local\Temp\fusion-evaluation-2026-05-23-round2.json`.

Selected pairs:

1. Bubble + Danger Sense
2. Comic + Weld
3. Tail + Air Walk
4. Clean Bubbler + Somnambulist
5. Blood Control + Papyrus

## 2. Generated fusions and evaluations

### Pair 1: Bubble + Danger Sense

Source premise: aroma-filled bubbles combined with surrounding-threat awareness.

#### Fusion 1

Name: Tiny Floating Warning Scent Bubbles  
Description summary: Permanent sac glands release scented bubbles that drift toward threats and mark their direction and intensity.  
Length: 332 characters.

Grades:
- Naming: 7
- Creativity: 8
- Balance: 8
- Mechanical sense: 8
- Simplicity: 6
- Anime tone: 8
- Fun factor: 8
- Source Quirk integration: 9
- Practical readability: 6
- User creativity space: 7

Analysis: Both parents are immediately legible, and the threat-marking bubble is a sensible sensory Quirk. The bubbles "latching" onto threats and then amplifying warnings adds process detail beyond the useful core, and the description misses the requested maximum length.

#### Fusion 2

Name: Bubble Sense  
Description summary: Long-range remembered-scent bubbles home toward anomalies, reveal threats, and steady nearby allies when they burst.  
Length: 318 characters.

Grades:
- Naming: 5
- Creativity: 6
- Balance: 6
- Mechanical sense: 5
- Simplicity: 4
- Anime tone: 6
- Fun factor: 6
- Source Quirk integration: 7
- Practical readability: 5
- User creativity space: 5

Analysis: Scent bubbles and alerts inherit the parents, but "anomalies" is vague and ally calming is an unearned second benefit. The result turns a clean warning mechanic into a targeting and support field with more claims than it needs.

#### Fusion 3

Name: Scentinel  
Description summary: Touch-planted scented bubbles pop to give the user short-lived directional danger alerts nearby.  
Length: 279 characters.

Grades:
- Naming: 8
- Creativity: 7
- Balance: 8
- Mechanical sense: 8
- Simplicity: 8
- Anime tone: 8
- Fun factor: 7
- Source Quirk integration: 9
- Practical readability: 8
- User creativity space: 8

Analysis: This is a credible modest fusion: bubbles are the trigger and danger direction is the sole result. Its contact scope is a natural limitation, and it leaves users to invent uses without listing tactics.

#### Fusion 4

Name: Pop Goes the Sixth Sense  
Description summary: Exhaled micro-bubbles burst at short range as localized danger-direction pings.  
Length: 285 characters.

Grades:
- Naming: 8
- Creativity: 7
- Balance: 8
- Mechanical sense: 8
- Simplicity: 7
- Anime tone: 8
- Fun factor: 7
- Source Quirk integration: 8
- Practical readability: 7
- User creativity space: 8

Analysis: The title is memorable and the short-range alarm reads easily. It is mechanically close to Scentinel, with range and activation changed rather than a substantially different interpretation.

Pair-level analysis:
- Intra-pair diversity: 4/10. All four entries are scented warning bubbles; output range changes, but role and core manifestation barely do.
- Best fusion: Scentinel.
- Weakest fusion: Bubble Sense.
- Repeated patterns: Threat-seeking or warning bubbles; localized alerts; variants expressed mainly as range restrictions.
- What should improve: Explore a protective bubble that bursts only on danger, a false-alarm drawback, a tracking residue, or a non-combat navigation use instead of four versions of the same alarm.

### Pair 2: Comic + Weld

Source premise: spoken physical onomatopoeia combined with touch-based bonding of matter.

#### Fusion 1

Name: Talk the Walk  
Description summary: Body glyph pads launch spoken letters that fuse to objects as grips or tethers for movement.  
Length: 449 characters.

Grades:
- Naming: 8
- Creativity: 8
- Balance: 5
- Mechanical sense: 4
- Simplicity: 2
- Anime tone: 7
- Fun factor: 7
- Source Quirk integration: 8
- Practical readability: 3
- User creativity space: 4

Analysis: The image is lively and both parents are visible, but the description says bonds permanently fuse and then dissolve after roughly ten seconds. Speech pads, projectiles, welding, extra limbs, tethers, mobility, and timed dissolution form an ability kit rather than one readable Quirk.

#### Fusion 2

Name: Soundpaste  
Description summary: Spoken giant glyphs fly outward and weld surfaces together along the letters' strokes.  
Length: 259 characters.

Grades:
- Naming: 9
- Creativity: 8
- Balance: 8
- Mechanical sense: 9
- Simplicity: 9
- Anime tone: 9
- Fun factor: 9
- Source Quirk integration: 9
- Practical readability: 9
- User creativity space: 9

Analysis: This is the strongest example in the sample. It converts the two sources into one vivid rule with clear limits implicit in trajectory and contact, and it does not tell the user what to do with it.

#### Fusion 3

Name: Echo Seal  
Description summary: Spoken sound-letters travel across an area and bind materials wherever each glyph lands.  
Length: 274 characters.

Grades:
- Naming: 6
- Creativity: 7
- Balance: 6
- Mechanical sense: 6
- Simplicity: 7
- Anime tone: 7
- Fun factor: 7
- Source Quirk integration: 8
- Practical readability: 7
- User creativity space: 7

Analysis: It is readable, but substantially duplicates Soundpaste. The phrase "according to the sound's meaning" creates an undefined effect scope: it either means nothing or permits new sound-based powers beyond welding.

#### Fusion 4

Name: Word Glue  
Description summary: Animal-like adhesive pads produce brittle sound-letter decals that fasten modest objects together.  
Length: 346 characters.

Grades:
- Naming: 7
- Creativity: 6
- Balance: 7
- Mechanical sense: 5
- Simplicity: 6
- Anime tone: 6
- Fun factor: 6
- Source Quirk integration: 7
- Practical readability: 6
- User creativity space: 6

Analysis: The weak fastening version is balanced, but permanent animal pads and a tail are not meaningfully motivated by either source. The forced Mutant/Anthropomorphic output specification visibly bends the fusion away from its parents.

Pair-level analysis:
- Intra-pair diversity: 4/10. Three variants are launched adhesive writing with small wording differences; the mobility entry differs by becoming overbuilt and internally contradictory.
- Best fusion: Soundpaste.
- Weakest fusion: Talk the Walk.
- Repeated patterns: Projected glyphs, surface bonding, launched decals; limited change in function.
- What should improve: Preserve Soundpaste-level clarity while reserving sibling slots for a touch-only stamp, a temporary repair/fastening utility, or a harmless comic nuisance instead of adding anatomy and movement subsystems.

### Pair 3: Tail + Air Walk

Source premise: a strong prehensile tail combined with standing on or steering air pockets.

#### Fusion 1

Name: Zephyr Lash  
Description summary: A compressed-air tail forms at the lower back and functions as a touch-only grasping or bracing limb.  
Length: 309 characters.

Grades:
- Naming: 8
- Creativity: 7
- Balance: 8
- Mechanical sense: 7
- Simplicity: 7
- Anime tone: 8
- Fun factor: 8
- Source Quirk integration: 6
- Practical readability: 7
- User creativity space: 8

Analysis: A tangible air tail is easy to picture and balanced, but Air Walk's defining mobility logic is reduced to compressed-air material. It is a coherent third idea, although a weaker inheritance test than the better variants.

#### Fusion 2

Name: Back Breeze  
Description summary: A short air-tail knocks back impacts, briefly shields the user, or produces a small hop.  
Length: 267 characters.

Grades:
- Naming: 7
- Creativity: 6
- Balance: 8
- Mechanical sense: 7
- Simplicity: 8
- Anime tone: 7
- Fun factor: 7
- Source Quirk integration: 6
- Practical readability: 8
- User creativity space: 8

Analysis: This weak, practical version is clean enough and avoids flight escalation. Tail is mostly represented by shape rather than prehensile behavior, and the shield plus hop split attention slightly.

#### Fusion 3

Name: Catch a Breeze  
Description summary: A permanent fan-like prehensile tail catches existing air currents for short glides and levitation bursts.  
Length: 287 characters.

Grades:
- Naming: 8
- Creativity: 8
- Balance: 8
- Mechanical sense: 8
- Simplicity: 7
- Anime tone: 8
- Fun factor: 9
- Source Quirk integration: 9
- Practical readability: 7
- User creativity space: 9

Analysis: This integrates the parents through one mobility function and has natural balance because it needs existing currents. Whisker-based airflow sensing is an avoidable add-on apparently driven by the required Sensory facet.

#### Fusion 4

Name: My Tail Floats Where I Point  
Description summary: An aero-membrane tail shapes a distant air column that pushes, pulls, or buoys objects.  
Length: 298 characters.

Grades:
- Naming: 6
- Creativity: 6
- Balance: 7
- Mechanical sense: 6
- Simplicity: 7
- Anime tone: 7
- Fun factor: 6
- Source Quirk integration: 6
- Practical readability: 7
- User creativity space: 7

Analysis: It is understandable, but the ability becomes remote air manipulation instead of standing on air, and the long literal name has little comic payoff. It reads as a generic air-control variant wearing a tail visual.

Pair-level analysis:
- Intra-pair diversity: 7/10. The entries include a contact limb, a defensive hop, a wind-surfing mobility body, and remote buoyancy, although every version remains tail-shaped airflow.
- Best fusion: Catch a Breeze.
- Weakest fusion: My Tail Floats Where I Point.
- Repeated patterns: Air-tail manifestation and failure-mode weakening in three of four variants.
- What should improve: Keep the successful body/mobility direction, but avoid replacing Air Walk with generic gust control or adding Sensory anatomy solely to satisfy a rolled facet.

### Pair 4: Clean Bubbler + Somnambulist

Source premise: powerful controllable soapy water combined with skin-released sleeping aroma.

#### Fusion 1

Name: Bubble Trouble  
Description summary: Long-range scented foam bubbles clean and cushion targets while their vapor makes enclosed people drowsy.  
Length: 249 characters.

Grades:
- Naming: 7
- Creativity: 6
- Balance: 6
- Mechanical sense: 6
- Simplicity: 6
- Anime tone: 7
- Fun factor: 7
- Source Quirk integration: 8
- Practical readability: 7
- User creativity space: 6

Analysis: Soapy sleep bubbles are an intuitive merger, but cushioning, cleaning, wound soothing, protection, and sedation stack several utilities. It would improve by retaining only transport/cushioning or only cleaning plus drowsiness.

#### Fusion 2

Name: Bubble Nap  
Description summary: The user's body turns into buoyant scented foam that carries a touched person while making them drowsy.  
Length: 311 characters.

Grades:
- Naming: 7
- Creativity: 8
- Balance: 7
- Mechanical sense: 7
- Simplicity: 6
- Anime tone: 8
- Fun factor: 8
- Source Quirk integration: 8
- Practical readability: 6
- User creativity space: 7

Analysis: The transformation is strange in a suitable anime way and gives this pair a mobility/rescue interpretation. Transforming the entire user into soap is more of a leap from Clean Bubbler than emitting foam, but the mechanism stays graspable.

#### Fusion 3

Name: Dreamfoam  
Description summary: Spongy skin produces animal-shaped foam constructs that cling to targets and cause drowsiness on contact.  
Length: 283 characters.

Grades:
- Naming: 8
- Creativity: 6
- Balance: 7
- Mechanical sense: 6
- Simplicity: 5
- Anime tone: 7
- Fun factor: 6
- Source Quirk integration: 7
- Practical readability: 6
- User creativity space: 6

Analysis: The direct-contact sedation limit is sensible, but animal-shaped constructs and "smother" language add an arbitrary and unnecessarily harsh identity. This is another case where rolled facets make a simple foam power more elaborate.

#### Fusion 4

Name: Bubble Nap  
Description summary: Warm soapy film cleans surfaces, seals wounds, dulls pain, and inconsistently causes mild drowsiness.  
Length: 359 characters.

Grades:
- Naming: 3
- Creativity: 5
- Balance: 7
- Mechanical sense: 5
- Simplicity: 3
- Anime tone: 5
- Fun factor: 5
- Source Quirk integration: 5
- Practical readability: 4
- User creativity space: 4

Analysis: It duplicates Fusion 2's name and largely suppresses Somnambulist in favor of unsupported first aid abilities. The weakness of sedation does not compensate for adding healing, pain reduction, cleaning, film formation, and bubbles in one entry.

Pair-level analysis:
- Intra-pair diversity: 6/10. The outputs span protection, mobility, containment, and first aid, but all rely on scented sleep foam and one of the distinct roles is achieved through unsupported extra benefits.
- Best fusion: Bubble Nap (Fusion 2).
- Weakest fusion: Bubble Nap (Fusion 4).
- Repeated patterns: Foam coating, drowsiness, support inflation, and duplicate naming.
- What should improve: Deduplicate sibling names and forbid recovery or analgesia unless a source actually provides it; cleaning, buoyancy, and sedation already give enough design space.

### Pair 5: Blood Control + Papyrus

Source premise: directed and hardened expelled blood combined with a flat, foldable paper-like body.

#### Fusion 1

Name: Flat Veins  
Description summary: A permanent paper-flat body unfurls ribboned blood into flexible sheets for binding, bridging, or slipping through gaps.  
Length: 265 characters.

Grades:
- Naming: 8
- Creativity: 8
- Balance: 8
- Mechanical sense: 8
- Simplicity: 8
- Anime tone: 8
- Fun factor: 8
- Source Quirk integration: 9
- Practical readability: 8
- User creativity space: 9

Analysis: This is visually distinctive, inherits both sources, and stays controlled by making sheets flexible rather than rigid. The uses are illustrative rather than an exhaustive tactic list.

#### Fusion 2

Name: Red Tape  
Description summary: Coagulated paper-thin blood sheets fold, steer, and harden into bindings or brief shields.  
Length: 281 characters.

Grades:
- Naming: 10
- Creativity: 8
- Balance: 8
- Mechanical sense: 9
- Simplicity: 8
- Anime tone: 9
- Fun factor: 9
- Source Quirk integration: 9
- Practical readability: 8
- User creativity space: 9

Analysis: The pun is excellent and the paper-blood rule is immediately useful without being inflated. It barely exceeds the length ceiling and could lose the generic dizziness clause without losing balance.

#### Fusion 3

Name: Paper-Thin Blood Marionette Act  
Description summary: A paper-flat body shapes blood ribbons into humanoid puppets that also transmit remote sensing.  
Length: 362 characters.

Grades:
- Naming: 6
- Creativity: 7
- Balance: 6
- Mechanical sense: 6
- Simplicity: 4
- Anime tone: 7
- Fun factor: 7
- Source Quirk integration: 7
- Practical readability: 4
- User creativity space: 5

Analysis: Blood ribbons and flat anatomy are faithful, but humanoid puppets plus remote vision/pressure sensing is an unnecessary new subsystem. It demonstrates the generator expanding a sound visual core into a detailed ability loadout.

#### Fusion 4

Name: Crimson Banner  
Description summary: Expelled flat blood ribbons steer, fold, stiffen, and relax at range for binding or bridging.  
Length: 240 characters.

Grades:
- Naming: 8
- Creativity: 7
- Balance: 8
- Mechanical sense: 8
- Simplicity: 9
- Anime tone: 8
- Fun factor: 8
- Source Quirk integration: 7
- Practical readability: 9
- User creativity space: 9

Analysis: This is concise and mechanically clean. Papyrus contributes the sheet/ribbon form rather than its defining user-body transformation, so the integration is less complete than Flat Veins or Red Tape.

Pair-level analysis:
- Intra-pair diversity: 5/10. Three outputs are controlled blood ribbons or sheets; the puppet version differs mostly by adding complexity rather than changing the interpretation.
- Best fusion: Red Tape.
- Weakest fusion: Paper-Thin Blood Marionette Act.
- Repeated patterns: Foldable blood material, binding, generic dizziness from blood loss.
- What should improve: Reserve one sibling for flat-body mobility or rescue utility and one for disposable seals/patches instead of repeating ribbon control with escalating extras.

## 3. Summary table

Overall is the mean of the ten per-fusion grades above.

| Pair | Fusion name | One-line description summary | Overall |
| --- | --- | --- | ---: |
| Bubble + Danger Sense | Tiny Floating Warning Scent Bubbles | Threat-marking aroma bubbles from permanent glands. | 7.5 |
| Bubble + Danger Sense | Bubble Sense | Long-range alert bubbles with an added steadying field. | 5.5 |
| Bubble + Danger Sense | Scentinel | Touch-planted bubbles provide local danger direction. | 7.9 |
| Bubble + Danger Sense | Pop Goes the Sixth Sense | Short-range bursting danger pings. | 7.6 |
| Comic + Weld | Talk the Walk | Welded spoken glyph tethers used for movement. | 5.6 |
| Comic + Weld | Soundpaste | Spoken glyphs weld surfaces along their strokes. | 8.8 |
| Comic + Weld | Echo Seal | Wide-area glyphs bond landed surfaces. | 6.8 |
| Comic + Weld | Word Glue | Brittle adhesive letter decals fasten objects. | 6.2 |
| Tail + Air Walk | Zephyr Lash | A touch-only compressed-air prehensile tail. | 7.4 |
| Tail + Air Walk | Back Breeze | A small defensive air-tail with a hopping burst. | 7.2 |
| Tail + Air Walk | Catch a Breeze | A fan tail rides existing air currents. | 8.1 |
| Tail + Air Walk | My Tail Floats Where I Point | A tail shapes a remote buoyant air column. | 6.5 |
| Clean Bubbler + Somnambulist | Bubble Trouble | Cleaning/cushioning foam bubbles release sleep vapor. | 6.6 |
| Clean Bubbler + Somnambulist | Bubble Nap | Buoyant foam body carries and drowses touched targets. | 7.2 |
| Clean Bubbler + Somnambulist | Dreamfoam | Contact sleep foam appears as clinging constructs. | 6.4 |
| Clean Bubbler + Somnambulist | Bubble Nap | Weak sedative soap film adds first-aid effects. | 4.6 |
| Blood Control + Papyrus | Flat Veins | Paper-flat body spreads flexible blood sheets. | 8.2 |
| Blood Control + Papyrus | Red Tape | Foldable blood-paper strips bind or shield. | 8.7 |
| Blood Control + Papyrus | Paper-Thin Blood Marionette Act | Blood-sheet puppets add remote sensing. | 5.9 |
| Blood Control + Papyrus | Crimson Banner | Long steered blood ribbons stiffen or relax. | 8.1 |

## 4. Average scores

The first ten averages are calculated across all 20 fusions. Intra-pair diversity is the mean of the five pair evaluations. Inter-pair diversity is one comparative set-level grade.

| Dimension | Average / 10 |
| --- | ---: |
| Naming | 7.20 |
| Creativity | 6.95 |
| Intra-pair diversity | 5.20 |
| Inter-pair diversity | 8.00 |
| Balance | 7.20 |
| Mechanical sense | 6.80 |
| Simplicity | 6.35 |
| Anime tone | 7.40 |
| Fun factor | 7.25 |
| Source Quirk integration | 7.60 |
| Practical readability | 6.60 |
| User creativity space | 7.05 |

Aggregate across the twelve reported dimensions: **6.97/10**.

## 5. Diversity analysis

### Intra-pair diversity

The system produces different metadata more reliably than different core fantasies. Bubble + Danger Sense remains warning bubbles in all four outputs. Comic + Weld remains projected bonding glyphs in three outputs and becomes an overloaded tether version in the fourth. Blood Control + Papyrus remains blood sheets/ribbons except when it adds puppets and sensing.

Tail + Air Walk is the best sibling set because it reaches contact utility, defense, mobility, and remote object buoyancy, even though it still uses the same air-tail visual. Clean Bubbler + Somnambulist changes role more often, but one change is unsupported healing inflation rather than a cleaner interpretation of the sources.

Strategy selection contributed directly to convergence:

| Selected strategy | Count |
| --- | ---: |
| failure-mode | 9 |
| synergy | 8 |
| emission-bridge | 3 |
| All seven other strategies | 0 |

No generated sibling had a prior variant supplied to the prompt. As tested, the prior-variant mechanism did not prevent repeated names or concepts: `Bubble Nap` occurred twice in the same pair.

### Inter-pair diversity

Inter-pair diversity is good. The five source pairs yield clearly different visual identities: scent alarms, talking glyph welds, air tails, sleep foam, and folding blood sheets. The sample does not collapse into explosions, smoke, armor, energy waves, or generic terrain control.

The recurrent cross-pair pattern is instead an emitted or extended material that coats, sticks, binds, or marks a target. This is not fatal, but it narrows the feeling of what a fusion can be. Sensory-only, passive mutant, social, traversal, harmless nuisance, and pure utility outcomes remain underrepresented.

## 6. Mechanical sense analysis

Strongest patterns:

- One carrier plus one behavior works: scent bubble warning in `Scentinel`, welded speech glyphs in `Soundpaste`, current-riding tail in `Catch a Breeze`, and foldable blood material in `Red Tape`.
- Natural physical scope often supplies adequate balance: contact placement, needing air currents, expelled blood, or a glyph having to land.
- The best entries have clear source inheritance without restating every parent ability.

Weakest patterns:

- Rolled facets add mechanics not supported by the parents: ally calming in `Bubble Sense`, animal anatomy in `Word Glue`, whisker sensing in `Catch a Breeze`, and first-aid functions in the second `Bubble Nap`.
- Added subsystems harm sense and balance: puppet-based remote sensing in `Paper-Thin Blood Marionette Act`.
- At least one description contradicts itself: `Talk the Walk` makes bonds permanent and also says they dissolve after ten seconds.

The system is not generally overpowered in this sample. Its more common mechanical failure is feature inflation: a balanced central rule receives an extra support, sensory, movement, or recovery effect to satisfy rolled metadata or make the text feel complete.

## 7. Simplicity analysis

The prompt asks for 2-3 short sentences, a maximum of 280 characters, and usually 160-260 characters. Actual results:

| Pair | Average description length | Over 280 characters |
| --- | ---: | ---: |
| Bubble + Danger Sense | 303.5 | 3/4 |
| Comic + Weld | 332.0 | 2/4 |
| Tail + Air Walk | 290.3 | 3/4 |
| Clean Bubbler + Somnambulist | 300.5 | 3/4 |
| Blood Control + Papyrus | 287.0 | 2/4 |
| All results | 302.65 | 13/20 |

Only 3/20 results fall in the preferred 160-260 character band. The most readable fusions (`Soundpaste`, `Crimson Banner`, `Scentinel`) are those with one causal sentence pair and no unnecessary body tells or generic drawback chain.

Descriptions become too complex when they attempt to prove every metadata facet in prose. Detail to reduce includes extra activation organs, timed dissolution, target-calming fields, animal-shaped foam, remote sensing, pain reduction, and repeated dizziness clauses. A concise Quirk premise should not be expanded into a technique list.

## 8. Anime tone and fun analysis

The sample is often anime-appropriate and playful. `Scentinel`, `Soundpaste`, `Catch a Breeze`, `Flat Veins`, and especially `Red Tape` are memorable and easy to imagine on a character card. Simple powers are among the most fun here because their applications are open-ended.

Name quality is uneven. The long-title register can work, but `Tiny Floating Warning Scent Bubbles`, `My Tail Floats Where I Point`, and `Paper-Thin Blood Marionette Act` describe mechanics more than they land a joke. Duplicate `Bubble Nap` is a preventable failure. Dramatic or highly literal names should not be forced when a blunt or punny title is already stronger.

## 9. Prompt and strategy improvement analysis

Problems visible in the current implementation:

1. The length instruction is not enforced. `src/server/fusion/prompts/english.ts` requests a maximum description length, while `src/server/fusion/validate.ts` explicitly says it never rejects for length or wording. The 13/20 over-limit rate is therefore unsurprising.
2. A simplicity niche is selected but does not guide generation. `src/server/fusion/prompts/roll-context.ts` stores `utilityNiche`, and `src/server/fusion/prompts/utility.ts` provides a usable instruction line, but `buildFusionPrompt` never inserts that line.
3. Sibling diversity is accidental. `src/server/fusion/prompts/strategy.ts` picks a weighted strategy independently by seed; it does not assign distinct intents for four outputs from the same parents. This sample used only three strategy types, with 17/20 results in `synergy` or `failure-mode`.
4. Forced type/facet contracts can override source logic. `src/server/fusion/prompts/facet-contract.ts` tells the model to show recovery for `Support`, animal-like traits for `Anthropomorphic`, and sensing for `Sensory`, even where those additions are not natural consequences of the parents.
5. Prior-variant avoidance is too narrow for this use case. All 20 prompts received zero prior variants, and the generated set still duplicated both core concepts and one name within a pair.
6. The prompt repeats compactness, single-mechanism, and limitation guidance across many bullets. More words in the instruction did not yield shorter entries; it may encourage the model to demonstrate compliance through extra clauses.

How the generation prompt can improve:

- Require one sentence for the core effect and optionally one short limit sentence; set a hard 240- or 260-character ceiling for normal entries.
- State that a rolled facet must be represented only if it follows directly from the source mechanism; it must never invent healing, calming, sensing, or anatomy merely to tick a tag.
- Explicitly prohibit adding a benefit not found in either parent unless it is the single core transformation of the fusion.
- Replace multiple repeated warning bullets with one compact rule: one mechanism, no tactical examples, no extra subsystem, at most one inherent limit.
- Supply sibling summaries in every multi-variant generation request and require a different manifestation or role, not merely a different range.

How the fusion strategy can be simplified:

- Generate sibling variants as a coordinated set rather than four independent rolls. Assign four distinct lanes, for example: straightforward core, non-combat utility/support, unusual manifestation or mobility/sensory, and weaker/narrow or awkward version.
- Select strategy lanes without replacement per parent pair. Do not allow `failure-mode` to occupy three of four sibling slots.
- Make output type and facets consequences of the chosen core idea, or constrain random facets to parent-supported facets unless a deliberate unusual lane allows one bridge trait.
- Use conceptual deduplication before accepting a sibling: reject same-name results and reject a description with the same carrier plus same action as an existing sibling.

What should be removed, reduced, rewritten, or constrained:

- Remove unenforced `utilityNiche` metadata or actually inject its instruction into the prompt.
- Reduce the weight/frequency of `failure-mode`; weakness should be an occasional interpretation, not the dominant sibling differentiator.
- Constrain `Support` so it does not imply healing, pain dulling, or ally buffs without parent support.
- Constrain `Anthropomorphic` and `Sensory` so they cannot bolt animal parts or remote perception onto unrelated sources.
- Remove generic dizziness/cooldown text when output material, contact, range, or resource expenditure already balances the Quirk.
- Reject duplicate names for a parent pair before accepting generated output.

## 10. Final recommendations

1. Enforce description length in validation and retry with a compact rewrite when the LLM exceeds it.
2. Replace independent sibling generation with four explicitly distinct variant intents and pass accepted sibling summaries into each next prompt.
3. Make the selected simplicity/utility instruction effective in `buildFusionPrompt`, or delete it as misleading metadata.
4. Restrict randomly selected facets to effects causally supported by the source pair; do not force unrelated healing, sensing, or anatomy.
5. Add duplicate-name and conceptual-similarity checks per parent pair.
6. Shorten the prompt around a single hard rule: one core function, at most one direct extension, optional one natural limitation.
7. Retest these same five pairs after changes and compare description-length compliance, duplicate-core rate, distinct role coverage, and the simplicity/readability averages.

Final verdict: the current system can produce highly enjoyable and mechanically clean fusions, particularly when it commits to one physical or sensory rule. It produces good inter-pair variety, but sibling variety is weak and prose complexity remains a consistent quality problem. The most valuable next work is not adding more generation complexity; it is enforcing brevity, coordinating variant intents, and preventing forced metadata from inventing unnecessary mechanics.
