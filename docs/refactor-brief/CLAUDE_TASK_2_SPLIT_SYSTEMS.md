# Claude Task 2: Split Self-Contained Systems Out Of `app.js`

This is a mechanical extraction into classic global scripts. Do not convert to ES modules.

Final script order in `index.html`:

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

Use the same cache-buster version currently in the file, or bump all script versions consistently.

## General Rules

- Use plain script files, not modules.
- Do not wrap moved code in an IIFE unless you explicitly export all functions used elsewhere.
- Top-level `function` declarations are fine for cross-file APIs.
- If you use `const`/`let` for private state, keep it in the file that owns the state.
- Do not move unrelated round flow, board sorting, Void/elimination, persistence, title screen, or lobby code.
- After each file move, load the page and run the relevant smoke test before moving the next section.

## Move 1: `net.js`

Move the "Online layer (room-synced clients)" section from `app.js` into `net.js`.

Move these symbols:

- `net`
- `netRoom`
- `netReconnectTimer`
- `setNetStatus`
- `NET_RELAY`
- `netConnect`
- `scheduleReconnect`
- `netSend`
- `markPeerOnline`
- `handleNetMsg`
- `serializeCharacter`
- `netAnnounceBaby`

Although `serializeCharacter` is used by persistence too, keep it in `net.js`; it is also the network baby payload serializer, and `app.js` can call it globally.

Known dependencies that are resolved later at runtime:

- From `app.js`: `state`, `els`, `newGame`, `render`, `renderRoom`, `renderBoard`, `renderSecret`, `renderOpponentPanel`, `updateLobby`, `scheduleSave`, `showRoundReveal`, `addLog`
- From `opponent-sim.js`: `stopOpponentSim`
- From `modes.js`: `mysteryEffects`, `applyMysteryEffect`, `playEffectAnnouncement`, `showMysteryAnnouncement`, `reapplyCurrentMystery`
- From `editor.js`/`breeding.js`: `flashToast`

Smoke test after this move:

- Page boots.
- Local game can start.
- Online host screen opens and shows a room code.
- Two tabs in the same browser can join via `BroadcastChannel`.
- Elimination syncs between tabs.

## Move 2: `breeding.js`

Move the "Breeding" and "Identity reels" sections into `breeding.js`.

Move from the `// ===================== Breeding...` header through the line just before `// ===================== Custom character editor...`.

Move these symbols:

- `mixHex`
- `mergeTraits`
- `babyName`
- `jitterHex`
- `mutateBaby`
- `babyCounter`
- `jitterGaybyHair`
- `makeBaby`
- `sameSex`
- `GAYBY_KEY`
- `loadGaybies`
- `mergeGaybiesIntoPool`
- `persistGayby`
- `parseCum`
- `formatCum`
- `BREED_MODES`
- `PRONOUN_REEL`
- `GENDER_REEL`
- `ETHNICITY_REEL`
- `KINK_REEL`
- `spinIdentityReels`
- `babyIdentityReels`
- `combineDiseaseAssignment`
- `mixAgendaAssignment`
- `showNewThinking`
- `breedCharacters`
- `simsPortrait`
- `offerKeepOrAbort`
- `ABORT_LINES`
- `abortBaby`
- `flashToast`
- `playBirthAnimation`
- `breedTouch`
- `wireBreedDnD`

Known dependencies:

- From `app.js`: `state`, `generatedCharacters`, `allCharacters`, `characterById`, `renderBoard`, `scheduleSave`, `addLog`, `sfx`, `escapeHtml`
- From `net.js`: `netAnnounceBaby`
- From `modes.js`: `mixPantonePair`, `propBattle`, `simsInteract`, `avadaKedavra`, `politicsTug`, `mysteryEffects` or `reapplyCurrentMystery`
- From `face-generator.js`: `window.faceGenerator`
- From `game-data.js`: `window.GameData`

Important: `mixHex`, `parseCum`, `formatCum`, `sameSex`, `makeBaby`, `simsPortrait`, and `flashToast` are used outside breeding. Keep them globally visible.

Smoke test after this move:

- Page boots.
- Trigger a breeding mode from the debug picker.
- Drag one card onto another.
- A baby can be kept and appears on the board.
- In non-PG, abort path increments parent `abortions` and persists the aborted baby for Judgement purgatory.
- In PG, keep/abort prompt is skipped and baby is kept.

## Move 3: `editor.js`

Move the "Custom character editor" section into `editor.js`.

Move from `// ===================== Custom character editor...` through the line just before `function sortedBoard()`.

Move these symbols:

- `CUSTOM_KEY`
- `EDITOR_ANIM`
- `loadCustomChars`
- `saveCustomChars`
- `buildCustomCharacter`
- `mergeCustomIntoPool`
- `upsertCustom`
- `deleteCustom`
- `editorDialog`
- `editorState`
- `newEditorState`
- `renderEditorPreview`
- `renderEditorControls`
- `renderEditorSaved`
- `renderEditorBoard`
- `syncEditorButtons`
- `editorRand`
- `setEditorTrait`
- `randomizeAll`
- `randomizeCurrent`
- `applyBoardEdit`
- `buildEditorDialog`
- `openCharacterEditor`

Known dependencies:

- From `app.js`: `stableHash`, `generatedCharacters`, `allCharacters`, `state`, `pick`, `escapeHtml`, `displayName`, `renderBoard`, `renderSecret`, `sfx`
- From `net.js`: `netSend`
- From `breeding.js`: `flashToast`
- From `modes.js`: `mysteryEffects` or `reapplyCurrentMystery`
- From `face-generator.js`: `window.faceGenerator`

Smoke test after this move:

- Page boots.
- Character editor button opens dialog.
- Randomise all and This setting update the preview.
- Save creates a persisted custom character.
- Add to board appends/replaces a board character and re-renders current mode data.
- Live board edit sends `editchar` online and receiving tab updates.

## Move 4: `opponent-sim.js`

Move the "Opponent view (simulated online play)" section into `opponent-sim.js`.

Move these symbols:

- `opponentTimer`
- `stopOpponentSim`
- `startOpponentSim`
- `renderOpponentPanel`

Known dependencies:

- From `app.js`: `state`, `els`, `characterById`, `escapeHtml`, `renderBoard`

Smoke test after this move:

- Page boots.
- Local game can start.
- Opponent panel renders.
- Calling `startOpponentSim()` in console creates periodic opponent eliminations.
- Calling `stopOpponentSim()` stops the interval.
- Online peer connection calls `stopOpponentSim()` with no missing-reference error.

## App Initialization After Moves

Keep these initialization calls in `app.js`, after all scripts have loaded:

```js
loadTheme();
installStaticIcons();
mergeCustomIntoPool();
mergeGaybiesIntoPool();
wirePainScaleDrag();
if (els.editorButton) els.editorButton.addEventListener("click", openCharacterEditor);
showTitleScreen();
wireCueCardClick();
wireFloatingSecret();
```

`wirePainScaleDrag()` may live in `modes.js`; it is still okay for `app.js` to call it generically.

## Final App Ownership

Leave these in `app.js`:

- base character fallback and generated pool creation
- `state` and `els`
- icons/theme
- `newGame`
- render orchestration
- board sorting
- `renderLocation`, `renderRoom`, `renderSecret`, `renderBoard`, `createCharacterCard`
- Void/elimination
- prompt drawing
- setup dialog, sound UI, title/lobby/end-round flow
- refresh persistence
- seed code parsing

