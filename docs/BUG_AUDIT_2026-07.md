# WHO? KNOWS? — Bug Audit (July 2026)

Adversarial pass over the whole current working tree, including the two features another session
added concurrently (WHO? WERE YOU? / GeneticsRules) and the app.js ruleset refactor that wired them
in. Method: full read of the changed/new files, deterministic rule probes in the live page, and
scripted end-to-end playthroughs (local + two-client online) driving the real UI.

## Headline

No critical or data-loss bug found. The new endgame code and the core flows are sound. One real
(low-severity, now-fixed) teardown defect, plus a few cosmetic notes. Detail below, honestly ranked.

## Fixed in this pass

### B1 · LOW→MEDIUM — Alternate-ruleset overlays could strand on top of the main menu
**Files:** `app.js` `showTitleScreen()` and the `#quitToMenuButton` handler.

The Groupthink/ancestry ceremonies (`.gt-handoff`, `.gt-results`, `.gt-finale`, `.gt-intro-warp`,
`.wwy-handoff`) are fixed, full-screen overlays at **z-index 12000–16000**, appended to `<body>`
outside `#app`. The title screen is **z-index 2000**. Returning to the menu while one of those
overlays is still up left it painted *on top of* the menu, blocking it — and the quit handler reset
`state.whowereyou` but not `state.groupthink` or `state.ruleset`, so a stray `render()` could
repaint the Groupthink board behind the title too.

**Reachability:** low. During a reveal `#app` is not inert and the gear stays in tab order, so a
**keyboard** user can Tab to it → open setup → "Main menu" and strand the overlay. Pointer/touch
users can't (the overlay covers the gear), and handoffs additionally set `#app` inert. So most
players never hit it — but it's a real dead-end when reached.

**Fix applied:** `showTitleScreen()` now tears down those five overlay classes at the single funnel
every menu-return uses, and the quit handler fully drops the live ruleset
(`state.groupthink = state.whowereyou = null; state.ruleset = "whoisit"`). Reproduced the strand
(overlay over a blocked menu), applied the fix, re-ran: overlay gone, `ruleset` reset, LET'S PLAY →
ruleset picker → names all functional. `app.js?v=259 → v=260`.

## Verified working (no bug)

- **New endgame code** — final-two showdown, no-insta-crown, unanimous consensus cut, scaled
  consolation. 17/17 rule probes; local 5→4→3→2→crown and split→empty-finale.
- **Online consistency of the auto-resolve path** — the showdown/consensus-cut outcome is *derived
  independently* on each client from the shared `gt-result` payload (no dedicated broadcast). Drove
  two live clients to an identical 2-face board and confirmed both computed the **same** cut/crown
  and board with no divergence — the highest-risk part of the new code.
- **Online Groupthink** — two clients synced cleanly through select → reveal → save → next round;
  revisioned packets, no desync.
- **WHO? WERE YOU?** — full 3-generation playthrough to the receipt; the pass-the-device handoff
  correctly hides the previous player's ballot (board re-renders blank before the overlay); scoring,
  founder reveal, and refresh-resume all behaved. Puzzle generation: 30 seeds × 7 puzzles, 0
  fairness failures, ~20 ms/session.
- **Classic WHO? IS IT?** after the refactor — eliminations register, the mystery engine (pantone)
  applies, prompts draw. The `render()`/`newGame()`/`activateCharacter()` ruleset guards hold.
- **Cross-ruleset menu transitions** — self-heal correctly (a lingering `state.ruleset` is
  overwritten on the next ruleset pick), and now also cleaned proactively by B1's fix.

## Minor notes (no action taken)

- **`who-were-you.js` `candidateLabel(candidate, index, puzzle)`** is called with 3 args but defined
  with 2 — the `puzzle` arg is unused. Harmless; tidy when convenient.
- **WHO? WERE YOU? self-handoff:** after each generation reveal, player 1 (index 0) gets a
  "PASS THE DEVICE TO [player 0]" screen before starting the next generation. Reasonable as a
  "back to the start of the table" beat, but reads slightly odd for the person already holding the
  phone. UX call, not a bug.
- **`genetics-lab.html/.js/.css`** are an unreferenced standalone workbench (not loaded by
  `index.html`) — same pattern as face-studio. Not shipped, no risk.
- **Finder-duplicate test files** (`tests/*" 2".*`) are still on disk, untracked and inert.

## Not yet run

`npm run test:rules` / Playwright / the balance sim — no Node runtime on this machine. The rule
logic was exercised via in-page probes against the real modules instead; the automated suites still
want a run wherever Node lives.
