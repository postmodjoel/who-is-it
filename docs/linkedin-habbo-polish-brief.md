# Implementation brief — LinkedIn polish, Habbo theming, PG fixes

Working rules (same as always): vanilla JS, no build step, must run from file://,
never `Math.random` for anything online peers must agree on (salt + `stableHash` only;
cosmetic-only animation may be random). Bump `?v=N` in index.html after every edit and
verify in the preview before committing. Commit per task.

---

## TASK A — LinkedIn: premium banners actually elite

Current: `applyLinkedin` (app.js ~4533) gives POWER tier a blurred location banner, but
MID can get one too (50/50), so premium doesn't read as special.

- POWER: always a blurred location banner (`assets/locations/<slug>_day_banner.png`,
  existing `.li-banner-img` blur treatment) **plus** upgrade the look: slightly taller
  banner (~34px), a thin gold bottom rule, and keep the gold card border. Consider
  `saturate(1.1)` instead of `0.9` for power so it looks rich, not washed.
- MID: plain `#0a66c2` gradient banner only (remove their 50/50 image roll).
- FLOP: keep the grey stripes.
- Only use slugs whose banner art exists — hardcode the known-good slug list (check
  `assets/locations/` for `*_day_banner.png`; during verification `train_station` and
  `gym` 404'd) instead of picking from all `locations`.

## TASK B — LinkedIn: consistent card layout + surnames + Sentence Case + location

Current problem: the character name is an `h3` rendered by `createCharacterCard`
(UPPERCASE, positioned per the base card layout), while title/company live in the
mode's `html` sheet — so spacing/order looks inconsistent card-to-card, and the banner
(`.li-banner` with negative margins) shifts things when present.

Fix by owning the whole plate in LinkedIn mode:

1. **Fixed layout order** on every card: banner → **Name Surname** → title (+premium
   chip) → company → location → connections → skills. Give every tier a banner element
   (grey/plain/image) so vertical rhythm is identical across the board.
2. **Surnames tied to skin tone** (salt-deterministic, `stableHash(salt:li:id:sn)`).
   Characters carry `traits.skin` (named tone — see `skinTones`/`skinToneHex` in
   face-generator.js). Map tone→surname pool in game-data.js as `linkedinSurnames`:
   - lightest tones: Anglo (Smith, Smythe, Johnson, Williams, Taylor, Brown, Wilson,
     Thompson, Smith-Jones…)
   - light-mid: broader European (Kowalski, Rossi, Müller, O'Brien, Papadopoulos…)
   - mid/olive: Mediterranean/Middle Eastern/South Asian (Haddad, Farah, Patel, Singh,
     Nguyen, Reyes, García…)
   - dark: African/Swahili representation (Okafor, Mwangi, Abara, Kamau, Otieno,
     Ndiaye, Banda, Chiedozie…)
   Resolve the character's tone bucket from `traits.skin` (fall back to mid pool if
   unknown). Keep it as genuine representation, not caricature — real surnames only.
3. **Sentence Case display name**: "Joel Smith" not "JOEL". The base `h3` is styled
   uppercase; in LinkedIn mode either hide the base h3 (`.character-card.linkedin h3
   { display:none }`) and render the full name inside `.li-sheet`, or override with
   `text-transform: none` + inject the surname. Hiding-and-rendering-in-sheet is
   cleaner for layout consistency (point 1). NOTE: name search/guessing flows key off
   `character.name` — do NOT mutate the character object; surname is display-only in
   the assignment (`a.surname`).
4. **Location line** under the company, LinkedIn-style: "Greater Sydney Area",
   "Melbourne, VIC", "Bali (Remote)", "San Francisco Bay Area", "Remote-first 🌍",
   plus a couple of flop-tier sad ones ("Mum's spare room", "The group chat").
   Pool in game-data.js (`linkedinLocations` + maybe `linkedinFlopLocations`),
   salt-deterministic pick. Small grey text, `.li-location`.
5. Update the SECRET CARD rendering too if it uses the same branch (it does — verify
   the reveal card shows the same ordered sheet).

## TASK C — Title screen: PG button width

`.ts-pg` (styles.css ~4731) renders full width; the LOCAL/ONLINE/RESUME buttons above
it are a fixed width. Make `.ts-pg` match their width/centering (same max-width or
`align-self: center; width: <same as .ts-local>`), keeping the ON/OFF pill inside.
Purely CSS.

## TASK D — Habbo: themed floor tiles

Habbo rooms already theme walls via CSS vars (`--hb-wall`, `--hb-wallpaper`, `--hb-cap`,
`--hb-skirt`, `--hb-rug`…) but the floor tiles are always the same beige
(`--hb-tile: #d8c79a` / `--hb-tile-alt: #cbb888`, styles.css ~4303).

- Find where the room theme sets the `--hb-*` vars in app.js (the habbo room builder)
  and add per-theme `--hb-tile`, `--hb-tile-alt`, `--hb-side` values that harmonise
  with each room's wall palette (e.g. cool blue room → slate/ice checker; garden →
  grass greens; disco → dark purple + neon grout). Keep the checkerboard pattern and
  the existing grout/edge shadows — only recolour via the vars.
- Optional polish if cheap: a subtle per-theme grout colour via the inset box-shadow
  var. No new DOM, no new timers.

## TASK E — Habbo: themed prompt deck (with Bobba)

There is currently NO `habbo` deck in `modePrompts` (game-data.js) — Habbo mode falls
back to the absurd deck. Add one, imperative voice + heat tags like the other decks:

- **mild** (PG-safe, Habbo-flavoured): "Ask everyone to come to your room for a
  totally normal party. It is not a normal party.", "Beg a passing Habbo for free
  furni.", "Do the Habbo dance. You know the one.", "Type your message in wobbly
  rainbow text — out loud.", "Get walled into a corner by someone's furni and react.",
  "Trade your entire room for one rare throne. Regret it instantly."
- **medium**: moderation/scams/2005-internet chaos — "You've been muted by the
  moderator mid-sentence. Finish the sentence in mime.", "Run the classic falling-
  furni scam on the person opposite.", "Explain to your parents the phone bill from
  buying Habbo Coins."
- **feral** (non-PG only): Bobba territory — "Bobba is what Habbos say instead of any
  filtered word. Tell the person opposite exactly how you would bobba them.",
  "Describe your ideal date entirely in bobba.", "You've been reported for bobba in
  the pool. Give your defence, using the word bobba at least five times."
- Because `habbo` is in `PG_SAFE_MODES`, the heat engine already caps PG at medium —
  so all bobba/adult prompts MUST be tagged `feral`. Double-check `heat` distribution
  (~⅓ / ⅓ / ⅓) and that mild+medium alone leave a healthy PG pool (≥20).

## TASK F — Adult-gate riddles: make them Australian

`ADULT_RIDDLES` (app.js ~1424) gate turning PG off. Currently UK/US-flavoured (HMRC,
national insurance, "meeting invite" one is just weak). Rewrite the whole set
Australian-specific, answers accepting common variants:

- superannuation ("super"), the ATO, tax file number (TFN), HECS/HELP debt, Medicare
  levy, rego, stamp duty, negative gearing, the RBA cash rate, BAS, bulk billing,
  strata fees, "the tradie's quote that never comes", servo/bottle-o adult errands.
- Keep the same shape `{ q, a: [accepted answers…] }`, free-text, lowercase-normalised
  (see `normalizeAdultAnswer`). Drop the meeting-invite riddle entirely.
- Keep 10–14 riddles so `askAdultGate(cb, 3)` has variety.

---

## Order & verification

Suggested order: C (trivial CSS) → F (self-contained data) → B (biggest LinkedIn
change) → A (banners, builds on B's layout) → D (habbo CSS) → E (habbo deck).

Per task: bump `?v=N`, reload preview, then:
- B/A: force LinkedIn (`newGame(state.gameSalt,{effectId:"linkedin",silentEffect:true});
  applyMysteryEffect("linkedin");render()`) and check: identical plate order on every
  card, Sentence Case "First Surname", surnames plausibly tracking skin tone across
  the board, location line present, POWER always image-banner / MID never, no 404s in
  the network log for banner art.
- C: screenshot title screen; PG button same width as LOCAL GAME.
- D: force habbo across 3+ room themes; tiles recolour per theme.
- E: force habbo in PG and non-PG; PG never shows a bobba prompt.
- F: toggle PG off; riddles are Australian; answers accept variants ("super",
  "superannuation").
