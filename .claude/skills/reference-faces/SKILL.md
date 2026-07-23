---
name: reference-faces
description: >-
  Recreate and refine the procedural SVG character portraits in the WHO IS THAT game's face
  generator (`src/characters/face-generator.js`, `labs/face-studio.html`, and
  `src/labs/face-studio/face-studio.js`) so they match the hand-illustrated "gold
  standard" reference art. Use this whenever working on how the generated faces/characters/avatars
  LOOK — hairstyles, eyes, brows, noses, mouths, ears, skin, proportions, colours, backgrounds,
  accessories — or when the user says the characters look too "Wii"/cartoonish/"chopped"/fake/
  "syndromic", want them to look more like the reference images, or ask to improve any visual
  feature of the portraits. Covers the target aesthetic spec, the "Wii tells" to avoid, per-feature
  SVG construction recipes, the src/characters/face-generator.js function map, the reference image location, and
  the local browser verification + cache-busting loop. Reach for this skill even when the request
  is narrow ("fix the curls", "the brows look like blocks") — the whole-portrait context matters.
---

# Reference Faces — matching the gold-standard portrait art

The WHO IS THAT face generator builds character portraits as procedural SVG strings (no SVG
library) embedded as `data:image/svg+xml` URLs. The goal of any visual work is to make those
generated faces look like the hand-illustrated **reference portraits**, not like Nintendo "Mii"
avatars. This skill encodes what that target looks like, how the code is organised, and how to
change it without regressing.

**The cardinal rule: study the reference, then change ONE feature category, then look at it in a
browser before moving on.** Most past mistakes came from editing several things at once and
guessing instead of comparing against the references and against a zoomed screenshot.

## Step 0 — Look at the references first

The gold-standard art is 24 illustrated PNG portraits at:

```
/Users/joel/Documents/Programming/WHO IS THAT/assets/characters/Archive.zip
```

(Note: that's the sibling `WHO IS THAT` directory, NOT the `WHO IS THAT claude` working copy.)
Unzip to the scratchpad and actually open a few with the Read tool before changing any aesthetic —
`kevin`, `jade`, `penny`, `oscar` are a representative spread (man, woman+glasses, wavy/blonde,
bald+beard). Never tune the look from memory; the references are the spec.

## The target aesthetic (the spec)

What separates the reference art from the old "Wii" look:

- **Flat, solid, slightly-muted background.** One fill colour. NO radial gradient, NO vignette, NO
  white halo circle behind the head. (Optional: a thin white card frame like `jade.png`.)
- **Dark desaturated NAVY ink, not pure black.** `#1f2330`. Softer, more illustrated. Strokes are
  on the thinner side (head contour ~3.4, features ~2.5).
- **Almond eyes, not cartoon discs.** A clean symmetric lens, an upper-lid shadow arc inside the
  top, the iris sitting LOW so the lid covers its top edge, plus a soft crease line above. Eyes are
  modest in size and not set too wide (default eye gap 47).
- **Brows with real anatomy.** A rounded inner "head" near the nose that arches over the eye and
  TAPERS to a thin "tail" at the temple. Per-character variety (thickness/arch). Coloured a deep
  shade of the hair, never a uniform black bar.
- **Hair = a mostly-smooth silhouette carried by internal flowing strand lines.** This is the single
  biggest lesson from the references (see `penny.png`, `kevin.png`): real illustrated hair is NOT a
  ring of bubble-clumps. Even curly/coily hair is a gently-wavy shape with many fine strand lines in
  tones of the hair colour sweeping along the hair's flow. A natural hairline that shows forehead
  and frames the temples (the `messy` style is the reference for "what good hair looks like here").
- **A real, short nose.** A soft underside curve with nostril hints sitting close under the eyes —
  NOT a long shaded bridge running down the midface (that made faces look gaunt/elongated).
- **Natural adult proportions.** A visible forehead, a soft jaw, no long pointy "chopped" chins.
- **Muted, natural palette** for skin, hair, clothing. Subtle skin modelling (faint cheek blush,
  nasolabial and jaw shadow lines at low opacity).

### The "Wii tells" to hunt down and remove

If a face looks wrong, it's almost always one of these:

1. Glossy gradient background / white halo behind the head → flatten it.
2. Pure-black, heavy outlines → navy, thinner.
3. Big round eyes, iris dead-centre and fully visible, huge highlight → almond lens, tucked iris,
   lid shadow.
4. Brows as solid uniform bars ("censor bars") → tapered tail, rounded head, thinner.
5. Hair as bubble-clumps or a smooth helmet/swim-cap with bolted-on texture → smooth-ish silhouette
   + internal strand lines + natural hairline.
6. Long shaded nose bridge + long pointy chin → short nose, softer/rounder jaw.

## The workflow (every visual change)

1. **Study the relevant reference(s)** for the feature you're touching.
2. **Name the specific delta** in words ("ours has X, the reference has Y") before editing. If you
   can't name it, you're guessing.
3. **Edit `src/characters/face-generator.js`** — one feature category at a time (eyes OR hair OR brows, not all).
   See `references/face-generator-map.md` for the function map and per-feature recipes.
4. **Bump the cache-buster** in `labs/face-studio.html` (see below) — non-negotiable.
5. **Verify in the browser** (see below): reload, take a ZOOMED screenshot of the portrait, read
   the console for runtime errors.
6. **Compare to the reference** and to the previous screenshot. If it's not closer, revert or adjust
   — don't pile fixes on top of a regression.

Iterate one feature to "good" before starting the next. Resist changing five things between
screenshots; when something breaks you won't know which change did it.

## Cache-busting (critical — stale files will waste you)

`labs/face-studio.html` hard-codes `?v=N` query strings on the css/js/generator `<link>`/`<script>`
tags. The static dev server caches aggressively, so **every** edit to `src/characters/face-generator.js`,
`src/labs/face-studio/face-studio.js`, or `src/labs/face-studio/face-studio.css` must be followed by bumping N, or the browser silently runs
the old code (this has caused hours of confusion debugging "fixes that don't appear"):

```bash
cd "/Users/joel/Documents/Programming/WHO IS THAT claude"
sed -i '' 's/?v=16/?v=17/g' labs/face-studio.html   # bump to the next number
```

## Browser verification

```bash
# serve (once)
cd "/Users/joel/Documents/Programming/WHO IS THAT claude" && python3 -m http.server 5173
```

Then drive it with the Chrome extension MCP (`mcp__Claude_in_Chrome__*`):

- `navigate` to `http://localhost:5173/labs/face-studio.html`
- `read_console_messages` with `onlyErrors:true` to catch generator exceptions (a thrown error
  means NO faces render — always check this after JS edits).
- `computer` action `zoom` on the selected-portrait region to inspect a feature closely; `screenshot`
  + scroll to see the whole 48-character roster at once.
- The top filters (Hair/Expression/Name) and the editor tabs let you isolate a style/character. To
  see a specific hairstyle, set the Hair filter; to see a named character, type in the Name search.

Use `node --check` for syntax, then load the page and read browser-console errors after every JS
edit; both checks catch different classes of failure.

## The Face Studio editor is a calibration tool

`labs/face-studio.html` and `src/labs/face-studio/face-studio.js` form a workbench: the user
sculpts a character toward the target with
sliders/dropdowns (grouped into tabs; clicking a region on the portrait jumps to that group), then
exports a correction JSON (`{ selected, all }`). When the user sends that JSON back, it is
**calibration data** — fold the deltas into the generator's base defaults in `src/characters/face-generator.js`,
don't just apply them as a one-off. Flat trait keys in corrections override the per-character
`portraitProfile` via `getProfile(traits)`.

## Core construction principles (the "why")

These are the load-bearing lessons. Details and code in `references/face-generator-map.md`.

- **Scale a composite feature as ONE transform group, never piecemeal.** When resizing/moving the
  head, every dependent part (skin, ears, hair, brows, eyes, nose, mouth, beard) must live in the
  same `<g transform>` (`headGroup`). Scaling only the skin while siblings stay at fixed coords
  desyncs them (floating beard, mismatched jaw). This is the most expensive bug to reintroduce.
- **Don't use `non-scaling-stroke` under a non-uniform scale.** It renders line weight unevenly
  around curves when X≠Y scale. Let the stroke scale with the transform for a clean resize.
- **Keep paired features mirror-symmetric.** Build left/right from the same magnitudes mirrored
  around x=128. Asymmetric control points applied identically to both eyes read as "syndromic".
- **Hair is smooth silhouette + strand lines, not clump outlines.** `lobeChain` can make a wavy
  edge, but keep the bump LOW (gentle wave) and carry the texture with internal flowing strand lines
  in hair-colour tones (`renderHairHighlights`). High bumps = spiky/bubbly = wrong.
- **Vary deterministically for naturalness.** Per-character brow shape, per-clump size jitter — a
  uniform pattern reads as fake (a wig, a hairnet, a row of identical bars).
- **Pivot-scale pattern:** `translate(pivot) scale(s) translate(-pivot)` to grow/move a sub-feature
  around a fixed anchor.

When you actually open the code, read `references/face-generator-map.md` for the function/constant
map and the exact per-feature recipes (eye lens, brow anatomy, hair strands, nose, headGroup).

## Style Guardrails

This style should remain clean, editable, and game-ready. The portraits should look like
intentionally designed SVG character tiles, not painterly illustrations, emoji avatars, or generic
AI cartoon heads.

Avoid:

- realistic skin texture
- painterly brushwork
- 3D lighting
- glossy highlights
- heavy drop shadows
- rim lighting
- detailed individual teeth
- dense hair texture
- overly complex fabric folds
- photographic shading
- scene backgrounds
- random props that are not part of the character design
- inconsistent crop or zoom between characters
- repeated facial templates with only hair/clothing changed
- hyper-symmetrical faces
- tiny details that disappear at tile size

The final character should read clearly at small game-card size while still having enough secondary
detail to feel distinct.

### Line Weight Rules

Use a clear line hierarchy.

Primary outlines define the outer silhouette of the head, hair, clothing, hat, glasses, beard, and
shoulders.

Secondary lines define facial features, hair separations, clothing seams, scarf folds, hat ribs,
beard texture, and expression marks.

Feature-emphasis lines may be slightly heavier for identity-defining elements such as glasses
frames, hat brims, beard edges, strong eyebrows, open mouths, moustaches, collars, and jewellery.

Avoid using the same stroke weight everywhere. The design should feel simple, but not mechanically
uniform.

### Expression and Mouth Rules

Expressions should be simple but specific.

Smiles should not be generic curved lines. Use small cheek hooks, lifted mouth corners, a clean
white tooth band where appropriate, and an optional faint lower-lip curve.

Open-mouth smiles should use a single clean mouth shape with one simple white tooth area. Do not draw
individual teeth unless the character specifically needs a goofy or exaggerated look.

Neutral, stern, worried, tired, smug, happy, surprised, and unimpressed expressions should be driven
by brow angle, eyelid shape, cheek lines, mouth shape, and forehead marks.

The mouth, brows, and eyes should work together. Do not mix random feature shapes unless the
contradiction is intentional.

### Background and Frame Rules

Each portrait may sit on a simple pastel square or rounded card background.

Allowed background treatments:

- flat pastel colour
- soft single-colour gradient
- rounded rectangle card
- simple border
- decorative corner lines
- plain white margin around the card
- no frame at all

Avoid scenes, rooms, landscapes, photographic backgrounds, props, textures, patterns, or complex
lighting.

The background should support the character tile, not become the subject.

### Batch Generation Rules

When generating a set of characters, keep the following consistent:

- canvas size
- viewBox
- head scale
- eye line
- shoulder baseline
- crop
- frame padding
- general portrait position

Variation should happen inside the character design, not through random zooming, cropping, or camera
angle changes.

For each character, vary at least five of the following identity slots:

- face shape
- jaw shape
- eye shape
- brow shape
- nose type
- mouth shape
- expression
- age cues
- hair silhouette
- hair texture
- facial hair
- glasses
- headwear
- earrings or small accessories
- clothing neckline
- clothing colour
- scarf, collar, tie, chain, or other simple identifier

Do not reuse the same eye, nose, mouth, and brow combination across multiple characters in the same
set.

All characters should remain front-facing, centred, and readable as part of the same game system.

### Diversity and Character Variation

Characters should vary across age, skin tone, face shape, body impression, expression, hair type,
clothing, and accessories.

Skin tone, facial structure, hair texture, clothing, and personality should vary independently. Do
not link ethnicity-coded features to fixed expressions, clothing styles, occupations, or personality
traits.

Include a broad mix of: straight hair, wavy hair, curly hair, coily hair, shaved hair, bald heads,
receding hairlines, undercuts, fringes, bobs, long loose hair, tied-back hair, buns, braids, locs,
beards, moustaches, clean-shaven faces.

Characters should feel like individuals, not a base avatar with swapped accessories.

### Accessory and Clothing Variation

Use clothing and accessories as simple identity anchors.

Useful options include: beanie, cap, beret, fedora, headband, hair clip, glasses, round glasses,
thick glasses, sunglasses, earrings, nose stud, hearing aid, scarf, bowtie, tie, chain, hoodie,
jumper, cardigan, turtleneck, vest, collared shirt, sports jersey, apron, work shirt, coat.

Accessories should remain simple SVG shapes. Avoid excessive detail.

### SVG Output Requirements

Generate clean, editable SVG.

Requirements:

- use `viewBox="0 0 1000 1000"`
- use semantic layer/group IDs
- do not embed raster images
- keep shapes editable
- prefer paths, circles, ellipses, rectangles, and simple polygons
- use rounded stroke joins and caps where appropriate
- avoid excessive path nodes
- avoid filters unless used very sparingly for blush or soft background treatment
- keep all colours as clear hex values or CSS variables
- support transparent export by allowing the background and frame group to be removed

Suggested group order:

1. background
2. frame
3. back hair
4. neck
5. clothing
6. face
7. ears
8. facial features
9. blush and soft marks
10. facial hair
11. front hair
12. glasses
13. headwear
14. accessories
15. foreground frame details

Layer order matters. Hair, glasses, hats, ears, collars, beards, and scarves should visually overlap
in a believable way.

### Quality Check Before Final Output

Before finalising a character or batch, check:

- Does each character have a distinct silhouette?
- Does the face still read clearly at small size?
- Are the eyes, nose, mouth, and brows not reused too obviously?
- Are the line weights varied but coherent?
- Are the characters front-facing and consistently cropped?
- Are accessories simple and readable?
- Does the batch feel like one game system?
- Does the design avoid looking like generic emoji, Bitmoji, or overly polished AI art?
- Could the SVG be edited later without fighting messy paths or embedded raster content?
