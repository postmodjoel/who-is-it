import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import test from "node:test";

const context = { window: {}, console };
context.window.window = context.window;
vm.createContext(context);

for (const file of ["clothing-profiles.js", "studio-bakes-import.js"]) {
  vm.runInContext(fs.readFileSync(new URL(`../src/characters/${file}`, import.meta.url), "utf8"), context, { filename: file });
}

test("exported clothing profiles are baked into the renderer defaults", () => {
  const profiles = context.window.WhoClothingStudio.profiles;
  assert.equal(profiles.labCoat.garmentY, 3);
  assert.equal(profiles.labCoat.necklineY, 5);
  assert.equal(profiles.labCoat.neckWidthScale, 1.12);
  assert.equal(profiles.sequin.collarY, 28);
  assert.equal(profiles.sequin.detailY, -15);
});

test("latest Face Studio export is merged under seed ids", () => {
  const bakes = context.window.WhoStudioBakeImport;
  const importedIds = [
    "aaron",
    "naomi",
    "tiana",
    "milo",
    "sim-saskia",
    "sim-marisol",
    "sim-lenny",
    "sim2-maude",
    "sim2-cleo"
  ];

  for (const id of importedIds) assert.ok(bakes[id], `${id} was not imported`);
  assert.equal(bakes.aaron.hair, "bald");
  assert.equal(bakes.aaron.tattoos.length, 2);
  assert.equal(bakes.naomi.headScaleY, 0.89);
  assert.equal(bakes.tiana.teethY, -5);
  assert.equal(bakes.milo.clothing, "blazer");
  assert.equal(bakes["sim-saskia"].clothing, "turtleneck");
  assert.equal(bakes["sim-marisol"].shirt, "#4f5451");
  assert.equal(bakes["sim-lenny"].neckWidth, 0.6);
  assert.equal(bakes["sim2-maude"].clothing, "collared");
  assert.equal(bakes["sim2-cleo"].hairComposition.layers.length, 6);
});
