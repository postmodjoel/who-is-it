# face-generator.js map + per-feature recipes

`face-generator.js` is one IIFE attached to `window.faceGenerator`, exposing `createCharacters`,
`renderPortrait` (= `composePortrait`), and `traitBook`. Everything below is inside that IIFE.
Line numbers drift as you edit — search by function name, not line.

## Constants (top of file)

- `ink = "#1f2330"` — the navy outline colour used by nearly every stroke. `softInk` is its
  translucent form for faint interior lines.
- `stroke = { contour: 3.4, frame: 3, feature: 2.5, detail: 1.8, whisper: 1.3 }` — the line-weight
  scale. Use these names instead of hardcoding widths so weights stay consistent.
- `skinTones`, `hairColors` — named hex palettes (muted/natural). `backgrounds` — flat card tones.
- `faceShapes` — `oval/round/heart/square/long` skin-outline path strings. The oval/long/heart chins were
  shortened (rounder, fuller faces) to match the gold standard; widening them instead would desync the
  ears (ears sit just outside the face edge), so shorten the chin rather than widen.
- `hairStyles` — object of named styles, each `{ back, front, texture?, bun?, sidePart?, covered? }`
  where `back`/`front` are SVG path strings (or generated, see curls/coily).
- `expressions` — per-expression `{ brows, eyes, mouth, ... }`. `eyes` is a key
  (`calm/bright/wide/narrow/soft`) used by both `renderEyes` and `renderBrows` to look up shape +
  emotion. `brows` here is legacy and no longer the brow source.
- `browShapes`, `browEmotion` — see Brows below.

## Render pipeline: `composePortrait(seed, traits)`

Builds the SVG. Order matters (later = on top):

```
<rect> flat background fill
renderClothing → renderNeckBase
headGroup( ... ):                 // everything head-related, scaled/moved as one unit
  renderBackHair  (behind face)
  renderEars
  <path> face skin
  renderFaceModeling              // cheeks, faint contour/jaw shading
  renderFrontHair (over face)     // the fringe/hairline
  renderHairHighlights            // INTERNAL STRAND LINES (the reference texture)
  renderBrows
  renderEyes
  renderNose
  accessory.beforeMouth
  renderExpressionMouth
  renderCheeks
  accessory.afterMouth
```

Hair fill is passed as `url(#hair-${seed})` (a subtle `linearGradient` in `<defs>`); keep the
gradient shallow so hair reads near-flat with the strand lines doing the work.

## `headGroup(traits, content)` — the composite-scaling rule

Wraps `content` in `<g transform='translate(x y) translate(128 150) scale(sx sy) translate(-128
-150)'>`. Driven by `headScaleX/Y`, `headX/Y`. **All head features must pass through here together.**
Deliberately NOT using `non-scaling-stroke` (a `fixed-stroke` CSS class) — under non-uniform scale
it renders strokes unevenly. Let strokes scale naturally.

## Hair

### faces.js hair (the current basis — `faces-hair.js`)
Most styles now render from real faces.js silhouettes (Apache-2.0, attributed) instead of the
procedural paths below. `faces-hair.js` exposes `window.facesHair.{render,has,styles}` and holds the
copied path data. Mapping: messy→messy, cropped→crop, sidePart→parted, bob→middle-part, curls→curly,
coily→afro, longWaves→**female1** (both-sides long hair, replaced the one-sided longHair), locs→dreads. faces.js authors on a 400×600 canvas; the
`FACES_HAIR_TRANSFORM` (`translate(50.5 22) scale(0.387)`) maps that onto this 256×256 head (head
centres + skull-top aligned, head width matched, uniform scale so shapes don't distort). In
`composePortrait`, `useFacesHair = window.facesHair.has(traits.hair)`: when true it draws ONE hair
group on top of the face (no separate back/front, no strand overlay); when false it falls back to the
procedural back/front hair + strands below. bun/hijab/bald are NOT mapped and still use the
procedural code. To add/adjust a mapping: extract the `<path d>` from the faces.js SVG, add it to the
`HAIR` table in faces-hair.js with a mode tag (`fs` fill+stroke, `f` fill-only, `l` line-only), and
add the style key. To re-fit, tweak `FACES_HAIR_TRANSFORM`. Strokes use width 8.8 in faces-space
(×0.387 ≈ the 3.4 contour) and scale naturally with any head resize.

### Procedural fallback — smooth styles
Most `hairStyles` are hand-authored `back`/`front` path strings. The `messy` style is the quality
bar: a swept shape with an irregular, face-framing hairline. When a smooth style looks like a
helmet, give it a higher/more natural hairline (show forehead, recede at temples) and add strand
lines.

### Curly / coily — generated, smooth + strands
`curls` and `coily` are built procedurally:

- `lobeChain(points, bump, focusY, away)` — turns a point path into a soft cubic BUMP edge. Each
  segment's control points are pushed `chord * bump * jitter` along the outward normal (`away`
  orients outward vs toward the face). The per-segment `jitter` (deterministic) varies clump size so
  the edge isn't a uniform bubble-cap. **Keep `bump` LOW** (~0.34 curls, ~0.44 coily) for a gentle
  wave; high bump = spiky/bubbly = the old broken look.
- `curlyCrown({rx, ry, cy, bottom, steps, bump})` — back blob (dome + flat bottom).
- `curlyFringe({rx, topY, bottomY, dip, steps, bump})` — front: lobed top (merges into the crown,
  no flat band) + lobed bottom hairline. Keep `dip` small (~3) or you get a harsh widow's-peak V.

### Strand lines — the reference texture (`renderHairHighlights`)
This is what makes hair read as hair. For `texture: "curls"/"coils"` it draws flowing, jittered
cubic strand lines sweeping down from the crown, in `shadeColor(hair, 0.64)` (lowlight) plus a
`shadeColor(hair, 1.22)` sheen — tighter/shorter for coils, longer/looser for curls. NOT a grid of
discrete marks (reads as polka-dots/hairnet) and NOT solid circles (pom-poms). The old
back-hair `renderHairTexture` for curls/coils is disabled in favour of these front strands. Extend
the same flowing-strand treatment to the smooth styles for richer texture.

## Eyes (`renderEyes` → `renderEye`)

- `shape` per expression: `{ y, up, dn }` — how far the lid arcs above/below the eye midline.
- `eyeLayout` — default gap 47; `left/right = 128 ∓ gap/2`.
- `renderEye` builds a **symmetric lens** (cubic top arc + mirrored bottom arc — mirror-safe, no
  skew). Then, clipped to the lens: a big iris sitting LOW (`irisY = y + dn*0.2`) so the upper lid
  covers its top, a pupil, a small highlight, and a **top-lid shadow arc** just inside the top. A
  soft **crease** line is drawn above the lens. `w = 13.5 * eyeScale` (modest size).
- The "syndromic" failure mode = asymmetric horizontal control points applied identically to both
  eyes, or an off-centre/low iris with no lid. Keep horizontal symmetric; convey shape via up/dn.

## Brows (`renderBrows`, `browShapes`, `browEmotion`, `browColor`, `browShapeFor`)

- `browShapes` — per-character `{ th (thickness), arch, len, peakX? }`. Keep `th` modest (2.4–5.6);
  fat uniform brows read as censor bars.
- `browEmotion` — keyed by `expression.eyes`; shifts inner/outer ends + arch (angry V, sad/worried,
  surprised raise).
- The brow path is **anatomical**: a rounded inner head (near the nose) that arches over and tapers
  to a thin tail point at the temple. Built per-eye and mirrored. Filled with `browColor` =
  `shadeColor(hair, 0.62)` (deep hair tone, visible on blondes, not pure black), thin ink outline.
- `browShapeFor(id, index)` assigns a shape deterministically so neighbours differ.

## Nose (`renderNose`)

A short, soft underside: a faint upper bridge hint + a rounded base curve close under the eyes
(`baseY ≈ 155`) with small nostril wing strokes and a tiny highlight. Driven by `noseY`/`noseScale`.
Avoid restoring a long centre bridge line — it elongates the midface.

## Ears / Face modelling / Mouth / Accessories

- `renderEars` — `earVariant` (round/attached/narrow/lobe), `earScale`, `earY`.
- `renderFaceShading(seed, skin, faceShapePath)` — face DEPTH. Soft *feathered* radial blobs CLIPPED
  to the face path: shadows at temples/cheek-hollows/jaw/hairline (`fblob`, `shadeColor(skin,0.72)`) +
  cheekbone/forehead highlights (`fhi`, `shadeColor(skin,1.12)`). Each blob fades to transparent at its
  OWN edge so nothing leaves a hard band where the clip cuts it (a full-face vignette did, at the chin
  — don't reintroduce that). None reach the chin. Reads on dark skin too. Drawn after the face fill,
  under all features. Main "give faces depth" lever.
- `renderFaceModeling` — faint cheek blush (`cheekOpacity`) + a soft under-eye highlight + one very
  faint jaw shade. (The old floating below-mouth/jaw arcs were removed for reading as stray lines.)
- Beard (`accessories.beard`): colour follows the hair (`shadeColor(hairColor, 0.8)`, lowlight 0.62,
  strand highlight 1.3) so beards aren't a flat near-black blob — red hair → red beard. Has an ink
  outline, a lowlight region, and curl strands clipped to the beard shape (`clipPath id=beardclip`).
- Mouths: `renderExpressionMouth(expression, traits, seed)` dispatches: open (surprised), smile
  (`renderSmileMouth`), or closed (`renderLips`). `mouthY/mouthScale` via `transformMouth`.
- Teeth (`renderSmileMouth` + `teethBand`): the smile draws a dark cavity, then the teeth are drawn
  generously and CLIPPED to that cavity (`clipPath id=mouth-${seed}`) so the upper lip masks their
  top edge — teeth emerge from the mouth instead of sitting on top. `teethStyle` trait
  (even/perfect/gappy/bucky/spaced; `teethStyleFor`) controls the pattern within the clip.
- Lips (`renderLips`): closed resting mouth is a plain line by default, or sculpted lips (cupid's-bow
  upper + fuller lower, tinted `shadeColor(skin,~0.78)`) when `traits.lips` is `soft`/`full` — only on
  calm faces (a full lip on a frown reads oddly). `lipsFor` assigns it (she-characters + some).
- Hair z-order: faces.js hair renders AFTER brows/eyes/nose/mouth/cheeks (but under glasses) so swept
  hair overlaps the brow/blush/temple like the reference art, instead of those poking through it.
- Accessories/beard/moustache all support flat `*X/*Y/*Scale` trait overrides via their transform
  helpers — the studio editor plugs into these directly.

## Traits & profiles

- `createCharacters` builds 48 characters from `seedSpecs`, assigning `traits` including
  `portraitProfile`, `earVariant`, `browShape`, etc.
- `defaultPortraitProfile()` + `getProfile(traits)` — `getProfile` merges the per-character nested
  `portraitProfile` with flat top-level overrides (from studio corrections) so callers don't special-
  case. `profileOverrideKeys` lists which numeric keys can be overridden flat.
- `shadeColor(hex, factor)` — channel-wise multiply for tints/shades (factor >1 lightens, <1 darkens).
- `traitBook` (exported) lists option keys for the studio editor; add new categorical traits here so
  the editor can surface them.

## When adding a new adjustable feature

1. Add the trait to `getProfile`/`profileOverrideKeys` (numeric) or as a categorical trait + to
   `traitBook`.
2. Consume it in the relevant `render*` function (use the `stroke` scale + `ink`/`shadeColor`).
3. Add a control to `face-studio.js` `editorFields` (range or `type:"select"`) in the right group.
4. Bump the cache-buster, reload, verify in the browser, compare to the reference.
