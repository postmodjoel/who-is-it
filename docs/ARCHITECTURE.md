# Architecture

WHO? IS IT? is a no-build browser application. `index.html` loads ordinary scripts in a deliberate
order; those scripts share browser globals. There is no bundler or module graph to resolve the order
for us, so treat the script list at the bottom of `index.html` as the executable dependency map.

## Runtime flow

1. `src/core/game-data.js` and the mode data files publish authored content.
2. `src/characters/` publishes the face, hair, clothing, and shared editor APIs.
3. `src/core/sound.js`, `net.js`, and `breeding.js` publish shared systems.
4. `src/modes/` publishes mystery effects and ruleset controllers.
5. `src/core/app.js` creates application state, binds the DOM, and starts the game.

`src/characters/editor.js` and `src/vendor/vendor-qrcode.js` are exceptions: `app.js` lazy-loads
them when their features are first needed.

## Ownership map

### Core game

- `src/core/app.js` — application state, rendering, setup, rounds, saves, and boot.
- `src/core/game-data.js` — characters, prompts, locations, and authored game data.
- `src/core/net.js` — room messages and online synchronization.
- `src/core/breeding.js` — character breeding and identity-reel behavior.
- `src/core/opponent-sim.js` — simulated opponent view.
- `src/core/sound.js` — sound effects and audio lifecycle.
- `src/core/styles.css` — shared game and mode presentation.

### Character system

- `src/characters/face-generator.js` — portrait generation and trait rendering.
- `src/characters/faces-hair.js` — hair silhouettes and compositing.
- `src/characters/clothing-profiles.js` — clothing geometry and tuning.
- `src/characters/studio-bakes-import.js` — imported studio corrections.
- `src/characters/editor-shared.js` — character/editor helpers needed at boot.
- `src/characters/editor.js` — full editor UI, loaded on demand.

### Modes and rulesets

- `src/modes/modes.js` — shared mystery-mode registry and effects.
- `src/modes/groupthink/` — Groupthink data, rules, lab capture, controller, and styles.
- `src/modes/genetics/` — deterministic genetics rules.
- `src/modes/who-did-you-make/` — draft rules, controller, and styles.
- `src/modes/habbo/` — room props, avatar manifests, and Habbo presentation data.
- `src/modes/who-were-you/` — retained legacy/experimental ruleset.

### Developer workbenches

HTML entry points are in `labs/`; their implementation is in the matching `src/labs/` directory.
Each lab page declares `<base href="../">`, so runtime asset paths still resolve from the repository
root.

## Where to make common changes

| Change | Start here |
| --- | --- |
| Setup, round flow, board UI, saves | `src/core/app.js` |
| Prompts, locations, base character data | `src/core/game-data.js` |
| Portrait appearance | `src/characters/face-generator.js` |
| Hair shapes or compositing | `src/characters/faces-hair.js` |
| Clothing geometry | `src/characters/clothing-profiles.js` |
| Online room behavior | `src/core/net.js` |
| Mystery effects | `src/modes/modes.js` |
| Groupthink | `src/modes/groupthink/` |
| WHO? DID YOU MAKE? | `src/modes/who-did-you-make/` |
| Generator calibration | `labs/face-studio.html` |

## Validation

```sh
npm run test:rules
node --test tests/clothing-layers.test.mjs tests/make-rules.test.mjs
npm run test:ui
```

Use `tools/stamp.sh` before deployment to give every local script and stylesheet the same cache
version. Generator scripts in `tools/` write directly to their corresponding files under
`src/modes/habbo/`.

Ignored Finder/iCloud `* 2.*` copies are quarantined under `.scratch/duplicates/`. Nothing in that
directory is loaded, tested, or deployed intentionally.
