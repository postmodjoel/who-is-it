import { expect, test } from "@playwright/test";

// The Hair Studio mines Joel's baked lock placements at runtime and deals two swipe decks
// (combos of existing pieces, brand-new drawn pieces) plus a catalogue of yays.

test("hair studio boots, mines the cast, and deals both decks", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "studio smoke runs once");
  await page.goto("/labs/hair-studio.html");
  await expect(page).toHaveTitle(/Hair Studio/);
  await expect(page.locator("#mineMeta")).toHaveText(/\d+ cast · \d+ placements mined · \d+ kinds/);

  await expect(page.locator('.lab-tab[data-view="combos"]')).toHaveClass(/is-active/);
  await expect(page.locator("#comboStage .rate-swipe-card")).toBeVisible();
  await expect(page.locator("#comboStage .fit-strip img")).toHaveCount(4);
  const comboLabel = await page.locator("#comboStage .rate-swipe-card small").textContent();
  expect(comboLabel).toMatch(/\S/);

  await page.locator('.lab-tab[data-view="pieces"]').click();
  await expect(page.locator("#pieceStage .rate-swipe-card")).toBeVisible();
  await expect(page.locator("#pieceStage .fit-strip img")).toHaveCount(4);
  const pieceLabel = await page.locator("#pieceStage .rate-swipe-card small").textContent();
  expect(pieceLabel).toMatch(/·/);
});

test("hair ratings swipe, store drawn pieces, cull to tagged nays, and persist", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "studio rating flow runs once");
  await page.goto("/labs/hair-studio.html");
  await page.evaluate(() => { try { localStorage.removeItem("wdym_hair_ratings_v1"); } catch (error) { /* blocked */ } });
  await page.reload();

  // note + chip ride the yay on the combos deck
  await expect(page.locator("#comboStage .rate-swipe-card")).toBeVisible();
  const firstCombo = await page.locator("#comboStage .rate-swipe-card").getAttribute("data-item");
  await page.locator("#hairNote").fill("good sweep");
  await page.locator('#comboStage .rate-tag[data-tag="SHAPE"]').click();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(`#comboStage .rate-swipe-card:not([data-item="${firstCombo}"])`)).toBeVisible();
  const combo = await page.evaluate((id) => JSON.parse(localStorage.getItem("wdym_hair_ratings_v1")).combos[id], firstCombo);
  expect(combo.verdict).toBe("yay");
  expect(combo.tags).toContain("SHAPE");
  expect(combo.note).toBe("good sweep");
  expect(Array.isArray(combo.pieces)).toBe(true);

  // a yayed NEW piece persists its drawn path (the renderer's pen-tool format)
  await page.locator('.lab-tab[data-view="pieces"]').click();
  const firstPiece = await page.locator("#pieceStage .rate-swipe-card").getAttribute("data-item");
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(`#pieceStage .rate-swipe-card:not([data-item="${firstPiece}"])`)).toBeVisible();
  const piece = await page.evaluate((id) => JSON.parse(localStorage.getItem("wdym_hair_ratings_v1")).pieces[id], firstPiece);
  expect(piece.verdict).toBe("yay");
  expect(typeof piece.d).toBe("string");
  expect(piece.d.length).toBeGreaterThan(20);

  // undo pulls the last verdict back out
  await page.keyboard.press("ArrowLeft");
  await expect.poll(async () => (await page.evaluate(() =>
    Object.values(JSON.parse(localStorage.getItem("wdym_hair_ratings_v1")).pieces).filter((p) => p.verdict === "nay").length))).toBe(1);
  await page.locator("#hairUndo").click();
  await expect.poll(async () => (await page.evaluate(() =>
    Object.values(JSON.parse(localStorage.getItem("wdym_hair_ratings_v1")).pieces).filter((p) => p.verdict === "nay").length))).toBe(0);

  // the catalogue lists both yays; culling flips to a tagged nay instead of deleting
  await page.locator('.lab-tab[data-view="catalogue"]').click();
  await expect(page.locator("#catCombos .cat-card")).toHaveCount(1);
  await expect(page.locator("#catPieces .cat-card")).toHaveCount(1);
  await page.locator("#catPieces .cat-cull").click();
  await expect(page.locator("#catPieces .cat-card")).toHaveCount(0);
  const culled = await page.evaluate((id) => JSON.parse(localStorage.getItem("wdym_hair_ratings_v1")).pieces[id], firstPiece);
  expect(culled.verdict).toBe("nay");
  expect(culled.tags).toContain("CULLED");

  // ratings survive a reload and the deck resumes past rated cards
  await page.reload();
  await expect(page.locator("#comboMeta")).toHaveText(/1 rated · 1 yay/);
  const resumed = await page.locator("#comboStage .rate-swipe-card").getAttribute("data-item");
  expect(resumed).not.toBe(firstCombo);
});
