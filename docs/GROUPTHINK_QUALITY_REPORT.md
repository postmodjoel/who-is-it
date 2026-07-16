# WHO? DO YOU THINK? — Quality Report

Response to `docs/WHO_DO_YOU_THINK_CLAUDE_REVIEW.md`. Method: full read of `groupthink.js`,
`groupthink-rules.js`, `groupthink-data.js`, `groupthink.css`, `tools/groupthink-sim.mjs` and the
groupthink test suites, plus a live local playthrough (2-player YOLO through the three-face cut,
final two and receipt) and Monte-Carlo probes run against the real `GroupthinkRules` module in the
browser (20,000 trials per cell, random-pick baseline — real humans correlate more, so treat these
as bounds).

## TL;DR

The core loop is strong: shared prompt → private ballots → communal reveal is genuinely funny, the
reveal presentation is good, online sync is careful, and the new three-face auto-cut fixes exactly
the redundancy it was designed to fix. The three problems that remain all live at the edges of that
new mechanic:

1. **The final two still has the old redundant save vote** — and when the room agrees it is *forced
   theater with one candidate*, which then crowns the face the room just condemned.
2. **A successful save at a 4–5 face board insta-crowns a champion**, skipping the 3→2 endgame arc
   the new mechanic just built.
3. **Lone-wolf consolation (flat 3) outscores matching (2) in every 1-pick round**, so the optimal
   endgame strategy in a consensus game is to avoid consensus.

## Flow map

| Phase | Player goal | Private/public | Advances on | Risk |
|---|---|---|---|---|
| Anthology title → ruleset picker | Choose WHO? IS IT? / WHO? DO YOU THINK? | public | click | none — the two-wordmark picker reads well |
| Local/online → names + YOLO + PG | Set the room up | public | BEGIN | YOLO's only explanation is the "PERMANENT CUTS" sub-label |
| Intro warp | Learn the premise | public | skip/auto | says "everyone sees the same faces", never mentions the saw |
| **selecting** | Privately pick N faces fitting the prompt | picks private | everyone locks (local handoffs between ballots) | stakes invisible: nothing says picks feed the saw; at local phase starts the device holder can act as seat 0 |
| **reveal** | Enjoy where the room agreed / who's alone | all public | — | all faces land at once; no build-up to the top pick |
| **saving** (YOLO, board > 3) | Save one nominated face | votes private | everyone locks | fine at big boards; see endgame findings for small boards |
| **three-face cut** (new) | — automatic | derived from picks | instant | tie loop has no escalation (duo stalls 67% of rounds at random baseline) |
| **results verdict** | See who was sawed | public | host/local NEXT | good ("FINAL TWO UNLOCKED" lands well) |
| **finale receipt** | Scores, survivor, psychic award | public | play again / menu | survivor can be the *most condemned* face (see F1) |

## Ranked findings

### F1 · HIGH — The final two is forced theater, and it crowns the condemned face
`groupthink.js` `applyResult` (board == 2 falls through to the generic save phase) +
`groupthink-rules.js:159` (`pickCount === 1 && savedId` ⇒ remove the whole rest of the board).

Played live: both players picked Naomi for "Pick one you would never give a spare key." The save
phase then offered **exactly one candidate** — both players are forced to tap "SAVE NAOMI", the
never-picked Niko is removed invisibly, and Naomi (the face the room just condemned) is crowned THE
LAST FACE STANDING on the receipt. Two full ceremonial phases (two device handoffs locally) for a
predetermined outcome — precisely the redundancy `resolveThreeFaceCut` was built to remove one step
earlier, plus a last-second inversion of what picking has meant all game (picked ⇒ sawed).

Random baseline for a duo final two: 50% forced theater (agree), 50% "both removed, nobody
survives" (split). Correlated humans agree more, so *most* duo finals are the theater case.

**Smallest credible fix:** resolve the final two directly from the picks, exactly like the
three-face cut: clear support on one face ⇒ that face is sawed and the *other* is crowned; a split
⇒ the saw takes both and nobody survives. One prompt, one choice, one climax; pick = condemnation
stays true from round 1 to the last breath, and the sole survivor is genuinely "the only face the
room never agreed to condemn". The empty finale survives as the punishment for a split — now a
deliberate, legible outcome rather than a vote artifact.

### F2 · HIGH — A save at 4–5 faces insta-crowns a champion and skips the endgame
`groupthink-rules.js:159`, enshrined by the rules test "one-pick agreement crowns the final
survivor". At any 1-pick board (2–5 faces), a successful save removes **the entire rest of the
board**, including never-nominated faces. A 5-face room jumps straight to a champion; the
three-face transition and final two never happen. It also creates a second, contradictory survivor
definition: "the face the room rescued" vs "the last face never cut".

**Smallest credible fix:** delete the special case — a save always removes only the non-saved
candidates. The board then walks 5→4→3→2 and the (new) endgame always gets to play. With F1 this
makes the whole YOLO arc one consistent statement: *nomination is condemnation; survival is
escaping it; the last agreement picks the winner.*

### F3 · HIGH — Lone-wolf consolation beats matching whenever picks shrink
`groupthink-rules.js:109` (`matched === 0 ? 3 : matched * 2`). Probe: picks `[a],[a],[b]` scores
`2, 2, 3` — the player who avoided consensus **wins the round outright** at pick-1, and ties a
1-match player at pick-2. The endgame of a consensus game currently rewards anti-consensus; the
sim's adaptive agent has an explicit consolation-defection metric because this is a real strategy.

**Smallest credible fix:** scale consolation to the pick count (3-pick ⇒ 3, 2-pick ⇒ 2, 1-pick ⇒
1). Early-game protection is untouched; the endgame inversion disappears. Touches `scoreRound`,
the sim's `candidateScore`, and one Playwright/rules expectation each.

### F4 · MEDIUM — Three-face ties have no escalation and can stall (duo especially)
`resolveThreeFaceCut` + `applyResult`. A tie ⇒ "ALL THREE SURVIVE", new prompt, repeat forever.
Random baseline no-cut rates: **2p 67%**, 3–4p ~22%, 9p ~18%. Humans converge, but a stubborn duo
can loop. **Fix (experiment):** mercy once, impatience twice — on the *second consecutive*
three-face tie, the saw takes all tied leaders ("THE SAW GOT IMPATIENT"). Deterministic (derived
from shared picks, no new net messages), ends the loop within two rounds, and rhymes with the
existing "a tie saves nobody" rule.

### F5 · MEDIUM — Local ballots can be misattributed at phase starts
`applyResult` resets `state.currentPlayer = 0` and `showResults` immediately renders live save
controls for seat 0 — no handoff gate. Reproduced live: holding the device as Bea after her lock, I
cast **Ada's** save vote. Same shape at round start (NEXT PROMPT leaves the device with the last
voter while seat 0's ballot is open). **Fix:** name the actor in local multi-player — tray head
"ADA'S PICKS", save button "ADA — PICK A SURVIVOR" / "ADA: SAVE NAOMI". Lighter than adding more
handoff gates, and the room self-polices.

### F6 · MEDIUM — Prompt reroll ping-pongs between two prompts
`rerollPrompt` sorts by `stableHash(`${salt}:reroll:${id}`)` with a fixed per-round salt: the first
reroll goes to the global minimum-hash prompt W, the second to runner-up W2, the third back to W,
forever. Rerolling because you dislike a prompt and getting the previous one back reads as broken.
**Fix:** include a reroll counter in the hash salt. Host-only action that already broadcasts the
resulting `promptId`, so online stays consistent.

### F7 · MEDIUM — The saw is invisible during selection
The selection tray says only "30 still in" (and the intro never mentions cuts). First-timers learn
what picking *does* only when the first face gets sawed. That first shock is arguably part of the
joke — but by round 2 the stakes line costs nothing. **Fix:** one dark line in the YOLO tray
footer, e.g. "EVERY PICK FEEDS THE SAW." (final copy yours).

### F8 · LOW — The reveal lands all at once
`showResults` renders the full face grid instantly. The comedy structure wants a build: lowest
counts first, the room's top pick landing last. **Fix:** stagger `.gt-result-face` entrances by
rank (CSS animation + per-card delay), ~15 lines, presentation only.

### F9 · LOW — Online save phase doesn't say who's still deciding
The lock button shows "SAVE LOCKED · 1/4" but not *who* the room is waiting on (the roster rail is
physically behind the overlay). **Fix:** list unlocked names in the save controls.

## Game-design assessment

- **Match-the-room incentive:** strong at 3+ players; 2 points per match plus the social reveal is
  enough. The weak spot is F3, which pays defection exactly when the board gets tense.
- **Consolation:** right instinct (protects the odd-one-out from feeling stupid), wrong constant at
  small pick counts. Scale it (F3); don't remove it.
- **Save phase:** keep. It's the agency beat, and at 6+ candidate boards it's a real decision. The
  problem is only what happens below 6 faces (F1/F2).
- **YOLO vs full deck:** meaningfully different products — elimination arc with a climax vs a pure
  scored parlour game. Full deck is intentionally flat; leave it.
- **Duo sync:** worth keeping. The sync grades ("SEEK MEDICAL HELP") are the right reward. Duo
  needs F4's escalation most, since its tie rates are the highest.
- **Three-face + final two as climax:** the three-face cut is the right shape. The final two is
  currently the weakest moment in the product (F1); fixed, it becomes the best.
- **Session arc:** YOLO on a 30-board runs a satisfying ~5–8 rounds with visibly rising stakes as
  pick counts shrink 3→2→1. Full deck's fixed 8 rounds is fine.

## Recommendations

**Guaranteed improvements** (low-risk, strongly supported):
1. Final-two showdown — F1.
2. Remove the 4–5 face insta-crown — F2.
3. Scale lone-wolf consolation by pick count — F3.
4. Name the actor in local mode — F5.
5. Reroll counter salt — F6.

**Experiments** (promising, playtest before trusting):
6. Impatient-saw escalation on consecutive three-face ties — F4.
7. Saw stakes line during selection — F7 (copy is the risk, not the code).
8. Staggered reveal — F8.
9. Waiting-on names in the online save phase — F9.

**Do not add:**
- Mystery effects, themed boards, or per-player boards in Groupthink — the plain wall of faces *is*
  the straight man; the isolation tests are right to enforce it.
- Public/open voting variants — kills the reveal.
- A second save vote, veto tokens, or any extra ceremony at ≤3 faces — the endgame needs fewer
  decisions, not more.
- New prompt content by generator — deck breadth is real but belongs to your Prompt Studio
  workflow, in the established dark voice.

## Validation plan

| Change | Hypothesis | Test scenario | Automated | Humans judge |
|---|---|---|---|---|
| Final-two showdown | The ending reads as one climax; agreement crowns the never-condemned face | 2p and 4p: agree case, split case | rules test: agreement ⇒ picked face removed + other crowned; split ⇒ both removed. Playwright: no `.gt-save-face` at board 2; verdict copy; receipt shows survivor/nobody | does the crown feel *earned*; is the empty finale funny |
| No insta-crown | Sessions reliably reach 3→2 | rules test on 4–5 board saves | sim: `singleFinaleRate` unchanged or ↑, rounds ↑ slightly | pacing at 4–5 faces |
| Scaled consolation | Lone-wolfing stops paying at 1–2 picks | `[a],[a],[b]` ⇒ `2,2,1` | update rules + spec expectations; sim `adaptiveConsolationRate` should drop | does 1 point still feel like a consolation |
| Impatient saw | Three-face loops end ≤2 ties without feeling arbitrary | duo forced-tie twice | rules test for escalation trigger; sim `stalledRate` → ~0 | is "THE SAW GOT IMPATIENT" funny or cruel |
| Actor naming | No more wrong-seat ballots locally | 3p local, watch phase starts | Playwright: tray/save button contain current name | none |
| Reroll salt | Rerolls feel fresh | reroll 3× in one round | Playwright: three distinct prompts (pool ≥ 4) | none |
| Stakes line / stagger / waiting-names | Clarity/drama up, no confusion | smoke | selector/copy assertions | comedy timing of stagger |

## Also noted (no action urged)

- `tests/*" 2".js` Finder-duplicate files are back on disk (untracked/ignored, inert to both
  runners) — delete when convenient.
- `state.seenPrompts` reset in `groupthink.js:148` is fine (it's the classic ruleset's no-repeat
  memory, correctly cleared).
- The results overlay at 12 players will be long but scrolls (`.gt-results { overflow: auto }`) —
  watch it in a real big room before worrying.
