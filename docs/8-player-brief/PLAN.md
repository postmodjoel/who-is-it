# 8-Player Team Mode — Implementation Brief

Audience: the implementing agent (Opus). This brief was verified line-by-line against the
post-`codex/refactor-modes-split` codebase on 2026-07-04. Every file/line reference below was
checked against the live code, not guessed.

## The core design (do not deviate)

The game engine stays a **two-seat game forever**. `state.players.length === 2` always — the two
entries are **sides/teams**, not humans. A new `state.roster` (2–8 humans) maps people onto the two
sides. All mystery modes, breeding, hints, undo, secrets, eliminations, and the sync protocol keep
working untouched because they only ever see two seats. 2-player games must behave EXACTLY as
today (same salt → same deal → same wheel).

Vocabulary used below: **side** = 0 or 1 (a team / a `state.players` entry). **roster index** = a
human (0..playerCount-1). `state.mySeat` keeps its current meaning but is now "my side".

## Verified baseline (read these before coding)

- Load order in `index.html`: game-data → face-generator → faces-hair → sound → net → breeding →
  editor → opponent-sim → modes → app. Classic scripts, no build. Top-level `function` decls and
  top-level `const/let` in an earlier file are visible to later files; functions in earlier files
  may reference `state`/`els` (declared in `app.js`) because those resolve at call time.
- `state` shape: `app.js:234`. `els`: `app.js:262`.
- `newGame()`: `app.js` ~380–459. Players built at `app.js:398`
  (`state.players = [makePlayer(0, takenSecrets), makePlayer(1, takenSecrets)]`), hints/undo reset
  to two arrays at `app.js:401-402`. Plain first round early-returns at `app.js:431` **before**
  `scheduleSave()` at 458 (pre-existing quirk, see "Save" below).
- `makePlayer(index, taken)`: `app.js:461` — deterministic secret from
  `stableHash(`${state.gameSalt}:secret:${index}`)`; `pname` comes from `state.lobby[index]`.
- Seat UI: `renderRoom()` `app.js:594` — online branch shows room code panel; local branch renders
  a seat pill from `state.players.map(...)` with a ⇄ swap that sets `state.currentPlayer`.
- Round end: `endRound()` `app.js:1321` → `netSend("endround")` + `showRoundReveal(() => newGame())`.
  `showRoundReveal()` `app.js:1299` hardcodes `state.players[0]/[1]` (fine — they're sides now; only
  the labels need to become team labels).
- Title screen: `showTitleScreen()` `app.js:1401`. Local start: `startLocalGame()` `app.js:1460`.
  Online: `startOnlineGame()` `app.js:1464`, `joinRoom()` `app.js:1475`, `showLobby()` `app.js:1486`,
  `updateLobby()` `app.js:1513` (hardcoded `[0, 1]` slots and a `both = names[0] && names[1]` gate).
- Save/resume: `GAME_SAVE_KEY = "whoisit_game_v1"` `app.js:1203`; `saveGameState()` `app.js:1206`;
  `resumeGame()` `app.js:1228`; 12 `scheduleSave()` call sites across app/modes/breeding/net.
- Net: `net.js`. Transport is BroadcastChannel per room (`whoisit-room-<code>`) on localhost, or a
  WebSocket relay when `?relay=` / deployed. `netSend()` (`net.js:69`) stamps every message with
  `seat: state.mySeat || 0`. `handleNetMsg()` (`net.js:82`) handles hello/sync/start/elim/baby/tug/
  manor-move/mode/endround/editchar/sfx/music.
- **BroadcastChannel does NOT echo to the sender.** The "our own echo" guard in `elim`
  (`net.js:141`) only matters on the WS relay path. Do not rely on seat equality for echo
  filtering once teammates share a side — use a `clientId`.
- Elimination send: `app.js:751` `netSend("elim", { id, down })`.
- Opponent sim (`opponent-sim.js`): **dormant** — `startOpponentSim()` is never called anywhere
  (verified on both this branch and main). Only `stopOpponentSim()` is called (`app.js:428`).
  Leave it dormant; just make `renderOpponentPanel()` label sides not seats. Do NOT build
  "AI fills empty sides" logic — out of scope.
- The `* 2.js` files (`breeding 2.js`, `editor 2.js`, `modes 2.js`, `net 2.js`, `opponent-sim 2.js`)
  are untracked Finder/iCloud duplicates and are NOT loaded by index.html. **Never edit them.**
  Suggest deletion to the user at the end; don't delete unprompted.
- Cache-busting: bump `?v=` on ALL script tags in `index.html` when you change any js file.

## Implementation steps (in order)

### 1. Roster model + helpers (app.js)

```
const SIDE_COUNT = 2, MIN_PLAYERS = 2, MAX_PLAYERS = 8;
state.playerCount = 2;
state.roster = [];        // [{ name, side }] — side filled in by assignRosterTeams
state.clientId = "";      // online only: `c-${Date.now()}-${rand}` minted once per tab session
state.myRosterIndex = 0;  // online only
```

Helpers (top-level `function` decls so every file sees them):
- `normalizeRoster(count, names)` → array of `{ name }` with fallbacks ("Player 3").
- `assignRosterTeams()` — deterministic shuffle: sort roster indexes by
  `stableHash(`${state.gameSalt}:team:${i}:${state.roster[i].name}`)`, first half → side 0, rest →
  side 1; for odd counts put the extra member on the side picked by
  `stableHash(`${state.gameSalt}:teambig`) % 2`. Write `side` back onto each roster entry.
  **All clients must hold the roster in the same order** (host-authoritative, see step 3) or this
  diverges. Call it in `newGame()` right after `state.gameSalt` is final and before `makePlayer`
  (so `pname`/labels can use it). Re-runs every round → teams rotate per round. No `Math.random()`
  anywhere in this path (online determinism rule).
- `teamMembers(side)` → roster entries on that side. `teamLabel(side)` → for 2p, the existing
  name/A/B behavior; for 3+, `"TEAM A"`/`"TEAM B"` (or the members' names joined).
- `sideFromMsg(msg)` → `msg.seat === 0 ? 0 : 1` centralized (replace the ternaries at
  `net.js:100/118/123/140` where they mean "side"; the hello/sync ones change more, see step 3).

2-player guarantee: when `state.playerCount === 2` and roster names are the defaults, everything
below must render/behave byte-identically to today. Easiest guard: treat
`state.roster.length <= 2` as "classic mode" wherever the new UI would differ.

### 2. Title screen (app.js `showTitleScreen`)

- Add a player-count control (2–8) in the main step. Selecting LOCAL with count > 2 shows a name
  step (editable inputs, prefilled "Player N") before dealing.
- `startLocalGame(count, names)`: build `state.roster = normalizeRoster(...)`,
  `state.playerCount = count`, keep `mySeat = 0`, then `newGame(undefined, { first: true })`.
  With count = 2 and no names entered, keep today's behavior exactly (empty roster ≙ classic).

### 3. Online lobby + protocol (app.js + net.js)

Protocol additions — every message gains `clientId` (in `netSend`), and roster-bearing messages
gain `playerCount` + `roster`:

- `hello`: `{ pname, clientId }`. Host (rosterIndex 0) assigns the newcomer the lowest open roster
  slot and broadcasts `lobby: { playerCount, roster: [{name, clientId}] }`. Every client renders
  the lobby from that broadcast; a joiner learns `state.myRosterIndex` by finding its `clientId`.
  Replace `state.seenPeers` seat-keying (`net.js:106-107`) with clientId-keying. Non-host clients
  ignore other clients' hellos (host is the single roster authority).
- `start` / `sync`: add `playerCount` + `roster` (names + clientIds). Receiver: restore roster,
  `assignRosterTeams()` runs inside `newGame` from the salt, then
  `state.mySeat = state.roster[state.myRosterIndex].side`. This replaces the two-client seat-collision
  dance at `net.js:118-125` — a rejoining client re-sends `hello`, host re-syncs with the roster,
  and the client finds itself by clientId (fall back: unknown clientId rejoins as spectator of
  side 1? No — assign to the emptiest side and add to roster, host broadcasts updated lobby).
- `elim`: keep `seat` (= side). New rules in the handler (`net.js:138`):
  - `if (msg.clientId === state.clientId) return;` (echo guard for the relay path)
  - Apply to `state.players[side]` even when `side === state.mySeat` (a TEAMMATE crossed it off) —
    and in that case also `renderBoard()` + `scheduleSave()`, since my own visible board changed.
  - Opponent feed (`state.opponentLog`) only records the OTHER side's moves.
- `endround`: unchanged (any client may end; the ender's `newGame` broadcasts `start`, dealer's
  salt wins — this already works, keep it).
- Lobby UI (`showLobby`/`updateLobby`): host picks player count (2–8); render `playerCount` slots
  from the broadcast roster; START enables when ≥2 humans present (host decides — empty slots just
  shrink `playerCount` on START, host re-normalizes and includes the final roster in `start`).

### 4. newGame() changes (app.js ~390)

- After salt is known: `assignRosterTeams()` (no-op for classic 2p with empty roster).
- Keep `state.players = [makePlayer(0, ...), makePlayer(1, ...)]`, hints/undo `[[], []]` — untouched.
- `makePlayer`'s `pname` should come from `teamLabel(index)` when roster > 2.
- For roster > 2, after the deal (and before/instead of nothing) show the team overlay (step 5),
  then let the existing plain-round/wheel flow continue. Skip the overlay when `opts.resume`.

### 5. Team-reveal overlay (new, app.js + styles.css)

Full-screen overlay in the visual language of `showMysteryAnnouncement`/`.round-reveal` (see
`styles.css` for `.round-reveal`, `.rr-*`): "TEAM A" vs "TEAM B", member names, small derived
avatars (e.g. `window.faceGenerator.renderPortrait(stableHash(name), ...)` or just initial chips —
avatars are decoration, NOT secrets; per-side secrets stay in `state.players[side].secretId`).
Auto-dismiss ~3s, tap to skip. Shown: local 3+ at every fresh deal; online 3+ on `start`.
Never on resume, never for 2p.

### 6. Generalize the 2-seat UI (app.js)

- `renderRoom()` local branch: for roster > 2 render two team halves (team label + member count or
  names); ⇄ still just flips `state.currentPlayer` 0↔1 ("hand the device to the other team").
  Online branch: keep room panel; show my team + teammates ("🟢 TEAM A — you, Sam, Riya").
- `showRoundReveal()`: labels become `teamLabel(...)` ("YOUR TEAM WAS" / "THEY WERE") for 3+.
- `renderOpponentPanel()` (`opponent-sim.js:26`): `seatLabel` → `teamLabel(otherIdx)`.
- Grep for remaining literal `players[0]`/`players[1]` display code and route labels through the
  helpers. The MECHANICS (secrets, eliminations, mystery per-seat state) stay side-indexed — do not
  touch modes.js/breeding.js beyond labels; they are already side-agnostic (verified: zero `mySeat`
  references in modes.js/breeding.js/editor.js).

### 7. Save / resume (app.js:1203-1298)

- Keep `v: 1`. Add `playerCount`, `roster` (names + sides + clientIds), `clientId`,
  `myRosterIndex` to the payload in `saveGameState()`.
- `resumeGame()`: restore `state.playerCount`/`state.roster`/`state.myRosterIndex` BEFORE
  `newGame(saved.salt, { resume: true, remote: true })` (assignRosterTeams inside newGame re-derives
  the same sides from the same salt+roster — verify it matches the saved sides).
- Known pre-existing quirk: a plain first round doesn't save until the first
  `scheduleSave()`-triggering action (`app.js:431` returns before line 458). Add one
  `scheduleSave()` after the deal in `startLocalGame` for roster games so a 5p setup survives an
  immediate refresh. Do not otherwise restructure `newGame`'s returns.

## Hard constraints

- No `Math.random()` / `Date.now()` in anything that must agree across clients (team assignment,
  secrets, wheel). `clientId` minting and log timestamps are fine.
- `state.players.length === 2` invariant — grep for any accidental push.
- Do not rename existing message types or drop existing fields; old fields keep working (a 2p
  game between this build and itself must work; cross-version compat is NOT required).
- Do not touch the `* 2.js` duplicates. Do not edit `face-generator.js`/`faces-hair.js`/`game-data.js`.
- Bump `?v=` cache version in `index.html`.

## Verification (required, in this order)

1. `node --check` on every edited js file (bundled node if needed:
   `/Users/joel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node`).
2. Serve: `python3 -m http.server 8080` (or the `.claude/launch.json` `who-is-that` config on 4173).
3. **Local 2p regression**: start a local 2-player game — must look and behave exactly like before
   (seat pill "YOU/B", no team overlay, first round plain, wheel on round 2). Zero console errors.
4. **Local 5p**: title screen → 5 players → names → team overlay shows 3v2 → seat pill shows teams →
   end round → teams reshuffle deterministically → refresh mid-round → roster + teams + crossings
   restore.
5. **Online multi-tab — use TWO (then THREE) REAL TABS in the same browser/profile at the same
   `http://127.0.0.1:<port>` origin.** BroadcastChannel only spans same-origin tabs in one browser
   profile — separate isolated browser contexts/incognito will NOT sync. Drive the tabs with the
   Chrome extension MCP tools (`tabs_create_mcp` + `navigate` + `javascript_tool`/`read_page`), not
   the single-tab preview server. Test:
   - Tab1 hosts (picks 4 players), Tab2+Tab3 join → lobby shows all names on every tab.
   - START → all tabs deal the same board, same teams, team overlay on all.
   - Teammate elim: a Tab2 crossing appears on its TEAMMATE's board (same side, different client),
     and in the opposing team's feed.
   - Opposing elim syncs to the opponent panel only.
   - Wheel round: same mode lands on every tab.
   - Refresh Tab2 mid-round → resumes same round, same roster slot, same side, still syncs.
   - endround from a non-host tab → all tabs reveal + redeal together.
6. Console assertions on every tab:
   `state.players.length === 2 && state.roster.length === state.playerCount &&
   state.roster.filter(r => r.side === 0).length - state.roster.filter(r => r.side === 1).length
   |> abs <= 1` (write it as real JS), and salt equality across tabs.
7. Re-run the modes smoke: type `debug`, trigger ~5 modes (fertility, habbo, linkedin, ps1-mode,
   knockoff-manor) in a 5p local game — board renders, no errors, teardown clean.
