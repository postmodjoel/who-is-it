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

function openingStroke(lipLineWidth) {
  const svg = decodeURIComponent(generator.renderPortrait(7, {
    ...baseTraits,
    expression: "happy",
    mouthStyle: "bigOpenSmile",
    lipLineWidth
  }));
  const match = svg.match(/<path d='M99 162[^']+' fill='none' stroke='[^']+' stroke-width='([^']+)' stroke-linejoin='round'\/>/);
  assert.ok(match, "open-smile inner outline was not rendered");
  return Number(match[1]);
}

test("lip line width scales the inner outline around an open smile", () => {
  assert.equal(openingStroke(0.5), 1.5);
  assert.equal(openingStroke(1), 3);
  assert.equal(openingStroke(2), 6);
});
