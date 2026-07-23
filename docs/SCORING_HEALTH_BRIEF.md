# Implementation brief — WHO? DO YOU THINK? scoring-health analysis

## Status (2026-07-22)

Tool **shipped**: `tools/groupthink-score-health.mjs` + `tests/groupthink-score-health.test.mjs`.
Run it with `npm run score:health` (unit tests: `npm run test:score-health`). Reports land in
`test-results/groupthink-score-health/` — note that dir is Playwright's output root, so **any**
`playwright test` run wipes it; just rerun `npm run score:health` to regenerate.

First run found the zero-match consolation floor (`min(3, ballotSize)`) meeting/beating a single match
(2 pts), which wrecked dimensions C (ties) and D (isolation-farming). **Fixed 2026-07-22**: the floor
is now a flat 1 (`scoreRound` in `groupthink-rules.js`, mirrored in `groupthink-sim.mjs`). Result:
**D FAIL→PASS**, C's median CoV healthy (0.21), no A/B/E regression.

**Thresholds calibrated 2026-07-22** (two principled exemptions in `THRESHOLDS`, both documented at
the const): low-correlation "luck rooms" (`luckRoomCorrelation` ≤ 0.5) are exempt from skill-separation
scoring (A, B) — a chaotic room *should* be lucky; and a high tie-for-first rate is accepted when the
score spread is healthy (`covHealthyForTies` ≥ 0.2, dimension C). Post-tune verdict: **A=PASS B=PASS
C=WARN D=PASS E=WARN** — "the score broadly works." C's WARN is thin spread in maximally-chaotic
rooms; E's WARN is oracle dominance (0.90) in big high-agreement games. Both left honest, not masked.

**Dashboard shipped:** `score-health-dashboard.html` (repo root) — self-contained, dark-themed, reads
`report.json`. Verdict chips, a player×correlation metric heatmap (selectable metric, YOLO/full toggle),
the ballot-size floor-safety bars, and a sortable cell table. Serve from repo root (`npm run
serve:test` or the game's dev server) and open `/score-health-dashboard.html`.

---

**Original brief (for Fable, now implemented):**

**Mode:** single context, no subagents, no worktrees. **Runtime:** Node (already
available: `node tools/groupthink-sim.mjs --smoke` runs today).

You are building a **measurement tool**, not changing the game. Do not edit `groupthink-rules.js`,
`groupthink.js`, or any deck/UI file. The pure rules in `groupthink-rules.js` are the single source
of truth — your job is to drive them thousands of times and report whether the *score* is meaningful.

---

## 1. The question, made concrete

The game's promise is "match the room." A player scores by picking faces that at least `support`
other players also picked. The scoring **works** if, and only if, all five of these hold. Each is a
measurable claim, not a vibe:

| # | Health property | Plain-English question | It fails when… |
|---|---|---|---|
| **A** | **Validity** | Does trying to match the room beat picking at random? | random ≈ consensus in points |
| **B** | **Signal vs luck** | Does skill decide the winner, or does the dice? | strategy explains almost none of the score |
| **C** | **Dynamic range** | Does the final score separate the table without a blowout? | everyone ties, or one runaway every game |
| **D** | **Invariance** | Is it fair across table size, board size, YOLO, and the new 1/2/3-pick ballots? | consolation-farming beats matching at some ballot size, or seat order predicts score |
| **E** | **No solved strategy** | Is there a single dominant line that makes the score boring? | one strategy wins almost every session |

Your deliverable is a report that returns a **PASS / WARN / FAIL verdict on each of A–E**, backed by
numbers with confidence intervals, plus one headline sentence: *does the score work?*

---

## 2. What already exists — read it first

`tools/groupthink-sim.mjs` already contains, and you should **reuse the exact approach** of:

- `createRng(seed)` — deterministic xorshift RNG with a `.normal()` gaussian. Use this. **Never** use
  `Math.random()` or `Date.now()` — the repo forbids them (they break reproducibility) and they throw
  in some contexts.
- The **latent-truth model**: each round draws a hidden `latent[face] = rng.normal()` — the "true"
  room-consensus signal. Each player sees a noisy copy `perception[seat][face] = correlation*latent +
  sqrt(1-correlation²)*noise`. High `correlation` = players mostly agree; low = chaos. This is the
  right model; keep it.
- The **strategy archetypes** (`simulateSession`): `consensus` ranks by the shared latent (an oracle
  upper bound), `honest` ranks by its own perception (a skilled human proxy), `random` ranks by pure
  noise, `consolation` ranks the latent *ascending* (deliberately anti-consensus, farming the floor).
- Scoring goes through `Rules.scoreRound(...)`. Never re-implement scoring — call the real function.

**The staleness you must fix in your model (not in the game):** the existing sim picks ballot size
with `Rules.pickCountForBoard(board.length, yolo)` (line ~170). The live game now uses
`Rules.pickCountFor({ boardCount, playerCount, yolo, promptPicks })`, which also narrows the ballot as
the *crowd* grows (3 picks for a duo → 1 for 7+). Your tool **must** call `pickCountFor` so the
analysis reflects the game people actually play. This is also exactly what dimension **D** stress-tests.

Do **not** refactor `groupthink-sim.mjs` to share code — it is a working, load-bearing balance tool.
Write a **new standalone script** that imports `groupthink-rules.js` and re-implements only the small
per-round loop you need. Copying ~60 lines is safer here than surgery on 800.

---

## 3. Experimental design — a fixed panel, so strategies are directly comparable

The existing harness scatters strategies unevenly across seats, which is fine for balance but noisy for
scoring questions. For this tool, seat a **fixed panel** so every session compares the same archetypes
against the *same* faces:

- Default panel for an N-seat table: fill seats round-robin from `["consensus", "honest", "honest",
  "random", "consolation"]` (so a 3-seat table is consensus/honest/honest, a 5-seat table is one of
  each, larger tables repeat the cycle). Every seat in a session sees the identical latent draw, so any
  score difference between seats is **strategy, not luck** — that is the whole point.
- **Add a pure-luck control:** run a parallel "mirror" panel where *every* seat plays `consensus`.
  Their score spread is the **noise floor** — the score two identical players end on just from
  independent perception noise and tie-breaks. Signal is only real if the real panel's between-strategy
  spread clears this floor.

Record, per session: each seat's **final total score**, its strategy, its seat index, and which seat
finished first. Aggregate across many seeded sessions per cell (reuse the bootstrap-CI helper pattern
already in `groupthink-sim.mjs`).

**Parameter axes** (the "cells" to sweep — keep it smaller than the balance matrix, this is focused):

- `playerCount ∈ [2, 3, 4, 5, 6, 7, 9, 12]` — must include the crowd-ramp breakpoints (2→3, 6→7).
- `correlation ∈ [0.25, 0.5, 0.75, 0.9]` — from a chaotic room to a room that mostly agrees.
- `yolo ∈ [true, false]`.
- `boardSize ∈ [30]` for the core run (add 36/40 only in a `--full` mode).

---

## 4. The five dimensions — exact metrics and thresholds

Compute these per cell, then roll up. Thresholds are **proposed defaults to report against**, not
sacred law — surface the number next to the verdict so Joel can retune. When a metric needs a CI, use
the bootstrap approach already in the codebase.

### A — Validity (does skill beat noise?)
- **Metric:** mean points-per-round for each strategy, with 95% CIs.
- **PASS:** ordering `consensus ≥ honest > random`, AND the consensus−random gap ≥ **0.5 pt/round**
  with non-overlapping CIs, in ≥ **80%** of cells.
- **WARN:** ordering holds but the gap or CI-separation fails in 20–50% of cells.
- **FAIL:** random ties or beats honest anywhere it shouldn't, or ordering inverts.

### B — Signal vs luck (does skill decide the winner?)
- **Metric 1 — variance explained (η²):** treat each seat's final score as an observation labelled by
  strategy. `η² = between-strategy variance / total variance`. This is the fraction of score spread
  attributable to strategy rather than luck.
- **Metric 2 — top-finish rate:** P(the `consensus` seat finishes strictly first). Chance =
  `1/playerCount`.
- **PASS:** η² ≥ **0.15**, AND consensus top-finish rate ≥ **1.5 × chance** AND ≤ **0.90** (skilled
  play should matter but not be a guarantee — a party game needs upsets).
- **FAIL:** η² < 0.05 (score is essentially a dice roll) or consensus top-finish ≤ chance.

### C — Dynamic range (does the score separate the table?)
- **Metrics:** coefficient of variation of final scores `CoV = stdev/mean`; **top-tie rate** = P(≥2
  seats tie for first); **runaway rate** (reuse the existing definition: leader beats 2nd by ≥
  max(6, 0.5×mean)).
- **PASS:** CoV ∈ **[0.15, 0.60]**, top-tie rate ≤ **0.25** for 3–6 players, runaway rate ≤ **0.10**.
- **FAIL:** CoV < 0.08 (scores collapse together) or top-tie rate > 0.40 (winner is a coin-flip) or
  runaway rate > 0.25.

### D — Invariance (is it fair across structure?) — **the most important one for the new mechanic**
- **Metric 1 — consolation never wins:** in **every** cell and **every** ballot size (3, 2, and the new
  1-pick crowd rounds), `consolation` points-per-round must be ≤ `honest` points-per-round. Break this
  out **by resolved ballot size**, because the 1-pick crowd rounds are new and untested for score
  fairness. The consolation floor is `min(3, max(1, ballotSize))`; a 1-pick round's floor is 1, a
  match is worth 2 — verify the floor never overtakes a match in aggregate.
- **Metric 2 — no seat-order bias:** Pearson correlation between seat index and final score across
  sessions; `|r|` must be ≤ **0.05**. (Picks are simultaneous, so any seat effect is a bug in fairness.)
- **Metric 3 — cross-table-size stability:** the A/B verdicts should not flip as `playerCount` crosses
  the crowd-ramp breakpoints. Report η² and consensus-advantage as a function of playerCount so a cliff
  at 2→3 or 6→7 is visible.
- **PASS:** all three hold in ≥ 95% of cells. **FAIL:** consolation ≥ honest anywhere, or `|seat r|` >
  0.15 anywhere, or a verdict flips across a breakpoint.

### E — No solved strategy
- **Metric:** for each cell, the maximum over strategies of P(that strategy wins the session).
- **PASS:** ≤ **0.85** in every cell. **FAIL:** any strategy > 0.95 in a realistic (correlation ≤ 0.9)
  cell — the game is solved and the score stops being interesting.

---

## 5. Deliverables

1. **`tools/groupthink-score-health.mjs`** — the analysis script.
   - CLI: `node tools/groupthink-score-health.mjs [--smoke] [--full] [--sessions=N]
     [--seed=STR] [--output=DIR]`. `--smoke` = a few hundred sessions/cell for a fast sanity run;
     default a few thousand; `--full` adds board sizes 36/40. Mirror the flag style already in
     `groupthink-sim.mjs`.
   - Deterministic: seeded RNG only. Same seed ⇒ identical report.
   - Writes to `test-results/groupthink-score-health/`:
     - `report.json` — every cell's raw metrics + the rolled-up A–E verdicts + CIs.
     - `report.md` — **the human read.** Lead with a headline verdict sentence, then a five-row
       PASS/WARN/FAIL table (dimension, verdict, the deciding number, one-line interpretation), then a
       per-dimension section with the by-cell / by-playerCount / by-ballot-size breakdowns. Write the
       interpretation lines in plain English — this is what Joel actually reads.
     - `cells.csv` — one row per cell for spreadsheet/plotting.
   - **Exit code:** non-zero if any dimension is FAIL, so it can gate CI later. Print the headline
     verdict and the output path to stdout on the way out.

2. **`tests/groupthink-score-health.test.mjs`** — a small `node:test` file (the repo's convention)
   that: (a) unit-tests your metric helpers (η² decomposition, CoV, rank/top-finish) on hand-built
   inputs with known answers; (b) runs a tiny `--smoke`-scale simulation and asserts the two invariants
   that must never break — `consensus ≥ random` in points, and `consolation ≤ honest` at every ballot
   size. This guards the *scoring*, not just your code.

3. A short **`## How to read this`** section at the top of `report.md`: what each verdict means and
   what to do if one is WARN/FAIL (e.g., FAIL on D at 1-pick ⇒ the crowd ramp needs the consolation
   floor lowered for 1-pick rounds).

---

## 6. Faithfulness rules (do not drift from the real game)

- All scoring MUST go through `Rules.scoreRound`. All ballot sizing MUST go through
  `Rules.pickCountFor`. All endgame resolution (if you model full sessions) MUST use the real
  `resolveSave` / `resolveThreeFaceCut` / `resolveFinalShowdown`. If you re-implement any of these, the
  analysis is measuring a fiction.
- Duo (`playerCount === 2`) scores as a shared sync total, not per-seat — handle it the way
  `scoreRound` does (`duo: true`) and interpret its "separation" metrics accordingly (a duo is
  cooperative; C/E apply differently — say so in the report rather than emitting a nonsense verdict).
- Keep the whole run under ~60s for the default (non-`--full`) mode on a laptop, so Joel will actually
  run it. Use `worker_threads` like the existing harness only if you need to; a single-threaded few-
  thousand-session run is fine and simpler.

---

## 7. Definition of done

- `node tools/groupthink-score-health.mjs --smoke` runs clean and writes all three files.
- `report.md` opens with a one-sentence verdict and a five-row A–E table a non-engineer can read.
- `node tests/groupthink-score-health.test.mjs` passes.
- The tool imports and exercises `pickCountFor` (proving it reflects the *current* crowd-scaled game),
  and dimension D reports results **broken out by resolved ballot size (1/2/3)**.
- No file under game source (`groupthink*.js`, decks, UI) is modified.

---

## 8. Guardrails

- **No subagents, no worktrees, no parallel agents.** One script, one context.
- **Do not change game rules or "fix" a bad verdict by editing the game.** If the score is broken, the
  report should *say so*. Tuning is a separate decision for Joel — surface the finding, stop there.
- If a threshold in §4 feels wrong once you see real numbers, keep the default, report the actual
  value beside it, and note your concern in `report.md`. Don't silently move the goalposts.
