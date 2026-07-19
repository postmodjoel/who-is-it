# Unified Hair Compositor — implementation record (2026-07-19)

Replaces the split base-hair / placed-lock renderers with one ordered compositor: every portrait
is a bald head plus an ordered stack of hair pieces. This doc records the pre-change inventory,
the architecture, and the gate results.

## 1. Pre-change inventory (captured before any rendering change)

### Advertised styles — `traitBook.hairStyles` (10)

| style | production route | zones | geometry space | auto overlay (overlayLock) |
| --- | --- | --- | --- | --- |
| messy | facesHair silhouette | front only | faces400 | messyTufts (DEFAULT_LOCK_TF) |
| cropped | facesHair silhouette | front only | faces400 | shortCrop (DEFAULT_LOCK_TF) |
| sidePart | facesHair silhouette | front only | faces400 | sideSwoop (`translate(20 4) scale(0.45)`) |
| bob | facesHair silhouette | front only | faces400 | curtainBangs (`translate(12.8 8) scale(0.45)`) |
| curls | facesHair silhouette | front only | faces400 | curlyForelock (DEFAULT_LOCK_TF) |
| coily | facesHair silhouette | front only | faces400 | softWaveCap (DEFAULT_LOCK_TF) |
| locs | facesHair silhouette | front only | faces400 | longSideLock (`translate(8 2) scale(0.46)`) |
| longWaves | procedural `longWaveFront` | front only | portrait256 | none |
| bald | empty | — | — | none |
| hijab | procedural covered | **back + front lines** | portrait256 | none |

Routing: `useFacesHair = facesHair.has(traits.hair)` in composePortrait. facesHair front pieces
render INSIDE headGroup AFTER face features (`facesHairSvg`, wrapped in `translate(0 frontHairY)`).
Procedural front (longWaves, hijab frame) renders inside headGroup BEFORE brows/eyes via
renderFrontHair; procedural back (hijab scarf, filled with `traits.shirt`) renders in the
behind layer via renderBackHair with `backHairY`.

Dead code found by the inventory (fallback-only, unreachable with faces-hair.js loaded):
procedural back/front paths for the 7 facesHair styles; every `hairProfile` fringe variant in
renderFrontHair (the `longFlow` branch early-returns before them; bob/cropped/messy/curls never
reach renderFrontHair at all); `renderHairHighlights` (returns "" unconditionally);
`strandPaths` in faces-hair.js (not called by render()).

### Automatic overlays (overlayLock)

Per-style: lifts the mapped lock's `dark`/`shine`/`lines` parts (never the base `hair` mass),
transforms 512-lock-space → portrait via LOCK_TF/DEFAULT_LOCK_TF (~`translate(12.8 5) scale(0.45)`),
and clips them to the style's silhouette union. These become `detail` parts owned by the preset
piece in the compositor.

### Placed locks (`traits.hairLocks`)

- Standard instances `{lock, x, y, scale, rot, mirror, behind, lines, outline, fill, dark, shine,
  line, internalLine, internalLineWidth, internalLineColor}` — render inside headGroup, split
  behind/front. Default `lockBlend:"merged"`: mass union → feMorphology dilate rim (single
  exterior contour) + per-lock fills + interior seam lines masked to overlaps
  (`mergedInternalLine*` trait knobs). `"separate"`: classic per-lock full render.
- Drawn (pen-tool) instances `{d, strokes, dx, dy, ...}` in raw portrait256 coordinates —
  currently render OUTSIDE headGroup at top level (before/after the whole head), always
  individually articulated.

### Coordinate spaces

- `portrait256` — procedural paths, drawn-lock `d`.
- `faces400` — faces.js silhouettes; `FACES_HAIR_TRANSFORM = translate(50.5 22) scale(0.387)`,
  stroke 7.6 in-space.
- `lock512` — LOCKS catalogue (31 kinds, parts hair/dark/shine/lines); instance transform
  `translate(x%·256, y%·256) scale(±0.42·scale) rotate(rot) translate(-256 -256)`.

### hairLocks consumers (compatibility surface)

face-studio.js (Lock Designer corrections), editor.js (in-app editor lock rows), breeding.js
(inheritance mirror+jitter), modes.js (mystery-effect strips/overrides), app.js (distinctness
scoring), make-rules.js (EXTRA_KEYS.hair rides with HAIR part), genetics-rules.js (synthetic
lock generation), studio-bakes-import.js + game-data.js (baked traits), hair-studio.js
(mining + rating). All keep reading `hairLocks`; the compositor keeps it synchronized with
non-base layers.

### Existing merge machinery (reused, not reinvented)

`renderHairLockRim` — feMorphology dilate of the mass union flooded with the outline colour
(solid, fill overlaps its inner half → no antialiasing seam). `renderHairLockInteriorLines` —
per-piece seam strokes double-masked to (eroded all-mass) ∩ (dilated other-mass overlap).
`hairOutlineFor/hairOutlineScale/resolvedHairOutlineColor` — outline colour/mode/width.
Hair gradient: `<linearGradient id='hair-${seed}'>` 1.1/1.0/0.86 shades of the hair hex.

## 2. Baseline (captured pre-change)

See `hair-compositor-lab.html` (BASELINE tab renders through whatever renderer is loaded).
Browser-pane screenshots of the full grid + overlap grid captured 2026-07-19 as diagnostic
references (visible refinement is allowed; these are not pixel-parity gates). CI snapshot
fixtures come from tests/hair-compositor.spec.js on first CI run.

**Legacy-split perf baseline** (100-portrait matrix = 10 styles × (6 variants + 4 overlap),
median of 3): **18.8 ms** (runs 21.6 / 16.3 / 18.8); worst style **locs 7.3 ms** (its 10 cells);
typical cropped + 2 placed locks SVG **17,478 bytes**. Gate ceilings: median ≤ 23.5 ms,
worst style ≤ 11.0 ms, typical SVG ≤ 26,217 bytes.

Baseline visual notes (defects the compositor must fix / behaviours it must keep):
- +overlap column: the base style's outline stays visible UNDER the overlapping placed piece
  (buried rim — the core defect).
- +disconnected: detached piece keeps its own exterior contour (keep).
- +behind: behind piece renders in the pre-head layer with its own contour (keep).
- hijab: scarf cloth colour = `traits.shirt` (not hair). hijab·light/dark cells identical.
