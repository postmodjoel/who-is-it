# Refactor Brief: Modes Registry + App Split

This packet is for handing the large `app.js` refactor to Claude later. It is intentionally documentation-only. Do not treat it as an implemented change.

## Current Baseline

- Start by checking `git status` and preserving any user changes. This packet itself should be the only change from this planning pass.
- Current `app.js` is 6601 lines.
- The requested self-contained section headers exist at:
  - Board sorting: `app.js` around line 733
  - Breeding: `app.js` around line 795
  - Identity reels: `app.js` around line 924
  - Custom character editor: `app.js` around line 1307
  - Opponent view: `app.js` around line 1588
  - Online layer: `app.js` around line 5801
- Syntax baseline checked with bundled Node:
  - `app.js`, `game-data.js`, `face-generator.js`, `faces-hair.js`, `sound.js`, and `face-studio.js` all pass `node --check`.

## Recommended Implementation Order

Although Fable listed `modes.js` first, the safest practical order is:

1. Move `net.js`.
2. Move `breeding.js`.
3. Move `editor.js`.
4. Move `opponent-sim.js`.
5. Introduce `modes.js` and move the mode registry, mode apply functions, mode render hooks, and teardown.
6. Update `index.html` to the final load order:

```html
<script src="game-data.js?v=..."></script>
<script src="face-generator.js?v=..."></script>
<script src="faces-hair.js?v=..."></script>
<script src="sound.js?v=..."></script>
<script src="net.js?v=..."></script>
<script src="breeding.js?v=..."></script>
<script src="editor.js?v=..."></script>
<script src="opponent-sim.js?v=..."></script>
<script src="modes.js?v=..."></script>
<script src="app.js?v=..."></script>
```

Reason: `modes.js` depends heavily on helpers currently in the Breeding section (`mixHex`, `parseCum`, `formatCum`, `sameSex`, `makeBaby`, `simsPortrait`, `flashToast`) and on networking helpers (`netSend`, `netAnnounceBaby`). Moving those first makes the final global-script contract explicit before the big registry move.

## Important Findings

- This is a classic no-build browser app. Top-level `function` declarations and `window.X = ...` are safest for cross-file globals.
- Avoid top-level `const`/`let` for exported APIs unless you are certain later files can see them. Prefer assigning exported functions/objects onto `window`.
- `modes.js` may be loaded before `app.js` and can define functions that reference `state`, `els`, `renderBoard`, etc.; those references are resolved when the functions run, after `app.js` has loaded.
- Do not call mode functions at `modes.js` load time if they touch `state`, `els`, or app DOM.
- The live test path is the hidden debug picker unlocked by typing `debug`. The old `triggerKnockoffManorTest`, `triggerPs1Test`, and `triggerGayFroggedTest` functions are currently dead code.
- `applyVibeLabels` and the `vibe-labels` card renderer branch exist, but `vibe-labels` is not in the active `mysteryEffects` array. Preserve only if you intentionally add it as a hidden/non-wheel mode.
- The current `PG_SAFE_MODES` includes `family-tree-disaster` despite nearby comments implying family tree is excluded. Preserve behavior, not the stale comment.

## Files In This Packet

- `CLAUDE_TASK_1_MODES.md`: copy/paste prompt for the `modes.js` registry refactor.
- `CLAUDE_TASK_2_SPLIT_SYSTEMS.md`: copy/paste prompt for extracting `net.js`, `breeding.js`, `editor.js`, and `opponent-sim.js`.
- `VERIFY.md`: smoke-test and manual QA checklist, including mode and teardown checks.
