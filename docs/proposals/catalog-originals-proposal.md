# ORIGINAL catalog proposal (review before seed)

**Status:** Seeded to Supabase (EN only). Canonical row data: [`tools/catalog/data/originals.json`](../tools/catalog/data/originals.json). Run `pnpm quirks:seed-originals` after edits.

**Canon copy style:** ~130–180 characters; starts with *Allows/Lets/Generates/Stops…*; states effect, scope, and main limit in the same paragraph (see `tools/catalog/output/copy/en.ts`, avg ~139 chars).

**Catalog tier scale:** `S` | `A` | `B` | `C` only (DB constraint). Fan-research tiers **X/F** were redesigned or dropped before mapping here.

---

## Summary table

| id | name | tier | type | range | Notes |
|----|------|------|------|-------|--------|
| `gorgon` | Gorgon | **A** | Emitter | Long | Was X; harder on larger mass, not a hard size ban |
| `sound-wave` | Sound Wave | **A** | Emitter | Medium | Unchanged design |
| `fairy-dust` | Fairy Dust | **C** | Mutant | Medium | Support / light mobility |
| `memory-projector` | Memory Projector | **C** | Emitter | Contact | Clearer hologram-memory wording |
| `playback` | Playback | **A** | Emitter | Contact | Touch rewind; empathic/sensory backlash |
| `water` | Water | **A** | Emitter | Medium | Generate/control only; hydration recall drawback |
| `ctrl` | Ctrl | **B** | Emitter | Medium | 10 m; non-living C/V/Z undo |
| `future-scenario` | Future Scenario | **A** | Emitter | Self | Mirror futures; 5 min jump; stamina |
| `cosmos` | Cosmos | **S** | Emitter | Medium | Star-forging-grade matter; ceiling in text, not tactics |
| `marker` | Marker | **A** | Transformation | Contact | Drawings become real |
| `tracker` | Tracker | **C** | Emitter | Long | One person's path trail |
| `animate` | Animate | **A** | Emitter | Contact | Sentient objects; ends when user sleeps |

**Excluded from your review:** Phobia, Labyrinth, Butterfly Effect, Red Dead of Night, Incognito, Fear Shifter.

---

## Per-quirk records (English + metadata)

### `gorgon` — Gorgon

| Field | Value |
|-------|--------|
| **tier** | A |
| **type** | Emitter |
| **range** | Long |
| **facets** | `Control` |
| **source** | https://www.deviantart.com/denebu-kise/art/Michihiko-Mebori-My-Hero-Academia-OC-profile-834881367 |
| **inspiration** | Fan OC Michihiko Mebori (All-Eyes/Gorgon); redesigned—no body-eye mutation, progressive hold by mass. |
| **tier note** | Down from fan **X**: stops motion on anything in sight, but hold weakens as target mass grows (strain / shorter hold), plus blink to release. No multi-eye body mutation. |

**description (EN):**

> Stops the motion of anything in the user's line of sight until they blink or release focus. Larger targets demand more strain and slip free sooner than smaller ones.

---

### `sound-wave` — Sound Wave

| Field | Value |
|-------|--------|
| **tier** | A |
| **type** | Emitter |
| **range** | Medium |
| **facets** | `Emission`, `Sensory` |
| **source** | https://www.deviantart.com/orionmaxell17/art/BNHA-OC-Hibiki-Albrecht-859486558 |
| **inspiration** | Fan OC Hibiki Albrecht (Queen of Sound / Duchess Wave). |
| **tier note** | High ceiling; needs to perceive waves; noise/hearing strain. Not instant-win vs war cast. |

**description (EN):**

> Allows the user to perceive and control sound waves, altering pitch, volume, speed, and direction. They can mimic voices, mute nearby hearing, or strike with focused bursts. Must detect the sound; heavy noise and hearing strain are drawbacks.

---

### `fairy-dust` — Fairy Dust

| Field | Value |
|-------|--------|
| **tier** | C |
| **type** | Mutant |
| **range** | Medium |
| **facets** | `Emission`, `Mobility` |
| **source** | https://www.deviantart.com/aaliyahgacha2008/art/Norika-Yosei-MHA-OC-1165138109 |
| **inspiration** | Fan OC Norika Yosei. |
| **tier note** | Support / rescue; weak direct combat tier. |

**description (EN):**

> Generates glowing dust the user moves by telekinesis to lift small loads, trace paths, or scatter light. The mutation adds faint wings and short flight. Too light for serious direct combat but useful for support and rescue.

---

### `memory-projector` — Memory Projector

| Field | Value |
|-------|--------|
| **tier** | C |
| **type** | Emitter |
| **range** | Contact |
| **facets** | `Psychic`, `Sensory` |
| **source** | https://www.deviantart.com/edcom02/art/MHA-DOFP-Lady-Flashback-844153838 |
| **inspiration** | Fan OC River Munroe / Lady Flashback; wording simplified. |
| **tier note** | Intel / investigation; contact + willingness; user blind when off. |

**description (EN):**

> On fingertip touch, pulls a target's memories and projects them as a hologram from the user's eyes for others to watch from that person's viewpoint. Resistant minds block or blur withheld scenes. The user is blind from reality and locked onto seeing the memories whenever the quirk is being used.

---

### `playback` — Playback

| Field | Value |
|-------|--------|
| **tier** | A |
| **type** | Emitter |
| **range** | Contact |
| **facets** | `Control`, `Sensory` |
| **source** | https://www.deviantart.com/thejayleedraws/art/Juri-Tatsumi-aka-REPLAY-MHA-OC-873683541 |
| **inspiration** | Fan OC Juri Tatsumi (REPLAY); touch rewind, empathic backlash. |
| **tier note** | Down from fan **X**: touch-only rewind; user inherits target felt experience. |

**description (EN):**

> On touch, rewinds a person or object's actions. The user feels whatever pain, emotion, or strain the target underwent in that span; rewound objects relay stored impact and stress instead.

---

### `water` — Water

| Field | Value |
|-------|--------|
| **tier** | A |
| **type** | Emitter |
| **range** | Medium |
| **facets** | `Elemental`, `Control` |
| **source** | https://shapes.inc/miyachi |
| **inspiration** | Fan OC Miya Sairin; no liquify, hydration recall drawback. |
| **tier note** | Down from **S**: no liquify; hydration-linked recall drawback. |

**description (EN):**

> Allows the user to generate and control water within range. The mass is drawn from their hydration; any volume they lose track of snaps back through the skin as stinging cold until it is recovered.

---

### `ctrl` — Ctrl

| Field | Value |
|-------|--------|
| **tier** | B |
| **type** | Emitter |
| **range** | Medium |
| **facets** | `Control`, `Support` |
| **source** | https://www.quotev.com/story/15831236/%E5%8A%9F%E7%8E%87-MHA-Quirk-Ideas/109 |
| **inspiration** | Quotev 功率 \| MHA Quirk Ideas #095 Ctrl. |
| **tier note** | Combat-low; excellent support/engineering; non-living only. |

**description (EN):**

> Within about ten meters, copies, pastes, or undoes small non-living actions by tracing C, V, or Z on their fingers toward the target. Cannot affect living things; undo reaches up to two minutes back.

---

### `future-scenario` — Future Scenario

| Field | Value |
|-------|--------|
| **tier** | A |
| **type** | Emitter |
| **range** | Self |
| **facets** | `Psychic`, `Mobility` |
| **source** | https://www.quotev.com/story/15831236/%E5%8A%9F%E7%8E%87-MHA-Quirk-Ideas/11 |
| **inspiration** | Quotev 功率 \| MHA Quirk Ideas #007 Future Scenario. |
| **tier note** | Down from fan **S**: heavy stamina, precise timing, must stand at destination; 5 min cap. |

**description (EN):**

> Shows possible futures in any mirror. The user may step to a chosen place-time for up to five minutes, then return to the present. Must name the second precisely and stand where they wish to arrive; each jump costs heavy stamina.

---

### `cosmos` — Cosmos

| Field | Value |
|-------|--------|
| **tier** | S |
| **type** | Emitter |
| **range** | Medium |
| **facets** | `Elemental`, `Emission` |
| **source** | https://www.quotev.com/story/15831236/%E5%8A%9F%E7%8E%87-MHA-Quirk-Ideas/39 |
| **inspiration** | Quotev 功率 \| MHA Quirk Ideas #033 Cosmos; nebula/dust redesign. |
| **tier note** | **S**: star-forging-grade particulate ceiling; weak in daylight. |

**description (EN):**

> Generates flowing cosmic dust and nebula-dense clouds the user can shape and propel. The particles are the same kind that gather before stars form and can be packed into far denser masses. Weakens in strong daylight.

---

### `marker` — Marker

| Field | Value |
|-------|--------|
| **tier** | A |
| **type** | Transformation |
| **range** | Contact |
| **facets** | `Construct`, `Emission` |
| **source** | https://www.deviantart.com/bluecola101/journal/My-Hero-Academia-Custom-Quirk-List-770276533 |
| **inspiration** | BlueCola101 Custom Quirk List (Marker). |
| **tier note** | Creation scaling; stamina/complexity limits. |

**description (EN):**

> Turns the fingers into markers whose drawn lines and shapes become real matter once the ink dries. Simple forms are reliable; large or moving constructs demand focus and stamina.

---

### `tracker` — Tracker

| Field | Value |
|-------|--------|
| **tier** | C |
| **type** | Emitter |
| **range** | Long |
| **facets** | `Sensory` |
| **source** | https://aminoapps.com/c/mhaocs/page/blog/oc-quirk-ideas/6PoQ_YeZIzuP1GkNpWJDKvxw5Mw0DRnYdjj |
| **inspiration** | Amino MHA OCs — OC Quirk Ideas by CJs-cats (Tracker). |
| **tier note** | Investigation; trails indistinguishable until caught up. |

**description (EN):**

> Reveals a glowing trail along one chosen person's past route. Every trail looks the same until the user reaches the current end of that path; switching targets requires a new focus.

---

### `animate` — Animate

| Field | Value |
|-------|--------|
| **tier** | A |
| **type** | Emitter |
| **range** | Contact |
| **facets** | `Psychic`, `Control` |
| **source** | — |
| **inspiration** | Original concept (Random MHA Quirk project review). |
| **tier note** | Unreliable wills; sleep ends all animations. |

**description (EN):**

> On touch, awakens non-living objects with a face and will of their own. They may cooperate, refuse, or deceive, and remember what they witnessed while awake. All animated objects return inert when the user falls asleep.

---

## Seed data (EN — PT/ES TBD)

Full rows (`source`, `inspiration`, mechanics): [`tools/catalog/data/originals.json`](../tools/catalog/data/originals.json)

```bash
pnpm quirks:seed-originals   # upsert ORIGINAL quirks + EN translations
pnpm quirks:list-originals   # verify in Supabase
```

---

## Tier changes vs first research pass

| Quirk | Research tier | Catalog tier | Why |
|-------|---------------|--------------|-----|
| Gorgon | X | **A** | Progressive difficulty by mass; blink release |
| Playback | X | **A** | Touch rewind; user feels target's pain/emotion/object stress |
| Future Scenario | S | **A** | Stamina + precision + 5 min cap |
| Cosmos | S | **S** | Still elite; dust/nebula not literal stars |
| Water | S | **A** | No liquify; hydration + lost-volume recall |
| Marker | A | **A** | Unchanged |
| Sound Wave | A | **A** | Unchanged |
| Ctrl | C | **B** | Worth B as unique support |
| Animate | — | **A** | New; sleep limit + unreliable wills |

---

## Before seeding (your call)

- [ ] Approve / edit **names** and **ids** (`water-body` vs `water`, etc.)
- [ ] Approve **tiers** (only **Cosmos** at S; Water Body now **A**)
- [ ] Approve **ranges** and **facets**
- [ ] Plan **pt-BR** + **es** copy (manual or `translate-pt` / `quirks:generate-es`)
- [ ] Append to `tools/catalog/output/*` + `QUIRK_IDS` + `pnpm quirks:seed`
