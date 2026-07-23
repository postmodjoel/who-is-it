import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";

const context = { window: {}, console };
context.window.window = context.window;
vm.createContext(context);
for (const file of ["faces-hair.js", "studio-bakes-import.js", "clothing-profiles.js", "face-generator.js"]) {
  vm.runInContext(fs.readFileSync(new URL(`../src/characters/${file}`, import.meta.url), "utf8"), context, { filename: file });
}

const generator = context.window.faceGenerator;
const baseTraits = generator.createCharacters(() => [])[0].traits;
const styles = ["labCoat", "rugby", "varsity", "tracksuit", "collared", "blazer", "jacket"];
const views = ["composite", "layerMap", "occlusion"];
const parts = ["rearCollar", "neck", "torso", "frontCollar", "details", "overlays"];
const bodies = [
  { build: 82, shoulderSlope: 0.55, bodyWidth: 1, neckWidth: 0.78, neckLength: 4, neckTaper: 0.3 },
  { build: 68, shoulderSlope: 0.86, bodyWidth: 0.84, neckWidth: 0.5, neckLength: -8, neckTaper: 0.15 },
  { build: 72, shoulderSlope: 0.76, bodyWidth: 0.88, neckWidth: 0.52, neckLength: 20, neckTaper: 0.45 },
  { build: 90, shoulderSlope: 0.34, bodyWidth: 1.06, neckWidth: 1.08, neckLength: -7, neckTaper: -0.1 },
  { build: 94, shoulderSlope: 0.3, bodyWidth: 1.08, neckWidth: 1.05, neckLength: 18, neckTaper: 0.7 },
  { build: 86, shoulderSlope: 0.66, bodyWidth: 1.2, neckWidth: 0.74, neckLength: 5, neckTaper: 0.25 }
];

function portrait(traits) {
  return decodeURIComponent(generator.renderPortrait(7, { ...baseTraits, ...traits }));
}

test("collared garments render one ordered wrapper per clothing part", () => {
  for (const style of styles) {
    for (const view of views) {
      for (const body of bodies) {
        const svg = portrait({ ...body, clothing: style, clothingLayerView: view });
        assert.doesNotMatch(svg, /NaN|undefined/, `${style}/${view} contains invalid output`);
        const indexes = parts.map((part) => svg.indexOf(`data-clothing-part='${part}'`));
        assert.ok(indexes.every((index) => index >= 0), `${style}/${view} is missing a layer`);
        assert.deepEqual([...indexes].sort((a, b) => a - b), indexes, `${style}/${view} layer order changed`);
        assert.equal((svg.match(/class='fa-clothing-part /g) || []).length, 5, `${style}/${view} duplicated a clothing part`);
        const ids = [...svg.matchAll(/\sid='([^']+)'/g)].map((match) => match[1]);
        assert.equal(new Set(ids).size, ids.length, `${style}/${view} emitted duplicate SVG ids`);
      }
    }
  }
});

test("layer visibility removes only the selected renderer part", () => {
  const svg = portrait({
    clothing: "labCoat",
    clothingLayerVisibility: { rearCollar: false, neck: true, torso: true, frontCollar: true, details: true, overlays: true }
  });
  assert.equal(svg.includes("data-clothing-part='rearCollar'"), false);
  for (const part of parts.slice(1)) assert.ok(svg.includes(`data-clothing-part='${part}'`), `${part} should remain visible`);
});

test("neck clearance recomputes collar geometry without scaling its wrapper", () => {
  const narrow = portrait({ clothing: "labCoat", clothingTuning: { neckWidthScale: 0.7 } });
  const wide = portrait({ clothing: "labCoat", clothingTuning: { neckWidthScale: 1.4 } });
  const rear = (svg) => svg.match(/data-clothing-part='rearCollar'[^>]*transform='([^']+)'[^>]*>([\s\S]*?)<\/g>/);
  const narrowRear = rear(narrow);
  const wideRear = rear(wide);
  assert.ok(narrowRear && wideRear);
  assert.equal(narrowRear[1], wideRear[1], "rear collar wrapper should not be width-scaled");
  assert.notEqual(narrowRear[2], wideRear[2], "rear collar coordinates should respond to clearance");
});
