# Opus handoff — scoring-health follow-ups

**Context:** `tools/groupthink-score-health.mjs` (Fable, 2026-07-22) measured whether the WHO? DO YOU
THINK? score means anything. Verdict `A=WARN B=FAIL C=FAIL D=FAIL E=WARN`, and the C/D failures share
one root cause: **the zero-match consolation floor `min(3, ballotSize)` meets or beats a single match
(2 pts)**. Full findings: `test-results/groupthink-score-health/report.md`, memory note
`scoring-health-findings`, design brief `docs/SCORING_HEALTH_BRIEF.md`.

Tasks are ordered by dependency. **Do 1 → 2 first** (metric fix, then baseline snapshot) so the floor
A/B in task 3 is measured with the corrected metric against a clean baseline. Task 3 is **gated on
Joel's decision**. 4–6 are independent polish.

Global guardrails:
- The tool must stay deterministic: seeded RNG only, no `Math.random`/`Date.now` inside simulation or
  metrics (the `generatedAt` stamp in `main()` is the one allowed exception).
- Never "fix" a verdict by weakening a threshold in the same change that alters game rules. One change
  per run; compare runs by seed.
- `tools/groupthink-sim.mjs` (the balance harness) re-implements the consolation floor in
  `candidateScore` — any floor change in the rules MUST be mirrored there in the same commit.

---

## Task 1 — fractional top-finish metric (fixes a known bias; do this first)

**Problem.** `runCell` counts only *strict* sole winners: `if (leaders.length > 1) ties += 1; else
winCounts[...]`. `topFinishConsensus` is then compared against `chance = 1/playerCount`. With tie
rates of 40–50%, strict-win probability is deflated for *everyone*, so "consensus finishes first less
often than chance" partly measures ties, not skill. Several B flags overstate the failure because of
this.

**Fix — fractional first-place credit.** A session with k tied leaders awards each leader `1/k` of a
win. Win mass then sums to exactly 1 per session, and `1/playerCount` becomes the correct null
baseline with no tie correction needed.

In `runCell` (`tools/groupthink-score-health.mjs`):
- Change `winCounts` accumulation: when `leaders.length >= 1`, add `1 / leaders.length` to
  `winCounts[strategies[i]]` for every leader seat `i`. Keep `ties += 1` (C still needs the raw tie
  rate — do not change C's inputs).
- `consensusFirst.wins` likewise becomes fractional: if a consensus seat is among the leaders, add
  `1 / leaders.length`.
- `winProb` and `maxWinProb` (dimension E) inherit the fractional counts unchanged — document in a
  comment that E's threshold now reads "expected share of firsts", which is the better definition
  anyway.
- `judge()` B thresholds stay as-is (`lift 1.5×`, `ceiling 0.9`, `fail ≤ chance`) — they were designed
  for this corrected quantity.

**Tests** (extend `tests/groupthink-score-health.test.mjs`):
- Hand-built finals: 3 seats scoring `[5, 5, 2]` with strategies `[consensus, honest, random]` must
  credit consensus 0.5 and honest 0.5; `[5, 3, 2]` credits consensus 1; all-equal `[4, 4, 4]` credits
  each ⅓. (Easiest via a small exported helper, e.g. `creditFirsts(finals, strategies)` — extract the
  leader logic so it is unit-testable.)
- Rerun the whole test file: 4 existing tests must stay green.

**Acceptance:** `node tests/groupthink-score-health.test.mjs` green; a `--smoke` run completes; B's
flagged-cell list shrinks to genuinely low-η² cells (expect corr 0.25 rows to remain — that failure is
real — but "consensus-first 0" artifacts at big tables should disappear).

---

## Task 2 — baseline snapshot (5 minutes, but mandatory before task 3)

After task 1 lands, snapshot the corrected baseline so the floor A/B has a fixed comparison point:

```
node tools/groupthink-score-health.mjs --sessions=1200 --seed=score-health-v1 \
  --output=test-results/score-health-baseline
```

Commit or at least keep this directory. All task-3 comparisons cite it. Do not reuse the default
output dir for the baseline — the A/B run will overwrite it.

---

## Task 3 — the consolation-floor change (GATED: needs Joel's pick)

### The decision, stated honestly

A match pays 2 regardless of ballot size. Therefore **any floor ≥ 2 collides with a single match** —
"scaled consolation" (3/2/1 by ballot) and "matching once always beats matching nothing" are
mathematically incompatible with integer scores. Joel locked scaled consolation on 2026-07-16
([[groupthink-endgame-design]]), but that predates the crowd ramp that made 2-pick rounds the norm
for 3–6 players; the evidence changed. Options:

| Option | Floor by ballot (3/2/1) | 3-pick: floor vs 1 match | 2-pick | 1-pick | Verdict prediction |
|---|---|---|---|---|---|
| **F1 flat 1** (recommended) | 1/1/1 | 1 < 2 ✓ | 1 < 2 ✓ | 1 < 2 ✓ | D passes everywhere; C ties drop hard (round outcomes become {1,2,4} not {2,2,4}) |
| F2 ballot−1 | 2/1/0 | 2 = 2 ✗ (equal, not less) | 1 < 2 ✓ | 0 < 2 ✓ | fixes 2-pick, moves the compression to 3-pick full-deck; 1-pick whiff pays 0 (harsh endgame) |
| F3 keep, add flavor | 3/2/1 | unchanged | unchanged | unchanged | C/D stay FAIL; ship a non-scoring "LONE WOLF" badge/tally instead so the flavor survives without distorting the score |

If Joel wants the *scaling feel* without the wart, F1 + a cosmetic lone-wolf streak counter (F3's
badge) is the coherent combo.

### Change surface (for F1; F2 analogous)

1. **`groupthink-rules.js` `scoreRound`** — the one real change:
   `const consolation = Math.min(3, Math.max(1, roundPickCount));` → `const consolation = 1;`
   Update the comment above it (it currently explains ballot scaling) to explain *why* flat:
   a single match (2) must strictly beat the floor at every ballot size. Duo path untouched (duo has
   no consolation). Double-down interaction stays coherent: a missed double-down still zeroes a
   no-match round.
2. **`tools/groupthink-sim.mjs` `candidateScore`** — mirror it:
   `let score = matches.length ? matches.length * 2 : Math.min(3, Math.max(1, ownPicks.length));`
   → `... : 1;` and fix its comment. Same commit.
3. **Existing test updates** (these encode the old floor — update the *expected values*, do not delete
   the tests):
   - `tests/groupthink-rules.test.mjs`: "three-player scoring … zero-match consolation" expects
     `roundScores [2,2,3]` → `[2,2,1]`; "lone-wolf consolation scales with the ballot size" — rewrite
     to assert the flat floor at ballots 3/2/1 and rename accordingly; scan the file for other literal
     3s tied to consolation.
   - `tests/groupthink.spec.js`: "standard scoring rewards matches and gives the no-match safety net"
     asserts the lone wolf gets `+2` (2-pick floor) → becomes `+1`; keep the `LONE WOLF` label assert.
   - Grep for more: `grep -rn "consolation\|LONE WOLF\|lone wolf" tests/ *.js` and check
     `tests/groupthink-scale.spec.js`, `tests/groupthink-online.spec.js`,
     `tests/groupthink-lab.test.mjs` for hard-coded totals that include a floor payout.
4. **UI copy**: `grep -rn "LONE WOLF\|consolation\|safety net" groupthink.js index.html` — if any
   help/results text says "3 points", fix the copy. The results chip logic itself reads
   `roundScores`, so it needs no change.
5. **Cache-bust** `groupthink-rules.js` in `index.html` (and anywhere else it is versioned).
6. **No online migration needed**: scores are cumulative integers computed identically on every
   client from shared rules; an in-flight saved session just scores future rounds under the new rule.

### A/B protocol and acceptance

```
node tools/groupthink-score-health.mjs --sessions=1200 --seed=score-health-v1 \
  --output=test-results/score-health-floor-f1
```
Same seed as the task-2 baseline; the only delta is the rules change. Then compare `report.md` A–E
tables side by side and put the before/after in the summary to Joel.

Acceptance (F1 expected):
- **D = PASS** with zero consolation>honest flags at any ballot size.
- **C**: tie-for-first at 4–6p YOLO drops from ~0.42–0.53 toward ≤ 0.25 across correlations ≥ 0.5.
  If C still WARNs at corr 0.25, that residue is the luck-room property, not the floor — report it,
  don't chase it.
- **A/B/E**: no regressions (A gap should widen slightly since random/consolation lose floor points).
- Full test sweep: `node tests/groupthink-rules.test.mjs`, `node tests/groupthink-lab.test.mjs`,
  `node tests/groupthink-score-health.test.mjs`, then
  `npx playwright test tests/groupthink.spec.js tests/groupthink-online.spec.js tests/groupthink-scale.spec.js tests/prompt-studio.spec.js`
  (stop any preview server on 4173 first — Playwright reuses it and the single-threaded python server
  chokes under parallel workers).
- `node tools/groupthink-sim.mjs --smoke` still completes with a sane decision line (guards the
  mirrored floor in `candidateScore`).

---

## Task 4 — dashboard (optional polish, after 3)

Single self-contained HTML at repo root (`score-health-dashboard.html`), following the
`audit-v2-dashboard.html` pattern: no CDNs, inline CSS/JS, dark theme to match the game. Load
`test-results/groupthink-score-health/report.json` via `fetch` with a relative path (works under the
`.claude/launch.json` python server; show a friendly "run the tool first / serve from repo root"
message on fetch failure). Load the `dataviz` skill before writing any chart code. Views, in order of
value:
1. Verdict banner: headline sentence + five A–E chips (PASS green / WARN amber / FAIL red).
2. Heatmap grid, playerCount × correlation, cell-colored by a selectable metric (etaSq, tieRate,
   covMean, seatR) with YOLO / full-deck toggle — this is the money view; thresholds drawn as legend
   ticks.
3. Ballot-size bar pairs: honest vs consolation pts/round at 1/2/3-pick, with the "one match = 2"
   reference line.
4. Sortable per-cell table (the cells.csv columns) with FAIL/WARN rows pre-flagged.
Keep it read-only; no editing features.

---

## Task 5 — `--full` sweep + wiring

1. `node tools/groupthink-score-health.mjs --full --sessions=800 --output=test-results/score-health-full`
   (boards 30/36/40 → 3× cells; ~1–2 min). Acceptance: no dimension's verdict *flips* because of board
   size alone; if one does, that is a new finding — report it, don't tune it away.
2. Add to `package.json` scripts (check existing script style first):
   `"test:score-health": "node tests/groupthink-score-health.test.mjs"` and
   `"score-health": "node tools/groupthink-score-health.mjs"`. If a combined `test:rules`-style
   aggregate exists, append the score-health unit test to it.
3. One paragraph in `docs/SCORING_HEALTH_BRIEF.md` under a new "## Status" heading: tool shipped,
   date, where reports live, how to rerun. Keep it to five lines.

---

## Task 6 — threshold retuning (only on Joel's request)

All knobs live in the exported `THRESHOLDS` const — single source, already printed beside every
verdict in `report.md`. Procedure: change the value, note old → new and the reason as a comment beside
it, rerun, and state in the summary that the verdict change (if any) came from the threshold, not the
game. Never adjust a threshold and the rules in the same run. Likely candidates once Joel reads real
numbers: `tiePass` (0.25 may be strict for 3p where ties are structurally likelier) and
`validityGap` (0.5 pt/round was a prior, not a measurement).
