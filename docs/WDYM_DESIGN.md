# WHO? DID YOU MAKE? — design record (2026-07-18)

The third anthology tile. A hot-seat body-parts draft for 2–6 players, built on the WHO? WERE YOU?
genetics engine after the ancestry game was retired.

## Why the ancestry game died

WHO? WERE YOU? v2 (rotating maker breeds 8 founders → 2 parents → 1 descendant, everyone else
reconstructs the four founders) was mathematically sound and perceptually dead. Measured post-ship:

- A founder's signature trait survived to the descendant at ~20% strength, for blends AND
  dominants — two inheritance hops each pick one parent by coin flip, so a specific founder's
  quirk needed both flips (~25%) or was nearly erased.
- Descendant hair colour sat ΔE≈15 from its *nearest own founder* while founders were ΔE≈42
  apart: double-LAB-blending made every descendant a mid-brown that matched nobody.
- The 210-config fairness margin was mostly per-config RNG reseed noise: configs sharing all
  4 founders with wrong pairing scored 85.7 vs the true config's 100, configs sharing only 2
  scored 82 — a 3.6-point genetic signal under a 14-point noise cliff.
- Bot proxies: random guessing 43, an oracle feature-matcher 91. Humans lived in the mush between.

Lesson encoded in this repo's process: **tune the fun with bots before building the UI.**

## The game

- Each player secretly holds a **commission**: six parts — SKULL, EYES, NOSE, MOUTH, HAIR, BODY —
  drawn from six distinct donors on the shared slab (8 donors at 2–3 players, 10 at 4+).
  Colour rides with anatomy (skin→SKULL, eye colour→EYES, hair colour→HAIR).
- Snake-order draft, six laps. On your turn: claim any free (donor, part) whose slot is empty on
  your build. Claimed parts strip visibly off the donor and are gone for everyone.
- **You wear what you take.** Stealing the part a rival needs is legal and costs you the slot.
  That one rule is the entire denial economy — no discard pile, no burn actions.
- Recipes are sampled with **2–4 contested parts per player** (ceiling rises to 5/6 at 5–6 seats),
  so the fights are guaranteed but never total.
- Picks are public; commissions are private (hold-to-peek, or memorize mode). Inference — watching
  what someone hoards — is the social game.
- Scoring: exact part **15**; substitution `round(15 × (sim − 0.4)/0.6)` capped at **12**;
  all-six-exact **MASTERPIECE +10** → 100. Reveals run worst build first; thefts are stamped
  ("STOLEN by Ada · pure spite"). Default three rounds ("bodies"), host-adjustable 1–5.

## Tuning numbers (bot sims, 100–200 seeded drafts per matchup)

| matchup | result |
| --- | --- |
| all greedy, 2p | 80 / 82 mean (seat spread ~2) |
| spite seat 1 vs greedy | 68 vs 74 — spite costs you ~8, costs the victim ~5 |
| random vs greedy | 46 vs 94 — skill gradient ≈ +47 |
| all greedy, 4p | 76–81 by seat, ~8–10 thefts/round |

Reproduce any of this in **genetics-lab.html → FLESH DRAFT → RUN 200 SIMS** (greedy/spite/random
bots live in make-rules.js). The Lab also shows sampled recipes with contention badges.

## File map

- `make-rules.js` — pure rules: parts partition over the trait registry (validated at load — a new
  registry trait that isn't mapped to a part throws), mannequin assembly, commission sampler,
  claim legality, scoring, theft annotation, bots. Tested by `tests/make-rules.test.mjs` (vm).
- `who-did-you-make.js` — controller (`state.whodidyoumake`, modeVersion 1). Phases:
  commission-viewing → drafting → reveal → round-score → finale. Saves after every claim; resumes
  any phase. Sounds are uniform on claims (a "steal!" sting would leak who wanted what).
- `who-did-you-make.css` — butcher-paper/surgical-teal skin; owns the shared 3-tile title grid.
- `tests/who-did-you-make.spec.js` — Playwright: full round, theft stamp, finale gallery, seat cap,
  peek hold, mid-draft resume, retired-save cleanup, touch overflow, lab smoke.
- Retired: `who-were-you.js` (unloaded, kept for a possible solo "Forensics" revival);
  `GeneticsRules` (genetics-rules.js) remains the substrate for donors, similarity, and the Lab.

## Cast donors (added same day)

Synthetic stranger boards measured perceptually samey — restrained jitter was an ancestry-era
leftover. The slab now defaults to **the base WHO? IS IT? cast** (first-screen toggle keeps
strangers available):

- Selection: seeded shuffle window (~2x board size) → greedy maximin, with a **≤2 bald cap** in the
  window ("no hair" is a cheap distinctness axis; unchecked maximin slabs five baldies).
- **Extras ride with their part** (`EXTRA_KEYS` / `ACCESSORY_PART` in make-rules.js): glasses with
  EYES, hats/clips with HAIR, beards/teeth/expression with MOUTH, outfit + tattoos with BODY,
  earrings/wrinkles/makeup with SKULL, nose rings with NOSE. Steal her hair and she stands on the
  slab bald without her flower clip — your mannequin wears it.
- Scoring stays **phenotype-pure**: extras are identity, never points, so cast and stranger modes
  share one tuning. Post-change gradients (random/greedy 2p): strangers 40/96, cast 46/94.
- Stranger generation itself was widened (22 silhouette spreads up, 3-4 signatures) so the
  anonymous mode also reads characterful.

## The big slab + the six-suspect commission (Joel's calls, same day)

- **18 donors** for every table size (letters skip I and O). Commissions still need six parts, but
  they hide among eighteen bodies — recognising the right donor became the core skill check. The
  recipe sampler still forces 2–4 contested parts, so theft pressure survives the bigger board
  (measured: 2.4 thefts/round at 2p, 7.8 at 4p).
- **The commission is a face and nothing else** (revised same day): no source portraits during
  play — you memorise the face at the ceremony and get **three rationed peeks** per round
  (hold-to-peek burns a charge; "NO PEEKS LEFT — MEMORY ONLY" when spent; charges are
  per-player, persisted, and the memorize toggle was removed because the ration IS the pressure).
  The sources moved to the reveal, staged in narrative order: BUILT FROM THESE (the donors whose
  parts you actually claimed — a lazy build shows two thumbs, self-shaming) → THE BUILD → vs →
  THE COMMISSION → IT WAS MADE FROM (its six, letter-sorted). Part-level stamps stay below as
  the score explanation.
- **Clean cards**: donor cards show name + portrait only; ledger chips appear per part only once
  claimed. Full availability lives in the claim bar.
- **UI consistency pass**: one shared `.wdym-panel` paper treatment for board/builds/reveal, and
  the morgue chrome is pinned in BOTH app themes (light mode used to blank the roster text).
- Post-change gradients (random/greedy, 18 donors): cast 43/96, strangers 37/98, cast 4p 42/83.

## UI style contract (2026-07-18 cleanup — hold every future change to this)

**Tokens** — the anthology family only: ink `#171512`, paper `#f4efe4`, cream cards `#fff4cb`,
gold `#ffd43b`, blue `#254ecb`, blood `#c22b20`. No mode-private hues (the teal experiment is
dead). Panels: 3px ink border + 7px offset shadow; cards: 2px + 3px; overlays: white border on
near-black with a blue offset shadow. Sidebar chrome is pinned in BOTH app themes.

**Type** — Archivo 900 everywhere. Exactly one display element per surface (the recipient's
name, the screen h2); eyebrows are small red letterspaced caps; body text ≤ .8rem. NEVER style a
bare `b`/`span` tag at display size — scope to the element (`> div > b`), or inline emphasis
explodes mid-sentence (the "3 peeks" incident).

**Copy** — one sentence per screen, verbs first, no second clauses. Buttons are commands
("HOLD TO LOOK"), toggles state their value ("BODIES TONIGHT: 3") — the button itself is the
"tap to change" affordance. Rules exposition lives in the help card only. Standing disclaimer
stays verbatim.

## Visual mode + the RATE lab (2026-07-18)

- **No questions anywhere.** The classic cue card (and its "tap for a new question" affordance)
  is hidden in this ruleset, its contents blanked, and the reroll handler early-returns —
  WHO? DID YOU MAKE? is purely visual. Instructions live on the screen headers.
- **Lab → RATE tab: taste as tuning data.** Deterministic batches of synthetic strangers
  (120 + DEAL 30 MORE); tap a face → sticky editor (YAY/NAY, reason chips
  EYES/NOSE/MOUTH/HAIR/PROPORTIONS/COLOUR, free note). Ratings persist in localStorage
  (`wdym_face_ratings_v1`) with full phenotype snapshots, exportable as JSON. At ≥3 yay and
  ≥3 nay the report computes **per-trait yay-vs-nay deltas** (normalized numeric means +
  categorical over/under-representation + tag counts) — the generator's next tuning pass
  reads straight off this report.

## Generator tuning v1 — from Joel's first 49 ratings (2026-07-18)

The RATE lab's first harvest (20 yay / 29 nay, notes verbatim) became these changes:

| complaint (count) | change |
| --- | --- |
| "skull poking out the top" (5) | headScaleX/Y out of the signature pool, spread 0.85→0.45 (max headScaleY 1.073 — poke-through starts ~1.08) |
| eyes "too crazy / too high / deviated" (7) | eye-asym signature magnitudes halved; lazy eye 3.6-7.2 → 2.2-4.4; mean abs eye offset 2+ → 0.96 |
| "out of proportion / cabbage patch" (4) | global signature push 0.62-0.96 → 0.45-0.75 of half-range |
| "lips too big" (2) | lip size spreads 0.65 → 0.45 |
| hair pieces "on the chin / too wack" | LOCK_PRESETS pruned 14 → 8 (top/fringe pieces only), y-jitter ±3 |
| "needs more than just base hair" | lock frequency 0.38 → 0.45 |
| YAY: "proportionate + funny", "tilted neck is good" ×2 | head-tilt signature untouched — it is the quirk budget |

RATE batches moved to a `rate-v2-*` seed namespace (v1 ids describe pre-tune renders) and rating
snapshots now include extras, so lock-specific taste is analyzable next round. Skill gradient
re-verified after the narrowing: 41 random / 96 greedy.

## Generator tuning v2 — from 146 fresh swipe-deck ratings (2026-07-18)

Rated on the v1-tuned generator (28% yay), so these deltas are second-derivative taste:

- **Locks are the product**: 2 pieces = 60% yay, 1 = 28%, 0 = 22% → frequency 0.45 → 0.7, and
  55% of locked faces now wear two. Per-kind yay:nay split kept only the proven four
  (longSideLock 8:5, curtainBangs 6:4, sideSwoop 4:2, curlyForelock 5:3); roundedPuffSide (1:9),
  softWaveCap (3:9), spikyFringe (2:7) and highPonytail (2:6) are retired until their placements
  are re-authored in the studio.
- "eye outline too thin" → upperEyelidWidth base 1 → 1.2 (yay mean was 1.08 vs nay 0.98).
- Nays ran wider/thicker brows, bigger lower lips, lower mouths/chins, wider torsos → spreads
  trimmed (browScaleX .3, browThick .5, lipLowerSize .35, mouthY .18, chinY .15, bodyWidth .55).
- Yays ran chunkier (build 82.7 vs 79.8) → base 80 → 83.
- hairFamily curly was 10% of yays but 30% of nays → curly weight .24 → .12 (straight/wavy up).
- Residual lazy-eye separation → quirk 2.2-4.4 → 1.8-3.6.
- RATE deck reseeded to `rate-v3-*`; snapshots tagged generation v3. Gradient held: 42 / 98.

## The Hair Studio (2026-07-19)

Tuning v2 proved locks ARE the product, and four of eight kinds were retired pending re-authoring —
so hair got its own workbench: `hair-studio.html` (+ `.js`/`.css`, same lab chrome). Three tabs:

- **RATE COMBOS** — base style × lock pieces, generated from Joel's own authored placements, mined
  at load from the baked cast (`traits.hairLocks` on ~40 characters → per-kind placement libraries,
  usage weights, co-occurrence pairs, base-style hosts, palette). Sampled instances get small
  jitter and mirror 50% (`x → 100−x`, `rot → −rot`; the renderer's lockTransform mirrors natively).
  Covered styles (hijab) never host. Cards show the hair on a fixed mannequin plus a
  WIDE/NARROW/TALL/SHORT fit strip.
- **RATE PIECES** — brand-new shapes, emitted as **drawn locks** (`{d, strokes}` pen-tool
  instances the renderer already supports — same format as the Lock Designer). Half are
  **mutants**: authored silhouettes extracted via `renderLockPart(..., "mass")`, flattened to
  polylines, then mirrored/tapered/curled/stretched/spliced and re-smoothed (Catmull-Rom). Half
  are **grown**: ribbon silhouettes swept along spine grammars (arc/sCurve/jHook/spiral/zig).
  Both anchor at mined placements; grown anchors clamp rotation to ±55° (the grammar grows
  downward — a cowlick's −138° would point the ribbon skyward).
- **CATALOGUE** — every yay, culled freely; a cull flips the rating to a tagged nay (CULLED)
  so the deck won't re-deal it and no taste data is lost. Final picks happen later, from here.

Placement maths worth remembering: standard locks render INSIDE `headGroup` (0.86 frame scale
about (128,150), −16 lift); drawn locks render OUTSIDE it in raw portrait space — so the studio
bakes the frame into generated paths, and grounds floaters (mined anchors authored for tall hair
hover over a crop; if a piece's lowest point clears y=68, it's pulled down to touch the scalp).
Ratings persist in `wdym_hair_ratings_v1` with full recipes/paths; export is
`who-did-you-make-hair-ratings.json` (includes mined usage + pair stats). Swipe grammar is
identical to the Lab's RATE deck. CI: `tests/hair-studio.spec.js`.

## Deliberate calls

- **No maker/guesser asymmetry** — everyone drafts every round; no one sits out their own puzzle.
- **No demand hints on the game board** — the Lab shows contention, the game must not (it would
  leak commissions). Only *taken* chips are public.
- **Six-seat cap** — donor count, snake pacing, and contested windows are tuned for 2–6.
- **Uniform claim sound** — see above; secrecy beats juice.
- Open knobs after real playtests: per-turn timer (party pressure), a scoreboard sting for pure
  spite (currently social-only), round count default.
