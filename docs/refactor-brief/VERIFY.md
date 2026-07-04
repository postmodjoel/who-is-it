# Refactor Verification Checklist

Use this after each extraction and again after the final `modes.js` registry pass.

## Syntax

Use the bundled Node runtime if `node` is not on PATH:

```sh
/Users/joel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check game-data.js
/Users/joel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check face-generator.js
/Users/joel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check faces-hair.js
/Users/joel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check sound.js
/Users/joel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check net.js
/Users/joel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check breeding.js
/Users/joel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check editor.js
/Users/joel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check opponent-sim.js
/Users/joel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check modes.js
/Users/joel/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check app.js
```

Only run checks for files that exist at that checkpoint.

## Boot

Serve locally so two-tab online tests work cleanly:

```sh
python3 -m http.server 8080
```

Open `http://127.0.0.1:8080/index.html`.

Boot expectations:

- No console errors.
- Title screen appears.
- Local game starts.
- First fresh round is plain Guess Who with no wheel.
- Ending the first round starts a wheel round if mystery effects are enabled.
- Refresh resumes the current round.

## Debug Picker

- Type `debug`.
- `#debugEffectPicker` appears.
- Trigger each visible mode from the picker.
- After each trigger:
  - board renders
  - secret card renders
  - question prompt changes to the mode deck when a deck exists
  - no console errors

PG filter:

```js
[...document.querySelectorAll("#debugEffectPicker option")].map((o) => o.value).filter(Boolean)
```

With debug PG on, it should match:

```js
["prop-panic","family-tree-disaster","emotional-audit","witness-protection-filter","role-reveal","face-first","ps1-mode","yugioh","pixall","linkedin","sims","heads-only","habbo","astrology","pantone"]
```

Order may follow registry order, but the set must be exactly the same as `PG_SAFE_MODES`.

## Wheel

Console helper:

```js
state.settings.mystery = true;
state.settings.pg = false;
localStorage.removeItem("whoisit_wheel_bag_v1");
Array.from({ length: 20 }, (_, i) => {
  state.gameSalt = `verify-wheel-${i}`;
  return wheelTargetFromBag();
});
```

Then repeat with `state.settings.pg = true`; every returned non-null id must be in `PG_SAFE_MODES`.

Check WOKE gating:

```js
localStorage.setItem("whoisit_wheel_bag_v1", JSON.stringify(["gay-frogged","orgy","drugs","disease","fertility","work"]));
state.gameSalt = "verify-woke-gate";
wheelTargetFromBag() !== "woke";
```

Then include `disguise`; WOKE may become eligible if earlier tiers are exhausted.

## Teardown

After triggering a mode, trigger a different mode and inspect for leftovers.

PS1:

```js
document.querySelectorAll(".ps1-character-stage").length === 0
document.body.dataset.characterRenderer
```

LinkedIn:

```js
document.getElementById("linkedinTicker") === null
```

Habbo:

```js
["habboCam","habboChat","voidPanel","deVoidBtn"].every((id) => !document.getElementById(id))
```

Heads Only:

```js
document.querySelector(".heads-toolbar") === null
```

Pixall:

```js
document.querySelectorAll(".pixall-live").length === 0
```

Global:

```js
document.querySelectorAll(".roulette-overlay").length === 0
document.getElementById("effectBlast") === null
```

## Core Workflows

Round flow:

- Start local game.
- End first plain round.
- Let wheel pick/apply a mode.
- Eliminate and un-eliminate a card.
- End round again.

Breeding:

- Trigger `fertility`.
- Drag two compatible cards.
- Keep baby.
- Verify baby card appears and persists through refresh-resume.
- In non-PG, abort a baby and trigger `judgement`; aborted soul appears in purgatory strip.

Editor:

- Open editor.
- Edit a board character.
- Save to board.
- Current mode data re-applies and secret card updates.

Online:

- Tab 1 hosts a room.
- Tab 2 joins the room.
- Host starts game.
- Elimination syncs.
- Mode syncs.
- Baby syncs.
- Board edit syncs.
- Refresh one tab; it resumes the same round and reconnects.

Mode spot checks:

- `knockoff-manor`: drag a suspect between rooms; other tab sees move.
- `family-tree-disaster`: custom board renderer appears; breeding updates family cluster.
- `habbo`: avatars walk, void/de-void works, teardown removes Habbo UI.
- `sims`: interactions work; PG excludes adult interaction choices.
- `pantone`: dragging two cards mixes colors rather than breeding.
- `prop-panic`: dragging two cards battles props.
- `horny-potter`: only darklord drag eliminates.
- `hidden-agendas`: opposite-party drag converts via tug.

