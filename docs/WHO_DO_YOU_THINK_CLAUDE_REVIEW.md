# WHO? DO YOU THINK? — Claude Review Brief

## Why this document exists

This repository began as **WHO? IS IT?**, a highly expanded Guess Who-style game. A second game has now been appended to the same face, board, setup, local-play and online-play engine:

**WHO? DO YOU THINK?** is a social consensus game. Every player sees the same board and privately chooses the faces they think best fit a judgement prompt. The reveal is funny because it exposes where the room agrees, where somebody is completely alone, and what that says about the faces and the players.

Your job is to review this second game as a complete experience: understand its flow, identify confusing or weak moments, and recommend concrete improvements. Do not assume it is merely another mystery effect or a variant of classic WHO? IS IT? It is a separate ruleset sharing the same engine.

## Product structure

The anthology title is **WHO? KNOWS?**

From the title flow, players choose:

1. **WHO? IS IT?** — the original deduction game.
2. **WHO? DO YOU THINK?** — the appended consensus/elimination game described here.

The shared engine supplies:

- The generated face deck and card rendering.
- Responsive desktop, tablet and phone layouts.
- Local pass-the-device play.
- Online rooms, seats, host state, refresh/resume and host takeover.
- Shared setup, persistence, sound and general UI infrastructure.

WHO? DO YOU THINK? deliberately does **not** use classic mystery effects such as Habbo, Heads Only or MURDER! LIVE! Its comedy depends on a clean, readable wall of ordinary face cards. The code actively strips mystery state from this ruleset.

## Current game flow

### Setup

- Choose WHO? DO YOU THINK?
- Choose local or online play.
- Add players.
- Choose whether **YOLO Mode** is on.
- Prompt safety/PG settings still apply.
- Two players use a cooperative “sync” score; three or more players have individual scores.

### A normal round

1. Every player receives the same prompt.
2. Every player privately chooses the required number of faces from the same board.
3. Local players pass the device; online ballots remain private until the reveal.
4. Everyone locks in.
5. All choices are revealed together.
6. Matches and scores are shown.

The number of picks shrinks with the board:

- 13 or more faces: pick 3.
- 6–12 faces: pick 2.
- 2–5 faces: pick 1.

For fewer than nine active players, a face needs support from at least two players to count as a match. From nine players upward, it needs three.

### Scoring

For three or more players:

- Each matching face is worth 2 points.
- A player with zero matches receives a 3-point consolation score.
- Skipped/disconnected players receive no score.

For exactly two players:

- The pair receives one shared sync score.
- Each shared face is worth 2 sync points.
- There is no competitive consolation strategy.

A double-down mechanic exists in the rules/lab as a gated candidate but is currently disabled in production.

## YOLO Mode

YOLO is the elimination version. Without YOLO, the full deck returns for eight scored rounds and there is no save ceremony.

With YOLO:

1. The round reveal identifies every nominated face.
2. In ordinary rounds, players privately vote to save one nominated face “from the saw.”
3. A clear save winner survives; the other nominated faces are removed.
4. A tied or unsupported save can remove every nominated face.
5. Removed faces disappear from the shared board for all future rounds.

This creates an increasingly difficult communal board rather than every player maintaining a separate Guess Who board.

### Special three-face transition

When exactly three faces remain, there is **no save vote**.

- If the room has one clear, sufficiently supported most-picked face, that face is cut automatically.
- The board becomes two faces and the final face-off begins.
- If the top choice is tied, nobody is cut. All three survive and the game asks a new prompt.

This avoids the redundant experience of unanimously nominating one of three faces and then being asked whether to save that same face.

### Final two

With two cards left, players pick one card each. This is intended to feel like the final test of group synergy. The current rules then use the survivor decision to determine whether one face remains or whether disagreement leaves no survivor.

This final-two experience deserves particularly close review. Assess whether:

- The prompt and survivor choice feel like one coherent climax or two repetitive choices.
- Players understand whether their first choice is a nomination, condemnation or endorsement.
- Agreement and disagreement produce emotionally satisfying outcomes.
- An empty finale is funny, frustrating or both.

## Important implementation files

- `groupthink.js` — live browser flow, phases, local handoffs, results, saves, finale and Groupthink network messages.
- `groupthink-rules.js` — pure production rules shared by the browser, tests and simulator.
- `groupthink-data.js` — judgement prompts.
- `groupthink.css` — ruleset-specific presentation.
- `groupthink-lab.js` — optional anonymous host-side lab capture.
- `tools/groupthink-sim.mjs` — deterministic strategy and balance simulation.
- `tests/groupthink.spec.js` — local interaction flow.
- `tests/groupthink-online.spec.js` — online state and fault handling.
- `tests/groupthink-scale.spec.js` — player-count and board-size coverage.
- `tests/groupthink-isolation.spec.js` — proof that mystery effects cannot leak into this ruleset.
- `app.js`, `net.js`, `modes.js` — shared engine integration points. Changes here can break classic WHO? IS IT?

## Known design tensions to assess

1. **What does picking mean?** The prompt asks players to choose a face fitting a description, but YOLO later frames chosen faces as being sent to the saw. Check whether that semantic shift is immediately understandable.
2. **Save ceremony frequency.** Saving adds drama and agency but may make every round feel mechanically repetitive.
3. **Zero-match consolation.** It protects weaker players but may reward deliberately avoiding consensus.
4. **Two-player viability.** It works as a cooperative sync game, but may have less social unpredictability than larger groups.
5. **Late-game pacing.** Smaller pick counts improve readability, but repeated ties at three faces could stall.
6. **Final-two clarity.** The ending should feel like a climax, not another ordinary round plus another vote.
7. **Player-count scaling.** Two, three, four and twelve-player rooms may need different pacing even if they share rules.
8. **Prompt quality.** Prompts must be instantly readable, visually judgeable and funny without all feeling like the same accusation.
9. **Online waiting.** Private sequential actions are natural locally but can produce dead time online.
10. **Classic-game safety.** Recommendations must preserve WHO? IS IT? and keep Groupthink-specific state isolated.

## Review assignment for Claude

Read the implementation files above and play or trace at least these journeys:

1. Local YOLO with two players, including the three-face transition and final two.
2. Local YOLO with four players.
3. Local full-deck mode with YOLO off.
4. Online Groupthink through selection, reveal, save, next round and refresh.
5. Classic WHO? IS IT? after playing Groupthink, to detect leaked state or UI.

Then produce:

### 1. Flow map

Describe every player-visible phase from anthology picker to final receipt. Mark:

- What the player is trying to do.
- What information is private or public.
- What action advances the game.
- What could confuse or bore the room.

### 2. Ranked findings

Give findings in priority order:

- **Critical:** breaks the game, loses state or makes the rules impossible to understand.
- **High:** materially harms pacing, comedy or the ending.
- **Medium:** recurring friction or weak presentation.
- **Low:** polish.

For each finding, cite the relevant file/function or visible screen and explain the smallest credible fix.

### 3. Game-design assessment

Specifically evaluate:

- Whether the core “match the room” incentive is strong enough.
- Whether consolation scoring invites undesirable strategy.
- Whether the save phase improves or dilutes the central idea.
- Whether YOLO and full-deck mode feel like meaningfully different products.
- Whether two-player sync is worth keeping and how it should differ.
- Whether the three-face and final-two rules create a satisfying climax.
- Whether a single session has a clear arc and appropriate length.

### 4. Recommendations

Separate recommendations into:

- **Guaranteed improvements:** low-risk changes strongly supported by the current design.
- **Experiments:** promising but requiring playtesting.
- **Do not add:** features that increase complexity without strengthening the central joke.

Prefer simplification. Do not recommend importing classic mystery effects merely because the engine supports them.

### 5. Validation plan

For each recommended gameplay change, state:

- The hypothesis.
- The exact scenario/player counts to test.
- The observable success/failure signal.
- Which automated tests should be added or changed.
- What still requires human playtesting because automation cannot judge comedy or clarity.

## Constraints

- Keep the shared face engine reusable.
- Do not break classic WHO? IS IT?
- Groupthink must continue to use plain, readable cards.
- Local and online rules should remain the same wherever practical.
- Avoid adding mechanics unless they make the consensus reveal, elimination arc or finale substantially better.
- Treat simulator results as balance evidence, not proof that humans will understand or enjoy a rule.

