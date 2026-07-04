# Claude Task 1: Implement `modes.js` Registry

Implement this after the self-contained file moves if possible. If you must follow Fable's order, this still works, but expect more temporary references back into `app.js`.

## Goal

Create `modes.js`, loaded before `app.js`, and move all active mystery-mode definitions plus their mode-owned logic into a registry. `app.js` should consume the registry instead of knowing each mode by hand.

The registry entries must include:

```js
{
  id,
  name,
  tier,
  pgSafe,
  exampleQuestion,
  glyph,
  flash,
  apply,
  cardData,
  renderBoard,
  afterDefaultBoard,
  decorateCard,
  afterRenderSecret,
  decorateLocation,
  teardown
}
```

Not every mode needs every hook.

## Export Contract

Because this app uses classic global scripts, export onto `window` from `modes.js`:

```js
window.MysteryModes = api;
window.mysteryEffects = api.effects;
window.WHEEL_TIERS = api.WHEEL_TIERS;
window.PG_SAFE_MODES = api.PG_SAFE_MODES;
window.WOKE_PREREQS = api.WOKE_PREREQS;
window.applyMysteryEffect = api.applyMysteryEffect;
window.clearMysteryEffectUI = api.clearMysteryEffectUI;
window.getMysteryCardData = api.getMysteryCardData;
window.spinModeRoulette = api.spinModeRoulette;
window.playEffectAnnouncement = api.playEffectAnnouncement;
window.showMysteryAnnouncement = api.showMysteryAnnouncement;
window.wheelTarget = api.wheelTarget;
window.wheelTargetFromBag = api.wheelTargetFromBag;
```

`app.js` can keep calling those names during the transition, but their source should be `modes.js`.

## Registry Skeleton

Use this shape, adapted to the existing code style:

```js
(function () {
  const registry = {};
  const order = [];
  const NO_EFFECT_SLOT_TIER = 1;
  const WOKE_PREREQS = ["gay-frogged", "orgy", "drugs", "disease", "fertility", "work", "disguise"];

  function registerMode(def) {
    if (!def || !def.id) throw new Error("registerMode requires an id");
    if (registry[def.id]) throw new Error(`Duplicate mystery mode: ${def.id}`);
    registry[def.id] = { pgSafe: false, tier: 99, ...def };
    order.push(def.id);
  }

  function modeById(id) {
    return registry[id] || null;
  }

  function effects() {
    return order.map((id) => registry[id]);
  }

  function deriveWheelTiers() {
    const tiers = [];
    effects().forEach((mode) => {
      if (mode.wheel === false) return;
      const index = Math.max(0, (mode.tier || 1) - 1);
      if (!tiers[index]) tiers[index] = [];
      tiers[index].push(mode.id);
    });
    if (!tiers[NO_EFFECT_SLOT_TIER - 1]) tiers[NO_EFFECT_SLOT_TIER - 1] = [];
    tiers[NO_EFFECT_SLOT_TIER - 1].push(null);
    return tiers.filter(Boolean);
  }

  function derivePgSafeModes() {
    return effects().filter((mode) => mode.pgSafe).map((mode) => mode.id);
  }

  // registerMode(...) calls go here.

  const api = {
    registry,
    effects: effects(),
    modeById,
    WHEEL_TIERS: deriveWheelTiers(),
    PG_SAFE_MODES: derivePgSafeModes(),
    WOKE_PREREQS,
    // plus wheel/apply/render helpers
  };

  window.MysteryModes = api;
  window.mysteryEffects = api.effects;
  window.WHEEL_TIERS = api.WHEEL_TIERS;
  window.PG_SAFE_MODES = api.PG_SAFE_MODES;
  window.WOKE_PREREQS = WOKE_PREREQS;
})();
```

## Active Mode Registration Table

Preserve the current wheel order and PG filtering exactly.

| id | name | tier | pgSafe | apply |
| --- | --- | ---: | --- | --- |
| `prop-panic` | `WHAT'S IN THE HAND?` | 1 | yes | `applyPropPanic` |
| `ps1-mode` | `PS1 Mode` | 1 | yes | `applyPs1Mode` |
| `face-first` | `Face First` | 1 | yes | `applyFaceFirst` |
| `emotional-audit` | `Emotional Audit` | 1 | yes | `applyEmotionalAudit` |
| `role-reveal` | `Role Reveal` | 1 | yes | `applyRoleReveal` |
| `astrology` | `Astrology` | 1 | yes | `applyAstrology` |
| `pantone` | `PANTONE` | 1 | yes | `applyPantone` |
| `habbo` | `Habbo Hotel` | 1 | yes | `applyHabbo` |
| `heads-only` | `Heads Only` | 1 | yes | `applyHeadsOnly` |
| `knockoff-manor` | `MURDER TIME!!!` | 2 | no | `applyKnockoffManor` |
| `family-tree-disaster` | `Family Tree Disaster` | 2 | yes | `applyFamilyTreeDisaster` |
| `yugioh` | `Yu-Gi-Oh!` | 2 | yes | `applyYugioh` |
| `pixall` | `PIXALL` | 2 | yes | `applyPixall` |
| `horny-potter` | `Horny Potter` | 2 | no | `applyHornyPotter` |
| `witness-protection-filter` | `Witness Protection Filter` | 2 | yes | `applyWitnessProtectionFilter` |
| `linkedin` | `LINKEDIN` | 2 | yes | `applyLinkedin` |
| `hidden-agendas` | `Hidden Agendas` | 3 | no | `applyHiddenAgendas` |
| `monocultural` | `Monocultural` | 3 | no | `applyMonocultural` |
| `gay-frogged` | `Gay Frogged` | 3 | no | `applyGayFrogged` |
| `swipe` | `SWIPE` | 3 | no | `applySwipe` |
| `fireworks` | `Fireworks Mode` | 3 | no | `applyFireworks` |
| `sims` | `Sims Mode` | 3 | yes | `applySims` |
| `drugs` | `Drug Addict Mode` | 4 | no | `applyDrugs` |
| `disguise` | `Special Disguise` | 4 | no | `applyDisguise` |
| `disease` | `Disease Mode` | 4 | no | `applyDisease` |
| `fertility` | `Fertility Mode` | 4 | no | `applyFertility` |
| `orgy` | `Orgy Mode` | 4 | no | `applyOrgy` |
| `judgement` | `Judgement Day` | 4 | no | `applyJudgement` |
| `work` | `Work Mode` | 4 | no | `applyWork` |
| `woke` | `WOKE Mode` | 5 | no | `applyWoke` |

Do not register `vibe-labels` into the wheel unless asked. If preserving it, set `wheel: false`.

## Code To Move From `app.js` Into `modes.js`

Move these blocks and remove their originals from `app.js`:

- `mysteryEffects` array.
- `KNOCKOFF_MANOR_TEST_TRIGGERS`, `PS1_TEST_TRIGGERS`, `GAY_FROGGED_TEST_TRIGGERS`, and the three old trigger functions can be deleted unless you intentionally restore typed triggers through the registry.
- Wheel helpers: `WHEEL_BAG_KEY`, `wheelBag`, `WHEEL_TIERS`, `WOKE_PREREQS`, `PG_SAFE_MODES`, `wheelPgOk`, `wheelTarget`, `wheelTargetFromBag`, `markWheelSeen`.
- Mode roulette: `MODE_GLYPHS`, `FALLBACK_GLYPHS`, `spinModeRoulette`.
- Apply/clear: `applyMysteryEffect`, `clearMysteryEffectUI`.
- Announcement: `MODE_FLASH`, `playEffectAnnouncement`, `showMysteryAnnouncement`.
- Card rendering: `getMysteryCardData`, `addMysteryBadge`, `renderPainScale`, `wirePainScaleDrag`, and mode-specific card helper constants such as `PAIN_SCALE_FACES`.
- Mode apply functions and helper constants from `applyYugioh` through `applyPs1Mode`.
- Mode-owned render systems:
  - LinkedIn ticker
  - Prop Panic loop
  - Heads Only board
  - Habbo board and selection/chat/wander helpers
  - Sims bladder loop
  - Family tree board/model helpers
  - Knockoff Manor board/model helpers
  - Pixall loop/pixel helpers
  - Hidden Agendas stances/tug helpers
  - Pantone helpers/mixing
  - Sims interaction helpers
  - Horny Potter helpers
  - Yu-Gi-Oh location flavor

Keep non-mode core rendering in `app.js`: `render`, `renderLocation`, `renderRoom`, `renderSecret`, `renderBoard`, `createCharacterCard`, sorting, Void/elimination, prompts, save/resume, title/lobby/round flow.

## How `app.js` Should Call Hooks

Replace mode-specific `if (state.global.mystery?.id === "...")` checks with registry calls.

Suggested app-side hook points:

```js
function renderLocation() {
  // app computes base location/variant/art
  const locHook = MysteryModes.decorateLocation?.({ location: state.location, variant, artSrc }) || {};
  // use locHook.name, locHook.description, locHook.classes, locHook.eyebrow, locHook.stamp when present
}

function renderSecret() {
  // app builds normal secret card using getMysteryCardData(secret)
  MysteryModes.afterRenderSecret?.({ card: els.secretCard, character: secret });
}

function renderBoard() {
  const player = currentPlayer();
  rebuildSortOptions();
  MysteryModes.beforeRenderBoard?.({ player });
  els.characterBoard.innerHTML = "";
  els.characterBoard.className = "character-board";

  if (MysteryModes.renderBoard?.({ player, board: els.characterBoard })) return;

  MysteryModes.applyBoardClasses?.({ board: els.characterBoard });
  sortedBoard().forEach((character) => {
    els.characterBoard.appendChild(createCharacterCard(character, player));
  });
  MysteryModes.afterDefaultBoard?.({ player, board: els.characterBoard });
}

function createCharacterCard(character, player) {
  const mystery = getMysteryCardData(character);
  // app builds the core card
  const decorated = MysteryModes.decorateCard?.({ card, character, player, mystery }) || {};
  // allow decorated.portraitSrc, decorated.extraPortraitHtml, decorated.classes
}
```

The registry should own all timer start/stop behavior. `app.js` should only call generic hooks.

## Teardown Requirements

`clearMysteryEffectUI()` in `modes.js` should:

- Set `state.global.mystery = null`.
- Run the active mode's `teardown()` if present.
- Run all global safety teardown functions:
  - stop/reset Heads Only animation
  - reset Habbo UI and timers
  - reset Sims bladder loop
  - reset LinkedIn ticker
  - stop Prop Panic loop
  - stop Pixall loop
  - run `ps1Cleanup` and clear it
- Remove all registered mode board classes from `#characterBoard`.
- Remove registered mode body classes from `document.body`.
- Clear `els.mysteryResult`.
- Remove stray UI ids/classes created by modes: `linkedinTicker`, `habboCam`, `habboChat`, `voidPanel`, `deVoidBtn`, `.roulette-overlay`, `#effectBlast`.

## Refresh/Reapply Hook

Add one helper in `modes.js`:

```js
function reapplyCurrentMystery() {
  const id = state.global.mystery?.id;
  const mode = modeById(id);
  if (mode && mode.apply) {
    try { state.global.mystery = mode.apply(mode); } catch (err) { /* no per-card data */ }
  }
}
window.reapplyCurrentMystery = reapplyCurrentMystery;
```

Use it in places currently repeating:

```js
const eff = mysteryEffects.find((x) => x.id === state.global.mystery.id);
if (eff && eff.apply) { ... }
```

Those sites include baby arrival, board edit, custom add-to-board, and network `editchar`/`baby`.

## Verification For Task 1

After implementing:

- `node --check modes.js app.js net.js breeding.js editor.js opponent-sim.js`.
- Page boots with no console errors.
- Type `debug`; picker appears.
- Trigger every mode from the debug picker once.
- Turn PG on in the debug PG toggle; picker contains exactly `PG_SAFE_MODES`.
- Turn PG on and start several new rounds; wheel never lands outside `PG_SAFE_MODES` or `null`.
- Trigger PS1, then another mode; all `.ps1-character-stage` nodes are gone.
- Trigger LinkedIn, then another mode; `#linkedinTicker` is gone.
- Trigger Habbo, void someone, then another mode; `#habboCam`, `#habboChat`, `#voidPanel`, and `#deVoidBtn` are gone.
- Trigger Heads Only, then another mode; no RAF animation continues and no `.heads-toolbar` remains.
- Trigger Sims, then another mode; no Sims bladder interval keeps changing the DOM.
- Trigger Pixall, then another mode; no `.pixall-live` canvases remain.

