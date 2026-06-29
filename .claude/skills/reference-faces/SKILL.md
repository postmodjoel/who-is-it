---
name: reference-faces
description: >-
  Recreate and refine the procedural SVG character portraits in the WHO IS THAT game's face
  generator (face-generator.js, face-studio.html/js) so they match the hand-illustrated "gold
  standard" reference art. Use this whenever working on how the generated faces/characters/avatars
  LOOK — hairstyles, eyes, brows, noses, mouths, ears, skin, proportions, colours, backgrounds,
  accessories — or when the user says the characters look too "Wii"/cartoonish/"chopped"/fake/
  "syndromic", want them to look more like the reference images, or ask to improve any visual
  feature of the portraits. Covers the target aesthetic spec, the "Wii tells" to avoid, per-feature
  SVG construction recipes, the face-generator.js function map, the reference image location, and
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
3. **Edit `face-generator.js`** — one feature category at a time (eyes OR hair OR brows, not all).
   See `references/face-generator-map.md` for the function map and per-feature recipes.
4. **Bump the cache-buster** in `face-studio.html` (see below) — non-negotiable.
5. **Verify in the browser** (see below): reload, take a ZOOMED screenshot of the portrait, read
   the console for runtime errors.
6. **Compare to the reference** and to the previous screenshot. If it's not closer, revert or adjust
   — don't pile fixes on top of a regression.

Iterate one feature to "good" before starting the next. Resist changing five things between
screenshots; when something breaks you won't know which change did it.

## Cache-busting (critical — stale files will waste you)

`face-studio.html` hard-codes `?v=N` query strings on the css/js/generator `<link>`/`<script>`
tags. The static dev server caches aggressively, so **every** edit to `face-generator.js`,
`face-studio.js`, or `face-studio.css` must be followed by bumping N, or the browser silently runs
the old code (this has caused hours of confusion debugging "fixes that don't appear"):

```bash
cd "/Users/joel/Documents/Programming/WHO IS THAT claude"
sed -i '' 's/?v=16/?v=17/g' face-studio.html   # bump to the next number
```

## Browser verification

```bash
# serve (once)
cd "/Users/joel/Documents/Programming/WHO IS THAT claude" && python3 -m http.server 5173
```

Then drive it with the Chrome extension MCP (`mcp__Claude_in_Chrome__*`):

- `navigate` to `http://localhost:5173/face-studio.html`
- `read_console_messages` with `onlyErrors:true` to catch generator exceptions (a thrown error
  means NO faces render — always check this after JS edits).
- `computer` action `zoom` on the selected-portrait region to inspect a feature closely; `screenshot`
  + scroll to see the whole 48-character roster at once.
- The top filters (Hair/Expression/Name) and the editor tabs let you isolate a style/character. To
  see a specific hairstyle, set the Hair filter; to see a named character, type in the Name search.

There is no local Node runtime, so you can't `node --check`. The browser console IS your syntax/
runtime check — load the page and read errors after every JS edit.

## The Face Studio editor is a calibration tool

`face-studio.html/js` is a workbench: the user sculpts a character toward the target with
sliders/dropdowns (grouped into tabs; clicking a region on the portrait jumps to that group), then
exports a correction JSON (`{ selected, all }`). When the user sends that JSON back, it is
**calibration data** — fold the deltas into the generator's base defaults in `face-generator.js`,
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
